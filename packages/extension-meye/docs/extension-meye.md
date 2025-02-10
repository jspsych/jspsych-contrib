# extension-meye

Current version: 1.0.0.

This extension collects pupillometric data using mEye. mEye is a deep-learning model available for public use at https://www.pupillometry.it/, and this extension adapts it to JsPsych. After calibrating the extension with the meye plugin (which must be a trial called before any trial using the extension), this extension runs in the background when added to any trial thereafter. 

Minimum requirements are a 720p 30fps webcam. The corresponding plugin must be called as a trial once in the experiment before using any trial can use the mEye extension. Original mEye website credits: Raffaele Mazziotti1, Fabio Carrara, Giuseppe Amato, and Tommaso Pizzorusso.

## Parameters

This extension accepts one parameter. If unspecified, the extension will not collect any data.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| detection_interval  | numeric      	 | null        | Specifies how often (in ms) the extension takes a snapshot of the user's pupil. |

## Data Generated

This extension collects the following data.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| pupil_diameter  | numeric  | The diameter of the user's pupil at the time of snapshot, in pixels relative to the participant's monitor. The participant is assumed to have circular pupils because diameter is reported. |
| blink_prob  | numeric | The probability that the user was blinking at the time of snapshot. Is between 0 and 1, where 1 indicates that the extension is certain that the user was blinking. |
| timecode	| numeric	| The seconds (rounded to three decimal places) since the start of the extension-trial dyad that the snapshot was taken, including the moment a trial starts and ends. Due to javascript, this cannot be perfectly accurate and an error of up to 30ms occurs on the developer's computer. |

## Install

Using the downloaded jspsych-contrib folder:

```js
<script src="jspsych-contrib/packages/extension-meye/dist/index.browser.min.js"></script>
```

## Examples

Ensure that the **plugin** is a trial in the timeline before adding the extension to any trial thereafter.

```javascript
var meyeCalibrate = {
	type: jsPsychMeyeConfig,
};
		
var useExtension = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<img id="some-image" src="some-image.png"/>',
	trial_duration: 600,
	response_ends_trial: false,
	data: { task: 'webcam1', US: 'no'},
	extensions: [{ type: jsPsychExtensionMeye, params: {detection_interval: 100} }]
}
```
