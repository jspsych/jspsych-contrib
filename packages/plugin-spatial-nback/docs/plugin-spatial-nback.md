# plugin-spatial-nback

Spatial grid n-back task plugin for jsPsych. Displays a stimulus in a spatial grid and collects responses for n-back paradigms.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                | Type    | Default Value                           | Description                                                    |
| ------------------------ | ------- | --------------------------------------- | -------------------------------------------------------------- |
| rows                     | int     | 3                                       | Number of rows in the spatial grid                            |
| cols                     | int     | 3                                       | Number of columns in the spatial grid                         |
| cell_size                | int     | 125                                     | Size of each cell in pixels, affects size of whole grid       |
| stimulus_row             | int     | 0                                       | Row position of the stimulus (0-indexed)                      |
| stimulus_col             | int     | 0                                       | Column position of the stimulus (0-indexed)                   |
| is_target                | bool    | false                                   | Whether this trial is a target trial                          |
| stimulus_duration        | int     | 750                                     | Duration the stimulus is displayed (ms)                       |
| isi_duration             | int     | 1000                                    | Inter-stimulus interval (ms)                                   |
| feedback_duration        | int     | 500                                     | Duration of feedback display (ms)                             |
| show_feedback_text       | bool    | true                                    | Whether to show feedback with response time after response    |
| show_feedback_border     | bool    | true                                    | Whether to show feedback border around the grid               |
| show_feedback_no_click   | bool    | true                                    | Whether to show feedback when there is no response            |
| feedback_wait_no_click   | bool    | true                                    | Whether to wait for feedback duration before ending trial when no response |
| button_text              | string  | "MATCH"                                 | Text for the response button                                   |
| stimulus_color           | string  | "#0066cc"                               | Color of the stimulus square                                   |
| correct_color            | string  | "#00cc00"                               | Color of correct feedback border                               |
| incorrect_color          | string  | "#cc0000"                               | Color of incorrect feedback border                             |
| instructions             | string  | "Click MATCH"                           | Instructions to display above the grid                        |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name           | Type    | Value                                           |
| -------------- | ------- | ----------------------------------------------- |
| stimulus_row   | int     | Row position of the stimulus (0-indexed)       |
| stimulus_col   | int     | Column position of the stimulus (0-indexed)    |
| is_target      | bool    | Whether this trial was a target                |
| response       | bool    | Whether participant responded                   |
| response_time  | int     | Response time in milliseconds (null if no response) |
| correct        | bool    | Whether the response was correct                |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-spatial-nback@1.0.0"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-spatial-nback
```

```js
import jsPsychSpatialNback from '@jspsych-contrib/plugin-spatial-nback';
```

## Examples

### Basic Spatial N-Back Trial

```javascript
var trial = {
  type: jsPsychSpatialNback,
  rows: 3,
  cols: 3,
  stimulus_row: 1,
  stimulus_col: 2,
  is_target: true,
  button_text: "MATCH"
}
```

### Custom Grid with Feedback Settings

```javascript
var trial = {
  type: jsPsychSpatialNback,
  rows: 4,
  cols: 4,
  cell_size: 80,
  stimulus_duration: 750,
  isi_duration: 1500,
  feedback_duration: 800,
  show_feedback_text: true,
  show_feedback_border: true,
  stimulus_color: "#ff6600",
  correct_color: "#00ff00",
  incorrect_color: "#ff0000",
  instructions: "Press the button when the current position matches the position from 2 trials ago.",
  button_text: "2-BACK MATCH"
}
```

### No Feedback Configuration

```javascript
var trial = {
  type: jsPsychSpatialNback,
  stimulus_row: 0,
  stimulus_col: 1,
  is_target: false,
  show_feedback_text: false,
  show_feedback_border: false,
  button_text: "TARGET"
}
```