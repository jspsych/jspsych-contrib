# plugin-numpad

an interactable and responsive numpad supporting both touch and keyboard interaction for numerical input.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| numpad_layout | array | `[1, 2, 3, 4, 5, 6, 7, 8, 9, "X", 0, "C"]` | A 12-element array of numbers 0-9, alongside "X" and "C", corresponding to the delete and continue keys. This parameter can be used to customize the layout of the numpad, where the 1st element corresponds to the top left key, going left to right and then down. |
| max_digits | integer | `null` | The maximum number of digits that can be entered. If the participant tries to enter more than this number, additional input will be ignored. Set this to null for no limit. |
| min_digits | integer | `1` | The minimum number of digits that must be entered in order to continue. If the participant tries to continue before entering this number of digits, an error message will be displayed and they will not be allowed to continue until they have entered enough digits. |
| error_message | string | `"Please enter at least the minimum number of digits before continuing."` | The error message that will be displayed if the participant tries to continue before entering the minimum number of digits. |
| show_preview | boolean | `true` | If true, a preview of the current input will be displayed above the numpad. If false, no preview will be displayed. |
| preamble | HTML string | `null` | An HTML string that will be displayed above the numpad and the preview if enabled. |
| continue_button_text | string | `"Continue"` | The text for the continue button. |
| delete_button_text | string | `"Delete"` | The text for the delete button. |
| allow_keyboard | boolean | `true` | If true, the user may use the keyboard to enter input in addition to clicking on the numpad. If false, only clicking on the numpad will be allowed. |
| delete_key | key | `"Backspace"` | If allow_keyboard is true, this will be the key that the user can press to delete the last digit they entered. |
| continue_key | key | `"Enter"` | If allow_keyboard is true, this will be the key that the user can press to continue and submit their input. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response | integer | The number that was entered by the participant, `null` if no response was given. |
| rt | integer | The response time in milliseconds for the trial. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-numpad"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-numpad.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-numpad
```

```js
import jsPsychNumpad from "@jspsych-contrib/plugin-numpad";
```


## Examples

### Simple Numpad

```javascript
var basic = {
  type: jsPsychNumpad,
  preamble: "<p>Enter any number using the numpad below.</p>",
}
```

### 4-digit PIN Input

```javascript
var pin = {
  type: jsPsychNumpad,
  preamble: "<p><strong>Enter a 4-digit PIN.</strong></p>",
  min_digits: 4,
  max_digits: 4,
  error_message: "Please enter exactly 4 digits.",
};
```