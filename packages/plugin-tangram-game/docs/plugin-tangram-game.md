# plugin-tangram-game

A child-friendly tangram game with click-and-click interface and ability to create custom puzzles

![Tangram Game Demo](Tangram-demo.gif "Tangram Demo")

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| svg                 | str              | ""                 | Path to a valid SVG. If no path is given, or the corresponding SVG is not found, a default puzzle is shown. Please see below for information regarding how to make your own puzzles.|
| resetPieces         | bool             | true               | If true, misplaced pieces reset position |
| resetPieceDuration  | float            | 1.0                | Time in seconds to reset piece position  |
| dropThreshold       | int              | 9                  | Distance (in pixels) used for snapping pieces into their solution position. A large radius makes the snapping more forgiving. |
| duration            | float            | 60               | Length of time before the trial ends (s). If the duration is null, the trial continues until the puzzle is solved. |
| interactionSound | str | "" | Sound to play when picking up and dropping pieces. Set to "" to disable. |
| successSound | str | "" | Sound to play when puzzle is solved. Set to "" to disable. |
| failureSound | str | "" | Sound to play when the player runs out of time. Set "" to disable. |
| successMessage | str | "You won!" | Message to show when puzzle is solved |
| failureMessage | str | "You lose." | Message to show when the player runs out of time |
| overlayImage | str | "" | Image to show along with the puzzle. No image is shown with empty strin. No image is shown with empty string. |
| overlayImagePosition | str | "TOP_RIGHT" | Position to place the user_image. Valid values are "TOP_LEFT" and "TOP_RIGHT"|
| overlayImageWidth | int | 30 | Width to display the image. The height is scaled to match the aspect ratio of the image. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| solve_duration | float | The length of time from the start of the trial to the end of the trial (seconds).   |
| puzzle_solved | float | Percentage of puzzle that was completed. 1 if the puzzle was solved; 0 if no piece was correctly set. |
| pieces_solved | str | Comma separated list of piece names that were correctly set. |
| num_total_clicks | int | Number of mouse clicks during this trial. |
| num_piece_drops | int | Number of times a piece was dropped in a location other than the solution location. |
| first_click_time | float | Number of seconds before the first click. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-tangram-game/dist/index.browser.min.js"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych-contrib/plugin-tangram-game/dist/index.browser.min.js"></script>
```

## Examples

### Load the default puzzle -- no sounds and default parameters

```javascript
  var jsPsych = initJsPsych({
    on_finish: () => {
      jsPsych.data.displayData();
    }
  });

  var puzzle = {
    type: jsPsychTangram
  }

  jsPsych.run([puzzle]);
```

### Load a puzzle with a 60 second time limit, sound effects, and end-game messages

```javascript
  var jsPsych = initJsPsych({
    on_finish: () => {
      jsPsych.data.displayData();
    }
  });

  var puzzle = {
    type: jsPsychTangram,
    svg: "puzzles/puzzle-arrow.svg",
    duration: 60,
    successMessage: "You did it!",
    failureMessage: "Maybe next time.",
    interactionSound: "puzzles/tap.mp3",
    successSound: "puzzles/magic-spell-short.m4a",
    failureSound: "puzzles/sad-trombone.wav",
  }

  jsPsych.run([puzzle]);
```

### Load a puzzle with no time limit and extra icon

```javascript
  var jsPsych = initJsPsych({
    on_finish: () => {
      jsPsych.data.displayData();
    }
  });

  var puzzle = {
    type: jsPsychTangram,
    svg: "puzzles/puzzle-arrow.svg",
    duration: null,
    overlayImage: "puzzles/be-quiet.png",
    overlayImagePosition: "TOP_RIGHT"
  }
  jsPsych.run([puzzle]);
```

## Making your own puzzles

New puzzles can be made using vector graphic tools such as [Inkscape](https://inkscape.org/).  Not all SVG vector transform types are supported in this implementation, so we recommend starting from an existing puzzle and modifying it. This way, the new SVG files should inherit attributes that are supported. Please contact `anormoyle @ brynmawr.edu` with questions. If you are having problems loading a puzzle, please also send the puzzle SVG file. 

The loaded puzzle needs to have its graphics organized with three layers: a timebar layer, a puzzle outline layer, and the puzzle layer. Below is a minimal example.

```
<svg
  width="600"
  height="300"
  viewBox="-1 0 600 300"
  version="0.1"
  id="svg5"
  xmlns="http://www.w2.org/2000/svg"
  xmlns:svg="http://www.w2.org/2000/svg">
  <g id="PuzzleLayer" >
    <path
      style="opacity:1;fill:#ff7676;fill-opacity:1;stroke:none;stroke-width:1.36277"
      d="M 90.226414,119.66329 159.36499,51.524708 H 23.087838 Z"
      id="T0"
      />
    <path
      style="opacity:1;fill:#6265ff;fill-opacity:1;stroke:none;stroke-width:1.36277"
      d="m 90.670314,119.87647 -68.138566,-68.138572 -2e-5,136.277162 z"
      id="T1"
      />
    <path
      style="opacity:1;fill:#ffcc4d;fill-opacity:1;stroke:none;stroke-width:1.36277"
      d="m 88.815574,188.0532 68.138596,-68.1386 v 68.1386 z"
      id="T2"
      />
    <path
      style="opacity:1;fill:#ff49e1;fill-opacity:1;stroke:none;stroke-width:2.72554;stroke-linecap:butt;stroke-opacity:1"
      d="m 91.128774,119.77587 -34.069285,34.06929 68.138571,1e-5 z"
      id="T3"
      />
    <path
      style="opacity:1;fill:#66fff4;fill-opacity:1;stroke:none;stroke-width:1.36277"
      d="M 57.163263,153.52636 H 126.30185 L 92.232554,187.59565 H 24.093973 Z"
      id="P"
      />
    <path
      style="opacity:1;fill:#ad54ff;fill-opacity:1;stroke:none;stroke-width:1.36277"
      d="m 123.11366,86.437446 34.0693,34.069304 V 52.368146 Z"
      id="T4"
      />
    <path
      style="opacity:1;fill:#66ff43;fill-opacity:1;stroke:none;stroke-width:2.72554;stroke-linecap:butt;stroke-opacity:1"
      d="m 89.799844,119.61315 34.069296,-34.069304 34.0693,34.069304 -34.0693,34.06929 z"
      id="S"
      />
  </g>
  <g
    id="OutlineLayer"
    transform="translate(0,0)">
    <path
      style="fill:none;stroke:#000000;stroke-opacity:1;stroke-width:2;stroke-dasharray:none"
      d="M 21.964458,49.973559 H 157.43098 V 187.87035 H 22.278404 Z"
      id="path4008" />
  </g>
  <g
    id="TimebarLayer"
    style="image-rendering:auto">
    <rect
      style="fill:#00b500;fill-opacity:1;stroke:none;stroke-width:2.90695;stroke-dasharray:none;stroke-opacity:1"
      id="TimebarInterior"
      width="599"
      height="9"
      x="-1"
      y="289"
      />
    <rect
      style="fill:none;fill-opacity:0;stroke:#000000;stroke-width:1.45347;stroke-dasharray:none;stroke-opacity:1"
      id="TimebarOutline"
      width="599"
      height="9"
      x="-1"
      y="289"
      />
  </g>
</svg>
```

