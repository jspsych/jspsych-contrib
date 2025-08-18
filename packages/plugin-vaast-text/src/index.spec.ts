import { pressKey, startTimeline } from "@jspsych/test-utils";

import jsPsychVaastText from ".";

jest.useFakeTimers();

describe("VAAST-text plugin Test Suite", () => {
  it("should load", async () => {
    const {} = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
      },
    ]);
  });

  it("should display the right background", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
      },
    ]);

    expect(getHTML()).toContain("background: url(../examples/background/eco_env/4.jpg)");

    pressKey("t");
    await expectFinished();
  });

  it("should only end trial when valid key pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
        response_ends_trial: true,
      },
    ]);

    pressKey(" ");
    expect(getHTML()).toContain('id="jspsych-vaast-stim">joy</div>');

    pressKey("b");
    await expectFinished();
  });

  it("should end trial after correct key press if response-ends-trial is true", async () => {
    const { expectFinished, displayElement, getData } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
        response_ends_trial: true,
      },
    ]);

    pressKey("t");

    expect(displayElement.querySelector("#jspsych-vaast-stim").className).toBe(" responded");

    expect(getData().values()[0].correct).toBe(true);

    await expectFinished();
  });

  it("should display html_when_wrong string if display-feedback is true and incorrect key pressed", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
        display_feedback: true,
        force_correct_key_press: false,
        response_ends_trial: true,
        key_to_move_forward: "ALL_KEYS",
      },
    ]);

    const wrongImageContainer = displayElement.querySelector<HTMLElement>("#wrongImgContainer");

    expect(wrongImageContainer.style.visibility).toBe("hidden");

    pressKey("b");

    expect(wrongImageContainer.style.visibility).toBe("visible");

    pressKey("t");
    await expectFinished();
  });

  it("should not end trial when response_ends_trial is false and stimulus should get responded class", async () => {
    const { getHTML, expectRunning, displayElement } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
        display_feedback: false,
        force_correct_key_press: false,
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain('id="jspsych-vaast-stim">joy</div>');

    pressKey("t");

    expect(displayElement.querySelector("#jspsych-vaast-stim").className).toBe(" responded");

    await expectRunning();
  });

  it("should end trial if valid but incorrect key pressed and force_correct_key_press is false", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
        force_correct_key_press: false,
        response_ends_trial: true,
      },
    ]);

    pressKey("b");

    expect(getData().values()[0].correct).toBe(false);

    await expectFinished();
  });

  it("should end trial only if correct key pressed when force_correct_key_press is true", async () => {
    const { expectFinished, expectRunning } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
        force_correct_key_press: true,
        response_ends_trial: true,
        display_feedback: true,
      },
    ]);

    pressKey("b");
    await expectRunning();

    pressKey("t");
    await expectFinished();
  });

  it("should end trial once duration is reached", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychVaastText,
        stimulus: "joy",
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
        font_sizes: [15, 20, 25],
        approach_key: "t",
        avoidance_key: "b",
        stim_movement: "approach",
        response_ends_trial: false,
        trial_duration: 650,
      },
    ]);

    jest.advanceTimersByTime(1000);

    await expectFinished();
  });
});
