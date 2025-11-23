# plugin-bart

The Balloon Analogue Risk Task (BART) displays an animated SVG balloon that participants can pump to earn points or collect their winnings. Each pump increases the balloon's value but also increases the risk of the balloon popping, which results in losing all points for that trial.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter                  | Type    | Default Value | Description                                                                                                                              |
| -------------------------- | ------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| pop_threshold              | int     | undefined     | The number of pumps that will cause the balloon to pop. Must be specified.                                                              |
| show_balloon_value         | bool    | true          | Whether to show the current balloon value during the trial.                                                                             |
| show_total_points          | bool    | true          | Whether to show the total points accumulated.                                                                                           |
| starting_total_points      | int     | 0             | The total points accumulated before this trial. This value is displayed but not modified by the plugin.                                 |
| points_per_pump            | int     | 1             | The number of points earned per pump.                                                                                                    |
| pump_button_label          | string  | "Pump"        | Text label for the pump button.                                                                                                          |
| collect_button_label       | string  | "Collect"     | Text label for the collect button.                                                                                                       |
| balloon_starting_size      | float   | 0.5           | Starting size of the balloon (SVG scale factor).                                                                                         |
| balloon_size_increment     | float   | 0.05          | Size increment per pump (SVG scale factor). This is automatically adjusted based on max_pumps to prevent balloon overflow.               |
| pump_animation_duration    | int     | 200           | Duration of pump animation in milliseconds.                                                                                              |
| pop_animation_duration     | int     | 300           | Duration of pop animation in milliseconds.                                                                                               |
| balloon_color              | string  | "#ff0000"     | Base color of the balloon (any CSS color).                                                                                               |
| max_pumps                  | int     | 20            | Maximum expected pumps for visual scaling. The balloon will scale to fit the container at this pump count. Does not prevent pumping beyond this value. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name          | Type    | Value                                                                                  |
| ------------- | ------- | -------------------------------------------------------------------------------------- |
| pumps         | int     | Number of times the balloon was pumped.                                               |
| popped        | bool    | Whether the balloon popped (true) or was collected (false).                           |
| points_earned | int     | Points earned on this trial (0 if popped).                                            |
| total_points  | int     | Total points after this trial (starting_total_points + points_earned).                |
| pump_times    | array   | Array of reaction times for each pump in milliseconds.                                |
| collect_time  | int     | Reaction time for the collect action in milliseconds, or null if balloon popped.      |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-bart"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-bart.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-bart
```

```js
import Bart from "@jspsych-contrib/plugin-bart";
```


## Examples

### Basic Single Trial

```javascript
const trial = {
  type: jsPsychBart,
  pop_threshold: 10,
};
```

### Custom Styling and Points

```javascript
const trial = {
  type: jsPsychBart,
  pop_threshold: 15,
  balloon_color: '#0000ff',
  points_per_pump: 5,
  pump_button_label: 'Inflate',
  collect_button_label: 'Bank Points',
  balloon_starting_size: 0.4,
  max_pumps: 25,
};
```

### Multiple Trials with Point Tracking

```javascript
const jsPsych = initJsPsych();

let total_points = 0;
const trials = [];

for (let i = 0; i < 5; i++) {
  const trial = {
    type: jsPsychBart,
    pop_threshold: Math.floor(Math.random() * 11) + 5, // Random between 5-15
    starting_total_points: () => total_points,
    balloon_color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i],
    on_finish: function(data) {
      total_points = data.total_points;
    }
  };
  trials.push(trial);
}

jsPsych.run(trials);
```

### Hiding Display Elements

```javascript
const trial = {
  type: jsPsychBart,
  pop_threshold: 12,
  show_balloon_value: false,
  show_total_points: false,
};
```
