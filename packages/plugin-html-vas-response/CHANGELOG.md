# @jspsych-contrib/plugin-html-vas-response

## 3.0.0

### Major Changes

- [#161](https://github.com/jspsych/jspsych-contrib/pull/161) [`865516a75ab54f55ec5822d2a78cb3797bce8586`](https://github.com/jspsych/jspsych-contrib/commit/865516a75ab54f55ec5822d2a78cb3797bce8586) Thanks [@kinleyid](https://github.com/kinleyid)! - Switching from using a div to draw the response marker to using an SVG image. This enables more shapes (e.g., cross). Rather than using `marker_colour` to control the marker's appearance, the new argument is `marker_svg_attrs` to edit the marker's SVG attributes.

  html-vas-response 2.1.0

## 2.1.0

### Minor Changes

- [#160](https://github.com/jspsych/jspsych-contrib/pull/160) [`50fc8db40def03a7eacfd3a8f7b5b5263cf72466`](https://github.com/jspsych/jspsych-contrib/commit/50fc8db40def03a7eacfd3a8f7b5b5263cf72466) Thanks [@kinleyid](https://github.com/kinleyid)! - Fixes an issue where drag events caused the scale to become unresponsive and the `not-allowed` cursor to appear.

## 2.0.0

### Major Changes

- [#144](https://github.com/jspsych/jspsych-contrib/pull/144) [`1a7604b7331df666e954156724dc29228b37ffe7`](https://github.com/jspsych/jspsych-contrib/commit/1a7604b7331df666e954156724dc29228b37ffe7) Thanks [@jadeddelta](https://github.com/jadeddelta)! - Plugin updated to use jsPsych v8, with data now properly typed, proper audio integration, unnecessary timeout/display clears removed, and citations added if they exist. To use v7, check the README.md file for which version is compatible.

## 1.2.0

### Minor Changes

- [#69](https://github.com/jspsych/jspsych-contrib/pull/69) [`fec841b`](https://github.com/jspsych/jspsych-contrib/commit/fec841b24272c2d410c6d7c86af3add8a0a704a1) Thanks [@kinleyid](https://github.com/kinleyid)! - Add option for discrete scale points

## 1.1.0

### Minor Changes

- [#43](https://github.com/jspsych/jspsych-contrib/pull/43) [`d3198d6`](https://github.com/jspsych/jspsych-contrib/commit/d3198d6f36a8c3cbb88dba08e0e0e56c655def5a) Thanks [@kinleyid](https://github.com/kinleyid)! - Add `resp_fcn` parameter and `clicks` data property

## 1.0.0

### Major Changes

- [#23](https://github.com/jspsych/jspsych-contrib/pull/23) [`8c1c999`](https://github.com/jspsych/jspsych-contrib/commit/8c1c999f40d094f0a14cd95e129d9aead4efd35f) Thanks [@kinleyid](https://github.com/kinleyid)! - Initial release
