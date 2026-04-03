import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychPluginColumbiaCardTask from ".";

jest.useFakeTimers();

describe("columbia card task plugin", () => {
  test("should load with basic parameters", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychPluginColumbiaCardTask,
        num_cards: 32,
        num_loss_cards: 3,
        gain_value: 10,
        loss_value: -250,
      },
    ]);

    await clickTarget(document.querySelector(".jspsych-btn"));
    await expectFinished();

    const data = getData().values()[0];
    expect(data.card_values).toHaveLength(32);
    expect(data.total_clicks).toBe(0);
    expect(data.cards_clicked).toEqual([]);
  });

  test("card clicks are recorded correctly", async () => {
    const { displayElement, getData } = await startTimeline([
      {
        type: jsPsychPluginColumbiaCardTask,
        num_cards: 16,
        num_loss_cards: 2,
        gain_value: 5,
        loss_value: -100,
      },
    ]);

    // Click first card
    await clickTarget(displayElement.querySelector('[data-card-index="0"]'));

    // Click second card
    await clickTarget(displayElement.querySelector('[data-card-index="1"]'));

    // Click continue button
    await clickTarget(displayElement.querySelector(".jspsych-btn"));

    const data = getData().values()[0];
    expect(data.total_clicks).toBe(2);
    expect(data.cards_clicked).toEqual([0, 1]);
    expect(data.click_order).toEqual([0, 1]);
    expect(data.response_times).toHaveLength(2);
    expect(data.points_per_click).toHaveLength(2);
  });

  test("plugin handles different card configurations", async () => {
    const { getData } = await startTimeline([
      {
        type: jsPsychPluginColumbiaCardTask,
        num_cards: 8,
        num_loss_cards: 1,
        gain_value: 15,
        loss_value: -50,
        starting_score: 100,
      },
    ]);

    await clickTarget(document.querySelector(".jspsych-btn"));

    const data = getData().values()[0];
    expect(data.card_values).toHaveLength(8);
    expect(data.total_points).toBe(100); // Starting score when no cards clicked
  });
});
