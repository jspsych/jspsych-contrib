# plugin-plugin-device-orientation

Require mobile devices to be in a specific orientation (landscape or portrait) before continuing

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|                     |                  |                    |                                          |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|           |         |                                          |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-plugin-device-orientation"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-plugin-device-orientation.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-plugin-device-orientation
```

```js
import PluginDeviceOrientation from "@jspsych-contrib/plugin-plugin-device-orientation";
```


## Examples

### Title of Example

```javascript
var trial = {
  type: jsPsychPluginDeviceOrientation
}
```
