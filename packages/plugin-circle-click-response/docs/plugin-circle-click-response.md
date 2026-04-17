# plugin-circle-click-response

A plugin that displays a central HTML stimulus surrounded by clickable options arranged in a circle

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| ------------------- | ---------------- | ------------- | ----------- |
| stimulus | HTML_STRING | undefined | The HTML content to display in the center of the screen. |
| choices | HTML_STRING[] | undefined | An array of HTML strings representing the clickable options arranged in a circle around the stimulus. |
| prompt | HTML_STRING | null | An optional HTML string to display as a prompt below the stimulus and circle. |
| circle_radius | INT | 200 | The radius of the circle in pixels. |
| trial_duration | INT | null | The maximum time in ms for the participant to respond. If null, waits indefinitely. |
| stimulus_duration | INT | null | The duration in ms to display the stimulus. Choices are shown immediately and the stimulus is hidden after this duration. If null, stays visible. |
| correct_choice | INT | null | The index of the correct response in the choices array. If null, correctness is not evaluated. |
| feedback_correct | HTML_STRING | null | HTML string to display as feedback after a correct response. |
| feedback_incorrect | HTML_STRING | null | HTML string to display as feedback after an incorrect response. |
| feedback_duration | INT | 1000 | The duration in ms to display feedback before ending the trial. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name | Type | Value |
| -------------- | ----------- | ----- |
| stimulus | HTML_STRING | The HTML content displayed as the central stimulus. |
| response | HTML_STRING | The HTML content of the chosen option. Null if trial timed out. |
| response_index | INT | The index of the chosen option in the choices array. Null if trial timed out. |
| rt | INT | The response time in milliseconds. Null if trial timed out. |
| correct | BOOL | Whether the response was correct. Null if correct_choice was not specified. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-circle-click-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-circle-click-response.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-circle-click-response
```

```js
import CircleClickResponse from "@jspsych-contrib/plugin-circle-click-response";
```


## Examples

### Digit search with feedback

```javascript
var trial = {
  type: jsPsychCircleClickResponse,
  stimulus: "<p>Find the <strong>7</strong></p>",
  choices: ["<span>3</span>", "<span>9</span>", "<span>7</span>", "<span>2</span>"],
  correct_choice: 2,
  feedback_correct: "<p style='color:green;'>Correct!</p>",
  feedback_incorrect: "<p style='color:red;'>Incorrect</p>",
  feedback_duration: 1500,
  prompt: "<p>Click the digit 7.</p>",
};
```
