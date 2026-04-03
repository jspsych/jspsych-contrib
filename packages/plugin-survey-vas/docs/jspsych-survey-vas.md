# jspsych-survey-vas plugin

This plugin displays a series of questions with point-and-click visual analogue scales.

## Citation

Kinley, I. (2022, March 7). "A jsPsych plugin for visual analogue scales." Retrieved from psyarxiv.com/avj92. DOI: 10.31234/osf.io/avj92

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter                | Type             | Default Value        | Descripton                               |
| ------------------------ | ---------------- | -------------------- | ---------------------------------------- |
| questions | array | `undefined` | An array of objects, each representing a question that appears on the screen. Each object contains a `name`, a `prompt`, a set of `labels`, and a `required` parameter for the corresponding question. See examples for further clarification. The `name` is the name of the question. This is used for storing data. If left undefined, then default names (Q0, Q1, ...) will be used for the questions. The `prompt` is a string displayed above the VAS. `labels` is an array of strings used to label the VAS. `required` is a boolean (default value is `false`) that makes it mandatory to answer the question before continuing. |
| randomize_question_order | Boolean | `false` | If `true`, the display order of questions is randomly determined at the start of the trial. In the data object, `Q0` will still refer to the first question in the array, regardless of where it was presented visually. |
| preamble | string | `""` | Text displayed above all of the VASs. |
| ticks | Boolean | `true` | Specifies whether smaller vertical tick marks should accompany the labels. |
| n_scale_points                     | integer           | `null`     | If the scale should have some set of discrete clickable points (such that the tick mark will be rounded to the nearest such point), this parameter can be used specify the number of such points. If not, set this to `null`. |
| marker_type | String | `'vline'` | Marker type. Options are "vline" (vertical line, default), "cross" (X shape), "circle", and "square". |
| marker_draggable | Boolean | `true` | Allows the user to drag the response markers |
| scale_width | integer | `null` |  The width of the VASs in pixels. If left `null`, then the widths will be equal to the widest element in the display. |
| scale_height | integer | 40 | The height of the clickable region around the VASs in pixels. |
| hline_pct | integer | 100 | The width of the horizontal lines as a percentage of the width of the clickable regions (capped at 100). Setting this to less than 100 makes it easier for the user to select the extreme ends of the scales. |
| scale_colour | string | `'black'` | The colour of the scale (the horizontal line). Anything that would make a valid CSS `background` property can be used here; e.g., `'linear-gradient(to right, blue, red)'` |
| scale_cursor | string | `'pointer'` | The style of the cursor when the clickable part of the scale is hovered over. |
| marker_svg_attrs | string | `'stroke="black" stroke-width="2" stroke-opacity="0.5"'` | Additional attributes of the response marker SVG. Changing this can further customize the marker's appearance. |
| tick_colour | string | `'black'` | The colour of the tick marks on the scale. Anything that would make a valid CSS `background` property can be used here; e.g., `'rgba(255, 0, 0, 0.8)'` |
| button_label | string | `'Continue'` | The text of the button that will submit the response. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.

| Name             | Type        | Value                                    |
| ---------------- | ----------- | ---------------------------------------- |
| rt            | numeric     | The time in milliseconds, between when the trial began and when the paticipant clicked the continue button. |
| response             | string      | A JSON string representing the responses given to each question. |
| question_order             | string | A JSON string representing the order in which the questions were presented. |

## Example

```javascript
var trial = {
  type: jsPsychSurveyVas,
  preamble: 'Answer the following questions',
  questions: [
    {prompt: 'First question', labels: ['Left', 'Right']},
    {prompt: 'Second question', labels: ['Left', 'Middle', 'Right'], required = true}
  ],
  randomize_question_order: true,
}
```