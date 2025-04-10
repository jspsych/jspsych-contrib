# text-to-speech-keyboard-response

Displays text, reads to the participant using SpeechSythesis, takes keybaoard presses for responses

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type        | Default Value | Description                                                                                                                                  |
| ------------------- | ----------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| stimulus            | STRING      | undefined     | The string to be displayed.                                                                                                                  |
| choices             | KEYS        | "ALL_KEYS"    | Array of keys the participant is allowed to press. Default is "ALL_KEYS" meaning all keys are valid responses. "NO_KEYS" means no responses. |
| lang                | STRING      | "en-US"       | The language of the voice for the speechSynthesis API. Falls back to 'en-US' if unavailable. Depends on the system/browser voices.           |
| prompt              | HTML_STRING | null          | HTML content displayed below the stimulus, typically a reminder of the action to take.                                                       |
| stimulus_duration   | INT         | null          | Time in milliseconds to display the stimulus. If null, the stimulus remains visible until the trial ends.                                    |
| trial_duration      | INT         | null          | Time limit in milliseconds for the participant to respond. If null, the trial waits indefinitely for a response.                             |
| response_ends_trial | BOOL        | true          | If true, the trial ends when the participant makes a response. If false, the trial continues until trial_duration is reached.                |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name     | Type   | Value                                        |
| -------- | ------ | -------------------------------------------- |
| response | STRING | The key the participant pressed.             |
| rt       | INT    | The response time in milliseconds.           |
| stimulus | STRING | The string that was displayed on the screen. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-text-to-speech-keyboard-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-text-to-speech-keyboard-response.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-text-to-speech-keyboard-response
```

```js
import TextToSpeechKeyboardResponse from '@jspsych-contrib/plugin-text-to-speech-keyboard-response';
```

## Examples

### Setting SpeechSythesis voice to french

```javascript
const trial = {
  stimulus: 'This is a string',
  prompt: 'Press any key to continue',
  lang: 'fr-Fr',
  type: TextToSpeechKeyboardResponse,
}
```
