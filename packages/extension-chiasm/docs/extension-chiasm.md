# extension-chiasm

Chiasm eye tracking extension for jsPsych. Wires the [Chiasm](https://chiasm.eu)
tracker into the trial lifecycle: starts a recording at `on_load`, stops it at
`on_finish`, and attaches the recorded frame timestamps to the trial's data
row. Gaze predictions are matched in at end-of-experiment via
`ensureAllPredictionsReturned()` (see Functions).

Tracker creation, backend session, and the participant-facing calibration
ceremony are triggered by the companion plugins
[`@jspsych-contrib/plugin-chiasm-setup`](../../plugin-chiasm-setup/docs/plugin-chiasm-setup.md)
and
[`@jspsych-contrib/plugin-chiasm-calibrate`](../../plugin-chiasm-calibrate/docs/plugin-chiasm-calibrate.md).

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`.

```js
initJsPsych({
  extensions: [
    { type: jsPsychExtensionChiasm, params: { ... } }
  ]
})
```

| Parameter           | Type     | Default Value  | Description                                                                                                            |
| ------------------- | -------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `experimentId`      | string   | undefined      | Experiment identifier registered with the Chiasm backend. Required.                                                    |
| `participantId`     | string   | undefined      | Participant identifier scoped to the experiment. Required.                                                             |
| `authToken`         | string   | undefined      | Authentication token issued for your Chiasm account. Required.                                                         |
| `saveData`          | bool     | `true`         | Whether the backend should persist trial data.                                                                         |
| `initChiasmTracker` | function | undefined      | Optional explicit factory. Falls back to `window.initChiasmTracker` (loaded via the `chiasm-tracker.js` script tag).   |

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: jsPsychImageKeyboardResponse,
  stimulus: "stim.png",
  extensions: [
    { type: jsPsychExtensionChiasm, params: { event_id: "stim_1" } }
  ]
}
```

| Parameter  | Type   | Default Value | Description                                                                 |
| ---------- | ------ | ------------- | --------------------------------------------------------------------------- |
| `event_id` | string | undefined     | Optional event label associated with the trial. Passed to `startRecording`. |

## Data Generated

| Name                 | Type    | Value                                                                                                                                       |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `chiasm_timestamps`  | array   | Frame timestamps for the trial. Each entry: `{ frame_number, frame_id, timestamp }`.                                                        |
| `chiasm_predictions` | array   | Gaze predictions matched to this trial's frames. Attached at end-of-experiment (or via `flushPredictionsToTrials()`). `undefined` until matches are attached, so guard before accessing (e.g. `data.chiasm_predictions?.length`). |
| `chiasm_recording_error` | string | Error message if `startRecording()` failed for this trial. Absent on success.                                                          |

## Functions

The extension exposes the following methods on `jsPsych.extensions.chiasm`.

### `start(): Promise<void>`

Creates the tracker, registers the prediction callback, sends experiment
metadata, and opens the backend session. Invoked by `plugin-chiasm-setup`.

### `calibrate(options?: { screenCalibration?: boolean }): Promise<void>`

Runs the full Chiasm ceremony: optional screen-size calibration, then
`setupTrackerWithRetries` (camera, fullscreen, gaze calibration, validation,
scoring, handoff). Invoked by `plugin-chiasm-calibrate`. Defaults to running
the screen-size step.

### `isInitialized(): boolean`

Returns true once `start()` has resolved successfully.

### `ensureAllPredictionsReturned(): Promise<void>`

Awaits any predictions still being sent to the backend, then attaches the
buffered predictions to their matching trial rows by `frame_id` (with a 1 ms
`timestamp` tolerance as a fallback). After this resolves, every tracked trial
whose frames received a prediction has its `chiasm_predictions` array
populated. Typically called from `initJsPsych({ on_finish })` before saving
data.

### `flushPredictionsToTrials(): void`

Immediately attaches any buffered predictions to their matching trials without
awaiting the backend's in-flight predictions. Use this between blocks, or
alongside an incremental-save workflow, to merge predictions that have already
arrived into the corresponding trials' data rows. Safe to call repeatedly;
only newly arrived predictions are processed on each call.

### `cleanup(): Promise<void>`

Tears down the tracker and resets extension state. Safe to call multiple
times.

## Install

Using the CDN-hosted JavaScript file (also load the Chiasm tracker; pin both
to the versions you have tested against):

```js
<script src="https://cdn.chiasm.eu/v0.5.0/chiasm-tracker.v0.5.0.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/extension-chiasm"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/extension-chiasm.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/extension-chiasm
```

```js
import jsPsychExtensionChiasm from "@jspsych-contrib/extension-chiasm";
```

## Examples

### Tracked image trial

```javascript
const jsPsych = initJsPsych({
  extensions: [
    {
      type: jsPsychExtensionChiasm,
      params: {
        experimentId: "my-experiment",
        participantId: "p01",
        authToken: "trk_...",
      },
    },
  ],
  on_finish: async function () {
    await jsPsych.extensions.chiasm.ensureAllPredictionsReturned();
    jsPsych.data.get().localSave("json", "chiasm_data.json");
    await jsPsych.extensions.chiasm.cleanup();
  },
});

const setup = { type: jsPsychChiasmSetup };
const calibrate = { type: jsPsychChiasmCalibrate };

const trial = {
  type: jsPsychImageKeyboardResponse,
  stimulus: "stim.png",
  choices: ["y", "n"],
  extensions: [
    { type: jsPsychExtensionChiasm, params: { event_id: "stim_1" } },
  ],
};

jsPsych.run([setup, calibrate, trial]);
```
