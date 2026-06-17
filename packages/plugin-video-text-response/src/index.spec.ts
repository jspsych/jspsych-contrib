import { clickTarget, dispatchEvent, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import jsPsychVideoTextResponse from ".";

jest.useFakeTimers();

// jsdom does not implement real media playback: calling play()/pause() on a <video> element
// logs a "not implemented" warning and does nothing (no state change, no event). Since this
// plugin's core behavior is driven entirely by the video's native play/pause events, we
// override both methods here to actually flip `paused` and dispatch the corresponding event,
// synchronously, the way a real browser would. Matching the real spec, each is a no-op if the
// element is already in the target state (e.g. calling pause() on an already-paused video does
// not re-fire "pause") so tests that redundantly call pause()/play() don't produce extra events.
beforeAll(() => {
  window.HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    if (this.paused === false) {
      return Promise.resolve();
    }
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  };
  window.HTMLMediaElement.prototype.pause = function (this: HTMLMediaElement) {
    if (this.paused === true) {
      return;
    }
    Object.defineProperty(this, "paused", { value: true, configurable: true });
    this.dispatchEvent(new Event("pause"));
  };
});

/** Simulates autoplay actually kicking in (jsdom never starts real playback on its own, even
 * with the autoplay attribute set), so the video is in the same "currently playing" state it
 * would be in a real browser before a test starts pausing/resuming it. */
function simulateAutoplay(videoElement: HTMLVideoElement) {
  videoElement.play();
}

/** Simulates the video reaching its natural end: sets `ended` to true (matching what a real
 * browser does before firing "pause"), then pause() and the "ended" event. */
function endVideo(videoElement: HTMLVideoElement) {
  Object.defineProperty(videoElement, "ended", { value: true, configurable: true });
  videoElement.pause();
  videoElement.dispatchEvent(new Event("ended"));
}

function getTextbox(displayElement: HTMLElement) {
  return displayElement.querySelector<HTMLTextAreaElement>("#jspsych-video-text-response-textbox");
}

function getSubmitButton(displayElement: HTMLElement) {
  return displayElement.querySelector<HTMLButtonElement>("#jspsych-video-text-response-submit");
}

function getPauseButton(displayElement: HTMLElement) {
  return displayElement.querySelector<HTMLButtonElement>("#jspsych-video-text-response-pause");
}

function getVideo(displayElement: HTMLElement) {
  return displayElement.querySelector<HTMLVideoElement>("#jspsych-video-text-response-stimulus");
}

function getDoneButton(displayElement: HTMLElement) {
  return displayElement.querySelector<HTMLButtonElement>("#jspsych-video-text-response-done");
}

async function typeInto(textbox: HTMLTextAreaElement, value: string) {
  textbox.value = value;
  await dispatchEvent(new Event("input", { bubbles: true }), textbox);
}

describe("plugin-video-text-response", () => {
  test("loads, renders the video, and does not set native controls by default", async () => {
    const { expectRunning, displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
      },
    ]);

    await expectRunning();

    const video = getVideo(displayElement);
    expect(video).not.toBeNull();
    expect(video.controls).toBe(false);
  });

  test("controls: true enables native HTML5 video controls", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        controls: true,
      },
    ]);

    expect(getVideo(displayElement).controls).toBe(true);
  });

  test("response box starts disabled in gated mode (response_allowed_while_playing: false)", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
      },
    ]);

    expect(getTextbox(displayElement).disabled).toBe(true);
    expect(getSubmitButton(displayElement).disabled).toBe(true);
  });

  test("response box is enabled immediately when response_allowed_while_playing is true", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        response_allowed_while_playing: true,
      },
    ]);

    expect(getTextbox(displayElement).disabled).toBe(false);
    expect(getSubmitButton(displayElement).disabled).toBe(false);
  });

  test("pausing (via the custom button) enables the response box, resuming disables it again", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
      },
    ]);

    const pauseButton = getPauseButton(displayElement);
    const textbox = getTextbox(displayElement);

    simulateAutoplay(getVideo(displayElement));

    await clickTarget(pauseButton);
    expect(textbox.disabled).toBe(false);
    expect(pauseButton.textContent).toBe("Resume");

    await clickTarget(pauseButton);
    expect(textbox.disabled).toBe(true);
    expect(pauseButton.textContent).toBe("Pause");
  });

  test("the spacebar toggles pause/resume", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
      },
    ]);

    const textbox = getTextbox(displayElement);

    simulateAutoplay(getVideo(displayElement));

    await dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }), document.body);
    expect(textbox.disabled).toBe(false);

    await dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }), document.body);
    expect(textbox.disabled).toBe(true);
  });

  test("pause_key: null disables keyboard pausing", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        pause_key: null,
      },
    ]);

    const textbox = getTextbox(displayElement);

    await dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }), document.body);
    expect(textbox.disabled).toBe(true);
  });

  test("pressing the pause key while focused in the textbox does not toggle pause", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        response_allowed_while_playing: true,
      },
    ]);

    const textbox = getTextbox(displayElement);
    const video = getVideo(displayElement);

    await dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }), textbox);

    // video should be untouched: still in its initial autoplay-not-yet-started state
    expect(video.paused).not.toBe(false);
  });

  test("submitting a response while paused records response/rt/response_duration and disables the box", async () => {
    const { displayElement, getData, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        trial_ends_after_video: true,
        response_ends_trial: false,
      },
    ]);

    const pauseButton = getPauseButton(displayElement);
    const textbox = getTextbox(displayElement);
    const submitButton = getSubmitButton(displayElement);

    simulateAutoplay(getVideo(displayElement));

    await clickTarget(pauseButton);
    await typeInto(textbox, "hello world");
    jest.advanceTimersByTime(50);
    await clickTarget(submitButton);

    expect(textbox.disabled).toBe(true);
    expect(textbox.value).toBe("");

    endVideo(getVideo(displayElement));
    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toEqual(["hello world"]);
    expect(data.rt.length).toBe(1);
    expect(data.response_duration.length).toBe(1);
    expect(data.response_duration[0]).toBeGreaterThanOrEqual(0);
    expect(data.response_video_time.length).toBe(1);
    expect(typeof data.response_video_time[0]).toBe("number");
  });

  test("one_response_per_pause: false keeps the box open after submitting, allowing multiple responses in one pause", async () => {
    const { displayElement, getData, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        one_response_per_pause: false,
        trial_ends_after_video: true,
        response_ends_trial: false,
      },
    ]);

    const pauseButton = getPauseButton(displayElement);
    const textbox = getTextbox(displayElement);
    const submitButton = getSubmitButton(displayElement);

    simulateAutoplay(getVideo(displayElement));

    // pause once, submit two responses without ever resuming
    await clickTarget(pauseButton);
    await typeInto(textbox, "first");
    await clickTarget(submitButton);

    // box should still be open after the first submission
    expect(textbox.disabled).toBe(false);
    expect(textbox.value).toBe("");

    await typeInto(textbox, "second");
    await clickTarget(submitButton);

    endVideo(getVideo(displayElement));
    await expectFinished();

    const data = getData().values()[0];
    // two responses recorded from a single pause
    expect(data.response).toEqual(["first", "second"]);
    expect(data.rt.length).toBe(2);
    expect(data.response_duration.length).toBe(2);
    // only one pause event happened
    expect(data.pause_video_time.length).toBe(1);
  });

  test("required blocks submission of an empty/whitespace-only response", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        required: true,
      },
    ]);

    const pauseButton = getPauseButton(displayElement);
    const textbox = getTextbox(displayElement);
    const submitButton = getSubmitButton(displayElement);

    simulateAutoplay(getVideo(displayElement));

    await clickTarget(pauseButton);
    await typeInto(textbox, "   ");
    await clickTarget(submitButton);

    // still enabled/open, since the empty submission should have been rejected
    expect(textbox.disabled).toBe(false);
  });

  test("multiple pause-respond cycles each produce their own data entries", async () => {
    const { displayElement, getData, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        trial_ends_after_video: true,
        response_ends_trial: false,
      },
    ]);

    const pauseButton = getPauseButton(displayElement);
    const textbox = getTextbox(displayElement);
    const submitButton = getSubmitButton(displayElement);

    simulateAutoplay(getVideo(displayElement));

    await clickTarget(pauseButton); // pause #1
    await typeInto(textbox, "first");
    await clickTarget(submitButton);
    await clickTarget(pauseButton); // resume

    await clickTarget(pauseButton); // pause #2
    await typeInto(textbox, "second");
    await clickTarget(submitButton);

    // end the trial while still paused from pause #2, rather than resuming first: reaching the
    // natural end of a *playing* video fires its own "pause" event (per the HTML spec, "ended"
    // is always preceded by "pause"), which would otherwise add a third, unintended entry here.
    endVideo(getVideo(displayElement));
    await expectFinished();

    const data = getData().values()[0];
    expect(data.response).toEqual(["first", "second"]);
    expect(data.rt.length).toBe(2);
    expect(data.response_duration.length).toBe(2);
    expect(data.pause_video_time.length).toBe(2);
    expect(data.pause_duration.length).toBe(2);
  });

  test.each([
    ["allow_numbers", false, "ab12cd", "abcd"],
    ["allow_letters", false, "ab12cd", "12"],
    ["allow_symbols", false, "a1!@#b", "a1b"],
  ])(
    "%s: false strips the corresponding character class",
    async (param, value, input, expected) => {
      const { displayElement } = await startTimeline([
        {
          type: jsPsychVideoTextResponse,
          stimulus: ["video.mp4"],
          response_allowed_while_playing: true,
          [param]: value,
        },
      ]);

      const textbox = getTextbox(displayElement);
      await typeInto(textbox, input);
      expect(textbox.value).toBe(expected);
    }
  );

  test("show_response_history displays prior responses, default is hidden", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        response_allowed_while_playing: true,
        show_response_history: true,
        response_ends_trial: false,
      },
    ]);

    const textbox = getTextbox(displayElement);
    const submitButton = getSubmitButton(displayElement);

    await typeInto(textbox, "a response");
    await clickTarget(submitButton);

    expect(displayElement.innerHTML).toContain("a response");
  });

  test("response_history_limit caps displayed history and removes oldest entries first", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        response_allowed_while_playing: true,
        show_response_history: true,
        response_history_limit: 2,
        response_ends_trial: false,
      },
    ]);

    const textbox = getTextbox(displayElement);
    const submitButton = getSubmitButton(displayElement);

    await typeInto(textbox, "first");
    await clickTarget(submitButton);

    await typeInto(textbox, "second");
    await clickTarget(submitButton);

    await typeInto(textbox, "third");
    await clickTarget(submitButton);

    const historyList = displayElement.querySelector("#jspsych-video-text-response-history");

    // only the 2 most recent should be visible
    expect(historyList.children.length).toBe(2);
    expect(historyList.innerHTML).not.toContain("first");
    expect(historyList.innerHTML).toContain("second");
    expect(historyList.innerHTML).toContain("third");
  });

  test("the natural end of the video does not create a pause entry", async () => {
    const { displayElement, getData, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        trial_ends_after_video: true,
      },
    ]);

    simulateAutoplay(getVideo(displayElement));
    endVideo(getVideo(displayElement));
    await expectFinished();

    const data = getData().values()[0];
    expect(data.pause_video_time).toEqual([]);
    expect(data.pause_duration).toEqual([]);
  });

  test("trial_ends_after_video ends the trial when the video ends", async () => {
    const { displayElement, expectRunning, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        trial_ends_after_video: true,
      },
    ]);

    await expectRunning();
    endVideo(getVideo(displayElement));
    await expectFinished();
  });

  test("trial_duration ends the trial and total_trial_time is recorded", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        trial_duration: 1000,
      },
    ]);

    jest.advanceTimersByTime(1000);
    await expectFinished();

    const data = getData().values()[0];
    expect(data.total_trial_time).toBeGreaterThanOrEqual(1000);
  });

  test("reaching `stop` ends the trial when trial_ends_after_video is true, even though pause() alone would not fire 'ended'", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        stop: 2,
        trial_ends_after_video: true,
      },
    ]);

    const video = getVideo(displayElement);
    Object.defineProperty(video, "currentTime", { value: 2, configurable: true });
    await dispatchEvent(new Event("timeupdate"), video);

    await expectFinished();
  });

  test("response_ends_trial: true ends the trial immediately on submission", async () => {
    const { displayElement, getData, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        response_allowed_while_playing: true,
        response_ends_trial: true,
      },
    ]);

    const textbox = getTextbox(displayElement);
    const submitButton = getSubmitButton(displayElement);

    await typeInto(textbox, "done");
    await clickTarget(submitButton);

    await expectFinished();
    const data = getData().values()[0];
    expect(data.response).toEqual(["done"]);
  });

  test("show_done_button renders a button that ends the trial when clicked", async () => {
    const { displayElement, expectRunning, expectFinished } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        show_done_button: true,
      },
    ]);

    await expectRunning();
    const doneButton = getDoneButton(displayElement);
    expect(doneButton).not.toBeNull();

    await clickTarget(doneButton);
    await expectFinished();
  });

  test("done_button_label sets the button text", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
        show_done_button: true,
        done_button_label: "Finish",
      },
    ]);
    expect(getDoneButton(displayElement).textContent).toBe("Finish");
  });

  test("no done button is rendered by default", async () => {
    const { displayElement } = await startTimeline([
      {
        type: jsPsychVideoTextResponse,
        stimulus: ["video.mp4"],
      },
    ]);
    expect(getDoneButton(displayElement)).toBeNull();
  });

  test("required stimulus parameter throws if missing", async () => {
    const jsPsych = initJsPsych();

    await expect(async () => {
      await jsPsych.run([{ type: jsPsychVideoTextResponse }]);
    }).rejects.toThrow();
  });
});
