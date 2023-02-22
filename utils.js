

const filterObject = (obj, callback) => {
  return Object.fromEntries(Object.entries(obj).
    filter(([key, val]) => callback(val, key)));
}

const pad = (n) => n<10 ? '0'+n : n;

const getTimestamp = () => {
  const currentDate = new Date();
  const date = pad(currentDate.getDate());
  const month = pad(currentDate.getMonth() + 1); 
  const year = currentDate.getFullYear();
  const hrs = pad(currentDate.getHours());
  const mins = pad(currentDate.getMinutes());
  const secs = pad(currentDate.getSeconds());
  return `${date}.${month}.${year} ${hrs}.${mins}.${secs}`;
}

const msToTime = (ms) => {
  let milliseconds = ms%1000;
  let seconds = parseInt((ms/1000)%60);
  let minutes = parseInt((ms/(1000*60))%60);
  let hours = parseInt((ms/(1000*60*60))%24);
  hours = pad(hours);
  minutes = pad(minutes);
  seconds = pad(seconds);
  milliseconds = (milliseconds < 100) ? pad(milliseconds / 10) : milliseconds / 10;
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

const seconds2HhMmSs = (seconds) => {
  const secs = pad(Math.floor(seconds));
  const mins = pad(Math.floor(secs / 60));
  const hrs = pad(Math.floor(mins / 60));
  return `${hrs}:${mins}:${secs}`;
}

const dedupe = (arr) => {
  const deduped = [];
  arr.forEach((elt) => {
    if (!deduped.includes(elt)) {
      deduped.push(elt);
    }
  });
  return deduped;
}

const pushNew = (arr, elt) => {
  if (!arr.includes(elt)) {
    return arr.push(elt);
  }
}

const repeatN = (n, iterator) => {
  const accum = Array(Math.max(0, n));
  for (let i = 0; i < n; i++) {
    // Previously we just had iterator.call(), but passing in (this, i)
    // gives code inside the iterator access to the current accumulator
    // index, as in Array.map and Array.forEach.
    accum[i] = iterator.call(this, i);
  }
  return accum;
}

const fill = (length, value) => repeatN(length, () => value);

const getLast = (arr) => arr.slice(-1)[0];

// With thanks to https://gomakethings.com/how-to-add-a-new-item-to-an-object-at-a-specific-position-with-vanilla-js/ 
const objectAddProperty = (obj, key, value, index) => {
    // Create a temp object and index variable
    var temp = {};
    var i = 0;

    // Loop through the original object
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            // If the indexes match, add the new item
            if (i === index && key && value) {
                temp[key] = value;
            }
            // Add the current item in the loop to the temp obj
            temp[prop] = obj[prop];
            // Increase the count
            i++;
        }
    }

    // If no index, add to the end
    if (!index && key && value) {
        temp[key] = value;
    }

    return temp;
};

const range = (start, end) => {
  const result = [];
  for (let i = start; i <= end; i++) {
      result.push(i);
  }
  return result;
}

// Conversion formulae obtained from: https://www.music.mcgill.ca/~gary/307/week1/node28.html.

const midiCps = (n) => {
  return 440 * Math.pow(2, (n - 69) / 12);
}

const cpsMidi = (f) => {
  return ~~(12 * (Math.log(f / 220.0) / Math.log(2.0)) + 57.01);
}

/*
const uInt8SampleToFloat32 = (sample) => {
  return ( (sample / 128) - 1);
}
*/

// For this version see: https://github.com/mohayonao/get-float-time-domain-data/blob/master/lib/get-float-time-domain-data.js
// The seeming 'magic number' 0.0078125 is simply (2 / 256).
const uInt8SampleToFloat32 = (sample) => {
  return (sample - 128) * 0.0078125;
}

const roundTo = (x, base=5) => base * Math.round(x / base);

const truncateTo = (x, base) => Math.floor(x / (base * 1.0)) * base;

const argMax = (arr, threshold=0) => {
  const maxElt = Math.max.apply(null, arr);
  if (maxElt > threshold) {
    return arr.indexOf(maxElt);
  }
}

// Numpy argsort.
// Adapted from https://stackoverflow.com/a/46622523/795131.
const argSort = (arr) => {
  return arr.map((item, index) => [index, item])
    .sort(([,arg1], [,arg2]) => arg1 - arg2)
      .map(([item,]) => item);
}

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const mean = (arr) => sum(arr) / arr.length;

// Computes z-score normalisation, a normalisation
// strategy recommended for time series.
const zScore = (arr) => {
  const arrMean = mean(arr);
  const diffs = arr.map((elt) => (elt - arrMean) ** 2);
  const stdDev = (sum(diffs) / arr.length) ** 0.5;
  return arr.map((elt) => (elt - arrMean) / stdDev);
}

const zeros = (size) => repeatN(size, () => 0);

// https://quickref.me/swap-the-rows-and-columns-of-a-matrix
const transpose = (matrix) => matrix[0].map((col, i) => matrix.map((row) => row[i]));

const clamp = (x, min, max) => {
  return Math.max(min, Math.min(x, max));
}

const rms = (values) => {
  const sumOfSquares = values.reduce((sum, value) => {
    return sum + Math.pow(value, 2);
  }, 0);
  return Math.sqrt(sumOfSquares / values.length);
}

module.exports = {
  filterObject,
  pad,
  getTimestamp,
  msToTime,
  seconds2HhMmSs,
  dedupe,
  pushNew,
  repeatN,
  fill,
  getLast,
  objectAddProperty,
  range,
  midiCps,
  cpsMidi,
  uInt8SampleToFloat32,
  roundTo,
  truncateTo,
  argMax,
  argSort,
  sum,
  mean,
  zScore,
  zeros,
  transpose,
  clamp,
  rms,
}