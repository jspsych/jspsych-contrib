# survey-number

Collects a number response in a text box

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| questions | array of object | `undefined` | Array of objects of the form `{ prompt: HTML_STRING, placeholder: STRING, rows: INT, columns: INT, required: BOOL, name: STRING }`, where: <br> `prompt`: Question prompt. <br> `placeholder`: Placeholder text to put in the response text box. <br> `rows`: Number of rows for the response text box. <br> `columns`: Number of columns for the response text box. <br> `required`: If the participant must give a response to continue in the trial. <br> `name`: Name of the question in the trial data. If not specified, questions are named `"Q0"`, `"Q1"`, etc... |
| randomize_question_order | boolean | `false` | If true, the order of questions in the `questions` array are randomized. |
| preamble | HTML string | `null` | HTML-formatted string that is displayed above all the questions. |
| button_label | string | `"Continue"` | Label of the button to submit responses. |
| autocomplete | boolean | `false` | If true, browser auto-complete or auto-fill will be enabled. |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| rt        | integer | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| response  | object  | An object containing the string of the response given by the participant. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-survey-number"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-survey-number.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-survey-number
```

```js
import SurveyNumber from '@jspsych-contrib/plugin-survey-number';
```

## Examples

### A trial to ask for age with a slider

```javascript
var trial = {
  type: jsPsychSurveyNumber,
  questions: [{
    prompt: 'How old are you?',
    name: 'age',
    required: true,
  }]
}
```