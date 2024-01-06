# countdown

This extension adds a countdown for a trial.

## Parameters

### Initialization Parameters

None

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```javascript
let trial = {
  type: jsPsych...,
  extensions: [
    {type: jsPsychExtensionWebgazer, params: {...}}
  ]
}
```

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| time | number | undefined | Time in milliseconds of the countdown |
| update_time | number | 50 | How often to update the countdown display; in milliseconds |
| format | function | (time) => String(Math.floor(time / 1000)) | The displayed content of the countdown. Receives the current time left in milliseconds and returns a string for display. |

## Data Generated

None

## Functions

These functions below are provided to enable a better interaction with the countdown. Note that all of the functions below must be prefixed with `jsPsych.extensions.countdown` (e.g. `jsPsych.extensions.countdown.pause()`).

### `pause()`

Pauses the countdown.

### `resume()`

Resumes the countdown.

## Example

```javascript
let jsPsych = initJsPsych({
  extensions: [{ type: jsPsychExtensionCountdown }],
});

let trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Hello world",
  extensions: [
    {
      type: jsPsychExtensionCountdown,
      params: {
        time: 5000,
        update_time: 20,
        format: (time) => {
          if (time < 3000) {
            document.querySelector(".jspsych-extension-countdown").style.color = "red";
          }

          let time_in_seconds = time / 1000;

          let minutes = Math.floor(time_in_seconds / 60);
          time_in_seconds -= minutes * 60;

          let seconds = Math.floor(time_in_seconds);

          let format_number = (number) => {
            let temp_str = `0${number}`;
            return temp_str.substring(temp_str.length - 2);
          };

          return `${format_number(minutes)}:${format_number(seconds)}`;
        },
      },
    },
  ],
  on_load: function () {
    setTimeout(() => {
      jsPsych.extensions.countdown.pause();
      setTimeout(() => {
        jsPsych.extensions.countdown.resume();
      }, 2000);
    }, 1000);
  },
};

jsPsych.run([trial]);
```
