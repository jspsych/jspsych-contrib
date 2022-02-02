import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { initJsPsych } from "jspsych";

import DeviceMotionExtension from ".";

describe("Basic test", () => {
  test("Loads extension", async () => {
    var jsPsych = initJsPsych({
      extensions: [{ type: DeviceMotionExtension }],
      on_finish: function () {
        jsPsych.data.displayData();
      },
    });

    var welcome = {
      type: htmlButtonResponse,
      stimulus: "Hello",
      choices: ["Start"],
    };

    var trial = {
      type: htmlButtonResponse,
      choices: ["Done"],
      stimulus: '<p style="font-size:48px;">Dance</p>',
      extensions: [{ type: DeviceMotionExtension }],
    };

    jsPsych.run([welcome, trial]);
  });
});
