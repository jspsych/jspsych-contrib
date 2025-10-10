# jspsych-html-vas-response plugin

This plugin collects responses to an arbitrary HTML string using a point-and-click visual analogue scale.

## Citation

Kinley, I. (2022, March 7). "A jsPsych plugin for visual analogue scales." Retrieved from psyarxiv.com/avj92. DOI: 10.31234/osf.io/avj92

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter                | Type             | Default Value        | Descripton                               |
| ------------------------ | ---------------- | -------------------- | ---------------------------------------- |
| stimulus                     | HTML string           | `undefined`     | The string to be displayed. |
| labels                     | array of strings           | `[]`     | Specifies the labels to be displayed, equally spaced along the scale, as in jspsych-html-slider-response. |
| resp_fcn                     | function           | `null`     | A function called when the participant clicks on the scale. The current location of the participant's response (between 0 and 1) is provided as an input. |
| ticks                     | Boolean           | `true`     | Specifies whether smaller vertical tick marks should accompany the labels. |
| n_scale_points                     | integer           | `null`     | If the scale should have some set of discrete clickable points (such that the tick mark will be rounded to the nearest such point), this parameter can be used specify the number of such points. If not, set this to `null`. |
| marker_type | String | `'vline'` | Marker type. Options are "vline" (vertical line, default), "cross" (X shape), "circle", and "square". |
| marker_draggable | Boolean | true | Allows the user to drag the response marker |
| scale_width | integer | `null` |  The width of the VAS in pixels. If left `null`, then the width will be equal to the widest element in the display. |
| scale_height | integer | 40 | The height of the clickable region around the VAS in pixels. |
| hline_pct | integer | 100 | The width of the horizontal line as a percentage of the width of the clickable region (capped at 100). Setting this to less than 100 makes it easier for the user to select the extreme ends of the scale. |
| scale_colour | string | `'black'` | The colour of the scale (the horizontal line). Anything that would make a valid CSS `background` property can be used here; e.g., `'linear-gradient(to right, blue, red)'` |
| scale_cursor | string | `'pointer'` | The style of the cursor when the clickable part of the scale is hovered over. |
| marker_svg_attrs | string | `'stroke="black" stroke-width="2" stroke-opacity="0.5"'` | Additional attributes of the response marker SVG. Changing this can further customize the marker's appearance. |
| tick_colour | string | `'black'` | The colour of the tick marks on the scale. Anything that would make a valid CSS `background` property can be used here; e.g., `'rgba(255, 0, 0, 0.8)'` |
| prompt | HTML string | `null` | The content to be displayed below the stimulus. |
| button_label | string | `'Continue'` | The text of the button that will submit the response. |
| required | Boolean | `false` | If `true`, the participant must select a response on the VAS before the trial can advance. |
| stimulus_duration | integer | `null` | The duration, in milliseconds, for which the stimulus is visible. If `null`, the stimulus is visible for the duration of the trial. |
| trial_duration | integer | `null` | The duration of the trial, in milliseconds. Once this time elapses, the trial ends and any response is recorded. If `null`, the trial continues indefinitely. |
| response_ends_trial | Boolean | `true` | If `false`, the participant's clicking the continue button does not end the trial (but does prevent any changes to the VAS response), and the trial ends when `trial_duration` has elapsed. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.

| Name             | Type        | Value                                    |
| ---------------- | ----------- | ---------------------------------------- |
| response             | numeric      | The value selected, between 0 and 1. 0 is the leftmost point on the scale, 1 is the rightmost point, and 0.5 is exactly in the middle. |
| rt            | numeric     | The time in milliseconds, between when the trial began and when the paticipant clicked the continue button. |
| stimulus          | string     | The stimulus displayed during the trial. |
| clicks          | array of objects     | A record of the participant's clicks on the scale. Each element in the array is an object with properties `time` (the time of the click, in milliseconds since the trial began) and `location` (the location of the click on the VAS, from 0 to 1). |

## Example

```javascript
var trial = {
  type: jsPsychHtmlVasResponse,
  stimulus: 'What is your temperature?',
  scale_width: 500,
  labels: ['Maximally<br>cold', 'Maximally<br>hot'],
  resp_fcn: function(ppn) {console.log(ppn)}
};
```