# plugin-tower-of-london

A jsPsych plugin for Tower of London/Hanoi style puzzle tasks. Participants move colored balls between pegs to match a goal configuration.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| start_state         | COMPLEX          | [["red", "green", "blue"], [], []] | Starting configuration of balls on pegs. Array of 3 arrays, each containing ball colors from bottom to top. |
| goal_state          | COMPLEX          | [["blue"], ["green"], ["red"]] | Goal configuration that participant must achieve. Same format as start_state. |
| peg_capacities      | INT[]            | [3, 3, 3]          | Capacity of each peg (max number of balls). Array of 3 numbers. Classic TOL uses [3, 2, 1]. |
| optimal_moves       | INT              | null               | Minimum number of moves for optimal solution. Used for scoring. Set to null to skip optimality check. |
| max_moves           | INT              | null               | Maximum moves allowed before trial ends. Set to null for unlimited. |
| time_limit          | INT              | null               | Time limit in milliseconds. Set to null for unlimited. |
| canvas_width        | INT              | 500                | Width of the canvas in pixels            |
| canvas_height       | INT              | 400                | Height of the canvas in pixels           |
| ball_radius         | INT              | 30                 | Ball radius in pixels                    |
| ball_colors         | COMPLEX          | {red: "#e74c3c", green: "#27ae60", blue: "#3498db"} | Colors for the balls. Object mapping ball names to CSS colors. |
| peg_color           | STRING           | "#8B4513"          | Color of the pegs                        |
| background_color    | STRING           | "#f5f5f5"          | Background color of the canvas           |
| show_goal           | BOOL             | true               | Whether to show the goal state display   |
| show_move_counter   | BOOL             | true               | Whether to show a move counter           |
| prompt              | HTML_STRING      | null               | HTML prompt displayed above the puzzle   |
| done_button_text    | STRING           | null               | Text for the done button. Set to null to auto-complete when goal is reached. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name         | Type    | Value                                    |
| ------------ | ------- | ---------------------------------------- |
| solved       | BOOL    | Whether the participant solved the puzzle |
| num_moves    | INT     | Number of moves made                     |
| optimal      | BOOL    | Whether solution was optimal (if optimal_moves was specified), null otherwise |
| rt           | INT     | Response time in milliseconds            |
| moves        | ARRAY   | Array of moves made: [{from: pegIndex, to: pegIndex, ball: color, time: ms}] |
| final_state  | ARRAY   | Final state of the puzzle                |
| start_state  | ARRAY   | The starting configuration               |
| goal_state   | ARRAY   | The goal configuration                   |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-tower-of-london"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-tower-of-london.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-tower-of-london
```

```js
import TowerOfLondon from "@jspsych-contrib/plugin-tower-of-london";
```


## Examples

### Basic Tower of London Trial

```javascript
var trial = {
  type: jsPsychTowerOfLondon,
  start_state: [["red", "green", "blue"], [], []],
  goal_state: [["blue"], ["green"], ["red"]],
  optimal_moves: 3,
  prompt: "<p>Move the balls to match the goal configuration.</p>"
};
```

### Classic Tower of London with Peg Capacities

The classic Tower of London uses pegs with capacities of 3, 2, and 1 balls.

```javascript
var trial = {
  type: jsPsychTowerOfLondon,
  start_state: [["red", "green", "blue"], [], []],
  goal_state: [[], ["blue"], ["green", "red"]],
  peg_capacities: [3, 2, 1],
  optimal_moves: 4,
  prompt: "<p>Solve the puzzle in as few moves as possible.</p>"
};
```

### With Time and Move Limits

```javascript
var trial = {
  type: jsPsychTowerOfLondon,
  start_state: [["red", "green", "blue"], [], []],
  goal_state: [["green"], ["red"], ["blue"]],
  optimal_moves: 5,
  max_moves: 15,
  time_limit: 60000,
  prompt: "<p>You have 60 seconds and 15 moves maximum.</p>"
};
```

### With Done Button (Manual Completion)

```javascript
var trial = {
  type: jsPsychTowerOfLondon,
  start_state: [["red", "green", "blue"], [], []],
  goal_state: [["blue"], ["green"], ["red"]],
  done_button_text: "I'm done",
  prompt: "<p>Click the button when you think you've matched the goal.</p>"
};
```
