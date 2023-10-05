---
"@jspsych-contrib/plugin-self-paced-reading": major
---

- Calls to jsPsych.data.write() are removed; jsPsych.finishTrial() now gets an object with words and reading times stored as arrays. Thus a trial now generates a single data object instead of x, where x is the number of words in the sentence.
- A bug when inter_word_interval > 0 is corrected.
- Tests are added related to reading times.
