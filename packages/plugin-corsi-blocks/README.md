# corsi-blocks

## Overview

This plugin implements the Corsi block tapping task. It has two modes: a display mode and an input mode. In the display mode, the participant is shown a sequence of blocks. In the input mode, the participant is shown a sequence of blocks and must tap the blocks in the same order. Feedback can be provided after each responses. The number and arrangement of the blocks can be customized.

## Loading

### In browser

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-corsi-blocks@1.0.0">
```

### Via NPM

```
npm install @jspsych-contrib/plugin-corsi-blocks
```

```js
import jsPsychCorsiBlocks from '@jspsych-contrib/plugin-corsi-blocks';
```

## Compatibility

jsPsych 7.3.2.

(Earlier versions of jsPsych version 7 will work if you explicitly set the `blocks` parameter in a trial. Using the default `blocks` parameter requires `7.3.2` or later.)

## Documentation

See [documentation](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-corsi-blocks/docs/jspsych-corsi-blocks.md)

## Author / Citation

Josh de Leeuw