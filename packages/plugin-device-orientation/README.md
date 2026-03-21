# plugin-device-orientation

## Overview

Require the device to be in a specific orientation (landscape or portrait) before continuing. If the device is already in the correct orientation, the trial ends immediately. On desktop browsers, orientation is determined by the window dimensions, so the trial will typically end immediately unless the browser window happens to be sized in the non-target orientation.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-device-orientation"></script>
```

### Via NPM

```
npm install @jspsych-contrib/plugin-device-orientation
```

```js
import jsPsychDeviceOrientation from "@jspsych-contrib/plugin-device-orientation";
```

## Compatibility

`@jspsych-contrib/plugin-device-orientation` requires jsPsych v8.0.0 or later.

## Documentation

See [documentation](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-device-orientation/docs/plugin-device-orientation.md)

## Author / Citation

[Josh de Leeuw](https://github.com/jodeleeuw)
