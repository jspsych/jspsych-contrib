# spr

## Overview

This is a plugin built to conduct self-paced reading trials. It supports different reading modes including single-word mask and multi-word (hide/show). This package allows you to also customize the format of the text displayed by using CSS, and how many words display per key press.

### Why `plugin-spr` over `plugin-self-paced-reading`?
This plugin primarily works within the context of the DOM- allowing for a much more flexible usage of this plugin with respect to differing screen sizes. On the other hand, `plugin-self-paced-reading` primarily handles appearance via `<canvas>` elements, which are much more strict, appearing as the same for all screen sizes. However, `plugin-self-paced-reading` provides an easier way to customize the look of your plugin through parameters, while `plugin-spr`, outside of the parameters given, require you to inject CSS classes to better customize.

## Loading

### In browser

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-spr@1.0.0"></script>
```

### Via NPM

```
npm install @jspsych-contrib/plugin-spr
```

```js
import jsPsychSpr from '@jspsych-contrib/plugin-spr';
```

## Compatibility

jsPsych 8.0.0

## Documentation

See [documentation](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-spr/docs/jspsych-spr.md)

## Author / Citation

Initial sketch by [Victor Zhang](https://github.com/vzhang03). Full implementation by [jade](https://github.com/jadeddelta).
