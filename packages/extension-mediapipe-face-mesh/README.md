# mediapipe-face-mesh extension

## Overview

This extension provides online tracking of facial posture during trials using the [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh) library. It currently records the estimated 3D translation and rotation.

For future releases, it is planned to provide callback registration. This fosters implementation of an interactive online variant of the [Open Virtual Mirror Framework](https://github.com/mgrewe/ovmf).

## Loading

### In browser

```js
<script src="https://unpkg.com/@jspsych-contrib/extension-mediapipe-face-mesh@1.0.0">
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

### Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/overview/plugins#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.

| Name             | Type        | Value                                    |
| ---------------- | ----------- | ---------------------------------------- |
| frame_id         | numeric     | The ID of the frame from which the tracking data was obtained |
| transformation   | [numeric]   | Array containing the full 3x4 transformation matrix for homogeneous coordinates. See [MediaPipe doc](https://google.github.io/mediapipe/solutions/face_mesh#metric-3d-space) for more details.|
| rotation          | [numeric]     | Array containing the Euler rotation angles in XYZ order. |
| translation          | [numeric]     | Array containing the translation along XYZ axes. |

