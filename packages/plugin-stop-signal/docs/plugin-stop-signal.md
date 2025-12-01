# plugin-stop-signal

This plugin supports the stop signal timeline. It shows a series of  1-2 images and collects a response from the user with buttons. 

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| stimuli | IMAGE | undefind | A list of urls to the 1-2 images that will be shown |
| stimulus_height | INT | null | Sets the height of the image in pixels. If left null (no value specified), then the image will display at its natural height.| 
| stimulus_width | INT | null | Sets the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. 
| maintain_aspect_ratio | BOOL | true | If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be scaled to maintain the image's aspect ratio. | 
| trial_duration | INT | 1000 | The total time (in ms) the trial will take. | 
| frame_delay | INT | 500 | The time (in ms) the first image will be shown. | choices | STRING | undefined | Labels for the buttons. Each different string in the array will generate a different button. | 
| button_html | FUCTION | ``function(choice: string, choice_index: number)=>`<button class="jspsych-btn">${choice}</button>`` | A function that generates the HTML for each button in the `choices` array. The function gets the string and index of the item in the `choices` array and should return valid HTML. If you want to use different markup for each button, you can do that by using a conditional on either parameter. The default parameter returns a button element with the text label of the choice. | 
| render_on_canvas | BOOL | true | If true, the images will be drawn onto a canvas element. This prevents a blank screen (white flash) between consecutive images in some browsers, like Firefox and Edge. If false, the image will be shown via an img element, as in previous versions of jsPsych. |


## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| animation_sequence | array | An array, where each element is an object that represents an image in the sequence. Each object has a `stimulus` property, which is the image that was displayed, and a `time` property, which is the time in ms, measured from when the sequence began, that the stimulus was displayed. |
| stimulus | string | The path of the image that was displayed when the button was pressed. |
| rt | numeric | 	The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. |
| response | numeric | Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on.|

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-stop-signal"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-stop-signal.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-stop-signal
```

```js
import PluginAnimationButtonResponse from '@jspsych-contrib/plugin-stop-signal';
```

## Example

```javascript
 var trial = {
    type: jsPsychStopSignal,
    stimuli: ['img/left.svg', 'img/left_stop.svg'],
    trial_duration: 4000,
    frame_delay: 1000,
    choices: ['left', 'right'],
    multiple_responses: false,
  };
```