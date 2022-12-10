import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import audioMultiResponse from ".";

jest.useFakeTimers();

// skip this until we figure out how to mock the audio loading
// The same decision is made in the core jsPsych repo
describe.skip("audio-multi-response", () => {
  test("on_load event triggered after page setup complete", async () => {
    const timeline = [
      {
        type: audioMultiResponse,
        stimulus: "mymp3.mp3",
        prompt: "foo",
        choices: ["choice1"],
        on_load: () => {
          expect(getHTML()).toContain("foo");

          clickTarget(displayElement.querySelector("button"));
        },
      },
    ];

    const jsPsych = initJsPsych({
      use_webaudio: false,
    });

    const { getHTML, finished, displayElement } = await startTimeline(timeline, jsPsych);

    expect(getHTML()).not.toContain("foo");

    await finished;
  });
});

describe("audio-multi-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: audioMultiResponse,
        stimulus: "foo.mp3",
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

  // Skip this test until we mock Audio elements
  // The same decision is made in the core jsPsych repo
  test.skip("visual mode works", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const timeline = [
      {
        type: audioMultiResponse,
        stimulus: "foo.mp3",
        prompt: "foo",
        keyboard_choices: "ALL_KEYS",
        button_choices: ["a", "b", "c"],
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual",
      {},
      jsPsych
    );

    await expectRunning();

    expect(getHTML()).toContain("foo");
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
