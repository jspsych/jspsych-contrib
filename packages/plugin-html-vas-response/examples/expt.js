
var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData('csv');
    }
});

var trial = {
  type: jsPsychHtmlVasResponse,
  stimulus: 'Some people have the experience of finding themselves in a place and have no idea how they got there.<br>Select the number to show what percentage of the time this happens to you.',
  ticks: false,
  scale_width: 500,
  scale_colour: 'black',
  labels: ['0%<br>Never', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%<br>Always']
};

jsPsych.run([trial]);