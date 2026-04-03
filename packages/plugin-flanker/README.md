# @jspsych-contrib/plugin-flanker

## Overview

A jsPsych plugin for the Eriksen Flanker Task. Presents a configurable flanker array with precise Stimulus Onset Asynchrony (SOA) timing using requestAnimationFrame. Supports arrows (default), letters, numbers, or any custom HTML/SVG stimuli. Includes both keyboard and mobile-friendly button response modes.

## Loading

**CDN:**
```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-flanker"></script>
```

**NPM:**
```sh
npm install @jspsych-contrib/plugin-flanker
```
```js
import jsPsychFlanker from '@jspsych-contrib/plugin-flanker';
```

## Compatibility

jsPsych v8.0+

## Documentation

See the [full documentation](./docs/plugin-flanker.md) for parameter details, usage examples, and integration instructions.

## Quick Start

```javascript
// Default arrows with keyboard response
const trial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'incongruent',
  soa: -200  // Flankers appear 200ms before target
};

// Letter flankers with buttons
const letterTrial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'incongruent',
  left_stimulus: '<span style="font-size:48px">H</span>',
  right_stimulus: '<span style="font-size:48px">S</span>',
  response_mode: 'buttons'
};
```

## Author / Citation

Josh de Leeuw
[GitHub](https://github.com/jodeleeuw)

If you use this plugin in your research, please cite:

```
Eriksen, B. A., & Eriksen, C. W. (1974). Effects of noise letters upon the
identification of a target letter in a nonsearch task. Perception & Psychophysics,
16(1), 143-149.
```
