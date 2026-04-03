# @jspsych-contrib/plugin-self-paced-reading

## 2.0.0

### Major Changes

- [#79](https://github.com/jspsych/jspsych-contrib/pull/79) [`599a090`](https://github.com/jspsych/jspsych-contrib/commit/599a09023c0f481c75b2af931c5646a58a1136cd) Thanks [@jessestorbeck](https://github.com/jessestorbeck)! - - Calls to jsPsych.data.write() are removed; jsPsych.finishTrial() now gets an object with words and reading times stored as arrays. Thus a trial now generates a single data object instead of x, where x is the number of words in the sentence.
  - A bug when inter_word_interval > 0 is corrected.
  - Tests are added related to reading times.

## 1.0.0

### Major Changes

- [#8](https://github.com/jspsych/jspsych-contrib/pull/8) [`0bbe715`](https://github.com/jspsych/jspsych-contrib/commit/0bbe7151c120a4b29a707f607bcd4b1e0ccd79cf) Thanks [@igmmgi](https://github.com/igmmgi)! - Initial release
