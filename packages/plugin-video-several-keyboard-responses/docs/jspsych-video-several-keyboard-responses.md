# jspsych-video-several-keyboard-responses plugin

Based on [video-keyboard-response](https://github.com/jspsych/jsPsych/tree/main/packages/plugin-video-keyboard-response) plugin, this plugin allows playing video and recording multiple responses together with video timestamps.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins) and [video-keyboard-response](https://github.com/jspsych/jsPsych/blob/main/docs/plugins/video-keyboard-response.md) plugin, this plugin accepts the following parameters. Parameters with a default value of _undefined_ must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                  | Type | Default Value | Description                      |
| -------------------------- | ---- | ------------- | -------------------------------- |
| multiple_responses_allowed | bool | true          | If true, multiple responses are recorded. If false, only the first response will be recorded, thus behaving as video-keyboard-response plugin. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name       | Type     | Value                                                            |
| ---------- | -------- | ---------------------------------------------------------------- |
| rt         | number[] | An array of the response time in milliseconds for each key press from the participant. The time is measured from when the stimulus first began playing until the participant's response. |
| stimulus   | string   | The stimulus displayed to the participant. |
| response   | string[] | An array of the keys that the participant pressed in order. |
| video_time | number[] | An array of playback positions of video when response(s) was given. |

## Example

```javascript
const trial = {
  type: jsPsychVideoSeveralKeyboardResponses,
  stimulus: ['video/sample_video.mp4'],
  choices: "ALL_KEYS",
  prompt: "Press any keys",
  width: 600,
  autoplay: true,
  trial_ends_after_video: true,
  response_ends_trial: false,
  response_allowed_while_playing: true,
  multiple_responses_allowed: true,
};
```
