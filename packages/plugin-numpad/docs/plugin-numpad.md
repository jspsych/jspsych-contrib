# plugin-numpad

an interactable and responsive numpad supporting both touch and keyboard interaction for numerical input.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter            | Type        | Default Value | Description |
| -------------------- | ----------- | ------------- | ----------- |
| numpad_layout        | array       | `[[1, 2, 3], [4, 5, 6], [7, 8, 9], ["delete", 0, "continue"]]` | A 2D array describing the numpad, one inner array per row. Every row must have the same length. Identical keys placed next to each other merge into one larger button, as long as they form a rectangle; otherwise each key may appear only once. See [Layouts](#layouts) for the keys each cell can have. |
| max_digits           | integer     | `null`        | The maximum number of digits that can be entered. If the participant tries to enter more than this, the extra input is ignored; a multi-digit key like `"00"` that would go over the limit is ignored entirely. Only digits count, not the minus sign, decimal character, or separators. `null` for no limit. |
| min_digits           | integer     | `1`           | The minimum number of digits that must be entered in order to continue. If the participant tries to continue with fewer, `error_message` is shown with reason `"min_digits"` and they cannot continue until they enter enough digits. Only digits count. `0` allows an empty response. Must not be greater than `max_digits`. |
| validate_fn          | function    | `null`        | An optional function `(input) => boolean`, called with the current contents of the field when the participant tries to continue, after the `min_digits` and format checks pass. `input` is the response exactly as displayed (e.g. `"-1,234.5"`), or `""` if nothing was entered. Return `true` to accept the response, or `false` to reject it and show `error_message` with reason `"validate_fn"`. |
| error_message        | function    | see description | A function `(input, reason) => string` returning the error message displayed between the preview and the numpad when the participant cannot continue. `input` is the current contents of the field. `reason` is `"min_digits"` (too few digits), `"format"` (the response ends in a minus sign, decimal character, or separator), or `"validate_fn"` (`validate_fn` returned `false`). The default returns a generic message for each reason. |
| show_preview         | boolean     | `true`        | If true, a preview of the current input is displayed above the numpad. If false, no preview is displayed. |
| preamble             | HTML string | `null`        | An HTML string displayed above the numpad, and above the preview if it is shown. |
| continue_button_text | string      | `"Continue"`  | The text for the `"continue"` key. |
| delete_button_text   | string      | `"Delete"`    | The text for the `"delete"` key. |
| negative_button_text | string      | `"±"`         | The text for the `"negative"` key. |
| decimal_character    | string      | `"."`         | Both the character entered by the `"decimal"` key and the keyboard key that enters it. Also used as the key's label. Can only be `null` if there is no `"decimal"` key. |
| separator_character  | string      | `","`         | The character used as a thousands or lakh-crore separator, entered either by the `"separator"` key or inserted automatically by `separate_pattern`. When `separate_pattern` is `"none"`, it is also the keyboard key that enters a separator. Also used as the `"separator"` key's label. Can only be `null` if neither is in use. Must differ from `decimal_character`. |
| separate_pattern     | select      | `"none"`      | How separators are inserted into the whole-number part of the response. `"none"`: no automatic separators; the participant may enter them with a `"separator"` key. `"thousands"`: automatic separators every three digits (`1,234,567`). `"lakh_crore"`: automatic separators in the Indian numbering style (`12,34,567`). A `"separator"` key cannot be used with `"thousands"` or `"lakh_crore"`. |
| allow_keyboard       | boolean     | `true`        | If true, the participant may use the keyboard to enter input in addition to clicking on the numpad. Only keys present on the numpad can be typed: single-digit keys, `-` for `"negative"`, `decimal_character` for `"decimal"`, and `separator_character` for `"separator"`. Multi-digit keys such as `"00"` can only be clicked. If false, only clicking on the numpad is allowed. |
| delete_key           | key         | `"Backspace"` | If `allow_keyboard` is true, the key the participant can press to delete the last character they entered. |
| continue_key         | key         | `"Enter"`     | If `allow_keyboard` is true, the key the participant can press to continue and submit their input. |

The trial throws an error at the start if its parameters can never produce a valid response, for example a malformed layout, `min_digits` greater than `max_digits`, or no `"continue"` key while `allow_keyboard` is false.

### Layouts

Each cell of `numpad_layout` can be:

| Cell | Behavior |
| ---- | -------- |
| a non-negative integer or a string of digits, e.g. `7`, `"7"`, `"00"` | Enters those digits. `7` and `"7"` are the same key. |
| `"delete"` | Removes the last character (or the minus sign, if nothing else is left). |
| `"continue"` | Submits the response. |
| `"negative"` | Toggles a leading minus sign. Can be pressed at any time. |
| `"decimal"` | Enters `decimal_character`, once per response. Pressed first, it enters `0` followed by the decimal character. |
| `"separator"` | Enters `separator_character`. Only allowed directly after a digit in the whole-number part, and only when `separate_pattern` is `"none"`. |
| `null` | An empty cell. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response | string | The response exactly as displayed to the participant, including any minus sign, decimal character, and separators (e.g. `"-1,234.5"`). Kept as a string to preserve leading zeros. `null` if no response was given. |
| raw_number | float | The response parsed as a number, ignoring separators, removing leading zeros, and reading the decimal character as a decimal point, whatever `decimal_character` is (e.g. `"-1,234.5"` and `"-1.234,5"` both give `-1234.5`, and `"007"` gives `7`). Use `response` for codes like PINs where leading zeros matter. Since this is a normal JavaScript number, a response with more than 15 significant digits may be rounded; `response` always keeps the exact digits. `null` if no response was given. |
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
  error_message: () => "Please enter exactly 4 digits.",
};
```

### Validated Age

```javascript
var age = {
  type: jsPsychNumpad,
  preamble: "<p>How old are you?</p>",
  max_digits: 3,
  validate_fn: (input) => Number(input) >= 18 && Number(input) <= 120,
  error_message: (input, reason) =>
    reason === "validate_fn"
      ? `${input} is not a valid age. Please enter an age between 18 and 120.`
      : "Please enter your age.",
};
```

### Desktop-style Numpad with Merged Keys

```javascript
var desktop = {
  type: jsPsychNumpad,
  preamble: "<p>Enter a temperature.</p>",
  numpad_layout: [
    ["negative", null, null, "delete"],
    [7, 8, 9, "delete"],
    [4, 5, 6, "continue"],
    [1, 2, 3, "continue"],
    [0, 0, "decimal", "continue"],
  ],
};
```

### Currency with Automatic Separators

```javascript
var money = {
  type: jsPsychNumpad,
  preamble: "<p>How much would you pay?</p>",
  numpad_layout: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["00", 0, "decimal"],
    ["delete", "continue", "continue"],
  ],
  separate_pattern: "thousands", // or "lakh_crore"
};
```

### European Formatting

```javascript
var european = {
  type: jsPsychNumpad,
  numpad_layout: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["separator", 0, "decimal"],
    ["delete", "continue", "continue"],
  ],
  decimal_character: ",",
  separator_character: ".",
};
```
