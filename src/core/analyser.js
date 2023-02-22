import { createGestureModel } from "./model";
import { zScore, } from "../../utils";

/*
From the Essentia docs:

https://mtg.github.io/essentia.js/docs/api/tutorial-3.%20Machine%20learning%20inference%20with%20Essentia.js.html#establishing-audioworklet-worker-communication

The problem we have is that we need to do the pitch tracking using the Crepe model, which is
TF.js-based. But it's not possible to properly load tensorflow as a module into an AudioWorklet.

But the above way of communicating between a worklet and a worker may solve our problem of loading
TensorFlow.js - which can't be done in the AudioWorklet. So we use the Worklet to simply extract the
input data - perhaps after accumulating a full analysis buffer - then just use portMessage to
send it to the Worker.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const getAudioInputStream = async () => {
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
  } catch(err) {
    console.log(err);
  }
  return stream;
}

export const createAudioInputAnalyser = async (options={}) => {

  const {
    analysisBufferSize=1024,
    k=1,
    voicingConfidenceThreshold=0.5,
    maxGestureSegmentGap,
    minGestureLength,
    callback=() => {},
  } = options;

  const model = await createGestureModel({ k, });

  let isRunning = false;

  const audioCtx = new AudioContext();

  const stream = await getAudioInputStream();
  const source = audioCtx.createMediaStreamSource(stream);
  const channelSplitter = new ChannelSplitterNode(audioCtx, { numberOfOutputs: 1 });
  source.connect(channelSplitter);

  await audioCtx.audioWorklet.addModule("/analyser.worklet.js");

  const workletNode = new AudioWorkletNode(audioCtx, "analyser.worklet", {
    processorOptions: {
      analysisBufferSize,
      voicingConfidenceThreshold,
      maxGestureSegmentGap,
      minGestureLength,
    }
  });

  channelSplitter.connect(workletNode, 0);

  const inferenceWorker = new Worker('./inference-worker.js');

  let workerToWorkletPort;

  inferenceWorker.onmessage = (msg) => {
    if (msg.data.port) {
      workerToWorkletPort = msg.data.port;
      workletNode.port.postMessage({
        port: workerToWorkletPort,
      }, [workerToWorkletPort]);
    }
    else if (msg.data.activation) {
      const { activation, } = msg.data;
      callback({activation: activation});
    }
    else if (msg.data.gestureCandidate) {
      const { gestureCandidate, } = msg.data;
      const normalised = zScore(gestureCandidate);
      const [ prediction, confidence ] = model.predict(normalised);
      const label = String.fromCharCode(prediction+97);
      callback({
        gestureCandidate: gestureCandidate,
        predictedGesture: [ label, confidence, ],
      });
    }
  }

  audioCtx.suspend();

  return {

    start() {
      if (audioCtx.state !== "running") {
        audioCtx.resume();
      }
      if (!isRunning) {
        //channelSplitter.connect(workletNode, 0);
        isRunning = true;
      }
    },

    stop() {
      audioCtx.suspend();
      //channelSplitter.disconnect(workletNode, 0);
      isRunning = false;
    },

    update(key, newValue) {
      workletNode.port.postMessage({
        [key]: newValue,
      });
    }

  }
}
