import KNN from "ml-knn";
import { repeatN, getLast, } from "../../utils";


const MAX_INT = Number.MAX_SAFE_INTEGER;

const dtwDistance = (seq1, seq2, d = (x,y) => Math.abs(x-y)) => {
  const maxWarpingWindow = MAX_INT;
  // Create cost matrix via broadcasting with large int
  seq1 = Array.isArray(seq1) ? seq1 : Object.values(seq1);
  seq2 = Array.isArray(seq2) ? seq2 : Object.values(seq2);
  const M = seq1.length;
  const N = seq2.length;
  //console.log(seq1, seq2);
  const cost = repeatN(M, () => repeatN(N, () => MAX_INT));
  // Initialize the first row and column
  cost[0][0] = d(seq1[0], seq2[0]);
  for (let i=1; i<M; i++) {
    cost[i][0] = cost[i-1][0] + d(seq1[i], seq2[0]);
  }
  for (let j=1; j<N; j++) {
    cost[0][j] = cost[0][j-1] + d(seq1[0], seq2[j]);
  }
  // Populate rest of cost matrix within window
  for (let i=1; i<M; i++) {
    const js = Math.max(1, i - maxWarpingWindow);
    const je = Math.min(N, i + maxWarpingWindow);
    for (let j=js; j<je; j++) {
      const choices = [ cost[i - 1][j - 1], cost[i][j-1], cost[i-1][j] ];
      cost[i][j] = Math.min.apply(null, choices) + d(seq1[i], seq2[j]);
    }
  }
  // Return DTW distance given window 
  return cost.slice(-1)[0].slice(-1)[0];
}

const DEFAULT_OPTS = {
  k: 1,
  analysisBufferSize: 1024,
}

const loadModel = async (k) => {
  const resp = await fetch(`/models/gesture/Forager-original-k${k}/model.json`);
  const data = await resp.json();
  return KNN.load(data, dtwDistance);
}

export const createGestureModel = async (options=DEFAULT_OPTS) => {

  const { k, analysisBufferSize=1024, } = options;

  let knn = await loadModel(k);

  const predictProbas = (currentCase) => {
    let nearestPoints = knn.kdTree.nearest(currentCase, knn.k);
    let pointsPerClass = {};
    let predictedClass = -1;
    let maxPoints = -1;
  
    for (let element of knn.classes) {
      pointsPerClass[element] = 0;
    }
  
    for (let i = 0; i < nearestPoints.length; ++i) {
      let currentClass = getLast(nearestPoints[i][0]);
      let currentPoints = ++pointsPerClass[currentClass];
      if (currentPoints > maxPoints) {
        predictedClass = currentClass;
        maxPoints = currentPoints;
      }
    }

    const confidence = pointsPerClass[predictedClass] / knn.k;

    return [ predictedClass, confidence ];
  }

  return {

    async load(k) {
      knn = await loadModel(k);
      return knn;
    },

    predict(inputs) {
      return predictProbas(inputs);
    }

  }

}