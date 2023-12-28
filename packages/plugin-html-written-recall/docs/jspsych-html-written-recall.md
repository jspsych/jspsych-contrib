# jspsych plugin for html-written-recall

This plugin displays a text box for participants to write a response to a prompt. The response is saved as a string. The trial advances when a certain keyboard input is pressed (default is `Spacebar`). The idea is that a general survey-text box allows for editing as well as observing prior responses whereas this input mimics verbal free recall. After a given period of time, a button appears that allows the participant to advance beyond the recall period.

Another use case for this plugin is to allow participants to see a set of images and write single word names in response to them or free-associate words. For instance, on a set of trials participants can see a set of images and write the first word that comes to mind.

This code was developed to be used in a loop_function (insert jsPsych `loop_function()` website) such that the participant sets the amount of recalls or until a timer allows them to move onto the next trial.

## Parameters
In addition to the standard jsPsych parameters, html-written-recall takes the following parameters:

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

