import { startTimeline } from "@jspsych/test-utils";

import jsPsychSurveySlider from ".";

jest.useFakeTimers();

describe("my plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychSurveySlider,
        questions: [{ prompt: "How old are you?" }],
      },
    ]);

    expect(getHTML()).toMatch("How old are you?");

    displayElement.querySelector("input").value = "25";

    (displayElement.querySelector("#jspsych-survey-slider-next") as HTMLInputElement).click();

    await expectFinished();
  });
});
