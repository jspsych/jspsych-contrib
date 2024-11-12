# headphone-check

Allows for one to check if a participant is wearing headphones using an auditory task.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter | Type    | Default Value      | Description        |
| --------- | ------- | ------------------ | ------------------ |
| stimuli   | array of audio files | *undefined* | The list of tones that will be played. |
| correct   | array of integers | *undefined* | The list of correct answers, corresponding to each tone. Each number in the array is between 1-3, corresponding to the first, second, and third being the correct response. |
| total_trials | integer | 6 | Number of trials that will be played. |
| threshold | integer | 5 | Threshold of correct trials needed to pass the headphone screening. |
| trials_per_page | integer | 3 | Number of trials that are rendered on a single page. Must be a factor of `total_trials` so each page gets their own equal set of trials. |
| prompt | HTML string | `"<p>Listen to the following sounds and select which option is quietest. <br> Click the play button to listen to the sound, and select the correct option. <br> Test sounds can only be played once!</p>"` | An HTML-formatted string presented to the participant above the audio questions. |
| labels | array of strings | `["FIRST sound is SOFTEST", "SECOND sound is SOFTEST", "THIRD sound is SOFTEST"]` | A 3 element array containing the labels of the three radio buttons. |
| play_button_label | string | `"Play"` | The label of the play button. Will be used for calibration as well if enabled. |
| continue_button_label | string | `"Continue"` | The label of the continue button. Will be used for calibration as well if enabled. |
| sequential | boolean | `false` | If true, each stimulus must be played and completed from first to last. |
| shuffle | boolean | `true` | If true, the trials will be shuffled before being displayed to the participant. |
| sample_with_replacement | boolean | `false` | If true, on shuffle, the trials will be shuffled with replacement, meaning some trials may contain duplicates. |
| calibration | boolean | `true` | If true, a calibration sound will be played to allow the participant to adjust their volume. |
| calibration_stimulus | audio file | `null` | The audio file that will be played for calibration. | 
| calibration_prompt | function | ``function (calibration_counter: number) { return `<p>Calibrating Volume: Press the play button below to play a sound. <br> Adjust the volume of the sound to a comfortable level, and click continue when you are ready. <br> You have ${calibration_counter} calibration attempts remaining.</p>`;}`` | A function taking in the current amount of calibration attempts, which acts to present this info along with a stimulus to the participant above the calibration button. |
| calibration_attempts | integer | 3 | The amount of times the user may play the calibration sound. |


## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| did_pass | boolean | If the participant passed the headphone screen. |
| total_correct | integer | Total number of correct responses. |
| responses | array of objects | An array of objects indicating what the headphone check stimulus was, which option the participant selected, and if it was correct. Has three fields: `stimulus`: Filepath of the stimulus object. `response`: The option the participant selected, from 1-3. `correct`: If the participant's response was correct. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-headphone-check"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-headphone-check.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-headphone-check
```

```js
import HeadphoneCheck from '@jspsych-contrib/plugin-headphone-check';
```

## Examples

### Basic Headphone Check
This example mimics the default configurations in the [original Headphone Check](https://github.com/mcdermottLab/HeadphoneCheck) plugin.

```javascript
var trial = {
  type: jsPsychHeadphoneCheck,
  stimuli: ["./audio/antiphase_HC_ISO.wav", "./audio/antiphase_HC_IOS.wav", "./audio/antiphase_HC_SOI.wav", "./audio/antiphase_HC_SIO.wav", "./audio/antiphase_HC_OSI.wav", "./audio/antiphase_HC_OIS.wav"],
  correct: [2, 3, 1, 1, 2, 3],
  calibration_stimulus: "./audio/noise_calib_stim.wav",
  sample_with_replacement: true,
  sequential: true,
}
```