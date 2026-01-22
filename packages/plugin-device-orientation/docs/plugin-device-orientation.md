# device-orientation

Require mobile devices to be in a specific orientation (landscape or portrait) before continuing. On desktop devices, the trial ends immediately as orientation is not applicable.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| orientation         | "landscape" \| "portrait" | "landscape" | The required device orientation. |
| message             | HTML_STRING      | (see below)        | Message displayed when device needs to be rotated. Use `%ORIENTATION%` as a placeholder for the required orientation. |
| allow_skip          | BOOL             | false              | If true, show a button that allows participants to skip the orientation requirement. Useful for testing. |
| skip_button_label   | STRING           | "Continue anyway"  | Label for the skip button (only shown if allow_skip is true). |

Default message: `'<p style="font-size: 24px;">Please rotate your device to <strong>%ORIENTATION%</strong> mode to continue.</p>'`

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name                   | Type    | Value                                    |
| ---------------------- | ------- | ---------------------------------------- |
| was_correct_orientation | boolean | Whether the device was already in the correct orientation when the trial started. |
| final_orientation      | string  | The orientation of the device when the trial ended ("landscape" or "portrait"). |
| skipped                | boolean | Whether the participant skipped the orientation requirement using the skip button. |
| rt                     | number  | Time spent waiting for correct orientation in milliseconds. |

## Install

Using the CDN-hosted JavaScript file:

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-device-orientation"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```html
<script src="jspsych/plugin-device-orientation.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-device-orientation
```

```js
import jsPsychDeviceOrientation from "@jspsych-contrib/plugin-device-orientation";
```


## Examples

### Require landscape orientation

```javascript
const trial = {
  type: jsPsychDeviceOrientation,
  orientation: "landscape",
};
```

### Require portrait orientation with custom message

```javascript
const trial = {
  type: jsPsychDeviceOrientation,
  orientation: "portrait",
  message: '<p>Please hold your phone upright to continue.</p>',
};
```

### Allow skipping for testing

```javascript
const trial = {
  type: jsPsychDeviceOrientation,
  orientation: "landscape",
  allow_skip: true,
  skip_button_label: "Skip (testing only)",
};
```
