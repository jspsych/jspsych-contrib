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

  it("should place images at custom positions when image_positions is provided", async () => {
    const customPositions = [
      { x: 10, y: 20 },
      { x: 50, y: 50 },
      { x: 80, y: 70 },
    ];
    const { displayElement } = await startTimeline([
      {
        type: jsPsychPluginVisualSearchClickTarget,
        images: ["img1.png", "img2.png", "img3.png"],
        target_present: true,
        target_index: 0,
        image_positions: customPositions,
      },
    ]);

    const imgs = displayElement.querySelectorAll("img");
    expect(imgs[0].style.left).toBe("10%");
    expect(imgs[0].style.top).toBe("20%");
    expect(imgs[1].style.left).toBe("50%");
    expect(imgs[1].style.top).toBe("50%");
    expect(imgs[2].style.left).toBe("80%");
    expect(imgs[2].style.top).toBe("70%");

    // Clean up
    (imgs[0] as HTMLImageElement).click();
  });

  it("should include images and image_positions in trial data", async () => {
    const customPositions = [
      { x: 10, y: 20 },
      { x: 50, y: 50 },
    ];
    const imageList = ["target.png", "distractor.png"];
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychPluginVisualSearchClickTarget,
        images: imageList,
        target_present: true,
        target_index: 0,
        image_positions: customPositions,
      },
    ]);

    const targetImg = displayElement.querySelector('img[data-index="0"]') as HTMLImageElement;
    targetImg.click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.images).toEqual(imageList);
    expect(data.image_positions).toEqual(customPositions);
  });

  it("should include randomly generated image_positions in trial data", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: jsPsychPluginVisualSearchClickTarget,
        images: ["img1.png", "img2.png"],
        target_present: false,
      },
    ]);

    const absentButton = displayElement.querySelector("button");
    absentButton.click();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.image_positions).toBeDefined();
    expect(data.image_positions.length).toBe(2);
    expect(data.image_positions[0]).toHaveProperty("x");
    expect(data.image_positions[0]).toHaveProperty("y");
  });
});
