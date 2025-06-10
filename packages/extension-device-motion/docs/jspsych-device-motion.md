# jspsych-device-motion extension

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type        | Value                                    |
| --------- | ----------- | ---------------------------------------- |
| x, y, z   | numeric     | Acceleration along x, y, z axis. [See details](https://w3c.github.io/deviceorientation/#devicemotion) |
| t         | numeric     | Time (ms) between beginning of trial and accelerometer reading.            |
| interval  | numeric     | Interval between samples (ms)            |
| event     | string      | Type of event being listened.     |

## Examples

### "Adding the extension to collect movement data while playing a song."

```javascript
var jsPsych = initJsPsych({
  extensions: [
    {type: jsPsychExtensionDeviceMotion }
  ]
});

var welcome = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 'Hello',
    choices: ['Start']
};

var trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: 'sound/tone.mp3',
    choices: ['Done'],
    prompt: "<p>Listen to the music and danve freely.</p>",
    extensions: [
      {type: jsPsychExtensionDeviceMotion }
    ],
};

}
