import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

import jsPsychHtmlKeyboardSlider from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load and finish", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychHtmlKeyboardSlider,
        min: 1,
        max: 5,
        prompt: "Rate your confidence in your response:",
        labels: [
          "Pure guess",
          "More or less guessing",
          "Somewhat confident",
          "Almost sure",
          "Certain",
        ],
        // Options Jest needs to end trial:
        //trial_duration: 5000
        //require_movement: false,  // Allow the trial to end without interaction
        //response_ends_trial: true,  // End the trial after a response
      },
    ]);

    // Simulate key press
    //pressKey('3');

    // Click continue button
    clickTarget(displayElement.querySelector("#keyboardSliderButton"));

    // Advance timers for setTimeout
    //jest.runAllTimers();

    await expectFinished();

    // check the trial output
    // const data = getData().values()[0];
    // expect(data).toBeDefined();
  });
});
