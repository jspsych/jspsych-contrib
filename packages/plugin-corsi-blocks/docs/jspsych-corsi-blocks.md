# jspsych-corsi-blocks plugin

This plugin displays a sequence of blocks and then gets the participant's response. The sequence can be displayed in either 'display' mode or 'input' mode. In 'display' mode, the sequence is displayed and the trial ends after the sequence is complete. In 'input' mode, the participant must click on the blocks in the correct order.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| ----------|------|---------------|------------ |
| sequence | array | undefined | An array of block indexes that specify the order of the sequence to be displayed. For example, `[0, 1, 2, 3, 4]` would display the first 5 blocks in the order they appear in the blocks parameter. |
| blocks | array | See description | An array of objects that specify the x and y coordinates of each block. The coordinates represent the center of the block. The coordinates are specified as percentages of the width and height of the display. For example, `{x: 50, y: 50}` would place the block in the center of the display. The default value is an array of nine blocks that approximates the layout of the original Corsi blocks task. |
| block_size | int | 12 | The size of the blocks as a percentage of the overall display size. |
| display_width | string | "400px" | The width of the display, specified as a valid CSS measurement. |
| display_height | string | "400px" | The height of the display, specified as a valid CSS measurement. |
| prompt | string | null | An optional text prompt that can be shown below the display area. |
| mode | string | "display" | The mode of the trial. If 'display', then the sequence is displayed and the trial ends after the sequence is complete. If 'input', then the use must click on the blocks in the correct order.
| sequence_gap_duration | int | 250 | The duration, in milliseconds, between each block in the sequence |
| sequence_block_duration | int | 1000 | The duration, in milliseconds, that each block is displayed in the sequence |
| pre_stim_duration | int | 500 | The duration, in milliseconds, to show the blocks before the sequence begins. |
| response_animation_duration | int | 500 | The duration, in milliseconds, to show the feedback response animation during input mode. |
| block_color | string | "#555" | The color of unselected, unhighlighted blocks. |
| highlight_color | string | "#f00" | The color of the highlighted block. |
| correct_color | string | "#0f0" | The color of correct feedback. |
| incorrect_color | string | "#f00" | The color of incorrect feedback. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| sequence | array   | The sequence of block indexes that was displayed. |
| response | array   | The sequence of block indexes that was selected by the participant. |
| correct | boolean | Whether the participant's response was correct. |
| rt | array | The time, in milliseconds, that the participant took to respond to each block. These times are cumulative, measured from the onset of the display. |
| blocks | array | The coordinates of the blocks that were displayed. |

## Examples

### Displaying a two-item sequence and then getting the participant's response.

```javascript
const show_sequence = {
  type: jsPsychCorsiBlocks,
  sequence: [3,1],
  mode: 'display'
}

const response = {
  type: jsPsychCorsiBlocks,
  sequence: [3,1],
  mode: 'input'
}
```