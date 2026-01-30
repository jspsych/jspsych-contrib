import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import jsPsychPluginVisualSearchClickTarget from ".";

jest.useFakeTimers();

describe("visual-search-click-target plugin", () => {
  it("should load and finish when absent button is clicked", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: jsPsychPluginVisualSearchClickTarget,
        images: ["img1.png", "img2.png", "img3.png"],
        target_present: false,
      },
    ]);

    // Click the absent button
    const absentButton = displayElement.querySelector("button");
    absentButton.click();

    await expectFinished();
  });

  it("should record correct response when target is clicked", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychPluginVisualSearchClickTarget,
        images: ["target.png", "distractor1.png", "distractor2.png"],
        target_present: true,
        target_index: 0,
      },
    ]);

    // Click the target image (first image)
    const targetImg = displayElement.querySelector('img[data-index="0"]') as HTMLImageElement;
    targetImg.click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toBe("target");
    expect(data.correct).toBe(true);
    expect(data.clicked_index).toBe(0);
  });

  it("should record incorrect response when wrong image is clicked", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychPluginVisualSearchClickTarget,
        images: ["target.png", "distractor1.png", "distractor2.png"],
        target_present: true,
        target_index: 0,
      },
    ]);

    // Click a distractor image
    const distractorImg = displayElement.querySelector('img[data-index="1"]') as HTMLImageElement;
    distractorImg.click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toBe("target");
    expect(data.correct).toBe(false);
    expect(data.clicked_index).toBe(1);
  });

  it("should record correct absent response when target is not present", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychPluginVisualSearchClickTarget,
        images: ["distractor1.png", "distractor2.png"],
        target_present: false,
      },
    ]);

    // Click the absent button
    const absentButton = displayElement.querySelector("button");
    absentButton.click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toBe("absent");
    expect(data.correct).toBe(true);
    expect(data.clicked_index).toBeNull();
  });
});
