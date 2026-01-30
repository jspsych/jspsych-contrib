# plugin-trail-making

A jsPsych plugin for the Trail Making Test (TMT), a neuropsychological test of visual attention and task switching. Participants connect circles in sequence as quickly as possible.

- **Part A:** Connect numbers in order (1-2-3-4...)
- **Part B:** Alternate between numbers and letters (1-A-2-B-3-C...)

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| test_type           | STRING           | "A"                | The type of trail making test: "A" (numbers only) or "B" (alternating numbers and letters) |
| num_targets         | INT              | 25                 | The number of targets to display. For type "B", this should be an even number for equal numbers and letters. |
| canvas_width        | INT              | 600                | The width of the display area in pixels  |
| canvas_height       | INT              | 600                | The height of the display area in pixels |
| target_radius       | INT              | 25                 | The radius of each target circle in pixels |
| min_separation      | INT              | 80                 | The minimum distance between target centers in pixels |
| target_color        | STRING           | "#ffffff"          | The color of unvisited target circles    |
| target_border_color | STRING           | "#000000"          | The border color of target circles       |
| visited_color       | STRING           | "#90EE90"          | The color of visited (correctly clicked) target circles |
| line_color          | STRING           | "#000000"          | The color of the line connecting targets |
| line_width          | INT              | 2                  | The width of the connecting line in pixels |
| error_color         | STRING           | "#FF6B6B"          | The color to flash when an error is made |
| error_duration      | INT              | 500                | Duration in milliseconds to show error feedback |
| targets             | COMPLEX[]        | null               | Optional array of {x, y, label} objects for exact target positions. Overrides num_targets and random positioning. |
| prompt              | HTML_STRING      | null               | Text prompt displayed above the canvas   |
| seed                | INT              | null               | Random seed for reproducible target layouts. If null, uses random seed. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name                | Type    | Value                                    |
| ------------------- | ------- | ---------------------------------------- |
| test_type           | STRING  | The type of trail making test ("A" or "B") |
| targets             | ARRAY   | Array of target objects with x, y, and label properties |
| clicks              | ARRAY   | Array of click events with target_index, label, time, x, y, and correct properties |
| completion_time     | INT     | Total time in milliseconds from first click to last correct click |
| num_errors          | INT     | Number of errors (incorrect clicks)      |
| total_path_distance | FLOAT   | Total path distance in pixels (sum of distances between consecutive correct targets) |
| inter_click_times   | INT[]   | Array of response times between consecutive correct clicks |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-trail-making"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-trail-making.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-trail-making
```

```js
import TrailMaking from "@jspsych-contrib/plugin-trail-making";
```


## Examples

### Part A (Numbers Only)

```javascript
var trial = {
  type: jsPsychTrailMaking,
  test_type: "A",
  num_targets: 25,
  prompt: "<p>Connect the numbers in order: 1, 2, 3, ...</p>"
};
```

### Part B (Alternating Numbers and Letters)

```javascript
var trial = {
  type: jsPsychTrailMaking,
  test_type: "B",
  num_targets: 24,
  prompt: "<p>Alternate between numbers and letters: 1, A, 2, B, 3, C, ...</p>"
};
```

### With Reproducible Layout Using Seed

```javascript
var trial = {
  type: jsPsychTrailMaking,
  test_type: "A",
  num_targets: 10,
  seed: 12345,
  prompt: "<p>Connect the numbers in order.</p>"
};
```

### Custom Target Positions

```javascript
var trial = {
  type: jsPsychTrailMaking,
  test_type: "A",
  targets: [
    { x: 100, y: 100, label: "1" },
    { x: 300, y: 150, label: "2" },
    { x: 200, y: 300, label: "3" },
    { x: 400, y: 250, label: "4" },
    { x: 500, y: 400, label: "5" }
  ],
  prompt: "<p>Connect the numbers in order.</p>"
};
```

### Smaller Canvas with Fewer Targets

```javascript
var trial = {
  type: jsPsychTrailMaking,
  test_type: "A",
  num_targets: 8,
  canvas_width: 400,
  canvas_height: 400,
  target_radius: 20,
  min_separation: 60,
  prompt: "<p>Practice trial: Connect 1 through 8.</p>"
};
```
