class AnalyserProcessor extends AudioWorkletProcessor {

  constructor(options) {
    super();

    const {
      analysisBufferSize,
      voicingConfidenceThreshold=0.5,
      maxGestureSegmentGap,
      minGestureLength,
    } = options.processorOptions;

    this.analysisBufferSize = analysisBufferSize;
    this._analysisBuffer = (new Float32Array(this.analysisBufferSize));
    this._analysisBytesWritten = 0;

    this.voicingConfidenceThreshold = voicingConfidenceThreshold;
    this.maxGestureSegmentGap = maxGestureSegmentGap;
    this.minGestureLength = minGestureLength;

    // Set up port for communicating with Worker.
    this._workerPort = undefined;
    this._workerPortAvailable = false;
    this.port.onmessage = (msg) => {
      if (msg.data.port) {
        console.info('Analyser worklet received port from main thread\n', msg.data.port);
        this._workerPort = msg.data.port;
        this._workerPortAvailable = true;
      }
      if (msg.data.voicingConfidenceThreshold) {
        this.voicingConfidenceThreshold = msg.data.voicingConfidenceThreshold;
      }
      if (msg.data.maxGestureSegmentGap) {
        this.maxGestureSegmentGap = msg.data.maxGestureSegmentGap;
      }
      if (msg.data.minGestureLength) {
        this.minGestureLength = msg.data.minGestureLength;
      }
    };
  }

  initAnalysisBuffer() {
    this._analysisBytesWritten = 0;
  }

  isAnalysisBufferFull() {
    return this._analysisBytesWritten === this.analysisBufferSize;
  }

  process(input) {
    if (!input || !input[0][0]) return;

    const chunk = input[0][0];

    if (this._workerPort) {
      for (let i = 0; i < chunk.length; i++) {
        this._analysisBuffer[this._analysisBytesWritten++] = chunk[i];
        if (this.isAnalysisBufferFull()) {
          this._workerPort.postMessage({
            analysisBuffer: this._analysisBuffer,
            voicingConfidenceThreshold: this.voicingConfidenceThreshold,
            maxGestureSegmentGap: this.maxGestureSegmentGap,
            minGestureLength: this.minGestureLength,
          });
          this.initAnalysisBuffer();
        }
      }
    }
    
    return true;
  }

}

registerProcessor("analyser.worklet", AnalyserProcessor);