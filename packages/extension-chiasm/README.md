# extension-chiasm

## Overview

`extension-chiasm` is a jsPsych extension that wires the [Chiasm](https://chiasm.eu)
eye tracker into the trial lifecycle. When attached to a trial it starts a
recording at `on_load`, stops it at `on_finish`, and merges the recorded frame
timestamps and matched gaze predictions into the trial's data row.

The extension stores configuration only. Tracker creation, backend session, and
the participant-facing calibration ceremony are triggered by the companion
plugins:

- [`@jspsych-contrib/plugin-chiasm-setup`](../plugin-chiasm-setup/README.md) —
  initializes the tracker and starts a recording session.
- [`@jspsych-contrib/plugin-chiasm-calibrate`](../plugin-chiasm-calibrate/README.md) —
  runs the full Chiasm ceremony (screen size, camera, gaze calibration,
  validation, scoring, handoff).

## Loading

### In browser

```html
<script src="https://cdn.chiasm.eu/v0.5.0/chiasm-tracker.v0.5.0.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/extension-chiasm"></script>
```

The Chiasm tracker script exposes a global `initChiasmTracker` factory that the
extension consumes. Pin the tracker URL to a specific version (as above) so
your experiment keeps working after Chiasm ships a new tracker release. The
`https://cdn.chiasm.eu/latest/chiasm-tracker.js` URL also exists but tracks
the rolling release and is intended for development only.

### Via NPM

```bash
npm install @jspsych-contrib/extension-chiasm
```

```js
import jsPsychExtensionChiasm from "@jspsych-contrib/extension-chiasm";
```

You still need to load `chiasm-tracker.js` so `window.initChiasmTracker` is
defined, or pass the factory explicitly via the `initChiasmTracker` parameter at
init time.

## Compatibility

| Component                          | Supported range  |
| ---------------------------------- | ---------------- |
| `@jspsych-contrib/extension-chiasm`| `0.x`            |
| `chiasm-tracker.js`                | `0.5.x`          |
| `jspsych`                          | `>=8.0.0`        |

Other tracker majors are not supported by this extension line; pin both the
extension and the tracker until you have explicitly tested an upgrade.

## Initialization parameters

Set when calling `initJsPsych`:

```js
initJsPsych({
  extensions: [{ type: jsPsychExtensionChiasm, params: { ... } }]
});
```

| Parameter           | Type    | Default        | Description                                                                                          |
| ------------------- | ------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `experimentId`      | string  | (required)     | Experiment identifier registered with the Chiasm backend.                                            |
| `participantId`     | string  | (required)     | Participant identifier scoped to the experiment.                                                     |
| `authToken`         | string  | (required)     | Authentication token issued for your Chiasm account.                                                 |
| `saveData`          | bool    | `true`         | Whether the backend should persist trial data.                                                       |
| `initChiasmTracker` | function | `undefined`   | Optional explicit factory. Falls back to `window.initChiasmTracker` (loaded via script tag).         |

## Trial parameters

Set when adding the extension to a trial:

```js
const trial = {
  type: jsPsychImageKeyboardResponse,
  stimulus: "stim.png",
  extensions: [{ type: jsPsychExtensionChiasm, params: { event_id: "stim_1" } }],
};
```

| Parameter  | Type   | Default     | Description                                                              |
| ---------- | ------ | ----------- | ------------------------------------------------------------------------ |
| `event_id` | string | `undefined` | Optional event label associated with the trial. Passed to `startRecording`. |

## Data generated

| Name                 | Type  | Description                                                                                                      |
| -------------------- | ----- | ---------------------------------------------------------------------------------------------------------------- |
| `chiasm_timestamps`  | array | Frame timestamps for the trial. Each entry: `{ frame_number, frame_id, timestamp }`.                             |
| `chiasm_predictions` | array | Gaze predictions matched to this trial's frames. Attached at end-of-experiment (or via `flushPredictionsToTrials()`). `undefined` until matches are attached, so guard before accessing (e.g. `data.chiasm_predictions?.length`). |
| `chiasm_recording_error` | string | Error message if `startRecording()` failed for this trial. Absent on success. |

## Data model

The extension treats the Chiasm backend and jsPsych's local data store as two
separate streams, joined locally by frame.

- **Local jsPsych stream.** Behavioral data plus `chiasm_timestamps` are
  available on every tracked trial's data row as soon as the trial ends. Each
  timestamp entry carries a `frame_id`, a `frame_number`, and a `timestamp`.
- **Chiasm backend stream.** Gaze predictions are persisted server-side as the
  tracker emits them, keyed by `frame_id`. This stream is independent of jsPsych
  and survives a participant closing the window.

The local `chiasm_predictions` array is a *convenience copy* assembled at
end-of-experiment by matching buffered predictions to each trial's recorded
`chiasm_timestamps`. The join key is `frame_id` (the opaque string the tracker
mints client-side and the backend echoes back); a 1 ms `timestamp` tolerance is
used as a fallback for predictions that arrive without a frame id.

Two workflows are supported:

1. **End-of-experiment save.** From `on_finish`, await
   `ensureAllPredictionsReturned()` — this drains the backend's in-flight
   predictions and attaches the buffered predictions to their matching trial
   rows. Then save `jsPsych.data.get().json()` once.
2. **Incremental save.** Persist behavioral data + `chiasm_timestamps` per
   trial from `on_trial_finish` (e.g. via `navigator.sendBeacon`). At
   experiment end, still call `ensureAllPredictionsReturned()` and then send a
   final flush of the merged dataset. Between blocks you can also call
   `flushPredictionsToTrials()` to merge whatever predictions have already
   arrived, without waiting for the backend round-trip.

**Crash resistance.** Because the two streams are independent, an interrupted
experiment is still recoverable. Trials persisted incrementally retain their
`chiasm_timestamps`, and the Chiasm backend still holds the predictions for
those frames — joinable by `frame_id`. If your local JSON is missing
predictions for a trial, they are not lost; they live on the Chiasm backend.

## Functions

In addition to the lifecycle hooks, the extension exposes methods on
`jsPsych.extensions.chiasm`:

### `start(): Promise<void>`

Creates the tracker, registers the prediction callback, sends experiment
metadata, and opens the backend session. Invoked by `plugin-chiasm-setup`.

### `calibrate(options?: { screenCalibration?: boolean }): Promise<void>`

Runs the full Chiasm ceremony: optional screen-size calibration, then
`setupTrackerWithRetries` (camera, fullscreen, gaze calibration, validation,
scoring, handoff). Invoked by `plugin-chiasm-calibrate`. Defaults to running the
screen-size step.

### `isInitialized(): boolean`

Returns true once `start()` has resolved successfully.

### `ensureAllPredictionsReturned(): Promise<void>`

Awaits any predictions still being sent to the backend, then attaches the
buffered predictions to their matching trial rows by `frame_id` (with a 1 ms
`timestamp` tolerance as a fallback). After this resolves, every tracked trial
whose frames received a prediction has its `chiasm_predictions` array
populated. Typically called from `jsPsych.initJsPsych({ on_finish })` before
saving data.

### `flushPredictionsToTrials(): void`

Immediately attaches any buffered predictions to their matching trials without
awaiting the backend's in-flight predictions. Use this between blocks, or
alongside an incremental-save workflow, to merge predictions that have already
arrived into the corresponding trials' data rows. Safe to call repeatedly; only
newly arrived predictions are processed on each call.

### `cleanup(): Promise<void>`

Tears down the tracker and resets extension state. Safe to call multiple times.

## Example

See [`examples/index.html`](./examples/index.html) for a complete demo
combining the extension with both companion plugins.

The example reads its `authToken` from a sibling
[`config.local.js`](./examples/config.local.example.js) file that is
gitignored. To run the demo, copy
[`examples/config.local.example.js`](./examples/config.local.example.js) to
`examples/config.local.js` and replace the placeholder token with one issued
for your Chiasm account.

## Author / Citation

[Chiasm](https://chiasm.eu) — MIT license.
