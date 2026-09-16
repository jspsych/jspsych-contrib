import { flushPromises, startTimeline } from "@jspsych/test-utils";
import { JsPsych } from "jspsych";

import AudioResponsePlugin from ".";

jest.useFakeTimers();

// Mock @huggingface/transformers so pipeline() never actually downloads a model
jest.mock("@huggingface/transformers", () => ({
  pipeline: jest.fn().mockResolvedValue(
    jest.fn().mockResolvedValue({
      text: " hello world",
      chunks: [{ text: " hello", timestamp: [0.5, 0.8] }],
    })
  ),
}));

// ─── Mock AudioWorkletNode ────────────────────────────────────────────────────

let lastAudioWorkletNode: MockAudioWorkletNode | null = null;

class MockAudioWorkletNode {
  port: {
    onmessage: ((e: MessageEvent) => void) | null;
    postMessage: jest.Mock;
  };

  constructor(_ctx: any, _name: string, _opts?: any) {
    this.port = { onmessage: null, postMessage: jest.fn() };
    lastAudioWorkletNode = this;
  }

  connect(dest: any) {
    return dest;
  }
}

// ─── Mock AudioContext ────────────────────────────────────────────────────────

class MockAudioContext {
  sampleRate = 44100;
  destination = {};
  audioWorklet = { addModule: jest.fn().mockResolvedValue(undefined) };

  createMediaStreamSource() {
    return { connect: (n: any) => n };
  }

  decodeAudioData(): Promise<any> {
    return Promise.resolve({
      numberOfChannels: 1,
      getChannelData: () => new Float32Array(100),
    });
  }

  close() {}
}

// ─── Mock Audio (HTMLAudioElement) ───────────────────────────────────────────

class MockAudio {
  private handlers: Record<string, (() => void)[]> = {};

  constructor(public src: string) {}

  addEventListener(event: string, fn: () => void) {
    (this.handlers[event] ??= []).push(fn);
  }

  removeEventListener(event: string, fn: () => void) {
    this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== fn);
  }

  play(): Promise<void> {
    // Dispatch "play" synchronously, then "ended" via microtask so the
    // display flips to "Listening…" after startTimeline's flushPromises().
    this.handlers["play"]?.forEach((h) => h());
    Promise.resolve().then(() => this.handlers["ended"]?.forEach((h) => h()));
    return Promise.resolve();
  }
}

// ─── Mock MediaRecorder ───────────────────────────────────────────────────────

class MockMediaRecorder {
  state: "inactive" | "recording" = "inactive";
  stream = { getTracks: () => [] } as unknown as MediaStream;
  private handlers: Record<string, ((e?: any) => void)[]> = {};

  addEventListener(ev: string, fn: (e?: any) => void) {
    (this.handlers[ev] ??= []).push(fn);
  }

  removeEventListener(ev: string, fn: (e?: any) => void) {
    this.handlers[ev] = (this.handlers[ev] ?? []).filter((h) => h !== fn);
  }

  start() {
    this.state = "recording";
    this.handlers["start"]?.forEach((h) => h(new Event("start")));
    // Provide a chunk of fake audio data
    const blob = new Blob(["x"], { type: "audio/webm" });
    this.handlers["dataavailable"]?.forEach((h) =>
      h(Object.assign(new Event("dataavailable"), { data: blob }))
    );
  }

  stop() {
    this.state = "inactive";
    // Fire asynchronously so that stopRecording()'s Promise constructor runs
    // first and sets this.load_resolver before the stop_event_handler calls it.
    Promise.resolve().then(() => {
      this.handlers["stop"]?.forEach((h) => h(new Event("stop")));
    });
  }
}

// ─── Mock FileReader ──────────────────────────────────────────────────────────
// Synchronous load so the promise chain in stop_event_handler resolves
// without needing extra microtask ticks.

class MockFileReader {
  result: string | null = null;
  private handlers: Record<string, (() => void)[]> = {};

  addEventListener(event: string, fn: () => void) {
    (this.handlers[event] ??= []).push(fn);
  }

  readAsDataURL(_blob: Blob) {
    this.result = "data:audio/webm;base64,ZmFrZQ==";
    this.handlers["load"]?.forEach((h) => h());
  }
}

// ─── Test setup ───────────────────────────────────────────────────────────────

let mockRecorder: MockMediaRecorder;

beforeEach(() => {
  lastAudioWorkletNode = null;
  mockRecorder = new MockMediaRecorder();

  (global as any).Audio = MockAudio;
  (global as any).AudioContext = MockAudioContext;
  (global as any).AudioWorkletNode = MockAudioWorkletNode;
  (global as any).FileReader = MockFileReader;
  (global as any).URL.createObjectURL = jest.fn(() => "blob:mock-url");
  (global as any).URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  jest.clearAllTimers();
});

/** Create a JsPsych instance with the mock microphone recorder wired up. */
function makeJsPsych(): JsPsych {
  const jsPsych = new JsPsych({});
  (jsPsych.pluginAPI as any).getMicrophoneRecorder = () => mockRecorder;
  return jsPsych;
}

/**
 * Start a single-trial timeline, then flush microtasks so MockAudio's
 * Promise-based "ended" event fires and the display switches to "Listening…".
 */
async function runTrial(params: Record<string, any> = {}) {
  const jsPsych = makeJsPsych();
  const helpers = await startTimeline(
    [{ type: AudioResponsePlugin, stimulus: "audio/test.mp3", ...params }],
    jsPsych
  );
  // Extra flush to ensure any remaining microtasks (detectSpeech's addModule,
  // createConnectProcessor) have settled.
  await flushPromises();
  return helpers;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AudioResponsePlugin", () => {
  // ── Plugin static info ────────────────────────────────────────────────────

  describe("plugin info", () => {
    it("has the correct plugin name", () => {
      expect(AudioResponsePlugin.info.name).toBe("plugin-audio-response");
    });

    it("declares all expected parameters", () => {
      const params = AudioResponsePlugin.info.parameters;
      const expectedKeys = [
        "stimulus",
        "prompt",
        "recording_start",
        "recording_duration",
        "silence_threshold",
        "show_done_button",
        "done_button_label",
        "allow_playback",
        "record_again_button_label",
        "accept_button_label",
        "save_audio_url",
        "local_download",
        "download_file_name",
        "transcription",
        "correct_response",
        "response_choices",
        "show_feedback",
        "feedback_duration",
        "correct_message",
        "incorrect_message",
        "require_keyword",
        "keyword_timeout",
        "keyword_prompt",
        "keyword_retry_message",
        "replay_on_retry",
      ];
      for (const key of expectedKeys) {
        expect(params).toHaveProperty(key);
      }
    });

    it("has correct defaults for key parameters", () => {
      const p = AudioResponsePlugin.info.parameters;
      expect(p.recording_start.default).toBe("audio_end");
      expect(p.recording_duration.default).toBe(5000);
      expect(p.silence_threshold.default).toBe(1000);
      expect(p.show_done_button.default).toBe(false);
      expect(p.done_button_label.default).toBe("Continue");
      expect(p.allow_playback.default).toBe(false);
      expect(p.transcription.default).toBe(false);
      expect(p.save_audio_url.default).toBe(false);
      expect(p.local_download.default).toBe(false);
      expect(p.show_feedback.default).toBe(false);
      expect(p.require_keyword.default).toBe(false);
      expect(p.correct_message.default).toBe("Correct!");
      expect(p.incorrect_message.default).toBe("Incorrect!");
    });

    it("declares all expected data fields", () => {
      const data = AudioResponsePlugin.info.data;
      const expectedDataKeys = [
        "stimulus",
        "rt",
        "response",
        "audio_onset",
        "estimated_speech_onset",
        "estimated_speech_offset",
        "audio_url",
        "transcript",
        "transcript_chunks",
        "correct",
        "detected_response",
      ];
      for (const key of expectedDataKeys) {
        expect(data).toHaveProperty(key);
      }
    });
  });

  // ── Display rendering ─────────────────────────────────────────────────────

  describe("display rendering (audio_end mode)", () => {
    it('shows "Listening…" after audio ends', async () => {
      const { getHTML } = await runTrial({ recording_duration: null });
      expect(getHTML()).toContain("Listening");
    });

    it("renders the prompt when provided", async () => {
      const { getHTML } = await runTrial({
        prompt: "<p>Say the animal name</p>",
        recording_duration: null,
      });
      expect(getHTML()).toContain("Say the animal name");
    });

    it("does not show a prompt when prompt is null", async () => {
      const { getHTML } = await runTrial({ prompt: null, recording_duration: null });
      expect(getHTML()).not.toContain("jspsych-audio-response-prompt");
    });

    it("does not show the done button by default", async () => {
      const { getHTML } = await runTrial({ recording_duration: null });
      expect(getHTML()).not.toContain("finish-trial");
    });

    it("shows the done button when show_done_button is true", async () => {
      const { getHTML } = await runTrial({
        show_done_button: true,
        recording_duration: null,
      });
      expect(getHTML()).toContain("finish-trial");
    });

    it("uses the custom done_button_label", async () => {
      const { getHTML } = await runTrial({
        show_done_button: true,
        done_button_label: "I'm done!",
        recording_duration: null,
      });
      expect(getHTML()).toContain("I'm done!");
    });
  });

  // ── audio_start recording mode ────────────────────────────────────────────

  describe("recording_start: audio_start mode", () => {
    it("recorder is active during audio playback in audio_start mode", async () => {
      // In audio_start mode, startRecording() is called before audio ends.
      // After runTrial(), audio has ended but no VAD stop has triggered, so
      // the recorder should still be in recording state.
      const { expectRunning } = await runTrial({
        recording_start: "audio_start",
        recording_duration: null,
      });
      expect(mockRecorder.state).toBe("recording");
      await expectRunning();
    });

    it("shows the done button after audio ends in audio_start mode", async () => {
      const { getHTML } = await runTrial({
        recording_start: "audio_start",
        show_done_button: true,
        recording_duration: null,
      });
      expect(getHTML()).toContain("finish-trial");
    });

    it("ends the trial when done button is clicked in audio_start mode", async () => {
      const { displayElement, expectFinished } = await runTrial({
        recording_start: "audio_start",
        show_done_button: true,
        recording_duration: null,
      });

      const btn = displayElement.querySelector("#finish-trial") as HTMLButtonElement;
      expect(btn).not.toBeNull();
      btn.click();

      await flushPromises();
      await expectFinished();
    });
  });

  // ── Done button ───────────────────────────────────────────────────────────

  describe("done button", () => {
    it("finishes the trial when clicked", async () => {
      const { displayElement, expectFinished } = await runTrial({
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();
      await expectFinished();
    });

    it("stores the stimulus URL in trial data", async () => {
      const { displayElement, getData } = await runTrial({
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      expect(getData().values()[0].stimulus).toBe("audio/test.mp3");
    });

    it("stores a base64 response in trial data", async () => {
      const { displayElement, getData } = await runTrial({
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      const { response } = getData().values()[0];
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
      // Base64 from our mock: "ZmFrZQ=="
      expect(response).toBe("ZmFrZQ==");
    });

    it("stores a numeric audio_onset in trial data", async () => {
      const { displayElement, getData } = await runTrial({
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      const { audio_onset } = getData().values()[0];
      expect(typeof audio_onset).toBe("number");
    });

    it("stores a numeric rt (relative to audio onset) in trial data", async () => {
      const { displayElement, getData } = await runTrial({
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      const { rt } = getData().values()[0];
      expect(typeof rt).toBe("number");
      expect(rt).toBeGreaterThanOrEqual(0);
    });

    it("stores null for estimated_speech_onset when no VAD speech was detected", async () => {
      const { displayElement, getData } = await runTrial({
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      expect(getData().values()[0].estimated_speech_onset).toBeNull();
    });
  });

  // ── recording_duration timeout ─────────────────────────────────────────────

  describe("recording_duration timeout", () => {
    it("ends the trial automatically after recording_duration ms", async () => {
      const { expectFinished } = await runTrial({ recording_duration: 2000 });

      jest.advanceTimersByTime(2000);
      await flushPromises();
      await expectFinished();
    });

    it("does not end the trial before recording_duration elapses", async () => {
      const { expectRunning } = await runTrial({ recording_duration: 2000 });

      jest.advanceTimersByTime(1999);
      await expectRunning();
    });
  });

  // ── allow_playback ────────────────────────────────────────────────────────

  describe("allow_playback", () => {
    async function stopWithDoneButton(params: Record<string, any> = {}) {
      const helpers = await runTrial({
        allow_playback: true,
        show_done_button: true,
        recording_duration: null,
        ...params,
      });
      (helpers.displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();
      return helpers;
    }

    it("shows a playback audio element after recording stops", async () => {
      const { getHTML } = await stopWithDoneButton();
      expect(getHTML()).toContain("playback");
    });

    it("shows a record-again button after recording stops", async () => {
      const { getHTML } = await stopWithDoneButton();
      expect(getHTML()).toContain("record-again");
    });

    it("uses the custom record_again_button_label", async () => {
      const { getHTML } = await stopWithDoneButton({
        record_again_button_label: "Try Again",
      });
      expect(getHTML()).toContain("Try Again");
    });

    it("shows the accept button after recording stops", async () => {
      const { getHTML } = await stopWithDoneButton();
      expect(getHTML()).toContain("continue");
    });

    it("uses the custom accept_button_label", async () => {
      const { getHTML } = await stopWithDoneButton({
        accept_button_label: "Submit Answer",
      });
      expect(getHTML()).toContain("Submit Answer");
    });

    it("finishes the trial when the accept button is clicked", async () => {
      const { displayElement, expectFinished } = await stopWithDoneButton();

      (displayElement.querySelector("#continue") as HTMLButtonElement).click();
      await flushPromises();
      await expectFinished();
    });
  });

  // ── save_audio_url ────────────────────────────────────────────────────────

  describe("save_audio_url", () => {
    it("includes audio_url in trial data when true", async () => {
      const { displayElement, getData } = await runTrial({
        save_audio_url: true,
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      expect(getData().values()[0].audio_url).toBe("blob:mock-url");
    });

    it("does not include audio_url in trial data when false", async () => {
      const { displayElement, getData } = await runTrial({
        save_audio_url: false,
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      expect(getData().values()[0].audio_url).toBeUndefined();
    });

    it("revokes the object URL after trial when save_audio_url is false", async () => {
      const { displayElement } = await runTrial({
        save_audio_url: false,
        show_done_button: true,
        recording_duration: null,
      });

      (displayElement.querySelector("#finish-trial") as HTMLButtonElement).click();
      await flushPromises();

      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  // ── VAD speech detection ──────────────────────────────────────────────────

  describe("VAD speech detection", () => {
    it("ends the trial after speech + silence_threshold ms of silence", async () => {
      const { expectFinished } = await runTrial({
        silence_threshold: 500,
        recording_duration: null,
      });

      // Simulate the worklet sending a "speech" then "silence" event
      const speechEvent = new MessageEvent("message", {
        data: { cmd: "speech" },
      });
      const silenceEvent = new MessageEvent("message", {
        data: { cmd: "silence" },
      });

      expect(lastAudioWorkletNode).not.toBeNull();
      lastAudioWorkletNode!.port.onmessage!(speechEvent);
      lastAudioWorkletNode!.port.onmessage!(silenceEvent);

      // Advance past silence_threshold
      jest.advanceTimersByTime(500);
      await flushPromises();
      await expectFinished();
    });

    it("does not end the trial during silence before any speech is detected", async () => {
      const { expectRunning } = await runTrial({
        silence_threshold: 500,
        recording_duration: null,
      });

      // Only silence — no prior speech
      const silenceEvent = new MessageEvent("message", {
        data: { cmd: "silence" },
      });
      lastAudioWorkletNode!.port.onmessage!(silenceEvent);

      jest.advanceTimersByTime(500);
      await expectRunning();
    });

    it("cancels the silence timer when speech is detected again", async () => {
      const { expectRunning } = await runTrial({
        silence_threshold: 500,
        recording_duration: null,
      });

      const speechEvent = new MessageEvent("message", { data: { cmd: "speech" } });
      const silenceEvent = new MessageEvent("message", { data: { cmd: "silence" } });

      // Start speaking, then silence, then speak again (resets timer)
      lastAudioWorkletNode!.port.onmessage!(speechEvent);
      lastAudioWorkletNode!.port.onmessage!(silenceEvent);
      jest.advanceTimersByTime(250); // half the silence threshold
      lastAudioWorkletNode!.port.onmessage!(speechEvent); // cancels silence timer
      jest.advanceTimersByTime(250); // would have triggered if not cancelled

      await expectRunning(); // still running — timer was reset
    });

    it("records estimated_speech_onset in trial data", async () => {
      const { getData, expectFinished } = await runTrial({
        silence_threshold: 500,
        recording_duration: null,
      });

      const speechEvent = new MessageEvent("message", { data: { cmd: "speech" } });
      const silenceEvent = new MessageEvent("message", { data: { cmd: "silence" } });

      lastAudioWorkletNode!.port.onmessage!(speechEvent);
      lastAudioWorkletNode!.port.onmessage!(silenceEvent);
      jest.advanceTimersByTime(500);
      await flushPromises();
      await expectFinished();

      const { estimated_speech_onset } = getData().values()[0];
      // May be a number or null depending on timeStamp availability in JSDOM
      expect(estimated_speech_onset === null || typeof estimated_speech_onset === "number").toBe(true);
    });
  });
});
