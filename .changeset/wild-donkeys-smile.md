---
"@jspsych-contrib/plugin-pipe": minor
---

Report failed saves correctly, and add `base_url` for testing against another DataPipe deployment.

A save trial used to record `success: true` when the request never left the browser, because a failed `fetch` returns an `Error` and an `Error` has no `.error` property. A refused condition request was worse: reading `.error` off an undefined condition threw inside the trial, which then never finished and left the participant watching the spinner forever. The same hang followed a condition response that was not JSON (such as an HTML 404 page from a mistyped URL) and a trial with a missing required parameter; both now finish with `success: false`.

A refused condition request now records why. `getCondition` returns DataPipe's response body (its `error` and `message`) when there is no condition to return, where it used to return `undefined`, so code that calls it directly should check for a number.

`base_url` (and `jsPsychPipe.setBaseURL()`) exist so that an experiment can be run end to end against a test deployment. Before, the URL was written into three `fetch` calls, so every change to this plugin was first tried in production against real studies.
