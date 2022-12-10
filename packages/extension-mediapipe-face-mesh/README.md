# mediapipe-face-mesh extension

## Overview

This extension provides online tracking of facial posture during trials using the [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh) library. It currently records the estimated 3D translation and rotation.

The primary purpose of this extension is to use it in plugins. For instance, it allows creation of interactive virtual mirror paradigms similar to the [Open Virtual Mirror Framework](https://github.com/mgrewe/ovmf). However, it can also be used as an online face tracker if recording of sensitive facial data can be avoided. Refer to [trial parameters](#trial-parameters) for more details.

## Loading

### In browser

```js
<script src="https://unpkg.com/@jspsych-contrib/extension-mediapipe-face-mesh@2.0.0">
```

### Via NPM

```
npm install @jspsych-contrib/extension-mediapipe-face-mesh
```

```js
import jsPsychExtensionMediapipeFacemesh from '@jspsych-contrib/extension-mediapipe-face-mesh';
```

## Compatibility

This extension was developed for, and tested with jsPsych v7.3.0. 

## Documentation


### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`

```js
initJsPsych({
  extensions: [
    {type: jsPsychExtensionMediapipeFacemesh, params: {...}}
  ]
})
```
Parameter | Type | Default Value | Description
----------|------|---------------|------------
locateFile | function | see source | The function that is used to locate the binary blobs used by the face_mesh tracker.

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: jsPsych...,
  extensions: [
    {type: jsPsychExtensionMediapipeFacemesh, params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
record | boolean | false | Should the data generated as described below recorded or immediately discarded. Please note, that long recording might require lots of memory.


### Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/overview/plugins#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.

| Name             | Type        | Value                                    |
| ---------------- | ----------- | ---------------------------------------- |
| frame_id         | numeric     | The ID of the frame from which the tracking data was obtained |
| transformation   | [numeric]   | Array containing the full 3x4 transformation matrix for homogeneous coordinates. See [MediaPipe doc](https://google.github.io/mediapipe/solutions/face_mesh#metric-3d-space) for more details.|
| rotation          | [numeric]     | Array containing the Euler rotation angles in XYZ order. |
| translation          | [numeric]     | Array containing the translation along XYZ axes. |


### Usage in other plugins

This extension allows creation of interactive experiments, e.g., virtual mirrors as in [this project](https://github.com/mgrewe/ovmf). Here is an example of the sage of the extension from another plugin:

```js
  class MyInteractivePlugin {

    constructor(jsPsych) {
        this.jsPsych = jsPsych;
        this.mediapipe = this.jsPsych.extensions["mediapipe-face-mesh"];
    }

    trial(display_element, trial) {

        const callback = (trackingResult) => {
            console.log(trackingResult);
        };

        this.mediapipe.addTrackingResultCallback(callback);

        // Do some stuff

        this.jsPsych.pluginAPI.setTimeout(
            () => {
                this.mediapipe.removeTrackingResultCallback(callback);
                this.jsPsych.finishTrial();
            },
            trial["trial_duration"]);
    }

```
