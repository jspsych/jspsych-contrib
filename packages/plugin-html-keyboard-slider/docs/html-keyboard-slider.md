# html-keyboard-slider

HTML slider which allows for keyboard responses, with a few extra parameters.

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.
| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| min                 | INT              | 0                  | Slider minimum value. Can be an integer or a float. |
| max                 | INT              | 10                 | Slider maximum value. Can be an integer or a float. |
| step                | INT              | 1                  | Minimum increase in value for the slider. |
| step_any            | BOOL             | false              | For a more coninuous slider, set HTML Range input's step attribute to 'any', see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#examples. Step values above still apply to 'increase_keys' and 'decrease_keys'. |
| slider_start        | INT              | null               | Starting value of the slider. Defaults to minimum value. |
| slider_width        | INT              | null               | Width of the slider in pixels. Defaults to 100% of the container. |
| minimum_keys        | KEYS             | ["`", "§"]         | Keys that set the slider to its minimum value. Note '..._keys' parameters can take either single string or array, can include numbers, and either empty [] or '' turns relevant functionality off. Also are case sensitive (e.g. ['a', 'A']). |
| maximum_keys        | KEYS             | ["="]              | Keys that set the slider to its maximum value. |
| decrease_keys       | KEYS             | ["ArrowLeft", "ArrowDown"] | Keys that decrease the slider by one step. |
| increase_keys       | KEYS             | ["ArrowRight", "ArrowUp"] | Keys that increase the slider by one step. |
| number_keys         | BOOL             | true               | Whether or not to listen to number keys. |
| keys_step           | FLOAT            | null               | Amount the increase and decrease keys change the slider value. Defaults to step size. |
| input_multiplier    | INT              | 1                  | Multiplies the input value after key buffer is accounted for (e.g. 1=10, 2=20 on 0-100% scale)|
| key_buffer_on       | BOOL             | false              | Tracks key presses over a specified time to allow multiple button presses. Handles '-' and '.' if not set to _keys params above. |
| key_buffer_timeout  | INT              | 300                | Length of time consecutive key presses are held in memory (ms). |
| prompt              | HTML_STRING      | ""                 | Prompt displayed above the slider. |
| ticks               | BOOL             | true               | Whether to display ticks under each value of the slider. These are also slightly 'sticky'. |
| ticks_interval      | FLOAT            | null               | Interval at which to display ticks. Defaults to step size. |
| labels              | HTML_STRING      | null               | Labels displayed equidistantly below the stimulus. Accepts HTML. |
| label_dividers      | BOOL             | true               | Whether to display dividing lines between labels. |
| display_value       | BOOL             | true               | Whether to display the current value of the slider below it. |
| unit_text           | STRING           | ""                 | Text displayed next to display value (e.g., %, cm). |
| prepend_unit        | BOOL             | false              | Whether to prepend the unit text (e.g., £5). Default is to append (e.g., 5%). |
| stimulus            | HTML_STRING      | null               | Stimulus to be displayed. Any HTML is valid. |
| stimulus_duration   | INT              | null               | Duration of stimulus (ms). |
| trial_duration      | INT              | null               | Duration of trial (ms). Response recorded as null if no response is made. |
| response_ends_trial | BOOL             | false              | Whether a response ends the trial. |
| require_movement    | BOOL             | false              | Whether the slider must be interacted with to continue. |
| button_label        | STRING           | "Continue"         | Label of the button displayed. |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name           | Type     | Description                            |
| -------------- | -------- | -------------------------------------- |
| response       | INT      | Final value of the slider. Defaults to slider starting value if not interacted with, or null if trial_duration ends first. |
| rt             | FLOAT    | Reaction time in milliseconds.         |
| stimulus       | HTML_STRING | Stimulus presented.                   |
| slider_start   | INT      | Starting value of the slider.          |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-html-keyboard-slider"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-html-keyboard-slider.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-html-keyboard-slider
```

```js
import HtmlKeyboardSlider from '@jspsych-contrib/plugin-html-keyboard-slider';
```

## Examples

### Simple discreet/categorical slider

Labelled discreet slider displaying defaults

```javascript
var discreet = {
    type: jsPsychHtmlKeyboardSlider,
    min: 1,
    max: 5,
    prompt: "Rate your confidence in your response:",
    labels: ["Pure guess", "More or less guessing", "Somewhat confident", "Almost sure", "Certain"],
}
```

### Percentage slider

Percentage slider where pressing 1 goes to 10, unless you press 1 again within 300 ms, in which case goes to 11

```javascript
var percentage = {
    type: jsPsychHtmlKeyboardSlider,
    min: 0,
    max: 100,
    step: 1,
    input_multiplier: 10,
    slider_start: 50,
    ticks: false,
    key_buffer_on: true,
    display_value: true,
    unit_text: '%',
    prompt: "Rate your confidence in your response: ",
    //labels: ["Complete Guess", "Complete Certainty"],
}

```

### Cost comparison

This is more of a list of parameters to play around with

```javascript
//https://www.freecodecamp.org/news/javascript-range-create-an-array-of-numbers-with-the-from-method/
// function to create array of £ labels
var arrayRange = (start, stop, step) =>
    Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step
);

var cost = {
    type: jsPsychHtmlKeyboardSlider,
    // Slider properties
    min: -5,
    max: 5,
    step: 0.01,
    step_any: false, // Generally don't worry about this one!
    slider_start: 0,
    slider_width: 700,
    // Special input keys
    number_keys: true,
    minimum_keys: '[', // an empty array or string turns _keys functionality off
    maximum_keys: ']',
    decrease_keys: ['ArrowLeft','ArrowDown'],
    increase_keys: ['ArrowRight','ArrowUp','+'],
    keys_step: 1,
    // Inputs extras
    input_multiplier: 1,
    key_buffer_on: true,
    key_buffer_timeout: 700,
    // Text
    stimulus: '<div style="display:flex;gap:10px;"><img src="https://picsum.photos/id/111/400"><img src="https://picsum.photos/id/183/400"></div>',
    ticks: true,
    ticks_interval: 0.5,
    prompt: "How much more/less expensive is the car on the left?",
    //labels: arrayRange(-5, 5, 1).map(i => '£' + i), //add £ sign to front of array -5 to 5
    labels: ['£-5.00','','','','','£0.00','','','','','£5.00'], // Spacing can be handled this way too
    label_dividers: false,
    display_value: true,
    unit_text: 'Difference in Value: £',
    prepend_unit: true,
    button_label: 'Submit',
    // Meta-trial parameters
    stimulus_duration: 3000, // After 3 seconds
    trial_duration: 20000, // After 20 seconds
    require_movement: true,
    response_ends_trial: false,
}
```

### Visual scale labels

2 happiness scale examples showing how to use other label types with HTML

```javascript
var emojis = {
    type: jsPsychHtmlKeyboardSlider,
    min: -2,
    max: 2,
    slider_start: 0,
    display_value: false,
    ticks: false,
    key_buffer_on: true,
    display_value: true,
    key_buffer_timeout: 300,
    stimulus: '<img src="https://picsum.photos/id/237/400">',
    prompt: "How do you feel about this dog?",
    labels: ["&#128557;","&#128555;","&#128528;", "&#128515;","&#128513;"],
}

var images = {
    type: jsPsychHtmlKeyboardSlider,
    min: -1,
    max: 1,
    slider_start: 0,
    slider_width: 500,
    display_value: false,
    prompt: "How happy are you?",
    labels: [
        "<img src='https://www.shutterstock.com/shutterstock/photos/1721368459/display_1500/stock-vector-smile-icon-vector-face-emoticon-sign-1721368459.jpg', style='max-width: 100%'>",
        "<img src='https://static.vecteezy.com/system/resources/previews/022/362/067/original/flat-face-emoticon-icon-vector.jpg', style='max-width: 100%'>",
        "<img src='https://www.shutterstock.com/shutterstock/photos/2471250453/display_1500/stock-vector-sad-face-icon-sad-emoji-emojis-sad-collection-and-black-icon-isolated-on-white-background-2471250453.jpg', style='max-width: 100%'>"
    ],
}
```