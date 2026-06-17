![jspsych logo](http://www.jspsych.org/7.0/img/jspsych-logo.jpg)

jsPsych is a JavaScript framework for creating behavioral experiments that run in a web browser.

## Plugin Description
The video-text-response plugin plays a video and collects one or more free-text responses from the participant. By default the response box is enabled only while the video is paused, so the participant can pause, type a response, resume, and repeat as many times as they like within a single trial. The video's playback position is recorded for every pause and every response, which makes the plugin well suited to event-segmentation, continuous-rating, and "pause and comment" paradigms, as well as simple "watch then answer" tasks.

Native HTML5 video controls are hidden by default, so the participant can pause and resume but cannot scrub or skip ahead. Pausing is handled by a custom Pause/Resume button and/or a configurable key (Space bar by default).

## Overview

- Pause-gated or continuous responding (`response_allowed_while_playing`).
- Multiple responses per trial, each tagged with the video time at which it was given.
- Optional on-screen history of submitted responses.
- Character filtering (letters / numbers / symbols) for constrained inputs.
- Flexible trial-ending options: on response, on a done button, when the video ends, or after a time limit.

## Parameters

This is a summary of the most commonly used parameters. See the [full documentation](docs/plugin-video-text-response.md) for the complete parameter and data reference.

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| stimulus | VIDEO (array) | *undefined* | Path(s) to the video file. Required. |
| response_allowed_while_playing | BOOL | false | If false, the response box is enabled only while paused. If true, it stays open continuously. |
| show_pause_button | BOOL | true | Show a custom Pause/Resume button below the video. |
| pause_key | KEY | `" "` | Key that toggles pause/resume. Set to null to disable keyboard pausing. |
| prompt | HTML_STRING | null | HTML shown below the video and above the response box. |
| placeholder | STRING | "" | Placeholder text in the empty response box. |
| required | BOOL | true | Block submission of an empty or whitespace-only response. |
| response_ends_trial | BOOL | true | End the trial as soon as a response is submitted. |
| trial_ends_after_video | BOOL | false | End the trial when the video finishes playing. |
| show_done_button | BOOL | false | Show a button that ends the trial when clicked. |
| allow_numbers / allow_letters / allow_symbols | BOOL | true | Restrict which character classes are accepted in the box. |
| show_response_history | BOOL | false | Display previously submitted responses on screen during the trial. |

## Data Generated

This is a summary of the data collected. See the [full documentation](docs/plugin-video-text-response.md) for the complete reference, including how `rt` and `response_duration` differ.

| Name | Type | Value |
| ---- | ---- | ----- |
| response | STRING (array) | Each submitted response, in submission order. |
| rt | INT (array) | Time from trial start to each submission. |
| response_duration | INT (array) | Time from when each response window opened to its submission. |
| response_video_time | FLOAT (array) | Video playback time (seconds) at each submission. |
| pause_video_time | FLOAT (array) | Video playback time at each pause. |
| pause_duration | INT (array) | Length of each pause in milliseconds. |
| total_trial_time | INT | Total trial duration in milliseconds. |

## Examples

Pause to respond, as many times as needed, with the trial ending when the video finishes:

```javascript
var trial = {
  type: jsPsychVideoTextResponse,
  stimulus: ["video/sample_video.mp4"],
  prompt: "<p>Pause the video (button or spacebar) whenever you want to respond.</p>",
  response_ends_trial: false,
  trial_ends_after_video: true,
};
```

Continuous responding while the video plays:

```javascript
var trial = {
  type: jsPsychVideoTextResponse,
  stimulus: ["video/sample_video.mp4"],
  response_allowed_while_playing: true,
  response_ends_trial: false,
  trial_ends_after_video: true,
};
```

Letters-only input, response required, with an on-screen response history:

```javascript
var trial = {
  type: jsPsychVideoTextResponse,
  stimulus: ["video/sample_video.mp4"],
  required: true,
  allow_numbers: false,
  allow_symbols: false,
  show_response_history: true,
  response_ends_trial: false,
  trial_ends_after_video: true,
};
```

Letting the participant end the trial themselves with a done button (useful when responses do not end the trial and you do not want to rely on the video finishing):

```javascript
var trial = {
  type: jsPsychVideoTextResponse,
  stimulus: ["video/sample_video.mp4"],
  prompt: "<p>Pause and respond as many times as you like.</p>",
  response_ends_trial: false,
  show_done_button: true,
  done_button_label: "I'm finished",
  done_prompt: "<p>Click when you have nothing more to add.</p>",
};
```

## Loading

### Via NPM

```
npm install @jspsych-contrib/plugin-video-text-response
```

```js
import VideoTextResponse from "@jspsych-contrib/plugin-video-text-response";
```

### Via CDN

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-video-text-response"></script>
```

## Compatibility

`plugin-video-text-response` requires jsPsych v8.0.0 or later.

## Documentation

See the [full documentation](docs/plugin-video-text-response.md) for the complete parameter and data reference.

## Author / Citation

Gabriel Fajardo, Xinyi Guan
