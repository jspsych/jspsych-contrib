# plugin-tangram-game

A child-friendly tangram game with click-and-click interface and ability to create custom puzzles

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| svg                 | str              | "puzzles/puzzle-rocket.svg"| Path to a valid SVG              |
| resetPieces         | bool             | true               | If true, misplaced pieces reset position |
| resetPieceDuration  | float            | 1.0                | Time in seconds to reset piece position  |
| duration            | float            | null               | Length of time before the trial ends (s). If the duration is null, the trial continues until the puzzle is solved. |
| interactionSound | str | "puzzles/tap.mp3" | Sound to play when picking up and dropping pieces |
| successSound | str | "puzzles/magic-spell-short.m4a" | Sound to play when puzzle is solved |
| failureSound | str | "puzzles/sad-trombone.wav" | Sound to play when the player runs out of time |
| successMessage | str | "You won! :)" | Message to show when puzzle is solved |
| failureMessage | str | "You lose. :(" | Message to show when the player runs out of time |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| solve_duration | float | The length of time from the start of the trial to the end of the trial (seconds).   |
| puzzle_solved | int | 1 if the puzzle was solved; 0 otherwise |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-tangram-game/dist/index.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-tangram-game/dist/tangram.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-tangram-game/dist/tangrampiece.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-tangram-game/dist/tangramutils.js"></script>
<script src="https://unpkg.com/@jspsych-contrib/plugin-tangram-game/dist/timebar.js"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych-contrib/plugin-tangram-game/dist/index.js"></script>
<script src="jspsych-contrib/plugin-tangram-game/dist/tangram.js"></script>
<script src="jspsych-contrib/plugin-tangram-game/dist/tangrampiece.js"></script>
<script src="jspsych-contrib/plugin-tangram-game/dist/tangramutils.js"></script>
<script src="jspsych-contrib/plugin-tangram-game/dist/timebar.js"></script>
```

## Examples

### Load a puzzle with a 60 second time limit

```javascript
  var jsPsych = initJsPsych({
    on_finish: () => {
      jsPsych.data.displayData();
    }
  });

  var puzzle = {
    type: jsPsychTangram,
    svg: "puzzles/puzzle-arrow.svg",
    duration: 60
  }

  jsPsych.run([puzzle]);
```

### Load a puzzle with no time limit

```javascript
  var jsPsych = initJsPsych({
    on_finish: () => {
      jsPsych.data.displayData();
    }
  });

  var puzzle = {
    type: jsPsychTangram,
    svg: "puzzles/puzzle-arrow.svg",
    duration: null
  }
  jsPsych.run([puzzle]);
```

## Making your own puzzles

New puzzles can be made using vector graphic tools such as [Inkscape](https://inkscape.org/). 
The loaded puzzle needs to have its graphics organized with three layers: a timebar layer, a puzzle outline layer, and the puzzle layer. The 

Not all SVG vector transform types are supported in this implementation. However, if you create new puzzles by modifying existing puzzles, the new SVG files should inherit attributes that are supported. Please contact `anormoyle @ brynmawr.edu` with questions. If you are having problems loading a puzzle, please also send the puzzle SVG file. 