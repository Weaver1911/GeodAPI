let debugMode = false;

function setDebugMode(mode) {
  debugMode = mode;
}

function log(...args) {
  if (debugMode) {
    console.log(...args);
  }
}

module.exports = {
  setDebugMode,
  log,
};