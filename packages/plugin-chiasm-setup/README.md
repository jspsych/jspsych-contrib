# plugin-chiasm-setup

## Overview

`plugin-chiasm-setup` is a jsPsych plugin that initializes the
[Chiasm](https://chiasm.eu) eye tracker and starts a backend recording session
by invoking
[`@jspsych-contrib/extension-chiasm`](../extension-chiasm/README.md)'s `start()`
method.

No participant-facing UI is shown beyond the configurable `loading_message`.
The visible calibration ceremony belongs to
[`plugin-chiasm-calibrate`](../plugin-chiasm-calibrate/README.md).

## Loading

### In browser

```html
<script src="https://cdn.chiasm.eu/v0.5.0/chiasm-tracker.v0.5.0.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/extension-chiasm"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-chiasm-setup"></script>
```

### Via NPM

```bash
npm install @jspsych-contrib/plugin-chiasm-setup
```

```js
import jsPsychChiasmSetup from "@jspsych-contrib/plugin-chiasm-setup";
```

## Compatibility

Requires jsPsych v8.0.0 or later. Requires
`@jspsych-contrib/extension-chiasm` to be registered on the `JsPsych` instance.

## Parameters

| Parameter          | Type        | Default                                                              | Description                                                                  |
| ------------------ | ----------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `loading_message`  | HTML string | `<p>Initializing eye tracking...</p>`                                | Shown while the tracker is being initialized.                                |
| `abort_on_failure` | bool        | `true`                                                               | If true, the experiment aborts when initialization throws.                   |
| `error_message`    | HTML string | `<p>Eye tracking setup failed. The experiment cannot continue.</p>`  | Shown to the participant on abort.                                           |

## Data generated

| Name             | Type   | Description                                                |
| ---------------- | ------ | ---------------------------------------------------------- |
| `success`        | bool   | Whether initialization succeeded.                          |
| `setup_duration` | int    | Milliseconds elapsed during initialization.                |
| `error`          | string | Error message if initialization failed, otherwise `null`.  |

## Example

```js
const setup = { type: jsPsychChiasmSetup };
jsPsych.run([setup, /* ... */]);
```

## Author / Citation

[Chiasm](https://chiasm.eu) — MIT license.
