---
"@jspsych-contrib/plugin-pipe": minor
---

Report failed saves correctly, and add `base_url` for testing against another DataPipe deployment.

A save trial used to record `success: true` when the request never left the browser, because a failed `fetch` returns an `Error` and an `Error` has no `.error` property. A refused condition request was worse: reading `.error` off an undefined condition threw inside the trial, which then never finished and left the participant watching the spinner forever.

`base_url` (and `jsPsychPipe.setBaseURL()`) exist so that an experiment can be run end to end against a test deployment. Before, the URL was written into three `fetch` calls, so every change to this plugin was first tried in production against real studies.
