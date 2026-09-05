---
"@jspsych-contrib/extension-chiasm": minor
"@jspsych-contrib/plugin-chiasm-setup": minor
"@jspsych-contrib/plugin-chiasm-calibrate": minor
---

Add Chiasm eye tracking integration for jsPsych.

- `extension-chiasm` wires the Chiasm tracker into the trial lifecycle, recording per-frame timestamps during each trial and post-hoc attaching matched gaze predictions to the trials they belong to (joined by `frame_id`, with a 1ms timestamp fallback). Supports an end-of-experiment data-export workflow as well as an incremental per-trial save flow.
- `plugin-chiasm-setup` initializes the tracker and starts a backend recording session in a single timeline node.
- `plugin-chiasm-calibrate` runs the full Chiasm participant-facing screen, camera, fullscreen, and gaze calibration ceremony in a single timeline node.
