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

  test("display button labels", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        button_choices: ["button-choice1", "button-choice2"],
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice1</button>');
    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice2</button>');
  });

  test("display button html", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        button_choices: ["buttonChoice"],
        button_html: '<button class="jspsych-custom-button">%choice%</button>',
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-custom-button">buttonChoice</button>');
  });

  test("display should clear after button click", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        button_choices: ["button-choice"],
        swipe_animation_duration: 0,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-swipe-response-button-0"));

    await expectFinished();
  });

  test("prompt should append html below button", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        button_choices: ["button-choice-0", "button-choice-1"],
        keyboard_choices: ["f", "j"],
        prompt: '<div id="foo">this is a prompt</div>',
        swipe_animation_duration: 0,
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-btn">button-choice-1</button></div></div><div id="foo">this is a prompt</div>'
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

    expect(getHTML()).toBe(
      '<div id="jspsych-html-swipe-response-stimulus-container"><div id="jspsych-html-swipe-response-stimulus">this is html</div></div><div id="jspsych-html-swipe-response-btngroup"></div>'
    );
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

  test("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        button_choices: ["button-choice-0", "button-choice-1"],
        keyboard_choices: ["f", "j"],
        swipe_animation_duration: 0,
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-swipe-response-button-0"));
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

    document
      .querySelectorAll("#jspsych-html-swipe-response-button-0 > button")
      .forEach((element) => {
        expect(element.className).toBe(" responded");
      });

    await expectRunning();
  });

  test("class should have responded when button is clicked", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        button_choices: ["button-choice-0", "button-choice-1"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-swipe-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-swipe-response-button-0"));
    expect(document.querySelector("#jspsych-html-swipe-response-stimulus").className).toBe(
      " responded"
    );
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

  test("should disable buttons on keyboard response", async () => {
    await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        swipe_animation_duration: 500,
      },
    ]);

    pressKey("f");

    document.querySelectorAll(".jspsych-html-swipe-response-button button").forEach((element) => {
      expect(element.getAttribute("disabled")).toBe("disabled");
    });
  });

  test("should disable buttons on click response", async () => {
    await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        button_choices: ["button-choice-0", "button-choice-1"],
        response_ends_trial: false,
      },
    ]);

    clickTarget(document.querySelector("#jspsych-html-swipe-response-button-0"));

    document.querySelectorAll(".jspsych-html-swipe-response-button button").forEach((element) => {
      expect(element.getAttribute("disabled")).toBe("disabled");
    });
  });

  test("should move container and stimulus together during drag", async () => {
    const { displayElement } = await startTimeline([
      {
        type: htmlSwipeResponse,
        stimulus: "this is html",
        swipe_animation_duration: 0,
      },
    ]);

    const container = displayElement.querySelector<HTMLElement>(
      "#jspsych-html-swipe-response-stimulus-container"
    );

    // Simulate a drag operation
    container.style.transform = "translate3D(100px, 50px, 0)";

    expect(container.style.transform).toBe("translate3D(100px, 50px, 0)");

    const stimulus = displayElement.querySelector<HTMLElement>(
      "#jspsych-html-swipe-response-stimulus"
    );

    // Check that the stimulus has moved with the container
    expect(stimulus.style.transform).toBe("translate3D(100px, 50px, 0) rotate(0deg)");
  });
});

describe("html-swipe-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: htmlSwipeResponse,
        stimulus: "foo",
        swipe_animation_duration: 0,
        button_choices: ["a", "b"],
      },
    ];
    const { expectFinished, getData } = await simulateTimeline(timeline);
    await expectFinished();
    const swipeResponse = getData().values()[0].swipe_response;
    const buttonResponse = getData().values()[0].button_response;
    const keyboardResponse = getData().values()[0].keyboard_response;
    const responseSource = getData().values()[0].response_source;
    expect(getData().values()[0].rt).toBeGreaterThan(0);
    if (responseSource == "keyboard") {
      expect(typeof keyboardResponse).toBe("string");
    } else if (responseSource == "swipe") {
      expect(typeof swipeResponse).toBe("string");
    } else if (responseSource == "button") {
      expect(buttonResponse).toBeGreaterThanOrEqual(0);
      expect(buttonResponse).toBeLessThanOrEqual(1);
    }
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: htmlSwipeResponse,
        stimulus: "foo",
        swipe_animation_duration: 0,
        button_choices: ["a", "b"],
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
    const buttonResponse = getData().values()[0].button_response;
    const keyboardResponse = getData().values()[0].keyboard_response;
    const responseSource = getData().values()[0].response_source;
    expect(getData().values()[0].rt).toBeGreaterThan(0);
    if (responseSource == "keyboard") {
      expect(typeof keyboardResponse).toBe("string");
    } else if (responseSource == "swipe") {
      expect(typeof swipeResponse).toBe("string");
    } else if (responseSource == "button") {
      expect(buttonResponse).toBeGreaterThanOrEqual(0);
      expect(buttonResponse).toBeLessThanOrEqual(1);
    }
  });
});
