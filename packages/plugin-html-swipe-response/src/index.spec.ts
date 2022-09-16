import { clickTarget, pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import htmlSwipeResponse from ".";

jest.useFakeTimers();

describe("plugin-html-swipe-response", () => {
  test("displays html stimulus", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div>'
    );
  });

  test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        swipe_animation_duration: 0,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div>'
    );

    pressKey("f");

    await expectFinished();
  });

  test("prompt should append html below stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        prompt: '<div id="foo">this is a prompt</div>',
        swipe_animation_duration: 0,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div><div id="foo">this is a prompt</div>'
    );

    pressKey("f");

    await expectFinished();
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        stimulus_duration: 500,
        swipe_animation_duration: 0,
      },
    ]);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-swipe-response-stimulus").style
        .visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-swipe-response-stimulus").style
        .visibility
    ).toBe("hidden");

    pressKey("f");

    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toBe('<div id="jspsych-html-swipe-response-stimulus">this is html</div>');
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        swipe_animation_duration: 0,
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div>'
    );

    pressKey("f");
    await expectFinished();
  });

  test("class should say responded when key is pressed", async () => {
    const { getHTML, expectRunning } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        response_ends_trial: false,
        swipe_animation_duration: 0,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div>'
    );

    pressKey("f");

    expect(document.querySelector("#jspsych-html-swipe-response-stimulus").className).toBe(
      " responded"
    );

    await expectRunning();
  });

  test("should wait for swipe animation if requested", async () => {
    const { expectFinished, expectRunning } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
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

describe("html-swipe-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: htmlSwipeResponse,
        stimulus: "foo",
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
        type: htmlSwipeResponse,
        stimulus: "foo",
        swipe_animation_duration: 0,
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual"
    );

    await expectRunning();

    expect(getHTML()).toContain("foo");
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
