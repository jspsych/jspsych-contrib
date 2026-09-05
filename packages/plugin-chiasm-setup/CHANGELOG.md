# @jspsych-contrib/plugin-chiasm-setup

## 0.1.0

### Minor Changes

- [#266](https://github.com/jspsych/jspsych-contrib/pull/266) [`dbd9788ad8fd74c099b176fb445ccf331222bdf4`](https://github.com/jspsych/jspsych-contrib/commit/dbd9788ad8fd74c099b176fb445ccf331222bdf4) Thanks [@artembelopolsky](https://github.com/artembelopolsky)! - Add Chiasm eye tracking integration for jsPsych.

  - `extension-chiasm` wires the Chiasm tracker into the trial lifecycle, recording per-frame timestamps during each trial and post-hoc attaching matched gaze predictions to the trials they belong to (joined by `frame_id`, with a 1ms timestamp fallback). Supports an end-of-experiment data-export workflow as well as an incremental per-trial save flow.
  - `plugin-chiasm-setup` initializes the tracker and starts a backend recording session in a single timeline node.
  - `plugin-chiasm-calibrate` runs the full Chiasm participant-facing screen, camera, fullscreen, and gaze calibration ceremony in a single timeline node.
