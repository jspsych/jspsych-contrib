# spr

This is a package built to enable self paced reading

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| Mode                | Number           | 1                  | Indicates the mode of text displaying used by the SPR plugin. Mode 1 is a masked presentation where clicking spacebar hides the previous shown words, mode 2 reveals one chunk at time but the chunks but previous ones remain visible. Mode 3 is when one word is displayed with no mask. |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|           |         |                                          |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-spr"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-spr.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-spr
```

```js
import Spr from '@jspsych-contrib/plugin-spr';
```

## Examples

### Title of Example

```javascript
var trial = {
  type: jsPsychSpr
}
```