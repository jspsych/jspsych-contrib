# plugin-chiasm-calibrate

jsPsych plugin that runs the participant-facing [Chiasm](https://chiasm.eu)
setup ceremony in a single trial. Delegates to
[`@jspsych-contrib/extension-chiasm`](../../extension-chiasm/docs/extension-chiasm.md)'s
`calibrate()` method, which performs:

1. *(optional)* Credit-card screen-size calibration (`showScreenCalibration`).
2. `setupTrackerWithRetries`: camera readiness check → fullscreen prompt →
   calibration instructions and countdown → gaze calibration → processing →
   validation instructions and countdown → validation → scoring → handoff back
   to the jsPsych timeline.

All UI during steps 1 and 2 is rendered by the Chiasm tracker. The plugin
only shows a brief `instructions` HTML block before the ceremony takes over
the display.

Requires `plugin-chiasm-setup` to have already initialized the tracker earlier
in the timeline.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter            | Type        | Default Value                                                                      | Description                                                                                              |
| -------------------- | ----------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `instructions`       | HTML string | `<p>Calibration will begin shortly. Please follow the on-screen instructions.</p>` | Shown briefly before the Chiasm calibration UI takes over the display.                                   |
| `screen_calibration` | bool        | `true`                                                                             | Whether to run the credit-card screen-size calibration step before the camera and gaze calibration flow. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name                   | Type   | Value                                                   |
| ---------------------- | ------ | ------------------------------------------------------- |
| `success`              | bool   | Whether the ceremony completed without throwing.        |
| `calibration_duration` | int    | Milliseconds elapsed during the ceremony.               |
| `error`                | string | Error message if the ceremony failed, otherwise `null`. |

## Install

Using the CDN-hosted JavaScript files (also load the Chiasm tracker and the
companion extension; pin to the versions you have tested against):

```js
<script src="https://cdn.chiasm.eu/v0.5.0/chiasm-tracker.v0.5.0.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/extension-chiasm"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-chiasm-calibrate"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-chiasm-calibrate.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-chiasm-calibrate
```

```js
import jsPsychChiasmCalibrate from "@jspsych-contrib/plugin-chiasm-calibrate";
```

## Examples

### Full ceremony, including screen-size step

```javascript
var trial = {
  type: jsPsychChiasmCalibrate,
  screen_calibration: true
};
```

### Skip the screen-size step

```javascript
var trial = {
  type: jsPsychChiasmCalibrate,
  screen_calibration: false
};
```

### Custom instructions

```javascript
var trial = {
  type: jsPsychChiasmCalibrate,
  instructions: "<p>Please follow the calibration target with your eyes.</p>"
};
```
