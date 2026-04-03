# @jspsych-contrib/plugin-flanker

## 1.0.0

### Major Changes

- [#205](https://github.com/jspsych/jspsych-contrib/pull/205) [`180868f87c31683dc5a8969c48bc7afeb269faff`](https://github.com/jspsych/jspsych-contrib/commit/180868f87c31683dc5a8969c48bc7afeb269faff) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Initial release of the Eriksen Flanker Task plugin. This plugin displays a configurable flanker array for measuring selective attention and response inhibition. Key features include:

  - Generic stimulus support: arrows (default), letters, numbers, or any custom HTML/SVG
  - Precise SOA (Stimulus Onset Asynchrony) timing using requestAnimationFrame for frame-accurate control
  - Dual response modes: keyboard and mobile-friendly buttons
  - Flexible spatial configuration: horizontal/vertical arrangement, 5 or 7-item arrays
  - Configurable timing parameters: stimulus duration, response timeout, SOA
  - Support for congruent, incongruent, and neutral trial types
  - Customizable stimulus size and target-flanker separation
  - Comprehensive test suite with 28 passing tests
