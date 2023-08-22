# jspsych-survey-grid

## Parameters

| Parameter | Type | Default Value | Description |
|-----------|------|---------------|-------------|
| questions | array | _undefined_  | An array of objects, each object represents a question that appears on the screen. Each object contains a prompt and required parameters that will be applied to the question. See examples below for further clarification. `prompt:` Type string, default value is _undefined_. The strings are the question that will be associated with an item. `reverse:` Type boolean, default value is false. Reverse-scores the response to that question if true. `required:` Type boolean, default value is false. Makes answering questions required. `name:` Name of the question. Used for storing data. If left undefined then default names (`Q1`, `Q2`, ...) will be used for the questions. |
| randomize_question_order | boolean | `false` | If true, the display order of `questions` is randomly determined at the start of the trial. In the data object, `Q1` will still refer to the first question in the array, regardless of where it was presented visually. |
| labels | array | _undefined_ | An array of strings that define the labels to display above the questions. If you want to use blank responses and only label the end points or some subset of the options, just insert a blank string for the unlabeled responses. |
| preamble | string | empty string | HTML formatted string to display at the top of the page above all the questions. |
| zero_indexed | boolean | false | Whether the lowest anchor of the scale should be scored as zero (true) or one (false) |
| scale_width | numeric | 960 | The width of the survey grid in pixels. |
| prompt_width | numeric | 50 | The percentage of the scale width allocated to the question prompts |
| labels_repeat | numeric | 10 | The number of items after which the scale labels are repeated. |
| hover_color | string | '#DEE8EB' | The background color of a question when hovered over. Should be specified as a _hex_ or `rgb(r,g,b)` value. |
| button_label | string | 'Continue' | Label of the button. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org//7.3/overview/plugins/index.html#data-collected-by-all-plugins), this plugin collects the following data for each trial:

| Name        | Type   | Value |
|-------------|--------|-------|
| responses   | object | An object containing the data for each question. `name:` The name for each question. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. Otherwise, the first question in the trial is recorded as `Q1`, the second as `Q2`, and so on. `item_pos:` The position of the question on the page (from the top). `resp_pos:` The position of the response selected on the Likert scale for that question, encoded as an integer. `response:` The response to the question. Will be identical to `resp_pos` unless `reverse = true`. |
| page_events | object | An object containing a record of all radio button events on the page. `event_target`: The target of the radio button event. The naming convention of each radio button is `{name}_{resp_pos}`. `event_time`: The time of the event in milliseconds. The time is measured from when the questions first appear on the screen. |
| diagnostics | object | An object containing diagnostics of the quality of responses. `page_time:` The response time, in milliseconds, for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. `honeypot:` The number of hidden radio buttons checked. `straightlining`: The maximum fraction of responses of the same position. `zigzagging:` The fraction of responses consistent with a zig-zagging response pattern. |

## Example(s)

### General Anxiety Disorder-7 (GAD-7) scale

```javascript
var gad7 = {
  type: jsPsychSurveyGrid,
  questions: [
    {prompt: "Feeling nervous, anxious, or on edge",              reverse: false, required: true},
    {prompt: "Not being able to stop or control worrying",        reverse: false, required: true},
    {prompt: "Worrying too much about different things",          reverse: false, required: true},
    {prompt: "Trouble relaxing",                                  reverse: false, required: true},
    {prompt: "Being so restless that it's hard to sit still",     reverse: false, required: true},
    {prompt: "Becoming easily annoyed or irritable",              reverse: false, required: true},
    {prompt: "Feeling afraid as if something awful might happen", reverse: false, required: true},
  ],
  labels: [
    "Not at all",
    "Several days",
    "Over half the days",
    "Nearly every day"
  ],
  preamble: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  randomize_question_order: true,
  scale_width: 900,
  prompt_width: 40,
  labels_repeat: 7,
}
```
