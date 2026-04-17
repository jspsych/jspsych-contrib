# circle-click-response

## Overview

A jsPsych plugin that displays a central HTML stimulus surrounded by clickable options arranged in an equally spaced circle. The participant responds by clicking one of the options. Response time and choice are recorded, and optionally correctness can be evaluated with configurable feedback.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-circle-click-response"></script>
```

### Via NPM

```
npm install @jspsych-contrib/plugin-circle-click-response
```

```js
import jsPsychCircleClickResponse from "@jspsych-contrib/plugin-circle-click-response";
```

## Compatibility

`@jspsych-contrib/plugin-circle-click-response` requires jsPsych v8.0.0 or later.

## Parameters

| Parameter            | Type         | Default | Description                                                                                                  |
| -------------------- | ------------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| stimulus             | HTML_STRING  | *Required* | The HTML content to display in the center of the screen.                                                   |
| choices              | HTML_STRING[] | *Required* | An array of HTML strings representing the clickable options arranged in a circle around the stimulus.      |
| prompt               | HTML_STRING  | null    | An optional HTML string to display as a prompt below the stimulus and circle.                                |
| circle_radius        | INT          | 200     | The radius of the circle in pixels.                                                                          |
| trial_duration       | INT          | null    | The maximum time in ms for the participant to respond. If null, waits indefinitely.                          |
| stimulus_duration    | INT          | null    | The duration in ms to display the stimulus before hiding it. If null, stays visible.                         |
| correct_choice       | INT          | null    | The index of the correct response in the choices array. If null, correctness is not evaluated.               |
| feedback_correct     | HTML_STRING  | null    | HTML string to display as feedback after a correct response.                                                 |
| feedback_incorrect   | HTML_STRING  | null    | HTML string to display as feedback after an incorrect response.                                              |
| feedback_duration    | INT          | 1000    | The duration in ms to display feedback before ending the trial.                                              |

## Data

| Name           | Type        | Description                                                                  |
| -------------- | ----------- | ---------------------------------------------------------------------------- |
| stimulus       | HTML_STRING | The HTML content displayed as the central stimulus.                          |
| response       | HTML_STRING | The HTML content of the chosen option. Null if trial timed out.              |
| response_index | INT         | The index of the chosen option in the choices array. Null if trial timed out.|
| rt             | INT         | The response time in milliseconds. Null if trial timed out.                  |
| correct        | BOOL        | Whether the response was correct. Null if correct_choice was not specified.  |

## Example

```js
const trial = {
  type: jsPsychCircleClickResponse,
  stimulus: "<p>2 + 2 = ?</p>",
  choices: ["<p>3</p>", "<p>4</p>", "<p>5</p>", "<p>6</p>"],
  correct_choice: 1,
  feedback_correct: "<p style='color:green;'>Correct!</p>",
  feedback_incorrect: "<p style='color:red;'>Incorrect</p>",
  feedback_duration: 1500,
  prompt: "<p>Click the correct answer.</p>",
};
```

## Author / Citation

[Josh de Leeuw](https://github.com/jodeleeuw)
