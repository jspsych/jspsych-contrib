# plugin-pursuit-rotor

Motor tracking task requiring continuous tracking of a moving target with mouse or touch input. The target moves in a circular path and participants must keep their cursor on the target.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| trial_duration      | INT              | 15000              | Duration of the trial in milliseconds    |
| path_radius         | INT              | 150                | Radius of the circular path in pixels    |
| target_radius       | INT              | 25                 | Radius of the target circle in pixels    |
| rotation_speed      | FLOAT            | 0.125              | Speed of rotation in rotations per second |
| rotation_direction  | STRING           | "clockwise"        | Direction of rotation: 'clockwise' or 'counterclockwise' |
| start_angle         | INT              | 0                  | Starting angle in degrees (0 = right, 90 = bottom, etc.) |
| canvas_width        | INT              | 500                | Width of the canvas in pixels            |
| canvas_height       | INT              | 500                | Height of the canvas in pixels           |
| target_color_on     | STRING           | "#27ae60"          | Color of the target when cursor is on it |
| target_color_off    | STRING           | "#e74c3c"          | Color of the target when cursor is off it |
| path_color          | STRING           | "#ddd"             | Color of the circular path guide         |
| background_color    | STRING           | "#f5f5f5"          | Background color of the canvas           |
| show_path           | BOOL             | true               | Whether to show the path guide circle    |
| prompt              | HTML_STRING      | null               | HTML prompt displayed above the canvas   |
| sample_interval     | INT              | 16                 | Sampling interval in milliseconds for recording data |
| require_mouse_down  | BOOL             | false              | Whether to require holding mouse button down (true) or just track cursor position (false) |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name              | Type    | Value                                    |
| ----------------- | ------- | ---------------------------------------- |
| time_on_target    | INT     | Total time the cursor was on the target in milliseconds |
| percent_on_target | FLOAT   | Percentage of trial time cursor was on target |
| mean_deviation    | FLOAT   | Mean deviation from target center in pixels |
| trial_duration    | INT     | Total duration of the trial in milliseconds |
| samples           | ARRAY   | Array of sampled data points, each containing: time, target_x, target_y, cursor_x, cursor_y, on_target, deviation |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-pursuit-rotor"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-pursuit-rotor.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-pursuit-rotor
```

```js
import PursuitRotor from "@jspsych-contrib/plugin-pursuit-rotor";
```


## Examples

### Basic Pursuit Rotor Trial

```javascript
var trial = {
  type: jsPsychPursuitRotor,
  trial_duration: 15000,
  prompt: "<p>Keep your cursor on the moving target!</p>"
};
```

### Faster Rotation with Smaller Target

```javascript
var trial = {
  type: jsPsychPursuitRotor,
  trial_duration: 20000,
  rotation_speed: 0.25,
  target_radius: 15,
  path_radius: 180,
  prompt: "<p>Track the target as accurately as you can.</p>"
};
```

### Counter-clockwise Rotation Without Path Guide

```javascript
var trial = {
  type: jsPsychPursuitRotor,
  trial_duration: 15000,
  rotation_direction: "counterclockwise",
  show_path: false,
  prompt: "<p>Follow the moving target.</p>"
};
```

### Require Mouse Button Hold

```javascript
var trial = {
  type: jsPsychPursuitRotor,
  trial_duration: 15000,
  require_mouse_down: true,
  prompt: "<p>Hold down the mouse button while tracking the target.</p>"
};
```
