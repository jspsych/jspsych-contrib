# jspsych-device-motion extension


## Trial parameters


| Parameter             | Type             | Default Value      | Description                              |
| --------------------- | ---------------- | ------------------ | ---------------------------------------- |
| events                | array            | devicemotion       | Event passed to window. see [devicemotion Events](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicemotion_event).  |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type        | Value                                    |
| --------- | ----------- | ---------------------------------------- |
| x, y, z   | numeric     | Acceleration along x, y, z axis. [See details](https://w3c.github.io/deviceorientation/#devicemotion) |
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
