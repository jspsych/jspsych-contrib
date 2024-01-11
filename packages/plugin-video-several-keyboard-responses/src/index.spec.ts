import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import videoSeveralKeyboardResponses from ".";

jest.useFakeTimers();

beforeAll(() => {
  window.HTMLMediaElement.prototype.pause = () => {};
});

// I can't figure out how to get this tested with jest
describe("video-several-keyboard-responses", () => {
  test("throws error when stimulus is not array #1537", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: videoSeveralKeyboardResponses,
        stimulus: "foo.mp4",
      },
    ];

    await expect(async () => {
      await jsPsych.run(timeline);
    }).rejects.toThrowError();
  });
});

describe("video-several-keyboard-responses simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: videoSeveralKeyboardResponses,
        stimulus: ["foo.mp4"],
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  // can't run this until we mock video elements.
  test("visual mode works", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: videoSeveralKeyboardResponses,
        stimulus: ["foo.mp4"],
        prompt: "foo",
        trial_duration: 1000,
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

    const rt = getData().values()[0].rt;
    const response = getData().values()[0].response;
    const video_time = getData().values()[0].video_time;
    expect(rt.every((value) => value > 0)).toBe(true);
    expect(response.every((value) => typeof value === "string")).toBe(true);
    expect(video_time.every((value) => typeof value === "number")).toBe(true);
  });
});
