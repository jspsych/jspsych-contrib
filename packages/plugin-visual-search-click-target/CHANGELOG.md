# @jspsych-contrib/plugin-visual-search-click-target

## 0.4.0

### Minor Changes

- [#272](https://github.com/jspsych/jspsych-contrib/pull/272) [`2b2295b5582bbbcdae394b34272bc0917451c812`](https://github.com/jspsych/jspsych-contrib/commit/2b2295b5582bbbcdae394b34272bc0917451c812) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Add a `show_absent_button` parameter (default `true`). When set to `false`, the "Absent" button is not rendered and the search area is centered in its place — useful for target-always-present displays where an absent response isn't needed.

## 0.3.0

### Minor Changes

- [#270](https://github.com/jspsych/jspsych-contrib/pull/270) [`147b725a94142b87ef724d96eca6fb10e4ec248c`](https://github.com/jspsych/jspsych-contrib/commit/147b725a94142b87ef724d96eca6fb10e4ec248c) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Make the visual search display embeddable and fix random positioning:

  - Add a `fit_container` parameter (default `false`). When `true`, the display fills its display element using container-relative units (cqw/cqh/cqmin) instead of covering the viewport, so the task can be embedded in a sized card or panel rather than only running full screen.
  - Fix an error on the default (random scatter) path: `image_positions` now defaults to `[]` instead of `null`, which jsPsych v8 rejects for an array parameter. Leaving it empty generates random non-overlapping positions as documented.

## 0.2.0

### Minor Changes

- [#224](https://github.com/jspsych/jspsych-contrib/pull/224) [`56afdfd0e5cc70d20e676240f517b0d2db9b9201`](https://github.com/jspsych/jspsych-contrib/commit/56afdfd0e5cc70d20e676240f517b0d2db9b9201) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Add optional `image_positions` parameter for specifying custom center positions for each image as percentages of the search area. Record `images` and `image_positions` in trial data output. Images are now center-positioned using the specified coordinates.

## 0.1.0

### Minor Changes

- [#219](https://github.com/jspsych/jspsych-contrib/pull/219) [`332811b434fd302f9ec63d3df8957181321b5b6c`](https://github.com/jspsych/jspsych-contrib/commit/332811b434fd302f9ec63d3df8957181321b5b6c) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - New plugin for visual search experiments with click responses. Displays images in a random scatter pattern with non-overlapping placement and an "Absent" button. Participants click on a target image or the "Absent" button if no target is present. Includes automatic correctness scoring based on target presence and the clicked image index.
