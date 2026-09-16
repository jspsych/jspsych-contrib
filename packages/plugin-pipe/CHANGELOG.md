# @jspsych-contrib/plugin-pipe

## 0.7.0

### Minor Changes

- [#279](https://github.com/jspsych/jspsych-contrib/pull/279) [`e556dc744c2d38bb56bb5794223ddbeef53ac3ab`](https://github.com/jspsych/jspsych-contrib/commit/e556dc744c2d38bb56bb5794223ddbeef53ac3ab) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Report failed saves correctly, and add `base_url` for testing against another DataPipe deployment.

  A save trial used to record `success: true` when the request never left the browser, because a failed `fetch` returns an `Error` and an `Error` has no `.error` property. A refused condition request was worse: reading `.error` off an undefined condition threw inside the trial, which then never finished and left the participant watching the spinner forever. The same hang followed a condition response that was not JSON (such as an HTML 404 page from a mistyped URL) and a trial with a missing required parameter; both now finish with `success: false`.

  A refused condition request now records why. `getCondition` returns DataPipe's response body (its `error` and `message`) when there is no condition to return, where it used to return `undefined`, so code that calls it directly should check for a number.

  `base_url` (and `jsPsychPipe.setBaseURL()`) exist so that an experiment can be run end to end against a test deployment. Before, the URL was written into three `fetch` calls, so every change to this plugin was first tried in production against real studies.

## 0.6.0

### Minor Changes

- [#236](https://github.com/jspsych/jspsych-contrib/pull/236) [`befe0a88fd2d330a2337d8ff531917c2e36ecdbf`](https://github.com/jspsych/jspsych-contrib/commit/befe0a88fd2d330a2337d8ff531917c2e36ecdbf) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Add gzip compression for request bodies, enabled by default via a new `compression` parameter. This allows uploading datasets larger than the 32 MB server limit by compressing them before sending. Text data (JSON, CSV) typically compresses 2-10x, effectively raising the upload limit to 60-300+ MB for most experiment data. Compression uses the browser's built-in `CompressionStream` API and gracefully falls back to uncompressed uploads in unsupported browsers.

## 0.5.0

### Minor Changes

- [#144](https://github.com/jspsych/jspsych-contrib/pull/144) [`1a7604b7331df666e954156724dc29228b37ffe7`](https://github.com/jspsych/jspsych-contrib/commit/1a7604b7331df666e954156724dc29228b37ffe7) Thanks [@jadeddelta](https://github.com/jadeddelta)! - Plugin updated to use jsPsych v8, with data now properly typed, proper audio integration, unnecessary timeout/display clears removed, and citations added if they exist. To use v7, check the README.md file for which version is compatible.

## 0.4.0

### Minor Changes

- [#114](https://github.com/jspsych/jspsych-contrib/pull/114) [`4af83c6f77f0b48af1ddf0b7cab794e57a82500d`](https://github.com/jspsych/jspsych-contrib/commit/4af83c6f77f0b48af1ddf0b7cab794e57a82500d) Thanks [@Bankminer78](https://github.com/Bankminer78)! - Added ability to display wait message above loading graphics during upload.

## 0.3.0

### Minor Changes

- [#63](https://github.com/jspsych/jspsych-contrib/pull/63) [`151f715`](https://github.com/jspsych/jspsych-contrib/commit/151f715bdee829fdf36cdbfbb6f25ba0ff56ff06) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Update to work with changes to the DataPipe API

## 0.2.0

### Minor Changes

- [#56](https://github.com/jspsych/jspsych-contrib/pull/56) [`e0fb545`](https://github.com/jspsych/jspsych-contrib/commit/e0fb545153fa7e81a4ef8c29139b745c4ae56519) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Rename data parameter to data_string to avoid conflict with builtin data parameter.

## 0.1.0

### Minor Changes

- [#48](https://github.com/jspsych/jspsych-contrib/pull/48) [`74ac790`](https://github.com/jspsych/jspsych-contrib/commit/74ac79018eb60a7396ed8b576496e94d79436daa) Thanks [@jodeleeuw](https://github.com/jodeleeuw)! - Initial release of the Pipe plugin, which facilitates communication with the Pipe My Data (https://pipe.jspsych.org) service. This service enables sending data directly to an OSF component. This release is under v0.1 to reflect that the API is still under development.
