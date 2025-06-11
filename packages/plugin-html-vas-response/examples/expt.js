var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  },
});

var timeline = [];

timeline.push({
  type: jsPsychHtmlVasResponse,
  stimulus: "Basic example",
  scale_width: 200,
  labels: ["Left", "Middle", "Right"],
  prompt: "[Prompt]",
});

timeline.push({
  type: jsPsychHtmlVasResponse,
  stimulus: "Wider and larger clickable area (also, ticks hidden)",
  scale_width: 500,
  scale_height: 120,
  ticks: false,
  labels: ["Left", "Middle-left", "Middle", "Middle-right", "Right"],
  prompt: "[Prompt]",
});

timeline.push({
  type: jsPsychHtmlVasResponse,
  stimulus:
    "Different marker shape.<br>Also, clickable area extends beyond horizontal line (making extremes easier to select)",
  scale_width: 300,
  scale_height: 100,
  hline_pct: 80,
  marker_type: "circle",
  labels: ["Left", "Right"],
});

timeline.push({
  type: jsPsychHtmlVasResponse,
  stimulus: "Responsive prompt",
  scale_width: 300,
  scale_height: 100,
  hline_pct: 90,
  ticks: false,
  marker_type: "cross",
  prompt: '<span id="resp-disp">Click the line and I will change!</span><br>',
  resp_fcn: function (ppn) {
    var pct = Math.round(100 * ppn);
    var resp_disp = document.getElementById("resp-disp");
    resp_disp.textContent = pct + "%";
  },
});

timeline.push({
  type: jsPsychHtmlVasResponse,
  stimulus: "Extra marker customization",
  scale_width: 300,
  scale_height: 100,
  hline_pct: 90,
  ticks: false,
  marker_type: "square",
  marker_size: 30,
  marker_svg_attrs: 'stroke="blue" stroke-width="2" stroke-opacity="1" rx="8"',
});

jsPsych.run(timeline);
