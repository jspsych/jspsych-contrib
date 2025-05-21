# spr

The self-paced-reading plugin displays a text with three distinct modes of word masking 
to allow for varied modes of self paced reading trials.

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| sentence | string           | `undefined`             | This is the string of text that will be displayed to the participant during the trial. The text will be split up into segments based on either the space bar or the `delimiter` character if it is present. Line breaks can be displayed, but must be attached to the start or end of a word, not as its own word. | 
| delimiter | string           | `"^"`             | If this character is present in the `sentence` parameter, the text will be split up based on the `delimiter` character. If the `delimiter` character is not present, the text will be split up based on the space character. | 
| mode | numeric           | 1                  | Indicates the mode of text displaying used by the SPR plugin. Mode 1 is a masked presentation where a valid key press hides the previous shown words, mode 2 reveals one chunk at time but the chunks but previous ones remain visible, and mode 3 is when one word is displayed with no mask. |
| segments_per_key_press | numeric           | 1            | Indicates how many segments will be revealed upon a key press. | 
| gap_character | string | `" "` | Character that will be used to separate each word of text. This is only used in mode 1 and 2. |
| intra_segment_character | bool | `true` | If `true`, the gap character will replace the space between segments. Otherwise, the gap character within a segment will be a space. |
| choices | array of keys | `[" "]` | This array contains the key(s) that the participant is allowed to press in order to advance to the next chunk. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see [this page](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values) and [this page (event.key column)](https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/) for more examples. Any key presses that are not listed in the array will be ignored. The value of `"ALL_KEYS"` means that all keys will be accepted as valid responses. |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | array of string | The individual segments that are displayed per key press. |
| mode      | number  | The mode that the trial was run with. |
| results   | array of object | The results of the trial, sorted into objects with keys: <br> `results.rt`: The response time in milliseconds from when the stimulus was displayed to when a valid key was pressed. <br> `results.segment`: The segment that was displayed to the participant. <br> `results.key_pressed`: The key that was pressed by the participant. |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-spr@3"></script>
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

### Self-paced-reading trial with simple word-by-word masking

```javascript
const trial = {
  type: jsPsychSpr,
  sentence: "The quick brown fox jumps over the lazy dog.",
  mode: 1,
};
```

### Custom unmasking of words via delimiter

```javascript 
const trial = {
  type: jsPsychSpr,
  sentence: "Portez^ce vieux whisky^au juge blond^qui fume.",
  mode: 1
};
```

### Display two words at a time with no other mask present

```javascript
const trial = {
  type: jsPsychSpr,
  sentence: "Victor jagt zwölf Boxkämpfer quer über den großen Sylter Deich.",
  mode: 3,
  segments_per_key_press: 2
}

