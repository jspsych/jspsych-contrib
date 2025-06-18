Maze
====

A jsPsych plugin for running Maze (Forster et al., 2009) experiments, a version of self-paced
reading that asks to choose between the correct next word and a distractor.

## Parameters

In addition to the [parameters available in all
plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this
plugin accepts the following parameters. Parameters with a default value of undefined must be
specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter         | Type                                        | Default Value                | Description                                                                                                                      |
|-------------------|---------------------------------------------|------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `sentence`        | `Array<[string, string]>`                   | `undefined`                  | The sentence to use in the Maze, as `[word, foil]` pairs.                                                                        |
| `question`        | `{text: string, correct: str, wrong: str}?` | `null`                       | An optional question to ask at the end of the mazz to make sure the subject has read the sentence.                               |
| `canvas_style`    | `string`                                    | `"border: 0px solid black;"` | Extra style to inject in the canvas element.                                                                                     |
| `canvas_colour`   | `string`                                    | `"white"`                    | The canvas' background colour.                                                                                                   |
| `canvas_size`     | `[number, number]`                          | `[1280, 960]`                | The dimensions of the canvas.                                                                                                    |
| `font_colour`     | `str`                                       | `"black"`                    | The font colour for the text.                                                                                                    |
| `font_style`      | `str`                                       | `"normal 24px monospace"`    | The font style for the text.                                                                                                     |
| `halt_on_error`   | `bool`                                      | `false`                      | If true, any error ends the trial and sends the subject directly to the question (if any), then exit.                            |
| `keys`            | `{left: string, right: string}`             | `{left: "f", right: "j"}`    | The choice/navigation keys.                                                                                                      |
| `position_left`   | `{x: number?, y: number?}`                  | `{x: null, y: null}`         | The position of the left word. A null `x` is set to 1/3 of the canvas' width and null `y` is set to half of the canvas' height.  |
| `position_right`  | `{x: number?, y: number?}`                  | `{x: null, y: null}`         | The position of the right word. A null `x` is set to 2/3 of the canvas' width and null `y` is set to half of the canvas' height. |
| `tranlate_origin` | `bool`                                      | `true`                       | If true, the coordinates are transposed to have `(0, 0)` be the center of the canvas.                                            |
| `waiting_time`    | `number`                                    | `0`                          | The minimum time (in ms) before the subject is allowed to chose a word.                                                          |

## Data Generated

In addition to the [default data collected by all
plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this
plugin collects the following data for each trial.

| Name       | Type                                                                                  | Value                                                                       |
|------------|---------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `sentence` | `string`                                                                              | The sentence used in the trial (joined with spaces)                         |
| `events`   | `Array<{correct: bool, foil: string, rt: number, word: string, word_number: number}>` | The parameters, choice and interaction time for each word of the sentence   |
| `question` | `{question: {text: string, correct: str, wrong: str}, correct: bool, rt: number}>`    | The parameters, choice and interaction time for the final question (if any) |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-maze"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-maze.js"></script>
```

Using NPM:

```bash
npm install @jspsych-contrib/plugin-maze
```

```js
import Maze from '@jspsych-contrib/plugin-maze';
```

## Examples

```javascript

const trial = {
  type: jsPsychMaze,
  sentence: [
      ["After", "x-x-x"],
      ["a", "so"],
      ["bit", "pot"],
      ["of", "if"],
      ["success", "singing"],
      ["the", "ate"],
      ["stocks", "winter"],
      ["took", "walk"],
      ["a", "we"],
      ["dive", "toad"],
    ],
  question: {
    text: "Did the stocks take a dive?",
    correct: "yes",
    wrong: "no",
  },
  waiting_time: 200,
}
```

## Bibliography

- Forster, Kenneth I., Christine Guerrera, and Lisa Elliot. 2009. ‘The Maze Task: Measuring Forced
  Incremental Sentence Processing Time’. Behavior Research Methods 41 (1): 163–71.
  <https://doi.org/10.3758/BRM.41.1.163>.
