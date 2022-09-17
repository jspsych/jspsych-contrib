import { clickTarget, pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import imageSwipeResponse from ".";

jest.useFakeTimers();

describe("plugin-image-swipe-response", () => {
  test("displays image stimulus", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        swipe_animation_duration: 0,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-swipe-response-stimulus"'
    );

    pressKey("ArrowLeft");
    await expectFinished();
  });

  test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        swipe_animation_duration: 0,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-swipe-response-stimulus"'
    );

    pressKey("f");
    await expectFinished();
  });

  test("prompt should append html below stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        prompt: '<div id="foo">this is a prompt</div>',
        swipe_animation_duration: 0,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain('<div id="foo">this is a prompt</div>');

    pressKey("f");
    await expectFinished();
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        stimulus_duration: 500,
        swipe_animation_duration: 0,
        render_on_canvas: false,
      },
    ]);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-image-swipe-response-stimulus").style
        .visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-image-swipe-response-stimulus").style
        .visibility
    ).toBe("hidden");

    pressKey("f");

    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        trial_duration: 500,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-swipe-response-stimulus"'
    );
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        swipe_animation_duration: 0,
        response_ends_trial: true,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-swipe-response-stimulus"'
    );

    pressKey("f");
    await expectFinished();
  });

  test("should show console warning when trial duration is null and response ends trial is false", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await startTimeline([
      {
        type: imageSwipeResponse,
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
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        response_ends_trial: false,
        swipe_animation_duration: 0,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-swipe-response-stimulus"'
    );

    pressKey("f");

    expect(document.querySelector("#jspsych-image-swipe-response-stimulus").className).toBe(
      " responded"
    );

    await expectRunning();
  });

  test("should wait for swipe animation if requested", async () => {
    const { expectFinished, expectRunning } = await startTimeline([
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        keyboard_choices: ["f", "j"],
        swipe_animation_duration: 500,
      },
    ]);

    pressKey("f");

    await expectRunning();

    jest.advanceTimersByTime(500);

    await expectFinished();
  });
});

describe("image-swipe-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        swipe_animation_duration: 0,
      },
    ];
    const { expectFinished, getData } = await simulateTimeline(timeline);
    await expectFinished();
    const swipeResponse = getData().values()[0].swipe_response;
    const keyboardResponse = getData().values()[0].keyboard_response;
    const responseSource = getData().values()[0].response_source;
    expect(getData().values()[0].rt).toBeGreaterThan(0);
    if (responseSource == "keyboard") {
      expect(typeof keyboardResponse).toBe("string");
    } else if (responseSource == "swipe") {
      expect(typeof swipeResponse).toBe("string");
    }
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: imageSwipeResponse,
        stimulus: "../media/blue.png",
        swipe_animation_duration: 0,
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual"
    );

    await expectRunning();

    expect(getHTML()).toContain('<canvas id="jspsych-image-swipe-response-stimulus"');
    jest.runAllTimers();

    await expectFinished();

    const swipeResponse = getData().values()[0].swipe_response;
    const keyboardResponse = getData().values()[0].keyboard_response;
    const responseSource = getData().values()[0].response_source;
    expect(getData().values()[0].rt).toBeGreaterThan(0);
    if (responseSource == "keyboard") {
      expect(typeof keyboardResponse).toBe("string");
    } else if (responseSource == "swipe") {
      expect(typeof swipeResponse).toBe("string");
    }
  });
});
