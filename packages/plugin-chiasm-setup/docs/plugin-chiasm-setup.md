# plugin-chiasm-setup

jsPsych plugin that initializes the [Chiasm](https://chiasm.eu) eye tracker
and starts a backend recording session by invoking
[`@jspsych-contrib/extension-chiasm`](../../extension-chiasm/docs/extension-chiasm.md)'s
`start()` method.

No participant-facing UI is shown beyond the configurable `loading_message`.
The visible calibration ceremony belongs to
[`plugin-chiasm-calibrate`](../../plugin-chiasm-calibrate/docs/plugin-chiasm-calibrate.md).

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter          | Type        | Default Value                                                       | Description                                                |
| ------------------ | ----------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| `loading_message`  | HTML string | `<p>Initializing eye tracking...</p>`                               | Shown while the tracker is being initialized.              |
| `abort_on_failure` | bool        | `true`                                                              | If true, the experiment aborts when initialization throws. |
| `error_message`    | HTML string | `<p>Eye tracking setup failed. The experiment cannot continue.</p>` | Shown to the participant on abort.                         |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name             | Type   | Value                                                     |
| ---------------- | ------ | --------------------------------------------------------- |
| `success`        | bool   | Whether initialization succeeded.                         |
| `setup_duration` | int    | Milliseconds elapsed during initialization.               |
| `error`          | string | Error message if initialization failed, otherwise `null`. |

## Install

Using the CDN-hosted JavaScript files (also load the Chiasm tracker and the
companion extension; pin to the versions you have tested against):

```js
<script src="https://cdn.chiasm.eu/v0.5.0/chiasm-tracker.v0.5.0.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/extension-chiasm"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-chiasm-setup"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-chiasm-setup.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-chiasm-setup
```

```js
import jsPsychChiasmSetup from "@jspsych-contrib/plugin-chiasm-setup";
```

## Examples

### Default setup trial

```javascript
var trial = {
  type: jsPsychChiasmSetup
};
```

### Custom loading and error messages

```javascript
var trial = {
  type: jsPsychChiasmSetup,
  loading_message: "<p>Preparing the camera...</p>",
  error_message: "<p>We could not initialize eye tracking. Please reload.</p>",
  abort_on_failure: true
};
```
