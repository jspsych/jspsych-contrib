import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import TextToSpeechButtonResponse from ".";

// minimal mock for SpeechSynthesisUtterance
(global as any).SpeechSynthesisUtterance = class {
  text: string;
  lang: string;
  constructor(text: string) {
    this.text = text;
    this.lang = "en-US";
  }

  speak() {}
};
// minimal mock function for speechSynthesis
(global as any).speechSynthesis = {
  speak: jest.fn(),
};

jest.useFakeTimers();

describe("text-to-speech-button-response", () => {
  it("should call speech synthesis when trial is executed", async () => {
    const {} = await startTimeline([
      {
        stimulus: "this is a string",
        choices: ["button_choice"],
        type: TextToSpeechButtonResponse,
      },
    ]);
    expect((global as any).speechSynthesis.speak).toHaveBeenCalled();
  });

  it("displays html stimulus and buttons", async () => {
    const { getHTML } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
      },
    ]);

    expect(getHTML()).toMatchInlineSnapshot(
      '"<div id="jspsych-text-to-speech-button-response-stimulus">this is a string</div><div id="jspsych-text-to-speech-btngroup" class="jspsych-btn-group-grid" style="grid-template-columns: repeat(1, 1fr); grid-template-rows: repeat(1, 1fr);"><button class="jspsych-btn" data-choice="0">button_choice</button></div>"'
    );
  });

  it("respects the `button_html` parameter", async () => {
    const buttonHtmlFn = jest.fn();
    buttonHtmlFn.mockReturnValue("<button>something-unique</button>");

    const { getHTML } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
        button_html: buttonHtmlFn,
      },
    ]);

    expect(buttonHtmlFn).toHaveBeenCalledWith("button_choice", 0);
    expect(getHTML()).toContain("something-unique");
  });

  test("prompt should append below button", async () => {
    const { getHTML } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
        prompt: "<p>this is a prompt</p>",
      },
    ]);

    expect(getHTML()).toContain("</button></div><p>this is a prompt</p>");
  });

  /* issues with the test, i think it's related to the clickTarget function
  tried implementing awaiting a new Promise with  setTimeout
  after setting jest.useRealTimers() and then setting jest.useFakeTimers()
  the clickTarget from jspsych-contrib/test-utils is different to the
  clickTarget from jspsych/test-utils the clickTarget from jspsych-contrib/test-utils is different to the
  clickTarget from jspsych/test-utils. */

  /* it("should clear the display after the button has been clicked", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
      },
    ]);

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));

    await expectFinished();

    expect(getHTML()).toEqual("");
  }); */

  it("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
        stimulus_duration: 500,
      },
    ]);

    const stimulusElement = displayElement.querySelector<HTMLElement>(
      "#jspsych-text-to-speech-button-response-stimulus"
    );

    expect(stimulusElement.style.visibility).toBe("");

    jest.advanceTimersByTime(500);
    expect(stimulusElement.style.visibility).toBe("hidden");
  });

  it("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-text-to-speech-button-response-stimulus">this is a string</div>'
    );

    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  it("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-text-to-speech-button-response-stimulus">this is a string</div>'
    );

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));
    await expectFinished();
  });

  test("class should have responded when button is clicked", async () => {
    const { getHTML, displayElement } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-text-to-speech-button-response-stimulus">this is a string</div>'
    );

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));
    expect(
      displayElement.querySelector("#jspsych-text-to-speech-button-response-stimulus").classList
    ).toContain("responded");
  });

  test("buttons should be disabled first and then enabled after enable_button_after is set", async () => {
    const { getHTML } = await startTimeline([
      {
        type: TextToSpeechButtonResponse,
        stimulus: "this is a string",
        choices: ["button_choice"],
        enable_button_after: 500,
      },
    ]);

    const btns = document.querySelectorAll(".jspsych-html-button-response-button button");

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].getAttribute("disabled")).toBe("disabled");
    }

    jest.advanceTimersByTime(500);

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].hasAttribute("disabled")).toBe(false);
    }
  });
});

describe("html-button-response simulation", () => {
  test("data mode works", async () => {
    const ENABLE_BUTTON_AFTER = 2000;

    const timeline = [
      {
        type: TextToSpeechButtonResponse,
        stimulus: "foo",
        choices: ["a", "b", "c"],
        enable_button_after: ENABLE_BUTTON_AFTER,
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    const response = getData().values()[0].response;

    expect(getData().values()[0].rt).toBeGreaterThan(ENABLE_BUTTON_AFTER);
    expect(response).toBeGreaterThanOrEqual(0);
    expect(response).toBeLessThanOrEqual(2);
  });

  test("visual mode works", async () => {
    const ENABLE_BUTTON_AFTER = 2000;

    const timeline = [
      {
        type: TextToSpeechButtonResponse,
        stimulus: "foo",
        choices: ["a", "b", "c"],
        enable_button_after: ENABLE_BUTTON_AFTER,
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

    const response = getData().values()[0].response;

    expect(getData().values()[0].rt).toBeGreaterThan(ENABLE_BUTTON_AFTER);
    expect(response).toBeGreaterThanOrEqual(0);
    expect(response).toBeLessThanOrEqual(2);
  });
});
