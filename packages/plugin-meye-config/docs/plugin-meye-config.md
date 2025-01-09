# plugin-meye-config

Current version: 1.0.0.

This plugin configures the mEye extension to collect pupillometric data. mEye is a deep-learning model developed by Fabio Carrara, who made it to run on a website for public use at https://www.pupillometry.it/. After calibrating the extension with this plugin, the extension runs in the background when added to any trial thereafter. 

Minimum requirements are a 720p 30fps webcam. This plugin must be called as a trial once in the experiment before using any trial can use the mEye extension. It can be difficult for mEye to detect participant' pupils. Use with caution.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
auto_calibrate | boolean | true | If enabled, the plugin will attempt to automatically configure its threshold for pupil detection. If disabled, GUI is presented to participants that lets them manually adjust this threshold.

## Data Generated

This plugin collects the following data. These are unlikely to be useful to the researcher but are used to configure instances of the mEye extension.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| avgPa  | numeric  | The average pupil area of the participant during calibration, in mEye's non-human-readable format. To convert this to pupil diameter in pixels where pixels are relative to the participant's monitor, use the following formula: `roiSize` \* sqrt(`avgPa`) ) / 128. |
| avgPx  | numeric | The average x-coordinate of the participant's pupil during calibration in pixels, where 0 is the leftmost side of the webcam video shown to the participant. |
| avgPy	| numeric	| The average y-coordinate of the participant's pupil during calibration in pixels, where 0 is the topmost side of the webcam video shown to the participant. |
| avgRx		| numeric	| The average x-coordinate of the region of interest ("red-edged box") during calibration in pixels, where 0 is the leftmost side of the webcam video shown to the participant. |
| avgRy	| numeric	| The average y-coordinate of the region of interest during calibration in pixels, where 0 is the topmost side of the webcam video shown to the participant. |
| roiSize	| numeric	| The side length of the region of interest selected by the participant during calibration, in pixels. |
| threshValue	| numeric	| The threshold output by calibration that is ideal for governing mEye's pupil detection for the particular participant. Ranges from .01 to .99 where a higher value indicates a stricter threshold. |

## Install

Using the downloaded jspsych-contrib folder:

```js
<script src="jspsych-contrib/packages/plugin-meye-config/dist/index.browser.min.js"></script>
```

## Examples

```javascript
var meyeCalibrate = {
	type: jsPsychMeyeConfig,
	auto_calibrate: false,
};
```
