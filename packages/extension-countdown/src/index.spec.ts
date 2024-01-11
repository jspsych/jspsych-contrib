import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { initJsPsych } from "jspsych";

import CountdownExtension from ".";

describe("Countdown Extension", () => {
  it("should pass", () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: CountdownExtension }],
    });

    let trial = {
      type: htmlButtonResponse,
      stimulus: "Hello world",
      choices: ["Foo", "Bar"],
      extensions: [{ type: CountdownExtension, params: { time: 5000 } }],
    };

    jsPsych.run([trial]);
  });
});
