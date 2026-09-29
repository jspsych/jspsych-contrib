const config = require("@jspsych/config/jest").makePackageConfig(__dirname);

// Force a single copy of jspsych across the test run. Without this, the spec
// (and the plugin) resolve jspsych from this package's nested copy while
// @jspsych/test-utils resolves it from the hoisted root copy. Two different
// JsPsych classes make `jsPsych instanceof JsPsych` fail inside
// startTimeline(), so the test's pre-configured instance (with the mocked
// microphone recorder) is silently discarded.
config.moduleNameMapper = {
  ...config.moduleNameMapper,
  "^jspsych$": require.resolve("jspsych"),
};

module.exports = config;
