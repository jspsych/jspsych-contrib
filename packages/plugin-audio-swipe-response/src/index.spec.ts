import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import audioSwipeResponse from ".";

jest.useFakeTimers();

describe("audio-swipe-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: audioSwipeResponse,
        stimulus: "foo.mp3",
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

  // Skip this test until we mock Audio elements
  // Same decision is made in the core jsPsych repo
  test.skip("visual mode works", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const timeline = [
      {
        type: audioSwipeResponse,
        stimulus: "foo.mp3",
        prompt: "foo",
        swipe_animation_duration: 0,
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
