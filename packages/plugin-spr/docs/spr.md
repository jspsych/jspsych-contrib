# spr

This is a package built to enable self paced reading with three distinct modes:

Mode 1: Masked presentation of the text on the screen (with spaces shown in the mask, eg. ___ ____ __ ____). Pressing space bar then revelas one word (or chunk) at a time and masks the previous word (or chunk) so that only one word (or chunk) is visible at a time.

Mode 2: One word (or chunk) is revealed with spacebar but earlier words (or chunks) remain visible.

Mode 3: Only one word (or chunk) is displayed centered on the screen, no mask.

For modes 1 and 2, if you are passing in a structured reading string you must use a list of list of strings, denoting what classifies as a word or chunk. For modes 3, you can either pass in a list of strings or a list of list of strings. Either way, the outcome will be the same and each list will be displayed at the same time.

To add css and style the text elements, there are three different css classifiers. 
  1. 'text-current-region' refers to the text being displayed.
  2. 'text-before-current-region' that has not been displayed.
  3. 'text-after-current-region' that has already been displayed and shown. 

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| structured_reading_string | List           | []             | This is the explicit declaration for what to display on the string. Depending on the mode this will be treated differently. For mode 1 and 2 this must be passed in as a list of a list of strings. For mode 3, this can either be passed in as a list of a list of strings, or a list of strings. For mode 1 and 2, each individiual list represents the block of text that displays at one time. For mode 3, each list of strings or string is treated as an invidual word to be displayed. | 
| Mode                | Number           | 1                  | Indicates the mode of text displaying used by the SPR plugin. Mode 1 is a masked presentation where clicking spacebar hides the previous shown words, mode 2 reveals one chunk at time but the chunks but previous ones remain visible. Mode 3 is when one word is displayed with no mask. |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | []      | This value represents the structured_reading_string used to run the experiment. |
| mode      | number  | This value represents the mode that the self-paced reading experiment was ran using and thus how the text was displayed.

## Chunks vs Lines



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