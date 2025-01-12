import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import TextToSpeechKeyboardResponse from ".";

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

describe("text-to-speech-keyboard-response", () => {
  it("should call speech synthesis when trial is executed", async () => {
    const {} = await startTimeline([
      {
        stimulus: "this is a string",
        choices: ["button_choice"],
        type: TextToSpeechKeyboardResponse,
      },
    ]);
    expect((global as any).speechSynthesis.speak).toHaveBeenCalled();
  });
  test("displays string stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "this is a string",
      },
    ]);

    expect(getHTML()).toBe(
      '<div id="jspsych-text-to-speech-keyboard-response-stimulus">this is a string</div>'
    );
    await pressKey("a");
    await expectFinished();
  });

  /* issues with the test, i think it's related to the clickTarget function
  tried implementing awaiting a new Promise with  setTimeout
  after setting jest.useRealTimers() and then setting jest.useFakeTimers()*/
  /* test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "this is a string",
        choices: ["f", "j"],
      },
    ]);
    expect(getHTML()).toContain(
      '<div id="jspsych-text-to-speech-keyboard-response-stimulus">this is a string</div>'
    );

    await pressKey("f");
    expect(getHTML()).toBe("");
    await expectFinished();
  }); */

  test("prompt should append html below stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "this is a string",
        choices: ["f", "j"],
        prompt: '<div id="foo">this is a prompt</div>',
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-text-to-speech-keyboard-response-stimulus">this is a string</div><div id="foo">this is a prompt</div>'
    );

    await pressKey("f");
    await expectFinished();
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "this is a string",
        choices: ["f", "j"],
        stimulus_duration: 500,
      },
    ]);

    expect(
      displayElement.querySelector<HTMLElement>(
        "#jspsych-text-to-speech-keyboard-response-stimulus"
      ).style.visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      displayElement.querySelector<HTMLElement>(
        "#jspsych-text-to-speech-keyboard-response-stimulus"
      ).style.visibility
    ).toBe("hidden");

    await pressKey("f");
    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "this is a string",
        choices: ["f", "j"],
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toBe(
      '<div id="jspsych-text-to-speech-keyboard-response-stimulus">this is a string</div>'
    );
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "this is a string",
        choices: ["f", "j"],
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-text-to-speech-keyboard-response-stimulus">this is a string</div>'
    );

    await pressKey("f");
    await expectFinished();
  });

  test("class should say responded when key is pressed", async () => {
    const { getHTML, expectRunning } = await startTimeline([
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "this is a string",
        choices: ["f", "j"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-text-to-speech-keyboard-response-stimulus">this is a string</div>'
    );

    await pressKey("f");

    expect(
      document.querySelector("#jspsych-text-to-speech-keyboard-response-stimulus").className
    ).toBe(" responded");

    await expectRunning();
  });
});

describe("text-to-speech-keyboard-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "foo",
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: TextToSpeechKeyboardResponse,
        stimulus: "foo",
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

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });
});
