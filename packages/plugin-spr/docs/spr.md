# spr

### Modes

This is a package built to enable self paced reading with three distinct modes:

Mode 1: Masked presentation of the text on the screen (with spaces shown in the mask, eg. ___ ____ __ ____). Pressing space bar then reveals one word (or chunk) at a time and masks the previous word (or chunk) so that only one word (or chunk) is visible at a time.

Mode 2: One word (or chunk) is revealed with spacebar but earlier words (or chunks) remain visible.

Mode 3: Only one word (or chunk) is displayed centered on the screen, no mask.

### Styling

To add css and style the text elements, there are three different css classifiers. 
  1. 'text-current-region' refers to the text being displayed.
  2. 'text-before-current-region' that has not been displayed.
  3. 'text-after-current-region' that has already been displayed and shown. 

### Input

There are two different methods to input the string that will be displayed. A structured_reading_string is a strict input where you define every screen using chunks and lines. An unstructured_reading_string is where you pass in the full string and use chunk_size and line_size to denote how you want to split this input. If both are passed in, the structured_reading_string will be prioritized. More details on the distinction between chunks and lines and how to pass in or split your input can be found below. 

### Examples

Examples of the difference between the different modes, styling and the uses of a structured vs unstructured reading strings can be found in the examples folder.

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| unstructured_reading_string | String           | ""             | This is a representation of the input string that can be passed in as a full string and will be split using the splitting parameters of "chunk_size" and "line_size". | 
| structured_reading_string | List           | []             | This is the explicit declaration for what to display on the string. This should usually be a list of list of strings (list of lines, each line is a list of chunks). When using mode 3 the input can also be a list of strings with each string representing a chunk. | 
| Mode                | Number           | 1                  | Indicates the mode of text displaying used by the SPR plugin. Mode 1 is a masked presentation where clicking spacebar hides the previous shown words, mode 2 reveals one chunk at time but the chunks but previous ones remain visible. Mode 3 is when one word is displayed with no mask. |
| chunk_size | String           | int            | Indicates the number of split words in the input string to be included within each chunk. | 
| line_size | String           | int             | Indicates the number of chunks to be included within each line. | 


## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | []      | This value represents the structured_reading_string used to run the experiment. |
| mode      | number  | This value represents the mode that the self-paced reading experiment was ran using and thus how the text was displayed. |

## Chunks vs Lines

When using this plugin, chunks and lines represent how text is displayed. Chunks can represent either words or multiple words along with characters ("one", "two?", "three four five"). During mode 1 or 2, chunks represents the words that are hidden or shown with each click of the spacebar. Lines on the other hand represent multiple chunks (["one", "two?", "three four five"]) held together in a list. Lines represent what is displayed during each distinct screen and chunks represent how they are grouped together. 

Imagine the line ["one", "two?", "three four five"]. If we are using mode 1, this will initially be represented on the screen as `"___ ____ _____ ____ ____"`. With one spacebar click, the first chunk is revealed and the screen displays `"one ____ _____ ____ ____"`. With the next click, the second chunk is revealed and the first is hidden: `"___ two? _____ ____ ____;"`. Lastly, when the final chunk is revelead: `"___ ____ three four five"`.

When using structured reading strings you have the ability to explicitly define each chunk and line. However when running experiments with longer strings you can also use "chunk_size" to define how many words (delimited by spaces) are included within each chunk and "line_size" to define how many chunks are included within each line.

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
  structured_reading_string: [["first and second", "second and fourth", "third"], ["fith", "sixth", "seventh"], ["eighth", "ninth", "tenth"]],
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

