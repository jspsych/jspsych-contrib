# spr

The self-paced-reading plugin displays a text with three distinct modes of word masking 
to allow for varied modes of self paced reading trials.

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| sentence | string           | `undefined`             | This is the string of text that will be displayed to the participant during the trial. The text will be split up into segments based on either the space bar or the `delimiter` character if it is present. | 
| delimiter | string           | `"^"`             | If this character is present in the `sentence` parameter, the text will be split up based on the `delimiter` character. If the `delimiter` character is not present, the text will be split up based on the space character. | 
| mode | numeric           | 1                  | Indicates the mode of text displaying used by the SPR plugin. Mode 1 is a masked presentation where a valid key press hides the previous shown words, mode 2 reveals one chunk at time but the chunks but previous ones remain visible, and mode 3 is when one word is displayed with no mask. |
| segments_per_key_press | numeric           | 1            | Indicates how many segments will be revealed upon a key press. | 
| choices | array of keys | `[" "]` | This array contains the key(s) that the participant is allowed to press in order to advance to the next chunk. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. |

### Styling

To add css and style the text elements, there are three different css classifiers. 
  1. 'jspsych-spr-before-text' that has not already been displayed.
  2. 'jspsych-spr-current-text' refers to the text being displayed.
  3. 'jspsych-spr-after-text' that has already been displayed and shown. 

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | []      | This value represents the structured_reading_string used to run the experiment. |
| mode      | number  | This value represents the mode that the self-paced reading experiment was ran using and thus how the text was displayed. |

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

### Using a structured_reading_string 

```javascript
const trial = {
  type: jsPsychSpr,
  structured_reading_string: [["first and second", "second and fourth", "third"], ["fifth", "sixth", "seventh"], ["eighth", "ninth", "tenth"]],
  mode: 2
};
```

### Using an unstructured_reading_string with chunk_size and line_size

```javascript 
const trial = {
  type: jsPsychSpr,
  unstructured_reading_string: "this is the reading string and it is super super long, i wonder what will be coming next.",
  chunk_size: 2,
  line_size: 2,
  mode: 1
};
```

