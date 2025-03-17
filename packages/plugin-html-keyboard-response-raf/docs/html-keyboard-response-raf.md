# html-keyboard-response-raf

This plugin implements the same functionality as the html-keyboard-response plugin, but uses requestAnimationFrame internally for timing.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| stimulus            | HTML string      | *undefined*        | The string to be displayed.              |
| choices             | array of strings | `"ALL_KEYS"` | This array contains the key(s) that the participant is allowed to press in order to respond to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. |
| prompt              | string           | null               | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). |
| stimulus_duration   | numeric          | null               | How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. |
| trial_duration      | numeric          | null               | How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. |
| response_ends_trial | boolean          | true               | If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. |
## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response  | string  | Indicates which key the participant pressed. |
| rt        | numeric | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| stimulus  | string  | The HTML content that was displayed on the screen. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-html-keyboard-response-raf"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-html-keyboard-response-raf.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-html-keyboard-response-raf
```

```js
import HtmlKeyboardResponseRaf from '@jspsych-contrib/plugin-html-keyboard-response-raf';
```

## Examples

### Flicker a one-frame stimulus

```javascript
const trial = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: 'Hello world!',
  stimulus_duration: 16.6,
  trial_duration: 50,
  choices: ['a', 'b', 'c'],
}

const loop = {
  timeline: [trial],
  loop_function: () => true,
}
```