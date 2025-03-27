var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  },
});

var trial = {
  type: jsPsychSurveyVas,
  preamble: 'Answer the following questions',
  questions: [
    {prompt: 'Q1', labels: ['a', 'b']},
    {prompt: 'Q2', labels: ['a', 'b', 'c']},
    {prompt: 'Q3', labels: ['a', 'b']},
    {prompt: 'Important!', labels: ['a', 'b'], required: true},
    {prompt: 'Also Important!', labels: ['a', 'b'], required: true}
  ],
  ticks: true,
  hline_pct: 90,
  scale_width: 300,
  // scale_height: 20,
  marker_type: 'cross',
  randomize_question_order: true,
  n_scale_points: 5
}
  

jsPsych.run([trial]);
