importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");


const buildCrepeModel = async () => {

  const modelEndpoint = "/models/crepe/model.json";
  const model = await tf.loadLayersModel(modelEndpoint);

  // bin number -> cent value mapping
  const centMapping = tf.add(tf.linspace(0, 7180, 360), tf.tensor(1997.3794084376191))

  const getActivation = (input) => {
    return tf.tidy(() => {
      // run the prediction on the model
      const frame = tf.tensor(input.slice(0, 1024));
      const zeromean = tf.sub(frame, tf.mean(frame));
      const framestd = tf.tensor(tf.norm(zeromean).dataSync()/Math.sqrt(1024));
      let normalised = tf.div(zeromean, framestd);
      normalised = normalised.reshape([1, 1024]);
      const activation = model.predict([normalised]).reshape([360]);
    
      // the confidence of voicing activity and the argmax bin
      const confidence = activation.max().dataSync()[0];
      const center = activation.argMax().dataSync()[0];
    
      // slice the local neighborhood around the argmax bin
      const start = Math.max(0, center - 4);
      const end = Math.min(360, center + 5);
      const weights = activation.slice([start], [end - start]);
      const cents = centMapping.slice([start], [end - start]);
    
      // take the local weighted average to get the predicted pitch
      const products = tf.mul(weights, cents);
      const productSum = products.dataSync().reduce((a, b) => a + b, 0);
      const weightSum = weights.dataSync().reduce((a, b) => a + b, 0);
      const predictedCent = productSum / weightSum;
      const predictedHz = 10 * Math.pow(2, predictedCent / 1200.0);

      // We don't actually need the Hz information, just the (argmax) bin.
      // This maps to the 360 pixels (vertically) of the canvas, so we can
      // render the frame around the gesture candidate.
      return [ activation.dataSync(), center, confidence, ];
    });
  }

  return {

    predict(input) {
      return getActivation(input);
    }

  }
}

let model;

buildCrepeModel().then((crepe) => {
  model = crepe;
} );

const channel = new MessageChannel(); // Bidirectional comm channel.
const { port1, port2, } = channel;

// Send port2 to main thread, where it will be transferred to the AudioWorklet so it can use it for sending analysis buffers.
// Passing as array on 2nd argument transfers ownership of the object, so it cannot be used inside inference-worker.js anymore.
postMessage({ port: port2 }, [port2]);

const repeatN = (n, iterator) => {
  const accum = Array(Math.max(0, n));
  for (let i = 0; i < n; i++) {
    accum[i] = iterator.call(this, i);
  }
  return accum;
}

// This version works in real time, accumulating input from
// each analysis buffer as it comes in, rather than across
// a finalised time window.
const findGestureCandidates = (() => {

  let prevGesture;
  let currentGesture;
  let gap = 0;
  let i = 0;

  return (pitch, maxGap=2, minLength=4) => {
    if (pitch) {
      if (gap || i===0) {
        if (prevGesture && (gap < maxGap)) {
          currentGesture = prevGesture;
          const last = currentGesture.slice(-1)[0];
          currentGesture.push(last);
        }
        else {
          currentGesture = [];
        }
        gap = 0;
        prevGesture = currentGesture;
      }
      currentGesture.push(pitch);
    }
    else {
      gap++;
    }
    if (currentGesture && gap===maxGap && currentGesture.length>=minLength) {
      self.postMessage({
        gestureCandidate: currentGesture,
      });
    }
    i++;
  }
})();

port1.onmessage = (msg) => {
  if (model) {
    const { analysisBuffer, voicingConfidenceThreshold=0.5, maxGestureSegmentGap=2, minGestureLength, } = msg.data;
    let [ activation, bin, confidence, ] = model.predict(analysisBuffer);
    bin = confidence > voicingConfidenceThreshold ? bin : 0;
    self.postMessage({ activation, });
    findGestureCandidates(bin, maxGestureSegmentGap, minGestureLength);
  }
}