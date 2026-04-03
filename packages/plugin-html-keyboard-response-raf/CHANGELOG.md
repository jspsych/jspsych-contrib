# @jspsych-contrib/plugin-html-keyboard-response-raf

## 2.0.0

### Major Changes

- [#144](https://github.com/jspsych/jspsych-contrib/pull/144) [`1a7604b7331df666e954156724dc29228b37ffe7`](https://github.com/jspsych/jspsych-contrib/commit/1a7604b7331df666e954156724dc29228b37ffe7) Thanks [@jadeddelta](https://github.com/jadeddelta)! - Plugin updated to use jsPsych v8, with data now properly typed, proper audio integration, unnecessary timeout/display clears removed, and citations added if they exist. To use v7, check the README.md file for which version is compatible.

## 1.0.1

### Patch Changes

- [#97](https://github.com/jspsych/jspsych-contrib/pull/97) [`a337d74807b74e4ce15e8aebf73ffa8a08a0a3e5`](https://github.com/jspsych/jspsych-contrib/commit/a337d74807b74e4ce15e8aebf73ffa8a08a0a3e5) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Adjusted how display durations are tracked to count frames rather than rely on timers

## 1.0.0

### Major Changes

- [#92](https://github.com/jspsych/jspsych-contrib/pull/92) [`46cf7d417b35178a2fc3568d98c71656dfc8d9f4`](https://github.com/jspsych/jspsych-contrib/commit/46cf7d417b35178a2fc3568d98c71656dfc8d9f4) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Added html-keyboard-response-raf, a drop in replacement for the html-keyboard-response plugin but using requestAnimationFrame for timing.
