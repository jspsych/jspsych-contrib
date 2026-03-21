# free-recall-response

A plugin for collecting free recall responses one word at a time with a mobile-friendly UI. Participants type words into an input field and add them one at a time. Each word is displayed in a list as it is added, and timing is recorded for each response.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| prompt              | HTML_STRING      | "Type the words you remember, one at a time." | Prompt/instruction text shown above the input. |
| add_button_label    | STRING           | "Add"              | Label for the button that adds the current word to the list. |
| done_button_label   | STRING           | "Done"             | Label for the button that ends the trial. |
| placeholder         | STRING           | "Type a word..."   | Placeholder text shown in the input field. |
| minimum_words       | INT              | 0                  | Minimum number of words before the done button is enabled. 0 means the done button is always enabled. |
| trial_duration      | INT              | null               | Maximum time allowed for recall in milliseconds. If null, there is no time limit. |
| words_list_label    | STRING           | "Words recalled:"  | Label shown above the list of recalled words. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| responses | array   | Array of objects, each with `word` (string, the recalled word in uppercase) and `rt` (number, time in ms from trial start when the word was added). |
| rt        | number  | Total time in milliseconds from trial start to when the done button was clicked or the trial timed out. |

## Install

Using the CDN-hosted JavaScript file:

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-free-recall-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```html
<script src="jspsych/plugin-free-recall-response.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-free-recall-response
```

```js
import jsPsychFreeRecallResponse from "@jspsych-contrib/plugin-free-recall-response";
```

## Examples

### Basic free recall

```javascript
const trial = {
  type: jsPsychFreeRecallResponse,
  prompt: "<p>Type the words you remember from the list.</p>",
};
```

### Require a minimum number of responses

```javascript
const trial = {
  type: jsPsychFreeRecallResponse,
  prompt: "<p>Try to recall at least 5 words from the list.</p>",
  minimum_words: 5,
};
```

### With a time limit

```javascript
const trial = {
  type: jsPsychFreeRecallResponse,
  prompt: "<p>You have 60 seconds to recall as many words as you can.</p>",
  trial_duration: 60000,
};
```
