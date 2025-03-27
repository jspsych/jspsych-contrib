var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  },
});

var trial = {
  type: jsPsychHtmlVasResponse,
  stimulus:
    "Some people have the experience of finding themselves in a place and have no idea how they got there.<br>Select the number to show what percentage of the time this happens to you.",
  prompt: '<span id="resp-disp"></span><br>',
  ticks: false,
  scale_width: 500,
  scale_colour: "black",
  labels: [
    "0%<br>Never",
    "10%",
    "20%",
    "30%",
    "40%",
    "50%",
    "60%",
    "70%",
    "80%",
    "90%",
    "100%<br>Always",
  ],
  hline_pct: 110,
  resp_fcn: function (ppn) {
    var pct = Math.round(100 * ppn);
    var resp_disp = document.getElementById("resp-disp");
    resp_disp.textContent = pct + "% of the time";
  },
};

jsPsych.run([trial]);
