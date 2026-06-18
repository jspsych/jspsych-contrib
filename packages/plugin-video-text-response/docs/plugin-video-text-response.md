# plugin-video-text-response

Plays a video and collects one or more free-text responses from the participant, recording the video playback time at which each response (and each pause) occurs.

By default, the response box and submit button are enabled only while the video is paused, via a custom Pause/Resume button and/or a configurable key (Space bar by default). The participant can pause, type a response, resume, and repeat as many times as they like within a single trial. Setting `response_allowed_while_playing: true` instead keeps the box open continuously, regardless of play/pause state.

Native HTML5 video controls are hidden by default, so the participant can pause and resume but cannot scrub or change the playback position. Set `controls: true` to show the native controls.

The trial can end in several ways, which can be combined: the participant submits a response (when `response_ends_trial` is true, the default), the participant clicks a done button (when `show_done_button` is true), the video finishes playing (when `trial_ends_after_video` is true), or a time limit elapses (`trial_duration`). An optional on-screen history can display previously submitted responses during the trial, and character-filtering options can restrict input to letters, numbers, and/or symbols.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| stimulus | VIDEO (array) | *undefined* | An array of file paths to the video. Multiple formats of the same video can be given (e.g. `.mp4`, `.webm`) for cross-browser support; the first format the browser can play is used. |
| width | INT | null | The width of the video in pixels. If null, the video's native width is used. |
| height | INT | null | The height of the video in pixels. If null, the video's native height is used. |
| autoplay | BOOL | true | If true, the video begins playing as soon as it has loaded. |
| controls | BOOL | false | If true, the native HTML5 video controls (play/pause, seek bar, volume) are shown, which lets the participant scrub the video. If false, only pausing/resuming via the custom button or key is possible. |
| show_pause_button | BOOL | true | If true, a custom Pause/Resume button is displayed below the video. The button label toggles between "Pause" and "Resume" with the video state. |
| pause_key | KEY | `" "` | A key that toggles pause/resume when pressed, in addition to (or instead of) the pause button. Set to null to disable keyboard pausing. The key is ignored while the participant is typing in the response box. |
| start | FLOAT | null | Time, in seconds, at which to start the clip. If null, the video starts at the beginning. |
| stop | FLOAT | null | Time, in seconds, at which to stop the clip. If null, the video plays to the end. |
| rate | FLOAT | 1 | The playback rate of the video. 1 is normal speed; less than 1 is slower; greater than 1 is faster. |
| trial_ends_after_video | BOOL | false | If true, the trial ends automatically as soon as the video finishes playing. |
| trial_duration | INT | null | The maximum time, in milliseconds, to wait before ending the trial. If null, there is no deadline. |
| prompt | HTML_STRING | null | HTML content (e.g. instructions or a question) displayed below the video and above the response box. |
| response_allowed_while_playing | BOOL | false | If false, the response box and submit button are enabled only while the video is paused; each pause opens a new response window and submitting (in one-response-per-pause mode) closes it until the next pause. If true, the box stays enabled continuously regardless of play/pause state. |
| enable_response_after | INT | 0 | How long, in milliseconds, after the *first* response window opens before the box and submit button are actually enabled. Useful for enforcing a minimum viewing time before any response can be made. Later response windows (subsequent pauses) are not delayed. |
| placeholder | STRING | "" | Placeholder text shown in the empty response box. |
| rows | INT | 1 | The number of visible text rows in the response box. |
| button_label | STRING | "submit" | The label displayed on the submit button. |
| required | BOOL | true | If true, submission of an empty or whitespace-only response is blocked. |
| allow_numbers | BOOL | true | If false, number characters (0-9) are stripped from the response box as they are typed. |
| allow_letters | BOOL | true | If false, letter characters are stripped from the response box as they are typed. |
| allow_symbols | BOOL | true | If false, symbol and punctuation characters are stripped from the response box as they are typed (letters, numbers, and whitespace are kept). |
| show_response_history | BOOL | false | If true, previously submitted responses are displayed on screen as a running list during the trial. |
| response_history_limit | INT | null | The maximum number of past responses shown in the history list at one time. When the limit is reached, the oldest entry is removed as each new one is added. If null, all responses are shown. Only applies when `show_response_history` is true. |
| one_response_per_pause | BOOL | true | Only applies in gated mode (`response_allowed_while_playing: false`). If true, submitting a response closes the box until the next pause. If false, the box clears and stays open after each submission, allowing multiple responses within the same pause. |
| response_ends_trial | BOOL | true | If true, the trial ends as soon as the participant submits a response. |
| show_done_button | BOOL | false | If true, a button is shown below the response box that ends the trial when clicked. Useful when `response_ends_trial` is false and you do not want to rely on the video finishing. |
| done_button_label | STRING | "Continue" | The label for the done button. Only applies when `show_done_button` is true. |
| done_prompt | HTML_STRING | "" | HTML content displayed below the done button (e.g. instructions for what happens next). Only applies when `show_done_button` is true. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name | Type | Value |
| ---- | ---- | ----- |
| response | array of STRING | The text entered by the participant for each response, in submission order. One entry per submitted response. |
| rt | array of INT | Time, in milliseconds, from the start of the trial until each response was submitted. Same length and order as `response`. |
| response_duration | array of INT | Time, in milliseconds, from when each response window became enabled (i.e. the relevant pause, or trial start in continuous mode) until that response was submitted. Isolates "thinking/typing" time from time spent watching. Same length and order as `response`. |
| response_video_time | array of FLOAT | The video's playback position, in seconds, at the moment each response was submitted. In gated mode the video is paused at this point, so this directly links each response to its location in the video. Same length and order as `response`. |
| stimulus | array of STRING | The video file(s) that were displayed during the trial. |
| pause_video_time | array of FLOAT | For each pause, the video's playback position, in seconds, at the moment it was paused. One entry per pause, in chronological order, independent of whether that pause led to a submitted response. |
| pause_duration | array of INT | For each pause, how long it lasted, in milliseconds, from the pause to the next resume (or to the end of the trial, if the trial ended while still paused). Same length and order as `pause_video_time`. |
| total_trial_time | INT | The total elapsed time, in milliseconds, from the start of the trial to the end of the trial. |

`rt` and `response_duration` answer different questions. `rt` is measured from the start of the trial, which is most useful when a trial has only a single response (for example, when a response ends the trial). `response_duration` is measured from when the relevant response window opened, which is the more standard "how fast did they respond" latency when a trial has multiple pause-respond cycles. Both arrays always have the same length as `response`. The `pause_video_time` and `pause_duration` arrays may have a different length, since a participant can pause to think without submitting a response.

## Install

Using the CDN-hosted JavaScript file:

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-video-text-response"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-video-text-response
```

```js
import VideoTextResponse from "@jspsych-contrib/plugin-video-text-response";
```

## Examples

### Pause to respond, as many times as needed

Gated mode (the default): the box is enabled only while paused. The participant pauses, responds, resumes, and repeats; the trial ends when the video finishes.

```javascript
var trial = {
  type: jsPsychVideoTextResponse,
  stimulus: ["video/sample_video.mp4"],
  prompt: "<p>Pause the video (button or spacebar) whenever you want to respond.</p>",
  response_ends_trial: false,
  trial_ends_after_video: true,
};
```

### Continuous responding while the video plays

The box stays enabled the whole time, so the participant can type and submit at any point.

```javascript
var trial = {
  type: jsPsychVideoTextResponse,
  stimulus: ["video/sample_video.mp4"],
  response_allowed_while_playing: true,
  response_ends_trial: false,
  trial_ends_after_video: true,
};
```

### Requiring a response, restricting to letters, and showing history

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

### Ending the trial with a done button

When responses do not end the trial and you do not want to rely on the video finishing, a done button gives the participant an explicit exit.

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

### Disabling the keyboard shortcut and enforcing a minimum viewing time

```javascript
var trial = {
  type: jsPsychVideoTextResponse,
  stimulus: ["video/sample_video.mp4"],
  pause_key: null,
  enable_response_after: 2000,
  trial_duration: 20000,
};
```
