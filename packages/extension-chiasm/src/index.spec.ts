import { initJsPsych } from "jspsych";

import jsPsychExtensionChiasm from ".";

describe("extension-chiasm", () => {
  it("registers itself with the expected static info", () => {
    expect(jsPsychExtensionChiasm.info.name).toBe("chiasm");
    expect(jsPsychExtensionChiasm.info.data?.chiasm_timestamps).toBeDefined();
    expect(jsPsychExtensionChiasm.info.data?.chiasm_predictions).toBeDefined();
  });

  it("initializes without contacting the Chiasm backend", async () => {
    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            environment: "production",
          },
        },
      ],
    });

    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    expect(extension).toBeDefined();
    expect(typeof extension.start).toBe("function");
    expect(typeof extension.calibrate).toBe("function");
    expect(extension.isInitialized()).toBe(false);
  });

  it("returns empty data from on_finish before the tracker exists", async () => {
    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: { experimentId: "exp", participantId: "pp" },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    const data = await extension.on_finish({});
    expect(data).toEqual({});
  });

  it("throws when start() runs without an authToken in any environment", async () => {
    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "",
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "",
    });
    await expect(extension.start()).rejects.toThrow(/authToken/);
  });

  it("throws when start() runs without an available initChiasmTracker factory", async () => {
    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: { experimentId: "exp", participantId: "pp", authToken: "tok" },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({ experimentId: "exp", participantId: "pp", authToken: "tok" });
    await expect(extension.start()).rejects.toThrow(/initChiasmTracker/);
  });

  /**
   * Build a fake tracker that captures the prediction callback registered by
   * the extension so tests can simulate the Chiasm backend emitting predictions
   * at arbitrary times (notably, after `on_finish` has already returned).
   */
  function makeFakeTracker(
    timestamps: Array<{ frameNumber: number; frameID: string; timestamp: number }>
  ) {
    const captured: { predictionCallback?: (pred: any) => void } = {};
    const tracker = {
      setUserPredictionCallback: jest.fn((cb: (pred: any) => void) => {
        captured.predictionCallback = cb;
      }),
      setExpInfo: jest.fn(),
      startSession: jest.fn().mockResolvedValue(undefined),
      showScreenCalibration: jest.fn().mockResolvedValue(undefined),
      setupTrackerWithRetries: jest.fn().mockResolvedValue(undefined),
      startRecording: jest.fn().mockResolvedValue(timestamps),
      stopRecording: jest.fn().mockResolvedValue(undefined),
      ensureAllPredictionsReturned: jest.fn().mockResolvedValue(undefined),
      cleanupTracker: jest.fn().mockResolvedValue(undefined),
    };
    return { tracker, captured };
  }

  it("calls the injected initChiasmTracker factory and reaches initialized state", async () => {
    const { tracker } = makeFakeTracker([]);
    const factory = jest.fn().mockResolvedValue(tracker);

    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "tok",
            initChiasmTracker: factory,
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "tok",
      initChiasmTracker: factory,
    });
    await extension.start();
    expect(factory).toHaveBeenCalledWith({ authToken: "tok", environment: "production" });
    expect(tracker.setExpInfo).toHaveBeenCalledWith("exp", "pp", true, true, false);
    expect(tracker.startSession).toHaveBeenCalled();
    expect(extension.isInitialized()).toBe(true);
  });

  it("attaches out-of-order predictions to matching trials via ensureAllPredictionsReturned", async () => {
    const frames = [
      { frameNumber: 0, frameID: "f0", timestamp: 1000 },
      { frameNumber: 1, frameID: "f1", timestamp: 1050 },
      { frameNumber: 2, frameID: "f2", timestamp: 1100 },
    ];
    const { tracker, captured } = makeFakeTracker(frames);
    const factory = jest.fn().mockResolvedValue(tracker);

    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "tok",
            initChiasmTracker: factory,
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "tok",
      initChiasmTracker: factory,
    });
    await extension.start();

    extension.on_start();
    extension.on_load({ event_id: "trial_1" });
    // Let the startRecording promise resolve so currentTrialTimestamps is set.
    await Promise.resolve();
    await Promise.resolve();

    const finishData = await extension.on_finish({});
    expect(finishData.chiasm_timestamps).toHaveLength(3);
    expect(finishData.chiasm_predictions).toBeUndefined();

    // Simulate the trial's data row being persisted to jsPsych's store, as
    // jsPsych would do after every trial.
    jsPsych.data.get().push({ ...finishData, trial_index: 0 });

    const trialBefore = jsPsych.data.get().values()[0];
    expect(trialBefore.chiasm_timestamps).toHaveLength(3);
    expect(trialBefore.chiasm_predictions).toBeUndefined();

    // Predictions arrive from the Chiasm backend AFTER on_finish has returned.
    expect(captured.predictionCallback).toBeDefined();
    captured.predictionCallback!({ timestamp: 1050.1, x: 0.4, y: 0.6 });
    captured.predictionCallback!({ timestamp: 1100.0, x: 0.5, y: 0.7 });
    captured.predictionCallback!({ timestamp: 9999, x: 0, y: 0 });

    await extension.ensureAllPredictionsReturned();

    const trialAfter = jsPsych.data.get().values()[0];
    expect(Array.isArray(trialAfter.chiasm_predictions)).toBe(true);
    expect(trialAfter.chiasm_predictions).toHaveLength(2);
    expect(trialAfter.chiasm_predictions[0]).toMatchObject({ timestamp: 1050.1, x: 0.4 });
    expect(trialAfter.chiasm_predictions[1]).toMatchObject({ timestamp: 1100.0, x: 0.5 });
  });

  it("flushPredictionsToTrials attaches buffered predictions without awaiting backend", async () => {
    const frames = [
      { frameNumber: 0, frameID: "f0", timestamp: 2000 },
      { frameNumber: 1, frameID: "f1", timestamp: 2050 },
    ];
    const { tracker, captured } = makeFakeTracker(frames);
    const factory = jest.fn().mockResolvedValue(tracker);

    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "tok",
            initChiasmTracker: factory,
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "tok",
      initChiasmTracker: factory,
    });
    await extension.start();

    extension.on_start();
    extension.on_load({ event_id: "trial_a" });
    await Promise.resolve();
    await Promise.resolve();
    const finishData = await extension.on_finish({});
    jsPsych.data.get().push({ ...finishData, trial_index: 0 });

    captured.predictionCallback!({ timestamp: 2050.4, x: 0.2, y: 0.3 });

    extension.flushPredictionsToTrials();
    expect(tracker.ensureAllPredictionsReturned).not.toHaveBeenCalled();

    const trial = jsPsych.data.get().values()[0];
    expect(trial.chiasm_predictions).toHaveLength(1);
    expect(trial.chiasm_predictions[0]).toMatchObject({ timestamp: 2050.4, x: 0.2 });

    // Repeated calls should be no-ops once the buffer is empty.
    extension.flushPredictionsToTrials();
    expect(trial.chiasm_predictions).toHaveLength(1);

    // A subsequent prediction can still be attached via another flush.
    captured.predictionCallback!({ timestamp: 2000.0, x: 0.9, y: 0.8 });
    extension.flushPredictionsToTrials();
    expect(trial.chiasm_predictions).toHaveLength(2);
  });

  it("matches predictions to trials by frame_id when no timestamp is present", async () => {
    const frames = [
      { frameNumber: 0, frameID: "frame-a", timestamp: 3000 },
      { frameNumber: 1, frameID: "frame-b", timestamp: 3050 },
    ];
    const { tracker, captured } = makeFakeTracker(frames);
    const factory = jest.fn().mockResolvedValue(tracker);

    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "tok",
            initChiasmTracker: factory,
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "tok",
      initChiasmTracker: factory,
    });
    await extension.start();
    extension.on_start();
    extension.on_load({ event_id: "trial_fid" });
    await Promise.resolve();
    await Promise.resolve();
    const finishData = await extension.on_finish({});
    jsPsych.data.get().push({ ...finishData, trial_index: 0 });

    // Predictions carry `frame_id` only (no `timestamp`). The matcher should
    // still attach them via the frame_id lookup.
    captured.predictionCallback!({ frame_id: "frame-b", x: 0.31, y: 0.42 });
    captured.predictionCallback!({ frame_id: "frame-a", x: 0.11, y: 0.12 });
    captured.predictionCallback!({ frame_id: "unknown", x: 0, y: 0 });

    await extension.ensureAllPredictionsReturned();

    const trial = jsPsych.data.get().values()[0];
    expect(trial.chiasm_predictions).toHaveLength(2);
    expect(trial.chiasm_predictions.map((p: any) => p.frame_id)).toEqual(["frame-b", "frame-a"]);
  });

  it("reads frames from the live startRecording() array after they arrive mid-trial", async () => {
    const liveFrames: Array<{ frameNumber: number; frameID: string; timestamp: number }> = [];
    const tracker = {
      setUserPredictionCallback: jest.fn(),
      setExpInfo: jest.fn(),
      startSession: jest.fn().mockResolvedValue(undefined),
      showScreenCalibration: jest.fn().mockResolvedValue(undefined),
      setupTrackerWithRetries: jest.fn().mockResolvedValue(undefined),
      startRecording: jest.fn().mockImplementation(async () => {
        await Promise.resolve();
        return liveFrames;
      }),
      stopRecording: jest.fn().mockResolvedValue(undefined),
      ensureAllPredictionsReturned: jest.fn().mockResolvedValue(undefined),
      cleanupTracker: jest.fn().mockResolvedValue(undefined),
    };
    const factory = jest.fn().mockResolvedValue(tracker);

    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "tok",
            initChiasmTracker: factory,
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "tok",
      initChiasmTracker: factory,
    });
    await extension.start();

    extension.on_start();
    extension.on_load({ event_id: "trial_live" });
    await Promise.resolve();

    liveFrames.push({ frameNumber: 0, frameID: "live-0", timestamp: 5000 });
    liveFrames.push({ frameNumber: 1, frameID: "live-1", timestamp: 5050 });

    const finishData = await extension.on_finish({});
    expect(finishData.chiasm_timestamps).toHaveLength(2);
    expect(finishData.chiasm_timestamps[0].frame_id).toBe("live-0");
    expect(finishData.chiasm_timestamps[1].frame_id).toBe("live-1");
  });

  it("records a recording error in on_finish when startRecording() rejects", async () => {
    const { tracker } = makeFakeTracker([]);
    tracker.startRecording = jest.fn().mockRejectedValue(new Error("camera unavailable"));
    const factory = jest.fn().mockResolvedValue(tracker);

    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "tok",
            initChiasmTracker: factory,
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "tok",
      initChiasmTracker: factory,
    });
    await extension.start();

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      extension.on_start();
      extension.on_load({ event_id: "trial_err" });
      // Let the rejected startRecording settle before on_finish awaits it.
      await Promise.resolve();
      await Promise.resolve();

      const finishData = await extension.on_finish({});
      expect(finishData.chiasm_timestamps).toEqual([]);
      expect(finishData.chiasm_recording_error).toMatch(/camera unavailable/);
      expect(tracker.stopRecording).toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("logs a single warning when buffered predictions match no trials", async () => {
    const frames = [{ frameNumber: 0, frameID: "frame-x", timestamp: 4000 }];
    const { tracker, captured } = makeFakeTracker(frames);
    const factory = jest.fn().mockResolvedValue(tracker);

    const jsPsych = initJsPsych({
      extensions: [
        {
          type: jsPsychExtensionChiasm,
          params: {
            experimentId: "exp",
            participantId: "pp",
            authToken: "tok",
            initChiasmTracker: factory,
          },
        },
      ],
    });
    const extension = (jsPsych.extensions as Record<string, any>)["chiasm"];
    await extension.initialize({
      experimentId: "exp",
      participantId: "pp",
      authToken: "tok",
      initChiasmTracker: factory,
    });
    await extension.start();
    extension.on_start();
    extension.on_load({ event_id: "trial_warn" });
    await Promise.resolve();
    await Promise.resolve();
    const finishData = await extension.on_finish({});
    jsPsych.data.get().push({ ...finishData, trial_index: 0 });

    // Predictions whose frame_id and timestamp neither match any trial.
    captured.predictionCallback!({ frame_id: "ghost", weirdField: 1 });
    captured.predictionCallback!({ frame_id: "phantom", weirdField: 2 });

    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      await extension.ensureAllPredictionsReturned();
      expect(warn).toHaveBeenCalledTimes(1);
      const [message, sample] = warn.mock.calls[0];
      expect(message).toMatch(/did not match any trial/);
      expect(sample).toMatchObject({ frame_id: "ghost" });
    } finally {
      warn.mockRestore();
    }
  });
});
