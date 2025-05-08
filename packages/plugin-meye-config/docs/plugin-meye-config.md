# plugin-meye-config

Current version: 1.0.0.

This plugin configures the mEye extension to collect pupillometric data. mEye is a deep-learning model available for public use at https://www.pupillometry.it/. After calibrating the extension with this plugin, the extension runs in the background when added to any trial thereafter. 

Minimum requirements are a 720p 30fps webcam. This plugin must be called as a trial once in the experiment before using any trial can use the mEye extension. It can be difficult for mEye to detect participant' pupils. Original mEye website credits: Raffaele Mazziotti1, Fabio Carrara, Giuseppe Amato, and Tommaso Pizzorusso.

## Parameters

In addition to the [parameters available in all plugins](../overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
auto_calibrate | boolean | true | If enabled, participants can click a button that makes the plugin attempt to automatically configure its threshold for pupil detection. If disabled, GUI is presented to participants that lets them manually adjust this threshold.
calibration_duration | int | 20 | Only applies if auto_calibration is enabled. This is the duration that automatic calibration takes. Shorter durations require higher fps (i.e., more powerful computers) to calibrate at the same quality.
band_size | int | 9 | Only applies if auto_calibrate is enabled. Automatic calibration works by getting the returned pupil area for all 99 levels of threshold for pupil detection. Then, the variance for every possible group of *band_size* consecutive thresholds is calculated. The median threshold in the band with the least variance is what auto_calibration uses as the threshold. Because of how this algorithm interacts with the general contrast between the pupil and iris, larger band sizes tend to better retain pupil tracking as participants move or their lighting changes, but also tend to underestimate the pupil area.
erratic_area_tolerance | float | null | An index of pupil area change between frames that triggers a warning on the webpage. Disabled (by default) by setting to *null*, but can range from 0 to 0.5, where 0 is no change between frames (thus causing the warning to always appear) and 0.5 is the most change possible, which can only be triggered by the pupil area becoming infinitely large or zero between frames. As erratic_area_tolerance approaches 0.5, it requires an exponentially larger difference in pupil area between frames to trigger the warning. Setting to 0.167 will trigger the warning if the pupil area doubles or halves between frames. This is more sensitive that it seems. Mathematically, a warning will trigger if \|0.5 - (pupilAreaBefore / (pupilAreaBefore + pupilAreaAfter))\| ≥ erratic_area_tolerance.
modelUrl | string | "../../plugin-meye-config/models/meye-segmentation_i128_s4_c1_f16_g1_a-relu-no-subj/model.json" | The model used to identify pupils in the video feed. Uses the original mEye model by default which is recommended unless experimenting with custom models. Note that only TensorFlow models (converted to JSON) are currently supported.

## Data Generated

This plugin collects the following data. These are unlikely to be useful to the researcher but are used to configure instances of the mEye extension. Averages assume that the auto_calibrate parameter was set to true. If manual calibration was used, then this information regards the last frame before the plugin ended.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| avgPa  | numeric  | The average pupil area of the participant during calibration, in mEye's non-human-readable format. To convert this to pupil diameter in pixels where pixels are relative to the participant's monitor, use the following formula: roiSize \* sqrt(avgPa) ) / 128. |
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
	calibration_duration: 10,
	erratic_area_tolerance: 0.35,
	auto_calibrate: false
};
```
