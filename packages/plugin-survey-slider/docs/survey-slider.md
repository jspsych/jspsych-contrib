# survey-slider

Add several analogue scales on the same page for use in questionnaires

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| questions | array of object | `undefined` | Array of objects of the form `{ stimulus: HTML_STRING, prompt: STRING, labels: STRING[], ticks: STRING[], name: STRING, min: INT, max: INT, slider_start: INT, step: INT }`, where: <br> `stimulus`: The HTML string to be displayed. <br> `prompt`: Content to be displayed below the stimulus and above the slider. <br> `labels`: Labels to appear to the left of each slider, one in line with the top row ticks and one in line with the bottom. <br> `ticks`: Array containing ticks that will be displayed in equidistant locations along the slider. <br> `name`: Name of the data value associated with this question. <br> `min`: Minimum value of the slider. <br> `max`: Maximum value of the slider. <br> `slider_start`: Starting value of the slider. <br> `step`: The value between each movement of the slider. |
| randomize_question_order | boolean | `false` | If true, the order of questions in the `questions` array are randomized. |
| preamble | HTML string | `null` | HTML-formatted string that is displayed above all the questions. |
| button_label | string | `"Continue"` | Label of the button to submit responses. |
| autocomplete | boolean | `false` | If true, browser auto-complete or auto-fill will be enabled. |
| require_movement | boolean | `false` | If true, the participant will need to input a value into the slider before moving on. |
| slider_width | integer | 500 | Width of the slider, in pixels. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| rt        | integer | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| response  | string  | An JSON object stringified, containing the responses given by the participant. |
| question_order | string | The order in which the questions were presented. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-survey-slider"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-survey-slider.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-survey-slider
```

```js
import SurveySlider from '@jspsych-contrib/plugin-survey-slider';
```

## Examples

### Title of Example

```javascript
var trial = {
  type: jsPsychSurveySlider
}
```