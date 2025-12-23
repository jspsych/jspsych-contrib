import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychPluginStopSignal from ".";

jest.useFakeTimers();

describe("stop-signal", () => {
  it("should load with only required properties given", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginStopSignal,
        stimuli: ["image.png"],
        choices: ["A", "B"],
      },
    ]);
  });

  it("should place everything on the screen correctly", async () => {
    const image = "../examples/img/left.png";

    function button_design(choice, index) {
      var html = `<button class="jspsych-btn"> ${"Option " + choice} </button>`;
      return html;
    }

    const { expectRunning, getHTML } = await startTimeline([
      {
        type: jsPsychPluginStopSignal,
        stimuli: [image],
        stimulus_height: 500,
        stimulus_width: 400,
        choices: ["A", "B"],
        button_html: button_design,
        grid_rows: 2,
        prompt: "Click a button",
      },
    ]);

    await expectRunning();
    const html = getHTML().replace(/"/g, "'");

    //expect(html).toContain(`href='${image}'`);
    expect(html).toContain("height='500'");
    expect(html).toContain("width='400'");
    expect(html).toContain("Option A");
    expect(html).toContain("Option B");
    expect(html).toContain("columns: repeat(1");
    expect(html).toContain("rows: repeat(2");
    expect(html).toContain("canvas");
    expect(html).toContain("Click a button");
  });

  it("should end after the trial duration", async () => {
    const image = "../examples/img/left.png";

    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginStopSignal,
        stimuli: [image],
        choices: ["A", "B"],
        trial_duration: 400,
      },
    ]);

    jest.advanceTimersByTime(400);
    await expectFinished();
  });

  it("should collect user response", async () => {
    const image = "../examples/img/left.png";

    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginStopSignal,
        stimuli: [image],
        choices: ["Left", "Right"],
        trial_duration: 500,
      },
    ]);

    jest.advanceTimersByTime(250);
    await clickTarget(displayElement.querySelector('[data-choice="0"]'));

    jest.advanceTimersByTime(250);
    await expectFinished();

    const data = getData().values()[0];
    console.log(data);

    expect(data.stimulus).toContain(image);
    expect(data.rt).toEqual(250);
    expect(data.response).toEqual(0);
  });

  it("should go to the next image after the frame_delay", async () => {
    const image1 = "../examples/img/left.png";
    const image2 = "../examples/img/left_stop.png";

    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychPluginStopSignal,
        stimuli: [image1, image2],
        choices: ["Left", "Right"],
        trial_duration: 500,
        frame_delay: 200,
      },
    ]);

    jest.advanceTimersByTime(250);
    await clickTarget(displayElement.querySelector('[data-choice="0"]'));

    jest.advanceTimersByTime(250);
    await expectFinished();

    const data = getData().values()[0];
    expect(data.stimulus).toContain(image2);
  });
});
