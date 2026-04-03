# @jspsych-contrib/plugin-visual-search-click-target

## 0.2.0

### Minor Changes

- [#224](https://github.com/jspsych/jspsych-contrib/pull/224) [`56afdfd0e5cc70d20e676240f517b0d2db9b9201`](https://github.com/jspsych/jspsych-contrib/commit/56afdfd0e5cc70d20e676240f517b0d2db9b9201) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Add optional `image_positions` parameter for specifying custom center positions for each image as percentages of the search area. Record `images` and `image_positions` in trial data output. Images are now center-positioned using the specified coordinates.

## 0.1.0

### Minor Changes

- [#219](https://github.com/jspsych/jspsych-contrib/pull/219) [`332811b434fd302f9ec63d3df8957181321b5b6c`](https://github.com/jspsych/jspsych-contrib/commit/332811b434fd302f9ec63d3df8957181321b5b6c) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - New plugin for visual search experiments with click responses. Displays images in a random scatter pattern with non-overlapping placement and an "Absent" button. Participants click on a target image or the "Absent" button if no target is present. Includes automatic correctness scoring based on target presence and the clicked image index.
