# text-to-speech-button-response

Displays text, reads to participant using SpeechSynthesis, has buttons for responses

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type           | Default Value                                                 | Description                                                                                                               |
| ------------------- | -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| stimulus            | STRING         | undefined                                                     | The text to be displayed and converted into speech.                                                                       |
| choices             | STRING (array) | undefined                                                     | Labels for the buttons. Each string in the array generates a different button.                                            |
| lang                | STRING         | "en-US"                                                       | The language of the voice for the speechSynthesis API. Falls back to 'en-US'. Depends on available system/browser voices. |
| button_html         | FUNCTION       | (choice)=>{}`<button class="jspsych-btn">${choice}</button>`} | Function that generates HTML for each button.                                                                             |
| prompt              | HTML_STRING    | null                                                          | HTML content displayed below the stimulus, typically a reminder of the action to take.                                    |
| stimulus_duration   | INT            | null                                                          | Time in milliseconds to display the stimulus. If null, the stimulus remains visible until the trial ends.                 |
| trial_duration      | INT            | null                                                          | Time limit in milliseconds for the participant to respond. If null, the trial waits indefinitely for a response.          |
| button_layout       | STRING         | "grid"                                                        | Layout for buttons. 'grid' makes the container a grid, 'flex' makes it a flexbox.                                         |
| grid_rows           | INT            | 1                                                             | Number of rows in the button grid. Applicable when `button_layout` is set to 'grid'.                                      |
| grid_columns        | INT            | null                                                          | Number of columns in the button grid. Applicable when `button_layout` is set to 'grid'.                                   |
| response_ends_trial | BOOL           | true                                                          | If true, the trial ends when the participant responds. If false, the trial continues until trial_duration is reached.     |
| enable_button_after | INT            | 0                                                             | Delay in milliseconds before enabling the buttons.                                                                        |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name     | Type   | Value                                                                                          |
| -------- | ------ | ---------------------------------------------------------------------------------------------- |
| rt       | INT    | The response time in milliseconds.                                                             |
| response | INT    | Indicates which button the participant pressed. 0 for the first button, 1 for the second, etc. |
| stimulus | STRING | The string content that was displayed on the screen.                                           |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-text-to-speech-button-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-text-to-speech-button-response.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-text-to-speech-button
```

```js
import TextToSpeechButtonResponse from '@jspsych-contrib/plugin-text-to-speech-button-response';
```

## Examples

### Setting SpeechSynthesis voice to french

```javascript
    const trial= {
      lang: 'fr-Fr',
      stimulus: 'This is a string',
      choices: ['Button A', 'Button B'],
      type: TextToSpeechButtonResponse,
    };
```
