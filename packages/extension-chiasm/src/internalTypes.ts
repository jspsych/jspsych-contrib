/**
 * Internal type surface for the Chiasm extension.
 *
 * NOTHING in this module is re-exported from `index.ts`, so none of it appears in
 * the published `dist/index.d.ts`. Keeping the tracker contract and the
 * non-production infrastructure knobs here means they are not part of the
 * package's supported public API (and therefore carry no semver obligation),
 * while the runtime can still honor them when present.
 */

/** Environment the Chiasm tracker should target. Internal/dev only. */
export type ChiasmEnvironment = "production" | "staging";

/**
 * Internal-only configuration knobs. These are honored at runtime when present on
 * the params passed to `initialize`, but are intentionally absent from the public
 * `InitializeParameters` type. For internal staging/dev work, set them via the
 * gitignored `config.local.js` in the examples (passed through at runtime).
 */
export interface InternalChiasmConfig {
  /** Chiasm environment to target. Defaults to "production". */
  environment?: ChiasmEnvironment;
  /** Override the backend base URL. When set, `environment` is ignored. */
  baseURL?: string;
  /** Whether the backend should retain data after the session ends. Defaults to true. */
  keepData?: boolean;
  /** Whether to upload camera frames alongside predictions. Defaults to false. */
  saveFrame?: boolean;
}

/** Shape of a frame timestamp emitted by the Chiasm tracker. */
export interface ChiasmFrameTimestamp {
  frameNumber: number;
  frameID: string;
  timestamp: number;
}

/** Gaze prediction emitted by the Chiasm tracker; opaque shape passed through to data. */
export type ChiasmPrediction = Record<string, unknown> & { timestamp?: number };

/** Minimal type for the Chiasm tracker handle returned by `initChiasmTracker`. */
export interface ChiasmTracker {
  setUserPredictionCallback(cb: (pred: ChiasmPrediction) => void): void;
  setExpInfo(
    experimentId: string,
    participantId: string,
    saveData?: boolean,
    keepData?: boolean,
    saveFrame?: boolean
  ): void;
  startSession(): Promise<void>;
  showScreenCalibration(): Promise<void>;
  setupTrackerWithRetries(): Promise<void>;
  startRecording(eventId?: string): Promise<ChiasmFrameTimestamp[]>;
  stopRecording(): Promise<void> | void;
  ensureAllPredictionsReturned(): Promise<void>;
  cleanupTracker(): Promise<void>;
}

/** Factory for the Chiasm tracker, normally loaded via the chiasm-tracker.js script tag. */
export type InitChiasmTracker = (options: {
  environment?: ChiasmEnvironment;
  baseURL?: string;
  authToken?: string;
}) => Promise<ChiasmTracker | null>;
