import { pipeline } from "@huggingface/transformers";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";
import { vadWorkletSource } from "./vad-worklet-source";

let _transcriber: any = null;

async function getTranscriber() {
  if (!_transcriber) {
    _transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en");
  }
  return _transcriber;
}

async function transcribeBlob(blob: Blob): Promise<{ text: string; chunks: any }> {
  const transcriber = await getTranscriber();
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioContext.decodeAudioData(arrayBuffer);
  audioContext.close();

  let audioData: Float32Array;
  if (decoded.numberOfChannels > 1) {
    const ch0 = decoded.getChannelData(0);
    const ch1 = decoded.getChannelData(1);
    audioData = new Float32Array(ch0.length);
    const SCALING_FACTOR = Math.sqrt(2);
    for (let i = 0; i < ch0.length; i++) {
      audioData[i] = (SCALING_FACTOR * (ch0[i] + ch1[i])) / 2;
    }
  } else {
    audioData = decoded.getChannelData(0);
  }

  const output = await transcriber(audioData, {
    return_timestamps: "word",
    no_repeat_ngram_size: 5,
  });
  return { text: (output as any).text, chunks: (output as any).chunks };
}

const info = <const>{
  name: "plugin-audio-response",
  version: version,
  parameters: {
    /** URL of the audio file to play as the stimulus. */
    stimulus: {
      type: ParameterType.AUDIO,
      default: undefined,
    },
    /** Optional HTML content displayed on screen throughout the trial. */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** Controls when the microphone recording and VAD speech detection activate.
     * - "audio_end" (default): recording begins after the audio stimulus finishes. Safer for speaker setups.
     * - "audio_start": recording begins when audio starts playing, enabling voice onset time (VOT) measurement relative to stimulus onset. Use headphones to prevent crosstalk. */
    recording_start: {
      type: ParameterType.SELECT,
      options: ["audio_end", "audio_start"],
      default: "audio_end",
    },
    /** Maximum recording duration in milliseconds. */
    recording_duration: {
      type: ParameterType.INT,
      default: 5000,
    },
    /** Milliseconds of continuous silence after detected speech that ends the trial automatically. */
    silence_threshold: {
      type: ParameterType.INT,
      default: 1000,
    },
    /** Whether to show a button the participant can click to finish the recording manually. */
    show_done_button: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Label for the done button. */
    done_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** Whether to allow the participant to listen to their recording and re-record if desired. */
    allow_playback: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Label for the record-again button shown during playback review. */
    record_again_button_label: {
      type: ParameterType.STRING,
      default: "Record again",
    },
    /** Label for the accept button shown during playback review. */
    accept_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** If true, an Object URL for the recorded audio is stored in the trial data. Only enable if you need to reuse the audio later in the experiment. */
    save_audio_url: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If true, the recorded audio is downloaded automatically at the end of the trial. */
    local_download: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Base filename for local downloads. A timestamp is appended automatically. */
    download_file_name: {
      type: ParameterType.STRING,
      default: "audio-response",
    },
    /** Whether to transcribe the recorded audio using the Whisper model. */
    transcription: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** The expected correct response(s). Accepts a string or an array of strings (e.g. `["dog","dogs"]`). `correct` is true if `detected_response` (or the transcript) matches any entry. If null, `correct` will not be set. */
    correct_response: {
      type: ParameterType.COMPLEX,
      default: null,
    },
    /** List of valid response words to scan for in the transcript. The first match becomes `detected_response`. */
    response_choices: {
      type: ParameterType.COMPLEX,
      default: null,
    },
    /** Whether to show correctness feedback after transcription. Requires `transcription: true` and `correct_response`. */
    show_feedback: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** How long to display the feedback in milliseconds. */
    feedback_duration: {
      type: ParameterType.INT,
      default: 1500,
    },
    /** Message shown when the response matches `correct_response`. */
    correct_message: {
      type: ParameterType.STRING,
      default: "Correct!",
    },
    /** Message shown when the response does not match `correct_response`. */
    incorrect_message: {
      type: ParameterType.STRING,
      default: "Incorrect!",
    },
    /** If true and `response_choices` is set, the trial will not end until a keyword is detected in the transcript. */
    require_keyword: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Milliseconds without any speech before showing a prompt to the participant. Only active when `require_keyword` is true. */
    keyword_timeout: {
      type: ParameterType.INT,
      default: 5000,
    },
    /** Toast message shown when `keyword_timeout` elapses without any speech. */
    keyword_prompt: {
      type: ParameterType.STRING,
      default: "Please say your answer",
    },
    /** Message shown briefly before the recording restarts when no keyword was detected. */
    keyword_retry_message: {
      type: ParameterType.STRING,
      default: "Please try again...",
    },
    /** If true, the audio stimulus is replayed before each retry attempt when `require_keyword` is true. Also updates `audio_onset_time` so that VAD-based RT is measured from the retry stimulus onset. */
    replay_on_retry: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
  data: {
    /** URL of the audio stimulus that was played. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /** Reaction time in milliseconds. Priority: (1) time from audio onset to done-button click, (2) time from audio onset to VAD-detected speech onset, (3) time from recording start to Whisper-detected speech onset (first chunk timestamp). The Whisper fallback uses recording start — not audio onset — so it stays correct across retry attempts when `require_keyword` is true. Null if no speech was detected and no button was clicked. */
    rt: {
      type: ParameterType.INT,
    },
    /** Base64-encoded audio data, or the filename if `local_download` is true. */
    response: {
      type: ParameterType.STRING,
    },
    /** Time from trial start to when the audio stimulus began playing, in milliseconds. */
    audio_onset: {
      type: ParameterType.INT,
    },
    /** Time from audio onset to first detected speech, in milliseconds (voice onset time). Null if no speech was detected. */
    estimated_speech_onset: {
      type: ParameterType.INT,
    },
    /** Time from audio onset to first silence after detected speech, in milliseconds. Null if no speech was detected. */
    estimated_speech_offset: {
      type: ParameterType.INT,
    },
    /** Object URL of the recorded audio, if `save_audio_url` is true. */
    audio_url: {
      type: ParameterType.STRING,
    },
    /** Full transcript text returned by Whisper, if `transcription` is true. */
    transcript: {
      type: ParameterType.STRING,
    },
    /** Word-level timestamp chunks returned by Whisper. */
    transcript_chunks: {
      type: ParameterType.COMPLEX,
    },
    /** Whether the transcript matched `correct_response`. Null if `correct_response` was not set. */
    correct: {
      type: ParameterType.BOOL,
    },
    /** The first word from `response_choices` found in the transcript. Null if not set or no match found. */
    detected_response: {
      type: ParameterType.STRING,
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * **plugin-audio-response**
 *
 * Plays an audio stimulus and records the participant's spoken response via microphone.
 * Uses voice activity detection (VAD) to end the trial automatically after a configurable
 * silence duration following detected speech.
 *
 * Two recording modes are available via `recording_start`:
 * - `"audio_end"` (default): recording begins after the stimulus finishes playing. Safe for
 *   speaker setups; use when you don't need to measure voice onset time.
 * - `"audio_start"`: recording begins when the stimulus starts playing. Enables voice onset
 *   time (VOT) measurement as `estimated_speech_onset` (time from audio onset to first speech).
 *   Requires headphones to prevent the stimulus from being captured by the microphone.
 *
 * Optionally transcribes the recording using the Whisper model, enabling correctness scoring,
 * keyword detection, and participant feedback.
 *
 * Requires `@jspsych/plugin-initialize-microphone` earlier in the timeline.
 *
 * !!! warning
 *     Microphone access requires `https://` protocol. `file://` and `http://` will not work.
 */
class AudioResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  private recorder: MediaRecorder;
  private audio_url: string;
  private response: string;
  private load_resolver: () => void;
  private rt: number = null;

  private start_event_handler: (e: Event) => void;
  private stop_event_handler: () => void;
  private data_available_handler: (e: BlobEvent) => void;
  private recorded_data_chunks: Blob[] = [];

  private processorNode: AudioWorkletNode | null = null;
  private started_speaking = false;
  private silence_timer = null;
  private speech_start_time: number | null = null;
  private speech_end_time: number | null = null;
  private audio_data: Blob;

  private transcript: string = null;
  private transcript_chunks: any = null;
  private correct: boolean = null;
  private detected_response: string = null;

  private no_speech_timer = null;

  /** performance.now() timestamp captured at the start of trial(). Used to compute audio_onset. */
  private trial_start_time: number;

  /** performance.now() timestamp when the audio stimulus began playing. Used for VOT calculation. */
  private audio_onset_time: number | null = null;

  /** performance.now() timestamp when the recorder started. Used to compute rt. */
  private recorder_start_time_perf: number;

  /**
   * Guards the silence-end logic in audio_start mode.
   * False until the audio stimulus finishes, preventing pre-response silence from ending the trial.
   */
  private vad_armed = true;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.trial_start_time = performance.now();

    if (trial.transcription) {
      getTranscriber().catch(() => {});
    }

    this.recorder = this.jsPsych.pluginAPI.getMicrophoneRecorder();
    this.setupRecordingEvents(display_element, trial);

    const audio = new Audio(trial.stimulus as string);

    if (trial.recording_start === "audio_end") {
      this.vad_armed = true;
      this.showDisplay(display_element, trial, false);

      audio.addEventListener("play", () => {
        this.audio_onset_time = performance.now();
      });
      audio.addEventListener("ended", () => {
        this.showDisplay(display_element, trial, true);
        this.detectSpeech(trial, display_element);
        this.startRecording();
      });
      audio.play().catch((err) => {
        console.error("[plugin-audio-response] Audio play failed:", err);
        this.audio_onset_time = performance.now();
        this.showDisplay(display_element, trial, true);
        this.detectSpeech(trial, display_element);
        this.startRecording();
      });
    } else {
      // audio_start: record and detect speech from the moment audio plays
      this.vad_armed = false;
      this.detectSpeech(trial, display_element);
      this.startRecording();

      audio.addEventListener("play", () => {
        this.audio_onset_time = performance.now();
      });
      audio.addEventListener("ended", () => {
        // Reset speech state so that only post-stimulus speech triggers trial end.
        // This prevents the stimulus itself (if picked up by mic) from gating the trial.
        this.started_speaking = false;
        this.speech_start_time = null;
        this.speech_end_time = null;
        this.vad_armed = true;
        this.showDisplay(display_element, trial, true);
      });
      audio.play().catch((err) => {
        console.error("[plugin-audio-response] Audio play failed:", err);
        this.audio_onset_time = this.audio_onset_time ?? performance.now();
        this.vad_armed = true;
        this.showDisplay(display_element, trial, true);
      });

      this.showDisplay(display_element, trial, false);
    }
  }

  /**
   * Renders the trial display. In the waiting state (before recording is active) a
   * "listening…" indicator is shown. Once recording is active the done button appears
   * (if enabled) and the prompt is visible.
   */
  private showDisplay(
    display_element: HTMLElement,
    trial: TrialType<Info>,
    recording_active: boolean
  ) {
    let html = "";

    if (trial.prompt !== null) {
      html += `<div id="jspsych-audio-response-prompt">${trial.prompt}</div>`;
    }

    if (!recording_active) {
      html += `<div id="jspsych-audio-response-status" style="text-align:center; margin-top:24px; color:#555; font-size:18px;">▶ Playing stimulus…</div>`;
    } else {
      html += `<div id="jspsych-audio-response-status" style="text-align:center; margin-top:24px; color:#555; font-size:18px;">🎙 Listening…</div>`;
      if (trial.show_done_button) {
        html += `<p><button class="jspsych-btn" id="finish-trial">${trial.done_button_label}</button></p>`;
      }
    }

    display_element.innerHTML = html;

    if (recording_active && trial.show_done_button) {
      display_element.querySelector("#finish-trial").addEventListener("click", () => {
        this.rt = Math.round(
          performance.now() - (this.audio_onset_time ?? this.recorder_start_time_perf)
        );
        this.stopRecording().then(() => this.afterStopRecording(trial, display_element));
      });
    }
  }

  private setupRecordingEvents(display_element: HTMLElement, trial: TrialType<Info>) {
    this.data_available_handler = (e: BlobEvent) => {
      if (e.data.size > 0) {
        this.recorded_data_chunks.push(e.data);
      }
    };

    this.stop_event_handler = () => {
      const mimeType = this.recorded_data_chunks[0]?.type ?? "audio/webm";
      const data = new Blob(this.recorded_data_chunks, { type: mimeType });
      this.audio_data = data;
      this.audio_url = URL.createObjectURL(data);
      if (trial.local_download) {
        const link = document.createElement("a");
        link.href = this.audio_url;
        const filename = `${trial.download_file_name}-${Date.now()}.wav`;
        link.download = filename;
        link.click();
        this.response = filename;
        this.load_resolver();
      } else {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          const base64 = (reader.result as string).split(",")[1];
          this.response = base64;
          this.load_resolver();
        });
        reader.readAsDataURL(data);
      }
    };

    this.start_event_handler = (e: Event) => {
      this.recorded_data_chunks.length = 0;
      this.recorder_start_time_perf = performance.now();

      if (trial.recording_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          if (this.recorder.state !== "inactive") {
            this.stopRecording().then(() => this.afterStopRecording(trial, display_element));
          }
        }, trial.recording_duration);
      }

      if (trial.require_keyword && trial.response_choices !== null) {
        this.no_speech_timer = setTimeout(() => {
          if (!this.started_speaking) {
            const toast = document.createElement("div");
            toast.style.cssText =
              "position:fixed; bottom:32px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.75); color:#fff; padding:12px 28px; border-radius:8px; font-size:20px; z-index:9999;";
            toast.textContent = trial.keyword_prompt;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          }
        }, trial.keyword_timeout);
      }
    };

    this.recorder.addEventListener("dataavailable", this.data_available_handler);
    this.recorder.addEventListener("stop", this.stop_event_handler);
    this.recorder.addEventListener("start", this.start_event_handler);
  }

  private startRecording() {
    this.recorder.start();
  }

  private stopRecording(): Promise<void> {
    this.recorder.stop();
    return new Promise((resolve) => {
      this.load_resolver = resolve as () => void;
    });
  }

  private onVadLevel(
    trial: TrialType<Info>,
    display_element: HTMLElement,
    event: MessageEvent,
    resolve: () => void
  ) {
    if (event.data.cmd === "speech") {
      if (!this.speech_start_time) {
        this.speech_start_time = event.timeStamp;
      }
      this.started_speaking = true;
      if (this.no_speech_timer) {
        clearTimeout(this.no_speech_timer);
        this.no_speech_timer = null;
      }
      if (this.silence_timer) {
        clearTimeout(this.silence_timer);
        this.silence_timer = null;
      }
    } else if (event.data.cmd === "silence" && this.started_speaking && this.vad_armed) {
      if (!this.speech_end_time) {
        this.speech_end_time = event.timeStamp;
      }
      this.silence_timer = this.jsPsych.pluginAPI.setTimeout(() => {
        this.onStoppedSpeaking(trial, display_element);
        this.jsPsych.pluginAPI.clearAllTimeouts();
        resolve();
      }, trial.silence_threshold);
    }
  }

  private setupPortOnMessage(trial: TrialType<Info>, display_element: HTMLElement) {
    return new Promise<void>((resolve) => {
      this.processorNode!.port.onmessage = (event: MessageEvent) => {
        if ("data" in event && "cmd" in event.data) {
          this.onVadLevel(trial, display_element, event, resolve);
        }
      };
    });
  }

  private createConnectProcessor(
    audioContext: AudioContext,
    microphone: MediaStreamAudioSourceNode
  ) {
    return new Promise<void>((resolve) => {
      this.processorNode = new AudioWorkletNode(audioContext, "vad", {
        outputChannelCount: [1],
        processorOptions: {
          sampleRate: audioContext.sampleRate,
          fftSize: 128,
        },
      });
      microphone.connect(this.processorNode).connect(audioContext.destination);
      resolve();
    });
  }

  private detectSpeech = async (trial: TrialType<Info>, display_element: HTMLElement) => {
    const stream = this.jsPsych.pluginAPI.getMicrophoneRecorder().stream;
    if (!stream) {
      throw new Error("[plugin-audio-response] No microphone stream available.");
    }
    const audioContext = new AudioContext();
    const microphone = audioContext.createMediaStreamSource(stream);
    try {
      // Load the VAD worklet from an inlined Blob URL so the plugin is
      // self-contained and does not require the worklet files to be served from
      // a particular path on the host.
      const workletUrl = URL.createObjectURL(
        new Blob([vadWorkletSource], { type: "application/javascript" })
      );
      try {
        await audioContext.audioWorklet.addModule(workletUrl);
      } finally {
        URL.revokeObjectURL(workletUrl);
      }
      await this.createConnectProcessor(audioContext, microphone);
      await this.setupPortOnMessage(trial, display_element);
    } catch (err) {
      throw new Error(`[plugin-audio-response] Error loading VAD worklet: ${err}`);
    }
  };

  private onStoppedSpeaking(trial: TrialType<Info>, display_element: HTMLElement) {
    this.stopRecording().then(() => this.afterStopRecording(trial, display_element));
  }

  private showPlaybackControls(display_element: HTMLElement, trial: TrialType<Info>) {
    display_element.innerHTML = `
      <p><audio id="playback" src="${this.audio_url}" controls></audio></p>
      <button id="record-again" class="jspsych-btn">${trial.record_again_button_label}</button>
      <button id="continue" class="jspsych-btn">${trial.accept_button_label}</button>
    `;
    display_element.querySelector("#record-again").addEventListener("click", () => {
      URL.revokeObjectURL(this.audio_url);
      this.startRecording();
    });
    display_element.querySelector("#continue").addEventListener("click", () => {
      this.endTrial(display_element, trial);
    });
  }

  private endTrial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.recorder.removeEventListener("dataavailable", this.data_available_handler);
    this.recorder.removeEventListener("start", this.start_event_handler);
    this.recorder.removeEventListener("stop", this.stop_event_handler);

    const ref = this.audio_onset_time ?? this.recorder_start_time_perf;
    const estimated_speech_onset =
      this.speech_start_time !== null ? Math.round(this.speech_start_time - ref) : null;

    // Priority: button-click time → VAD onset → Whisper-derived onset → null.
    // Whisper timestamps are seconds from the start of the recording that produced
    // the successful response, so they measure RT from the retry phase start rather
    // than from the original audio onset. This keeps RT meaningful when require_keyword
    // causes multiple recording attempts.
    let rt: number | null = this.rt;
    if (rt === null) {
      if (estimated_speech_onset !== null) {
        rt = estimated_speech_onset;
      } else if (
        this.transcript_chunks?.length > 0 &&
        this.transcript_chunks[0].timestamp?.[0] != null
      ) {
        rt = Math.round(this.transcript_chunks[0].timestamp[0] * 1000);
      }
    }

    const trial_data: any = {
      stimulus: trial.stimulus,
      rt: rt,
      response: this.response,
      audio_onset: Math.round((this.audio_onset_time ?? ref) - this.trial_start_time),
      estimated_speech_onset: estimated_speech_onset,
      estimated_speech_offset:
        this.speech_end_time !== null ? Math.round(this.speech_end_time - ref) : null,
      transcript: this.transcript,
      transcript_chunks: this.transcript_chunks,
      correct: this.correct,
      detected_response: this.detected_response,
    };

    if (trial.save_audio_url) {
      trial_data.audio_url = this.audio_url;
    } else {
      URL.revokeObjectURL(this.audio_url);
    }

    this.jsPsych.finishTrial(trial_data);
  }

  private async afterStopRecording(trial: TrialType<Info>, display_element: HTMLElement) {
    this.jsPsych.pluginAPI.clearAllTimeouts();
    this.processorNode?.port.postMessage({ stopped_speaking: true });

    if (trial.transcription) {
      display_element.innerHTML = `
        <style>
          .loader {
            width: 48px; height: 48px;
            border: 5px solid black;
            border-bottom-color: transparent;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
          }
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <div style="text-align:center; margin-top:100px;">
          <span class="loader"></span>
        </div>
      `;
      try {
        const result = await transcribeBlob(this.audio_data);
        this.transcript = result.text;
        this.transcript_chunks = result.chunks;

        if (trial.response_choices !== null) {
          const words = this.transcript
            .toLowerCase()
            .replace(/[^a-z\s]/g, "")
            .split(/\s+/);
          const choices: string[] = trial.response_choices.map((c: string) => c.toLowerCase());
          this.detected_response = words.find((w) => choices.includes(w)) ?? null;
        }

        if (trial.correct_response !== null) {
          const correctList: string[] = Array.isArray(trial.correct_response)
            ? trial.correct_response.map((s: string) => s.toLowerCase())
            : [trial.correct_response.toLowerCase()];

          if (trial.response_choices !== null) {
            if (this.detected_response !== null) {
              this.correct = correctList.includes(this.detected_response);
            } else {
              // Keyword not found in response_choices — fall back to checking the transcript
              // directly against correct_response (e.g. participant said "dogs" which is a
              // correct variant but wasn't listed in response_choices).
              const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
              const match = correctList.find((r) => norm(this.transcript).includes(norm(r)));
              if (match !== undefined) {
                this.detected_response = match;
                this.correct = true;
              } else {
                this.correct = false;
              }
            }
          } else {
            const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
            this.correct = correctList.some((r) => norm(this.transcript).includes(norm(r)));
          }
        }
      } catch (err) {
        console.error("[plugin-audio-response] transcription failed:", err);
      }

      if (
        trial.require_keyword &&
        trial.response_choices !== null &&
        this.detected_response === null
      ) {
        display_element.innerHTML = `<p style="text-align:center; margin-top:100px; font-size:24px;">${trial.keyword_retry_message}</p>`;
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        this.started_speaking = false;
        this.speech_start_time = null;
        this.speech_end_time = null;
        this.transcript = null;
        this.transcript_chunks = null;
        this.detected_response = null;
        this.correct = null;
        this.vad_armed = true;

        if (trial.replay_on_retry) {
          this.showDisplay(display_element, trial, false);
          const retry_audio = new Audio(trial.stimulus as string);
          retry_audio.addEventListener("play", () => {
            this.audio_onset_time = performance.now();
          });
          retry_audio.addEventListener("ended", () => {
            this.showDisplay(display_element, trial, true);
            this.startRecording();
          });
          retry_audio.play().catch(() => {
            this.audio_onset_time = performance.now();
            this.showDisplay(display_element, trial, true);
            this.startRecording();
          });
        } else {
          this.startRecording();
          this.showDisplay(display_element, trial, true);
        }
        return;
      }
    }

    if (trial.show_feedback && this.correct !== null) {
      const message = this.correct ? trial.correct_message : trial.incorrect_message;
      const color = this.correct ? "green" : "red";
      display_element.innerHTML = `<p style="text-align:center; margin-top:100px; font-size:48px; color:${color};">${message}</p>`;
      await new Promise<void>((resolve) => setTimeout(resolve, trial.feedback_duration));
    }

    if (trial.allow_playback) {
      this.showPlaybackControls(display_element, trial);
    } else {
      this.endTrial(display_element, trial);
    }
  }
}

export default AudioResponsePlugin;
