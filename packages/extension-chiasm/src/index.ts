import { JsPsych, JsPsychExtension, JsPsychExtensionInfo, ParameterType } from "jspsych";

import { version } from "../package.json";
import type {
  ChiasmEnvironment,
  ChiasmFrameTimestamp,
  ChiasmPrediction,
  ChiasmTracker,
  InitChiasmTracker,
  InternalChiasmConfig,
} from "./internalTypes";

/**
 * Public, infrastructure-free factory type for the optional `initChiasmTracker`
 * escape hatch. Deliberately hides the tracker shape and the non-production
 * environment/baseURL knobs (those live in the internal type surface). The
 * runtime widens this to the full factory before invoking it.
 */
type PublicChiasmTrackerFactory = (options: { authToken?: string }) => Promise<unknown>;

interface InitializeParameters {
  /** Experiment identifier used by the Chiasm backend. */
  experimentId: string;
  /** Participant identifier scoped to the experiment. */
  participantId: string;
  /** Authentication token. Required. */
  authToken: string;
  /** Whether the backend should persist trial data. Defaults to true. */
  saveData?: boolean;
  /**
   * Optional explicit reference to the `initChiasmTracker` factory. If omitted, the
   * extension falls back to `window.initChiasmTracker` (loaded via script tag).
   */
  initChiasmTracker?: PublicChiasmTrackerFactory;
}

interface OnStartParameters {}

interface OnLoadParameters {
  /** Optional event label associated with the trial. Passed to `startRecording`. */
  event_id?: string;
}

interface OnFinishParameters {
  event_id?: string;
}

/** Options for the full Chiasm setup ceremony triggered by `calibrate()`. */
export interface CalibrateOptions {
  /** Whether to run the credit-card screen size calibration step. Defaults to true. */
  screenCalibration?: boolean;
}

declare global {
  interface Window {
    initChiasmTracker?: PublicChiasmTrackerFactory;
  }
}

/**
 * **extension-chiasm**
 *
 * Chiasm eye tracking extension for jsPsych. Wires the Chiasm tracker into the trial
 * lifecycle: starts a recording at `on_load`, stops it at `on_finish`, and attaches
 * the recorded frame timestamps and matched gaze predictions to the trial's data.
 *
 * Initialization stores configuration only. Tracker creation, session start, and
 * the participant-facing setup ceremony are triggered by the companion plugins
 * `@jspsych-contrib/plugin-chiasm-setup` and `@jspsych-contrib/plugin-chiasm-calibrate`.
 *
 * @author Chiasm
 * @see {@link https://github.com/jspsych/jspsych-contrib/blob/main/packages/extension-chiasm/README.md}
 */
class ChiasmExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "chiasm",
    version: version,
    data: {
      /** Array of frame timestamps recorded by Chiasm during this trial. */
      chiasm_timestamps: {
        type: ParameterType.COMPLEX,
        array: true,
        nested: {
          frame_number: { type: ParameterType.INT },
          frame_id: { type: ParameterType.STRING },
          timestamp: { type: ParameterType.FLOAT },
        },
      },
      /** Array of gaze predictions received by Chiasm during this trial. */
      chiasm_predictions: {
        type: ParameterType.COMPLEX,
        array: true,
      },
      /** Error message if recording failed to start for this trial, otherwise absent. */
      chiasm_recording_error: {
        type: ParameterType.STRING,
      },
    },
    citations: "__CITATIONS__",
  };

  private experimentId: string = "";
  private participantId: string = "";
  private environment: ChiasmEnvironment = "production";
  private baseURL: string = "";
  private authToken: string = "";
  private saveData: boolean = true;
  private keepData: boolean = true;
  private saveFrame: boolean = false;
  private initFactory: InitChiasmTracker | undefined;

  private tracker: ChiasmTracker | null = null;
  private initialized: boolean = false;
  private startPromise: Promise<void> | null = null;
  private currentRecordingPromise: Promise<ChiasmFrameTimestamp[]> | null = null;
  /**
   * Live reference to the frame log array returned by `startRecording()`. The
   * Chiasm tracker resolves that promise early (once the webcam is ready) but
   * keeps appending frames for the rest of the trial, so we must hold the array
   * reference — not a one-time awaited snapshot — until `on_finish`.
   */
  private currentRecordingFrames: ChiasmFrameTimestamp[] | null = null;
  private predictionBuffer: ChiasmPrediction[] = [];

  constructor(private jsPsych: JsPsych) {}

  initialize = (params: InitializeParameters): Promise<void> => {
    const {
      experimentId,
      participantId,
      authToken = "",
      saveData = true,
      initChiasmTracker: factory,
    } = params;
    this.experimentId = experimentId;
    this.participantId = participantId;
    this.authToken = authToken;
    this.saveData = saveData;
    this.initFactory = factory as InitChiasmTracker | undefined;

    // Internal/dev-only knobs are honored at runtime when present but are not part
    // of the public `InitializeParameters` type (see internalTypes.ts). This keeps
    // staging/baseURL/keepData/saveFrame out of the published API surface while
    // still allowing internal testing via the gitignored examples config.
    const internal = params as InitializeParameters & InternalChiasmConfig;
    this.environment = internal.environment ?? "production";
    this.baseURL = internal.baseURL ?? "";
    this.keepData = internal.keepData ?? true;
    this.saveFrame = internal.saveFrame ?? false;
    return Promise.resolve();
  };

  on_start = (_params?: OnStartParameters): void => {
    this.currentRecordingPromise = null;
    this.currentRecordingFrames = null;
  };

  on_load = (params?: OnLoadParameters): void => {
    if (!this.tracker) return;

    const eventId = params?.event_id;
    const startPromise =
      eventId !== undefined && eventId !== null
        ? this.tracker.startRecording(eventId)
        : this.tracker.startRecording();

    // Keep the promise so on_finish can await rejection/completion, and keep
    // the live frame-log array reference once the promise resolves. The Chiasm
    // tracker resolves startRecording() once the webcam is ready but continues
    // pushing frames into that same array until stopRecording() runs.
    this.currentRecordingPromise = startPromise;
    startPromise
      .then((frames) => {
        if (Array.isArray(frames)) {
          this.currentRecordingFrames = frames;
        }
      })
      .catch(() => {});
  };

  on_finish = async (_params?: OnFinishParameters): Promise<{ [key: string]: any }> => {
    if (!this.tracker) return {};

    await this.tracker.stopRecording();

    const recordingPromise = this.currentRecordingPromise;
    this.currentRecordingPromise = null;

    let recordingError: string | null = null;
    if (recordingPromise) {
      try {
        await recordingPromise;
      } catch (err) {
        recordingError = err instanceof Error ? err.message : String(err);
        console.error("extension-chiasm: startRecording() failed for this trial:", err);
      }
    }

    const frames = this.currentRecordingFrames ?? [];
    this.currentRecordingFrames = null;

    const timestamps = frames.map((frame) => ({
      frame_number: (frame as ChiasmFrameTimestamp).frameNumber ?? (frame as any).frame_number,
      frame_id: (frame as ChiasmFrameTimestamp).frameID ?? (frame as any).frame_id,
      timestamp: frame.timestamp,
    }));

    // Predictions are attached post-hoc via attachBufferedPredictionsToTrials()
    // because Chiasm's backend is async: most predictions arrive after on_finish
    // returns. See ensureAllPredictionsReturned() and flushPredictionsToTrials().
    const data: { [key: string]: any } = {
      chiasm_timestamps: timestamps,
    };
    if (recordingError !== null) {
      data.chiasm_recording_error = recordingError;
    }
    return data;
  };

  /**
   * Initialize the Chiasm tracker, wire the prediction callback, and start the session.
   * Invoked by `plugin-chiasm-setup`. Safe to call only once per experiment; subsequent
   * calls resolve immediately. Concurrent calls share a single in-flight promise so the
   * tracker, prediction callback, and backend session are only ever created once.
   */
  start = (): Promise<void> => {
    if (this.initialized && this.tracker) return Promise.resolve();
    if (this.startPromise) return this.startPromise;

    this.startPromise = this.doStart().catch((err) => {
      // Clear the cached promise on failure so a later call can retry.
      this.startPromise = null;
      throw err;
    });
    return this.startPromise;
  };

  private doStart = async (): Promise<void> => {
    if (!this.authToken) {
      throw new Error(
        "extension-chiasm: authToken is required. Pass it via the extension's init params."
      );
    }
    if (!this.experimentId) {
      throw new Error(
        "extension-chiasm: experimentId is required. Pass it via the extension's init params."
      );
    }
    if (!this.participantId) {
      throw new Error(
        "extension-chiasm: participantId is required. Pass it via the extension's init params."
      );
    }

    const options: { environment?: ChiasmEnvironment; baseURL?: string; authToken: string } = {
      authToken: this.authToken,
      ...(this.baseURL ? { baseURL: this.baseURL } : { environment: this.environment }),
    };

    const factory: InitChiasmTracker | undefined =
      this.initFactory ??
      (typeof window !== "undefined"
        ? (window.initChiasmTracker as InitChiasmTracker | undefined)
        : undefined);
    if (!factory) {
      throw new Error(
        "extension-chiasm: initChiasmTracker is not available. Load chiasm-tracker.js or pass `initChiasmTracker` via initialize params."
      );
    }

    const tracker = await factory(options);
    if (!tracker) {
      throw new Error("extension-chiasm: tracker failed to initialize");
    }

    tracker.setUserPredictionCallback((pred) => {
      this.predictionBuffer.push({ ...pred });
    });

    tracker.setExpInfo(
      this.experimentId,
      this.participantId,
      this.saveData,
      this.keepData,
      this.saveFrame
    );

    await tracker.startSession();
    this.tracker = tracker;
    this.initialized = true;
  };

  /**
   * Run the full Chiasm setup ceremony: optional screen-size calibration, then the
   * camera readiness, fullscreen, gaze calibration, validation, scoring, and handoff
   * flow provided by `setupTrackerWithRetries`. Invoked by `plugin-chiasm-calibrate`.
   */
  calibrate = async ({ screenCalibration = true }: CalibrateOptions = {}): Promise<void> => {
    if (!this.tracker) {
      throw new Error("extension-chiasm: cannot calibrate before start() has run");
    }
    if (screenCalibration) {
      await this.tracker.showScreenCalibration();
    }
    await this.tracker.setupTrackerWithRetries();
  };

  /** Returns true if `start()` has completed successfully. */
  isInitialized = (): boolean => this.initialized;

  /**
   * Awaits any in-flight predictions still being sent to the backend, then
   * attaches the buffered predictions to their matching trials by frame
   * timestamp. After this resolves, `chiasm_predictions` is populated on every
   * tracked trial whose frames received a prediction.
   */
  ensureAllPredictionsReturned = async (): Promise<void> => {
    if (!this.tracker) return;
    await this.tracker.ensureAllPredictionsReturned();
    // Let any prediction callbacks scheduled during the backend flush run
    // before we match against trial rows.
    await Promise.resolve();
    this.drainBufferedPredictionsToTrials();
  };

  /**
   * Immediately attach any buffered predictions to their matching trials,
   * without waiting for the backend to flush in-flight predictions. Use this
   * between blocks or alongside an incremental-save workflow to merge whatever
   * predictions have arrived so far into completed trials' data rows.
   */
  flushPredictionsToTrials = (): void => {
    this.drainBufferedPredictionsToTrials();
  };

  /**
   * Repeatedly attach buffered predictions until a pass makes no progress. This
   * handles partial matches across flushes and late-arriving predictions that
   * land in the buffer just after the tracker flush completes.
   */
  private drainBufferedPredictionsToTrials(): void {
    while (this.predictionBuffer.length > 0) {
      const sizeBefore = this.predictionBuffer.length;
      this.attachBufferedPredictionsToTrials();
      // Stop when nothing matched (warn once) or everything matched (buffer empty).
      if (this.predictionBuffer.length === sizeBefore) {
        break;
      }
    }
  }

  /** Tear down the tracker and reset extension state. Safe to call multiple times. */
  cleanup = async (): Promise<void> => {
    if (!this.tracker) return;
    await this.tracker.cleanupTracker();
    this.tracker = null;
    this.initialized = false;
    this.startPromise = null;
    this.predictionBuffer = [];
    this.currentRecordingPromise = null;
    this.currentRecordingFrames = null;
  };

  /**
   * Match every buffered prediction against trial-level `chiasm_timestamps`
   * already recorded in jsPsych's data, pushing each match onto that trial's
   * `chiasm_predictions` array.
   *
   * Predictions are joined to trials by `frame_id` first (the primary key the
   * Chiasm backend echoes back from the per-frame upload) and fall back to a
   * 1ms timestamp tolerance for predictions that, for whatever reason, omit
   * the frame id. The prediction buffer is cleared at the end so subsequent
   * flushes only process newly arrived predictions.
   *
   * Any prediction that matches no trial is kept in the buffer so it can still
   * be joined on a later flush (e.g. when its trial row is pushed after the
   * prediction arrives, as happens in incremental-save mode). Whenever one or
   * more predictions go unmatched on a flush, a single warning is logged with
   * the count and the shape of the first unmatched prediction so the mismatch
   * can be diagnosed without re-instrumenting the extension.
   */
  private attachBufferedPredictionsToTrials(): void {
    if (this.predictionBuffer.length === 0) return;

    const trials = this.jsPsych.data.get().values() as Array<{
      chiasm_timestamps?: Array<{ frame_id?: string; timestamp?: number }>;
      chiasm_predictions?: ChiasmPrediction[];
    }>;

    // Build a frame_id -> trial lookup once. Multiple frames per trial all
    // point at the same trial object, which is fine.
    const trialByFrameId = new Map<string, (typeof trials)[number]>();
    for (const trial of trials) {
      if (!Array.isArray(trial.chiasm_timestamps)) continue;
      for (const ts of trial.chiasm_timestamps) {
        if (typeof ts.frame_id === "string") trialByFrameId.set(ts.frame_id, trial);
      }
    }

    const findTrialByTimestamp = (predTimestamp: number) =>
      trials.find(
        (t) =>
          Array.isArray(t.chiasm_timestamps) &&
          t.chiasm_timestamps.some(
            (ts) => typeof ts.timestamp === "number" && Math.abs(ts.timestamp - predTimestamp) < 1
          )
      );

    const stillUnmatched: ChiasmPrediction[] = [];
    let firstUnmatched: ChiasmPrediction | undefined;
    for (const pred of this.predictionBuffer) {
      const frameId =
        (pred as Record<string, unknown>).frame_id ??
        (pred as Record<string, unknown>).frameID ??
        (pred as Record<string, unknown>).frameId;
      let trial = typeof frameId === "string" ? trialByFrameId.get(frameId) : undefined;
      if (!trial && typeof pred.timestamp === "number") {
        trial = findTrialByTimestamp(pred.timestamp);
      }
      if (trial) {
        if (!Array.isArray(trial.chiasm_predictions)) trial.chiasm_predictions = [];
        trial.chiasm_predictions.push(pred);
      } else {
        if (!firstUnmatched) firstUnmatched = pred;
        stillUnmatched.push(pred);
      }
    }

    if (stillUnmatched.length > 0 && firstUnmatched) {
      console.warn(
        `extension-chiasm: ${stillUnmatched.length} buffered prediction(s) did not match any trial. ` +
          "Expected each prediction to carry a `frame_id` matching a recorded " +
          "frame, or a numeric `timestamp` within 1ms of one. They are retained " +
          "for the next flush in case the matching trial row arrives later. Example prediction:",
        firstUnmatched
      );
    }

    // Keep only the unmatched predictions so a later flush can still join them.
    this.predictionBuffer = stillUnmatched;
  }
}

export default ChiasmExtension;
