import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychNumpad from ".";

jest.useFakeTimers();

describe("plugin-numpad", () => {
  it("records response and rt after pressing 1 then continue", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychNumpad,
      },
    ]);

    clickTarget(document.querySelector(".jspsych-numpad-button-digit[data-digit='1']"));
    jest.advanceTimersByTime(1000);
    clickTarget(document.querySelector(".jspsych-numpad-button-continue"));

    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toBe(1);
    expect(data.rt).toBeGreaterThan(0);
  });
});
