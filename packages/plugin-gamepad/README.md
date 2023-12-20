# jsPsych Gamepad Plugin

## Overview

This is a plugin that allows one to use gamepads in a jsPsych experiment. Currently, the plugin is only tested with limited models of gamepads (by limited, it means that only xbox 360 controllers have been tested up to now) and certain features are only functional when using these gamepads. Any support or enhancement is appreciated.

## Compatibility

jsPsych >= 7.0

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |
| canvas_size | array | `[500, 500]` | Array that defines the size of the canvas element in pixels. First value is height, second value is width. |
| display_minature_gamepad | boolean | false | Whether to display a minature gamepad on the page that reflects gamepad operations. This feature should probably be used for debugging purposes and at the current stage supports only limited models of gamepads (namely, xbox 360 controllers only) |
| end_trial | function | `(context, gamepad, time_stamp, delta) => { return time_stamp > 2000 }` | This function, when returning `true`, would terminate the trial. It is called once every frame, after `on_frame_update`. It receives four arguments, which are the context to paint on, the gamepad connected (**caution: gamepad can be `null`**), the milliseconds that have passed since the start of the first frame, and the milliseconds since the last frame. |
| gamepad_connection_prompt | HTML string | `Awaiting gamepad connection...` | The content to prompt for gamepad connection, displayed beneath the stimulus. |
| on_frame_update | function | `(context, gamepad, time_stamp, delta) => {}` | This function is called once every frame, where new content can be painted (the old content is automatically removed and the user needs not manually do that part). It receives four arguments, which are the context to paint on, the gamepad connected (**caution: gamepad can be `null`**), the milliseconds that have passed since the start of the first frame, and the milliseconds since the last frame. |
| stimulus | function | `(context) => {}` | The unchanging content of each frame. The function is only called once, and the rendered content is thereafter copy-pasted in every frame before `on_frame_update`. |

## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| rt | number | Milliseconds from the start of the first frame to the end of the last frame. |
| input | Array of Gamepad objects | The state of the gamepad in each frame, put together in the form of an array. Note that this can be colossal in size, so mind how you deal with it. |

## Example

See the `examples/` folder. Note that this plugin can only be used via the **https** protocol.

## Trouble Shooting

> I keep on receiving the `npm ERR! node-pre-gyp ERR!` error message when running `npm install` on Windows.

This is actually not about the project itself, but a potential problem one might encounter when installing the dependency [`node-canvas`](https://github.com/Automattic/node-canvas/). If you look more carefully at the full log, you would probably locate this one line:

```
npm ERR! C:\GTK\bin\libpangowin32-1.0-0.dll
```

The solution to this is thus simple. According to the installation guide of `node-canvas` on Windows, you need to also install GTK2 and unzip it to `C:\GTK`. Check out the project's [wiki](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows) for more information.

> `display_minature_gamepad` does not work despite my setting it to `true`

Well, currently I have only tested the feature on Xbox 360 controllers and that is the only model that supports the feature. Theoretically, it should not be too hard to implement the support for other models, but again, I have only this one controller with me, so testing with other gamepads are not possible for me at present. You are, however, more than welcome to contribute to this plugin.
