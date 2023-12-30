# jspsych plugin for html-written-recall

This plugin displays a text box for participants to write a response to a prompt. The response is saved as a string. The trial advances when a certain keyboard input is pressed (default is `Spacebar`). The idea is that a general survey-text box allows for editing as well as observing prior responses whereas this input mimics verbal free recall. After a given period of time, a button appears that allows the participant to advance beyond the recall period.

Another use case for this plugin is to allow participants to see a set of images and write single word names in response to them or free-associate words. For instance, on a set of trials participants can see a set of images and write the first word that comes to mind.

This code was developed to be used in a `loop_function()` such that the participant sets the amount of recalls or until a timer allows them to move onto the next trial (See example 1).

## Parameters
In addition to the [parameters available in all plugins](https://www.jspsych.org/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `stimulus` | string | `''` | A stimulus for the participant to respond to. |
| `prompt` | string | `''` | The prompt to be displayed above the text box. |
| `stimulus_duration` | numeric | `null` | How long to show the stimulus. If null, then the stimulus will remain on the screen until the trial ends. |
| `trial_duration` | numeric | `null` | How long to show the trial. If null, then the trial will remain on the screen until the participant advances. |
| `next_word_key` | string | `'Spacebar'` | The key to advance to the next word. |
| `button_string` | string | `null` | The string to display on the button that advances the trial. If null, then no button is displayed. |
| `button_delay` | numeric | `0` | How long to wait before displaying the button. If 0, the button is displayed immediately |
| `block_time_start` | numeric | `null` | The time at which the block started. If null then this value is not used for the button appearance calculation|
| `total_block_duration` | numeric | `null` | The total duration of the block. If null then this value is not used for the button appearance calculation|

## Data Generated
In addition to the [default data collected by all plugins](https://www.jspsych.org/overview/plugins#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.
| Name | Type | Value |
| --- | --- | --- |
| `rt` | numeric | The response time in milliseconds for the participant to advance to the next word. |
| `stimulus` | string | The prompt given to the participant. |
| `response` | string | The response given by the participant. |
| `button_pressed` | string | A binary indicator of whether or not the button to move onto next portion of experiment is pressed |

## Example

### Single word association
```javascript
var free_association_trial = {
  type: 'html-written-recall',
  stimulus: 'Dog',
  prompt: 'Write the first word that comes to mind.',
  stimulus_duration: 500, // the word disappears after 500 ms
  button_string: 'Next task', // Button displayed to finish the block
  button_delay: 5000 // button appears after 5 seconds, though this timer resets after each word submitted (so 5 seconds from final submission they can move on)
}

var free_association_block = {
  timeline: [free_association_trial],
  loop_function() {
    // Loop until 10 trials are completed
    if (jsPsych.data.get().last(1).values()[0].button_pressed) {
      return false;
    } else {
      return true;
    }
  }
}
```
See `examples/example1.html` for a demo.

### Free recall with button appearing after 10 seconds
```javascript
var total_block_duration = 10000 // 10 seconds
var free_recall_trial = {
  type: 'html-written-recall',
  prompt: 'Write down as many words as you can remember from the previous list.',
  stimulus_duration: 500, // the word disappears after 500 ms
  button_string: 'Next task', // Button displayed to finish the block
  block_time_start: begin_block_time,
  total_block_duration: total_block_duration // button appears based on global clock
}
var free_recall_block = {
  timeline: [free_recall_trial],
  on_start: function() {
    begin_block_time = performance.now();
  }, // set the initial block time so that participants have 30 seconds before the button appears
  loop_function() {
    // Loop until 30 seconds have passed
    if (jsPsych.data.get().last(1).values()[0].button_pressed) {
      return false;
    } else {
      return true;
    }
  }
}
```
See `examples/example2.html` for a demo.
