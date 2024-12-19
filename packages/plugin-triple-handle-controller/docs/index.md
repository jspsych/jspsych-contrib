# triple-handle-controller

Current version: 1.0.2. [See version history](https://github.com/jspsych/jsPsych/blob/main/packages/plugin-triple-handle-controller/CHANGELOG.md).

This plugin displays a video and records inputs from the participant via a game controller. This plugin requires an external game controller with at least one or more analogue input devices, such as a handle or a pressure sensitive button. The recording of data starts when the user presses the record button and ends when the video stops.

The plugin will record data as indicated by the _rate_ variable (how many times it will record per second).

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/index.html#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of _undefined_ must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter     | Type    | Default Value                       | Description                                                                                                                                                                                                                           |
| ------------- | ------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title         | string  | undefined                           | The title to appear above the video.                                                                                                                                                                                                  |
| video_src     | string  | undefined                           | The url of the video location.                                                                                                                                                                                                        |
| axis_1        | numeric | undefined                           | The input number of the first axis.                                                                                                                                                                                                   |
| axis_2        | numeric | undefined                           | The input number of the second axis.                                                                                                                                                                                                  |
| axis_3        | numeric | undefined                           | The input number of the third axis.                                                                                                                                                                                                   |
| axis_location | complex | ["L", "H", "R"]                     | An array of three characters which will indicate the placement of each of the three axises on screen. "L" places the axis on the left of the screen, "R" places the axis on the right of the screen, and "H" hides the axis entirely. |
| axes_labels   | complex | ["axis1", "axis2", "axis3"]         | An array of the three axis names. If an axis is not going to be used, then an empty string ("") can be used in place of the name.                                                                                                     |
| axis1_labels  | complex | ["low", "neutral", "high"]          | An array of labels for axis 1. The label in index 1 appears near the bottom of the axis, the one in index 2 appears near the middle, and the one in index 3 appears near the top.                                                     |
| axis2_labels  | complex | ["negative", "neutral", "positive"] | An array of labels for axis 2. The label in index 1 appears near the bottom of the axis, the one in index 2 appears near the middle, and the one in index 3 appears near the top.                                                     |
| axis3_labels  | complex | ["a", "b", "c"]                     | An array of labels for axis 3. The label in index 1 appears near the bottom of the axis, the one in index 2 appears near the middle, and the one in index 3 appears near the top.                                                     |
| rate          | numeric | 1000                                | Number of miliseconds between each data call.                                                                                                                                                                                         |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/index.html#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name        | Type    | Value                                                                                                                                                                              |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data_arrays | array   | An array of three arrays, each representing an different input device. Each of the three arrays inside contains a value of the handle taken as often as set in the rate parameter. |
| rate        | numeric | Number of miliseconds between each data call.                                                                                                                                      |
| video_src   | string  | A URL to a copy of the videodata.                                                                                                                                                  |
| duration    | numeric | The length of the video, in seconds.                                                                                                                                               |



## Examples

This code runs an experiment involving two levers.


```
        const videos = ["Test.webm"];

        var experiment = [
            {
                type: jsTripleHandleController,
                axis_1: 0,
                axis_2: 1,
                axis_3: 2,
                axis_location: ["L", "R", "H"],
                axis1_labels: ["No", "Maybe", "Yes"],
                axis2_labels: ["0%", "50%", "100%"],
                css_clases: ["thc-override"],
                axes_labels: ["axis1 (axis 1)", "axis2 (axis 2)", "item 3 (axis 3)"],
                title: "Follow the instructions in the video.",
                // A monitor refresh rate of 60 Hz means that
                // the screen changes every 16.7 ms or higher.
                rate: 1000 / 60, //16.777...
            },
        ];

        async function createExperiment() {
            const videoSrc = `./videos/${videos[0]}`;
            experiment[0].video_src = videoSrc;
            jsPsych.run(experiment);
        }

        createExperiment();
```

## Demo

See the examples folder.

The bullet train video (BulletTrainFriction.webm) is from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:BulletTrainFriction.webm), under the [Creative Commons CC0 1.0 Universal Public Domain Dedication](https://creativecommons.org/publicdomain/zero/1.0/deed.en).
