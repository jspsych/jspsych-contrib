import { startTimeline } from "@jspsych/test-utils";

import jsPsychVaastFixation from ".";

jest.useFakeTimers();

describe("VAAST-fixation plugin Test Suite", () => {
  it("should load", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychVaastFixation,
        fixation: "+",
        font_size: 46,
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
      },
    ]);

    jest.runAllTimers();

    await expectFinished();
  });

  it("should display html stimulus", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychVaastFixation,
        fixation: "+",
        font_size: 46,
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
      },
    ]);

    jest.runAllTimers();

    expect(getHTML()).toContain('id="jspsych-vaast-stim">+</div>');

    await expectFinished();
  });

  it("should display the right background", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: jsPsychVaastFixation,
        fixation: "+",
        font_size: 46,
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
      },
    ]);

    jest.runAllTimers();

    expect(getHTML()).toContain("background: url(../examples/background/eco_env/4.jpg)");

    await expectFinished();
  });

  it("should clear html once duration is reached", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: jsPsychVaastFixation,
        fixation: "+",
        font_size: 46,
        position: 1,
        background_images: [
          "../examples/background/eco_env/2.jpg",
          "../examples/background/eco_env/4.jpg",
          "../examples/background/eco_env/6.jpg",
        ],
      },
    ]);

    jest.advanceTimersByTime(2000);

    await expectFinished();
  });
});
