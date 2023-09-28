# jspsych-self-paced-reading plugin

jsPsych plugin for self-paced reading experiments.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter              | Type     | Default Value    | Description                                             |
| ---------------------- | -------- | -----------------| ------------------------------------------------------- |
| sentence               | string   | undefined        | The sentence to be presented                            |
| font_family            | string   | "monospace"      | Font to use (NB. requires monospaced font type)         |
| font_size              | string   | "24px"           | Font size                                               |
| font_weight            | string   | "normal"         | Font weight                                             |
| font_colour            | string   | "black"          | Font colour                                             |
| mask_type              | number   | 1                | The type of mask (1 vs. 2 vs. 3)                        |
| mask_character         | string   | "_"              | The character used as the mask                          |
| mask_on_word           | bool     | false            | Display the mask together with the word                 |
| mask_gap_character     | string   | " "              | Character to display between the masked words           |
| mask_offset            | number   | 0                | Mask offset in y direction                              |
| mask_weight            | string   | "normal"         | Mask weight                                             |
| mask_colour            | string   | "black"          | Mask colour                                             |
| line_height            | number   | 80               | Line height for multiline text                          |
| canvas_colour          | string   | "white"          | Canvas colour                                           |
| canvas_size            | number[] | [1280 960]       | Canvas size                                             |
| canvas_border          | string   | "0px solid black | Canvas border                                           |
| canvas_clear_border    | bool     | true             | Clear screen following final word in sentence           |
| translate_origin       | bool     | false            | Translate coordinates to [0,0] at centre                |
| choices                | string[] | " "              | Key to press                                            |
| xy_position            | number[] | [0, 0]           | X and Y position                                        |
| x_align                | string   | "center"         | X alignment                                             |
| y_align                | string   | "top"            | Y alignment                                             |
| inter_word_interval    | number   | 0                | Interval (in ms) between succesive words                |
| save_sentence          | bool     | true             | Keep sentence in results file                           |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name          | Type     | Value                                                      |
| ------------- | -------- | ---------------------------------------------------------- |
| spr_words     | string[] | Array of words in the sentence                             |
| spr_rts       | number[] | Array of reading times for each word (ms)                  |
| spr_rts_total | number[] | Array of reading times for sentence through each word (ms) |
| spr_sentence  | string   | Item sentence (can be omitted with `save_sentence: false`) |

## Example 

```javascript
const sentence = [ `The quick brown fox jumps over the lazy dog.`];
const moving_window = {
        type: jsPsychSelfPacedReading,
        sentence: sentence,
      };
```
