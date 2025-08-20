# vaast-image

The VAAST-image plugin displays a single trial with an image stimulus appearing on a background image. The participant has to either approach or avoid the image stimulus shown on the screen, depending on the instructions. They respond by pressing one key or another. The scene changes accordingly. This plugin is used in VAAST (Visual Approach and Avoidance by the Self Task) experiments.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter               | Type        | Default Value   | Description                              |
| ----------------------- | ----------- | --------------- | ---------------------------------------- |
| stimulus                | IMAGE       | undefined       | The image to be displayed. | 
| approach_key            | KEY         | 'Z'             | The key press associated with an approach movement. |
| avoidance_key           | KEY         | 'S'             | The key press associated with an avoidance movement. |
| key_to_move_forward     | KEYS        | "ALL_KEYS"      | This array contains the key(s) that the participant is allowed to press in order to advance to the next trial if their key press was incorrect. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see {@link https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values this page} and {@link https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/ this page (event.key column)} for more examples. Any key presses that are not listed in the array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. Specifying `"NO_KEYS"` will mean that no responses are allowed. |
| display_feedback        | BOOL        | false           | If true, then the code included in 'html_when_wrong' will be displayed when the user makes an incorrect key press. |   
| feedback_duration       | INT         | null            | How long the feedback is shown (in ms). |
| html_when_wrong         | HTML_STRING | '<span style="color: red; font-size: 80px">X</span>' | The content to display when a user presses the wrong key. |
| force_correct_key_press | BOOL        | false           | If true, the user will be forced to press the correct key in order to advance to the next trial after a wrong key press. |
| stim_movement           | STRING      | undefined       | The movement associated with the stimulus (either "approach" or "avoidance"). |
| font_sizes              | INT         | null            | An array with the sizes of the image as function of the position. The medium font corresponds to the stimulus font size when it's first presented. The smaller and larger fonts correspond to the stimulus font size when the movement is avoidance and approach, respectively. |
| response_ends_trial     | BOOL        | true            | If true, the trial will end when the user makes a response. True in trials in which the participant responds to a stimulus. False in trials where the participant sees the position change on the screen (background and stimulus). |
| trial_duration          | INT         | null            | How long to wait for the participant to make a response before ending the trial, in milliseconds. If the value of this parameter is `null`, then the trial will wait for a response indefinitely. |
| background_images       | IMAGE       | undefined       | An array with the images displayed as background as function of the position. |
| position                | INT         | 3               | The position in the "background_images" array which will be used to set the background (and the stimulus font size). |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | STRING  | The path to the image file that was displayed on the screen. |
| response  | STRING  | Indicates which key that the participant pressed. |
| correct   | BOOL    | Boolean indicating whether the user's key press was correct or incorrect for the given stimulus. |
| rt        | INT     | The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| movement  | STRING  | The movement associated with the stimulus. |
| position  | INT     | The position in the "background_images" array used to set the background and the stimulus size. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-vaast-image"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-vaast-image.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-vaast-image
```

```js
import VaastImage from '@jspsych-contrib/plugin-vaast-image';
```

## Example

```javascript
// VAAST background images
// In the examples folder, 'eco_env' refers to an ecological environment but non-ecological visual flow, 'eco_vf' to an ecological visual flow but non-ecological environment and 'eco_vf_env' to an ecological visual flow and environment.

const background = [
  "../examples/background/eco_env/2.jpg",
  "../examples/background/eco_env/4.jpg",
  "../examples/background/eco_env/6.jpg"
];
// VAAST stimuli sizes 
const stim_sizes = [
  266,
  322,
  420
];

var vaast_first_step = {
  type: jsPsychVaastImage,
  stimulus: '../examples/stimuli/diamond.png',
  position: 1,
  background_images: background,
  font_sizes: stim_sizes,
  approach_key: "t",
  avoidance_key: "b",
  stim_movement: 'approach',
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: true,
  display_feedback: true,
  response_ends_trial: true
} 

// Press the approach key 't' to view the next trial (i.e., the step forward)
// Press the avoidance key 'b' to view the error screen

var vaast_second_step = {
  type: jsPsychVaastImage,
  stimulus: '../examples/stimuli/diamond.png',
  position: 2,  // in a real trial, we would calculate the next position, see 'examples/minimal_example.html'
  background_images: background,
  font_sizes: stim_sizes,
  stim_movement: 'approach',
  response_ends_trial: false,
  trial_duration: 650
} 
```