# plugin-capture-url-params

## Overview

The `plugin-capture-url-params` plugin saves data embedded in the URL parameters into the jsPsych data object. This is useful when working with external participant platforms like Prolific, which use URL parameters to pass unique identifiers such as `PROLIFIC_PID`, `STUDY_ID`, or `SESSION_ID`.

By default, the plugin captures all available URL parameters. You can also specify a subset of required parameters using the `url_params` option. If any of these required parameters are missing, the plugin can optionally show an error message to participants and either allow the experiment to continue (`soft_fail = true`) or stop the experiment (`soft_fail = false`).

## Loading (Note: these CDN resources don't currently exist... but maybe will eventually?)

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych/plugin-capture-url-params@VERSION_HERE"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-capture-url-params.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-capture-url-params
```

```js
import jsPsychPluginCaptureUrlParams from "@jspsych/plugin-capture-url-params";
```

## Compatibility

`plugin-capture-url-params` requires jsPsych v8.0.0 or later.

## Parameters

| Name            | Type             | Default                                    | Description                                                                                                                             |
| --------------- | ---------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `url_params`    | array of strings | `[]`                                       | A list of specific URL parameter keys to extract (e.g., `["PROLIFIC_PID", "STUDY_ID"]`). If empty, all URL parameters will be captured. |
| `show_error`    | boolean          | `false`                                    | Whether to display an error message to the participant if any of the specified parameters are missing.                                  |
| `error_message` | string           | `"URL parameters could not be retrieved."` | The message shown to participants if required parameters are missing.                                                                   |
| `soft_fail`     | boolean          | `true`                                     | If set to `false`, the experiment will abort when required parameters are missing. If `true`, the experiment will continue.             |

## Data

The plugin saves the captured parameters as an object in the `response` field of the trial data.

```json
{
  "response": {
    "PROLIFIC_PID": "abc123",
    "STUDY_ID": "def456"
  }
}
```

## Documentation

See [documentation](https://github.com/themusiclab/pose/tree/main/test/plugin-capture-url-params/README.md)

## Author / Citation

[Courtney B. Hilton](https://github.com/courtney-bryce-hilton)
