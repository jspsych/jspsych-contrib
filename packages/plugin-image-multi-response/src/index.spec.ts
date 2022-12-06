import { clickTarget, pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import imageMultiResponse from ".";

jest.useFakeTimers();

describe("plugin-image-multi-response", () => {
  test("displays image stimulus", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );

    expect(getHTML()).toContain('<div id="jspsych-image-multi-response-btngroup"></div>');
  });

  test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );

    pressKey("f");
    await expectFinished();
  });

  test("display button labels", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        button_choices: ["button-choice1", "button-choice2"],
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice1</button>');
    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice2</button>');
  });

  test("display button html", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        button_choices: ["buttonChoice"],
        button_html: '<button class="jspsych-custom-button">%choice%</button>',
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-custom-button">buttonChoice</button>');
  });

  test("display should clear after button click", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        button_choices: ["button-choice"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );

    clickTarget(document.querySelector("#jspsych-image-multi-response-button-0"));

    await expectFinished();
  });

  test("prompt should append below button", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        button_choices: ["button-choice"],
        prompt: "<p>this is a prompt</p>",
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-btn">button-choice</button></div></div><p>this is a prompt</p>'
    );
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        stimulus_duration: 500,
      },
    ]);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-image-multi-response-stimulus").style
        .visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-image-multi-response-stimulus").style
        .visibility
    ).toBe("hidden");

    pressKey("f");
    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        trial_duration: 500,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        response_ends_trial: true,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );

    pressKey("f");
    await expectFinished();
  });

  test("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        button_choices: ["button-choice"],
        response_ends_trial: true,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );

    clickTarget(document.querySelector("#jspsych-image-multi-response-button-0"));
    await expectFinished();
  });

  test("should show console warning when trial duration is null and response ends trial is false", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        response_ends_trial: false,
        trial_duration: null,
        render_on_canvas: false,
      },
    ]);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("class should say responded when key is pressed", async () => {
    const { getHTML, expectRunning } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        response_ends_trial: false,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );

    pressKey("f");

    expect(document.querySelector("#jspsych-image-multi-response-stimulus").className).toBe(
      " responded"
    );

    await expectRunning();
  });

  test("class should have responded when button is clicked", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        button_choices: ["button-choice"],
        response_ends_trial: false,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img draggable="false" src="../media/blue.png" id="jspsych-image-multi-response-stimulus"'
    );

    clickTarget(document.querySelector("#jspsych-image-multi-response-button-0"));
    expect(document.querySelector("#jspsych-image-multi-response-stimulus").className).toBe(
      " responded"
    );
  });
});

describe("image-multi-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: "ALL_KEYS",
        button_choices: ["a", "b", "c"],
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    const buttonResponse = getData().values()[0].button_response;
    const keyboardResponse = getData().values()[0].keyboard_response;
    const responseSource = getData().values()[0].response_source;

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    if (responseSource == "keyboard") {
      expect(typeof keyboardResponse).toBe("string");
    } else if (responseSource == "button") {
      expect(buttonResponse).toBeGreaterThanOrEqual(0);
      expect(buttonResponse).toBeLessThanOrEqual(2);
    }
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: imageMultiResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: "ALL_KEYS",
        button_choices: ["a", "b", "c"],
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual"
    );

    await expectRunning();

    expect(getHTML()).toContain('<canvas id="jspsych-image-multi-response-stimulus"');
    jest.runAllTimers();

    await expectFinished();

    const buttonResponse = getData().values()[0].button_response;
    const keyboardResponse = getData().values()[0].keyboard_response;
    const responseSource = getData().values()[0].response_source;

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    if (responseSource == "keyboard") {
      expect(typeof keyboardResponse).toBe("string");
    } else if (responseSource == "button") {
      expect(buttonResponse).toBeGreaterThanOrEqual(0);
      expect(buttonResponse).toBeLessThanOrEqual(2);
    }
  });
});
