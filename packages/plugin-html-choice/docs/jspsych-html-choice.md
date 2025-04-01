# jspsych-html-choice plugin

This plugin displays clickable html elements that can be used to present a choice. The choices can be presented until a response is given, a fixed time, or a fixed time after the reponse to allow for animated feedback.


## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type                  | Default Value | Description                                                                                                                                                                                                                                                                                                                                                                                                                   |
|---------------------|-----------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| html_array          | array of HTML-strings | *undefined*   | The HTML elements to be displayed                                                                                                                                                                                                                                                                                                                                                                                             |
| stimulus_duration   | numeric               | null          | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.                                                                                                                                                                                               |
| trial_duration      | numeric               | null          | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.                                                                             |
| response_ends_trial | boolean               | true          | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. |
| stimulus_duration   | numeric               | null          | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends.                                                                                                                                                                                               |
| values              | array                 | null          | Can be used to assign attributes to the html elements (for example, to use in a feedback animation)                                                                                                                                                                                                                                                                                                                           |
| time_after_response | numeric               | null          | If respondes_ends_trial is set to true, this is the time the stimulus remains visible after the response (can be used for feedback animation)                                                                                                                                                                                                                                                                                 |


## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name     | Type                  | Value                                                     |
|----------|-----------------------|-----------------------------------------------------------|
| rt       | numeric               | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant makes a response. |
| stimulus | array of HTML-strings | The array of HTML elements that were displayed.            |
| choice   | numeric               | The index of the chosen HTML element.                      |
| value    | object                | If given, the value attributed to the chosen HTML element. |

## Example

```javascript
let trial = {
        type: jsPsychHtmlChoice,
			html_array: [
				'<div style="position: absolute; top:0; left:0" class="slotmachine blue"></div>',
				'<div style="position: absolute; top:0; right:0" class="slotmachine red"></div>',
				'<div style="position: absolute; bottom:0; left:0" class="slotmachine green"></div>',
				'<div style="position: absolute; bottom:0; right:0" class="slotmachine yellow"></div>',
			],
			trial_duration: 2000,
			values: [20, 100, 30, 40],
			response_ends_trial: true,
			time_after_response: 3000,
    };
```
