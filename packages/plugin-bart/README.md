# plugin-bart

## Overview

The Balloon Analogue Risk Task (BART) is a widely used behavioral measure of risk-taking propensity. This plugin displays an animated SVG balloon that grows with each pump. Participants can choose to pump the balloon to earn points or collect their current winnings. If the balloon is pumped beyond a predetermined threshold, it pops and all points for that trial are lost.

This plugin runs a single BART trial. The researcher specifies the exact number of pumps that will cause the balloon to pop, allowing for flexible implementation of probabilistic risk strategies outside the plugin.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-bart"></script>
```

### Via NPM

```
npm install @jspsych-contrib/plugin-bart
```

```js
import jsPsychBart from "@jspsych-contrib/plugin-bart";
```

## Compatibility

`@jspsych-contrib/plugin-bart` requires jsPsych v8.0.0 or later.

## Parameters

| Parameter                 | Type    | Default Value | Description                                                                                       |
|---------------------------|---------|---------------|---------------------------------------------------------------------------------------------------|
| pop_threshold             | INT     | undefined     | **Required.** The number of pumps that will cause the balloon to pop.                            |
| show_balloon_value        | BOOL    | true          | Whether to show the current balloon value during the trial.                                       |
| show_total_points         | BOOL    | true          | Whether to show the total points accumulated.                                                     |
| starting_total_points     | INT     | 0             | The total points accumulated before this trial. This value is displayed but not modified by the plugin. |
| points_per_pump           | INT     | 1             | The number of points earned per pump.                                                             |
| pump_button_label         | STRING  | "Pump"        | Text label for the pump button.                                                                   |
| collect_button_label      | STRING  | "Collect"     | Text label for the collect button.                                                                |
| balloon_starting_size     | FLOAT   | 0.5           | Starting size of the balloon (SVG scale factor).                                                  |
| balloon_size_increment    | FLOAT   | 0.05          | Size increment per pump (SVG scale factor).                                                       |
| pump_animation_duration   | INT     | 200           | Duration of pump animation in milliseconds.                                                       |
| pop_animation_duration    | INT     | 300           | Duration of pop animation in milliseconds.                                                        |
| balloon_color             | STRING  | "#ff0000"     | Base color of the balloon (CSS color value).                                                      |
| balloon_stage_height      | INT     | 400           | Height of the balloon stage (the area the balloon is drawn in), in pixels. The balloon scales to fit this area. |
| value_text_color          | STRING  | "currentColor" | CSS color for the value/total point numbers in the info boxes. Defaults to `currentColor` so it inherits the surrounding text color and adapts to light/dark themes. |
| label_text_color          | STRING  | "color-mix(in srgb, currentColor 60%, transparent)" | CSS color for the labels above the value/total point numbers. Defaults to a muted version of the surrounding text color so it adapts to light/dark themes. |
| info_box_border_color     | STRING  | "currentColor" | CSS color for the info box borders. Defaults to `currentColor` so it inherits the surrounding text color and adapts to light/dark themes. |
| info_box_background_color | STRING  | "color-mix(in srgb, currentColor 6%, transparent)" | CSS color for the info box backgrounds. Defaults to a subtle tint of the surrounding text color so it adapts to light/dark themes. |
| max_pumps                 | INT     | 20            | Maximum expected pumps, used for visual scaling. The balloon scales to fit the stage at this pump count. Does **not** prevent pumping beyond this value (use `pop_threshold` for that). |

## Theming

By default, the info box text, borders, and backgrounds are derived from `currentColor` (the inherited text color), so the display adapts to light and dark page themes without any per-trial configuration. To take explicit control, set `value_text_color`, `label_text_color`, `info_box_border_color`, and `info_box_background_color` to any CSS color value. The balloon stage size is controlled with `balloon_stage_height` (no `!important` overrides needed).

## Data Generated

In addition to the default data collected by all plugins, this plugin collects the following data for each trial:

| Name          | Type    | Description                                                                          |
|---------------|---------|--------------------------------------------------------------------------------------|
| pumps         | INT     | Number of times the balloon was pumped.                                              |
| popped        | BOOL    | Whether the balloon popped (true) or was collected (false).                          |
| points_earned | INT     | Points earned on this trial (0 if balloon popped).                                   |
| total_points  | INT     | Total points after this trial (starting_total_points + points_earned).               |
| pump_times    | ARRAY   | Array of reaction times for each pump in milliseconds from trial start.              |
| collect_time  | INT     | Reaction time for the collect action in milliseconds from trial start, or null if balloon popped. |

## Examples

### Basic Example

```javascript
const trial = {
  type: jsPsychBart,
  pop_threshold: 8,
  points_per_pump: 5
};
```

### Multiple Trials with Random Pop Thresholds

```javascript
const generatePopThreshold = () => {
  // Pop threshold randomly between 5 and 15 pumps
  return Math.floor(Math.random() * 11) + 5;
};

let total_points = 0;
const trials = [];

for (let i = 0; i < 10; i++) {
  const trial = {
    type: jsPsychBart,
    pop_threshold: generatePopThreshold(),
    starting_total_points: () => total_points,
    on_finish: function(data) {
      total_points = data.total_points;
    }
  };
  trials.push(trial);
}

jsPsych.run(trials);
```

### Customized Appearance

```javascript
const trial = {
  type: jsPsychBart,
  pop_threshold: 10,
  balloon_color: "#00aaff",
  balloon_starting_size: 0.3,
  balloon_size_increment: 0.08,
  balloon_stage_height: 500,
  pump_button_label: "Inflate",
  collect_button_label: "Cash Out",
  show_balloon_value: true,
  show_total_points: false,
  // Explicit theming (defaults adapt to light/dark themes automatically)
  value_text_color: "#ffffff",
  label_text_color: "#cccccc",
  info_box_border_color: "#00aaff",
  info_box_background_color: "#102030"
};
```

### Implementing the Standard BART

The original BART uses a probabilistic approach where each pump has a fixed probability of causing the balloon to pop. You can implement this by calculating the pop threshold for each trial:

```javascript
const generateBARTThreshold = () => {
  // Original BART: 1/128 probability of pop per pump
  // Average pop occurs at 64 pumps (128 / 2)
  // This simulates by drawing from range 1-128
  return Math.floor(Math.random() * 128) + 1;
};

const trials = Array(30).fill(null).map(() => ({
  type: jsPsychBart,
  pop_threshold: generateBARTThreshold(),
  starting_total_points: () => total_points,
  on_finish: (data) => {
    total_points = data.total_points;
  }
}));
```

## Simulation Mode

This plugin does not currently support [simulation mode](https://www.jspsych.org/latest/overview/simulation/).

## Install

Using NPM package manager:

```
npm install @jspsych-contrib/plugin-bart
```

Using yarn:

```
yarn add @jspsych-contrib/plugin-bart
```

## Author / Citation

Created by Josh de Leeuw.

If you use this plugin in your research, please cite:

Lejuez, C. W., Read, J. P., Kahler, C. W., Richards, J. B., Ramsey, S. E., Stuart, G. L., Strong, D. R., & Brown, R. A. (2002). Evaluation of a behavioral measure of risk taking: The Balloon Analogue Risk Task (BART). *Journal of Experimental Psychology: Applied*, 8(2), 75–84. https://doi.org/10.1037/1076-898X.8.2.75