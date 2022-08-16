import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

import htmlMultiResponse from ".";

jest.useFakeTimers();

describe("plugin-html-multi-response", () => {
  test("displays html stimulus", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div><div id="jspsych-html-multi-response-btngroup"></div>'
    );
  });

  test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
      },
    ]);
    expect(getHTML()).toContain(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div>'
    );

    pressKey("f");
    await expectFinished();
  });

  test("display button labels", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlMultiResponse,
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
        type: htmlMultiResponse,
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
        type: htmlMultiResponse,
        stimulus: "this is html",
        button_choices: ["button-choice"],
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-multi-response-button-0"));

    await expectFinished();
  });

  test("prompt should append below button", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
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
        type: htmlMultiResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        stimulus_duration: 500,
      },
    ]);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-multi-response-stimulus").style
        .visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-multi-response-stimulus").style
        .visibility
    ).toBe("hidden");

    pressKey("f");
    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toBe(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div><div id="jspsych-html-multi-response-btngroup"></div>'
    );
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div>'
    );

    pressKey("f");
    await expectFinished();
  });

  test("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
        button_choices: ["button-choice"],
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-multi-response-button-0"));
    await expectFinished();
  });

  test("class should say responded when key is pressed", async () => {
    const { getHTML, expectRunning } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
        keyboard_choices: ["f", "j"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div>'
    );

    pressKey("f");

    expect(document.querySelector("#jspsych-html-multi-response-stimulus").className).toBe(
      " responded"
    );

    await expectRunning();
  });

  test("class should have responded when button is clicked", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlMultiResponse,
        stimulus: "this is html",
        button_choices: ["button-choice"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-multi-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-multi-response-button-0"));
    expect(document.querySelector("#jspsych-html-multi-response-stimulus").className).toBe(
      " responded"
    );
  });
});
