# plugin-chiasm-calibrate

## Overview

`plugin-chiasm-calibrate` is a jsPsych plugin that runs the
participant-facing [Chiasm](https://chiasm.eu) setup ceremony in a single trial.

The trial delegates to
[`@jspsych-contrib/extension-chiasm`](../extension-chiasm/README.md)'s
`calibrate()` method, which performs:

1. *(optional)* Credit-card screen-size calibration (`showScreenCalibration`).
2. `setupTrackerWithRetries`: camera readiness check → fullscreen prompt →
   calibration instructions and countdown → gaze calibration → processing →
   validation instructions and countdown → validation → scoring → handoff back
   to the jsPsych timeline.

All UI during steps 1 and 2 is rendered by the Chiasm tracker. The plugin only
shows a brief `instructions` HTML block before the ceremony takes over the
display.

## Loading

### In browser

```html
<script src="https://cdn.chiasm.eu/v0.5.0/chiasm-tracker.v0.5.0.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/extension-chiasm"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-chiasm-calibrate"></script>
```

### Via NPM

```bash
npm install @jspsych-contrib/plugin-chiasm-calibrate
```

```js
import jsPsychChiasmCalibrate from "@jspsych-contrib/plugin-chiasm-calibrate";
```

## Compatibility

Requires jsPsych v8.0.0 or later. Requires
`@jspsych-contrib/extension-chiasm` to be registered on the `JsPsych` instance
and `plugin-chiasm-setup` to have already initialized the tracker earlier in the
timeline.

## Parameters

| Parameter            | Type        | Default                                                                              | Description                                                                                              |
| -------------------- | ----------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `instructions`       | HTML string | `<p>Calibration will begin shortly. Please follow the on-screen instructions.</p>`   | Shown briefly before the Chiasm calibration UI takes over the display.                                   |
| `screen_calibration` | bool        | `true`                                                                               | Whether to run the credit-card screen-size calibration step before the camera and gaze calibration flow. |

## Data generated

| Name                   | Type   | Description                                                |
| ---------------------- | ------ | ---------------------------------------------------------- |
| `success`              | bool   | Whether the ceremony completed without throwing.           |
| `calibration_duration` | int    | Milliseconds elapsed during the ceremony.                  |
| `error`                | string | Error message if the ceremony failed, otherwise `null`.    |

## Example

```js
const calibrate = {
  type: jsPsychChiasmCalibrate,
  screen_calibration: true,
};

jsPsych.run([setup, calibrate, /* ... tracked trials ... */]);
```

## Author / Citation

[Chiasm](https://chiasm.eu) — MIT license.
