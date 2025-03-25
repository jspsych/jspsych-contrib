import { clickTarget, startTimeline } from "@jspsych/test-utils";

import jsPsychImageClickResponse from ".";

jest.useFakeTimers();

describe("imag-click-response", () => {
  it("should load", async () => {
    const { expectFinished, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychImageClickResponse,
        stimulus: "image.jpg",
        dot_radius: 6,
        dot_color: "blue",
        minimum_dots_required: 1,
      },
    ]);
  });

  it("correctly configures layout parameters", async () => {
    const stimulus_value = "../examples/jspsych-logo.jpg";
    const button_label_value = "random label";

    const { expectRunning, getHTML } = await startTimeline([
      {
        type: jsPsychImageClickResponse,
        stimulus: stimulus_value,
        button_label: button_label_value,
      },
    ]);

    await expectRunning();

    const html = getHTML().replace(/"/g, "'");

    expect(html).toContain(`href='${stimulus_value}'`);
    expect(html).toContain(button_label_value);
  });

  it("correctly sets the continue button state when the minimum_dots_required parameter is > 0", async () => {
    const minimum_dots_required = 1;

    const { expectRunning, getHTML, getData, displayElement, jsPsych } = await startTimeline([
      {
        type: jsPsychImageClickResponse,
        stimulus: "image.jpg",
        minimum_dots_required: 1,
      },
    ]);

    const response_button = displayElement.querySelector(
      "#image-click-response-button"
    ) as HTMLButtonElement;
    const svg_container = document.getElementById("image-click-response-svg") as HTMLElement;

    await expectRunning();

    expect(response_button.disabled).toBe(true);
    await clickTarget(svg_container);

    expect(response_button.disabled).toBe(false);
  });

  it("should end the trial when the button is clicked", async () => {
    const { expectRunning, getHTML, expectFinished, getData, displayElement, jsPsych } =
      await startTimeline([
        {
          type: jsPsychImageClickResponse,
          stimulus: "image.jpg",
        },
      ]);

    const response_button = displayElement.querySelector(
      "#image-click-response-button"
    ) as HTMLButtonElement;
    await clickTarget(response_button);

    await expectFinished();
  });

  it("should contain an object with x, y and rt properties when a single click has been performed", async () => {
    const { expectRunning, getHTML, expectFinished, getData, displayElement, jsPsych } =
      await startTimeline([
        {
          type: jsPsychImageClickResponse,
          stimulus: "image.jpg",
        },
      ]);

    const response_button = displayElement.querySelector(
      "#image-click-response-button"
    ) as HTMLButtonElement;
    const svg_container = document.getElementById("image-click-response-svg") as HTMLElement;

    await clickTarget(svg_container);
    await clickTarget(response_button);

    await expectFinished();

    const data = getData().values()[0];
    console.log(data);
    expect(data).toHaveProperty("points");
    expect(data.points.length).toBe(1);
    expect(data.points[0]).toHaveProperty("x");
    expect(data.points[0]).toHaveProperty("y");
    expect(data.points[0]).toHaveProperty("rt");
  });
});
