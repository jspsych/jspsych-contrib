import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychSurveyGrid from ".";

jest.useFakeTimers();

// an admittedly weak initial test
describe("survey-grid plugin", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychSurveyGrid,
        questions: [
          { prompt: "question 1", reverse: false },
          { prompt: "question 2", reverse: true },
        ],
        randomize_question_order: false,
        labels: ["label 1", "label 2", "label 3", "label 4", "label 5"],
      },
    ]);

    await jest.runAllTimers();

    // click middle buttons of both questions
    await clickTarget(displayElement.querySelector(`input[type="radio"][name="q1"][pos="3"]`));
    await clickTarget(displayElement.querySelector(`input[type="radio"][name="q2"][pos="3"]`));

    // finish the survey
    await clickTarget(displayElement.querySelector("#jspsych-survey-grid-next"));

    await expectFinished();
  });
});
