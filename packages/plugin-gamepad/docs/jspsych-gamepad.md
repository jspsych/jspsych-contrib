# jsPsych Gamepad Plugin

## Overview

This is a plugin that allows one to use gamepads in a jsPsych experiment. Currently, the plugin is only tested with limited models of gamepads (by limited, it means that only xbox 360 controllers have been tested up to now) and certain features are only functional when using these gamepads. Any support or enhancement is appreciated.

## Compatibility

jsPsych >= 7.0

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| canvas_size | array | `[500, 500]` | Array that defines the size of the canvas element in pixels. First value is height, second value is width. |
| display_minature_gamepad | boolean | false | Whether to display a minature gamepad on the page that reflects gamepad operations. This feature should probably be used for debugging purposes and at the current stage supports only limited models of gamepads (namely, xbox 360 controllers only) |
| end_trial | function | `(context, gamepad, time_stamp, delta) => { return time_stamp > 2000 }` | This function, when returning `true`, would terminate the trial. It is called once every frame, after `on_frame_update`. It receives four arguments, which are the context to paint on, the gamepad connected (**caution: gamepad can be `null`**), the milliseconds that have passed since the start of the first frame, and the milliseconds since the last frame. |
| gamepad_connection_prompt | HTML string | `Awaiting gamepad connection...` | The content to prompt for gamepad connection, displayed beneath the stimulus. |
| on_frame_update | function | `(context, gamepad, time_stamp, delta) => {}` | This function is called once every frame, where new content can be painted (the old content is automatically removed and the user needs not manually do that part). It receives four arguments, which are the context to paint on, the gamepad connected (**caution: gamepad can be `null`**), the milliseconds that have passed since the start of the first frame, and the milliseconds since the last frame. |
| stimulus | function | `(context) => {}` | The unchanging content of each frame. The function is only called once, and the rendered content is thereafter copy-pasted in every frame before `on_frame_update`. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| rt | number | Milliseconds from the start of the first frame to the end of the last frame. |
| input | Array of Gamepad objects | The state of the gamepad in each frame, put together in the form of an array. Note that this can be colossal in size, so mind how you deal with it. |

## Examples

### Track gamepad input for 10 s

```javascript
let trial = {
    type: jsPsychGamepad,
    canvas_size: [400, 400],
    display_minature_gamepad: true,
    end_trial: (context, gamepad, time_stamp, delta_time) => {
        return time_stamp > 10000;
    },
    gamepad_connection_prompt: 'No controller detected...',
    on_frame_update: (context, gamepad, time_stamp, delta) => {
        context.save();
        context.font = 'normal 16px Arial';
        context.fillStyle = 'red';
        context.textBaseline = 'top';
        context.fillText(`Time: ${Math.round(time_stamp)} ms`, 20, 20);
        context.fillText(`Fps: ${Math.round(1000 / delta)}`, 20, 50);
        context.restore();
    },
    stimulus: (context) => {
        context.save();
        context.fillStyle = 'rgb(200, 200, 200)';
        context.fillRect(0, 0, 400, 400);
        context.font = 'normal 30px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Trial ends in 10 seconds', 200, 200);
        context.restore();
    },
};
```
