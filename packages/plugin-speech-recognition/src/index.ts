import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

//import { pipeline, env } from '@xenova/transformers';
import { version } from "../package.json";

const info = <const>{
  name: "speech-recognition",
  version: version,
  parameters: {
    /** The HTML content to be displayed. */
    stimulus: {
      type: ParameterType.HTML_STRING,
      default: undefined,
    },
    /** The text that will be displayed underneath the stimulus. */
    prompt: {
      type: ParameterType.STRING,
      default: null,
    },
    /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** The maximum length of the recording, in milliseconds. The default value is 10000 (10 seconds) to recognize meaningul timestamps */
    recording_duration: {
      type: ParameterType.INT,
      default: 10000,
    },
    /** Whether to show a button on the screen that the participant can click to finish the recording. */
    show_done_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** The label for the done button. */
    done_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** The label for the record again button enabled when `allow_playback: true`.
     */
    record_again_button_label: {
      type: ParameterType.STRING,
      default: "Record again",
    },
    /** The label for the accept button enabled when `allow_playback: true`. */
    accept_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** Whether to allow the participant to listen to their recording and decide whether to rerecord or not. If `true`, then the participant will be shown an interface to play their recorded audio and click one of two buttons to either accept the recording or rerecord. If rerecord is selected, then stimulus will be shown again, as if the trial is starting again from the beginning. */
    allow_playback: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If `true`, then an [Object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) will be generated and stored for the recorded audio. Only set this to `true` if you plan to reuse the recorded audio later in the experiment, as it is a potentially memory-intensive feature. */
    save_audio_url: {
      type: ParameterType.BOOL,
      default: false,
    },
    // /** If false, a trial is used to cache the whisper-tiny ONNX model  */ Will probably switch on to make loading model more elegant.
    // is_initialized: {
    //   type: ParameterType.BOOL,
    //   default: false,
    // },
    /** Optional, if given returns response time for when the first utterance of the word occurs  */
    choices: {
      type: ParameterType.KEYS,
      default: undefined,
    },
    trial_duration: {
      type: ParameterType.INT,
      default: 10000,
    },
  },
  data: {
    /** Transcript of audio recognized during trial  */
    transcript: {
      type: ParameterType.STRING,
    },
    /** Timestamp of first word in choice uttered (Might consider changing to recognizing multiple timestamps for consecutive words)  */
    timestamp: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **speech-recognition**
 *
 * Plugin that uses whisper-tiny from Transformer.js to automatically convert speech to text.
 *
 * @author Niranjan Baskaran
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-speech-recognition/README.md}}
 */
class SpeechRecognitionPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private stimulus_start_time;
  private recorder_start_time;
  private recorder: MediaRecorder;
  private audio_url;
  private response;
  private load_resolver;
  private rt: number = null;
  private start_event_handler;
  private stop_event_handler;
  private data_available_handler;
  private recorded_data_chunks = [];
  private transcript: string;
  private params: TrialType<Info>;
  private timestamp: { [choice: string]: Array<number> };
  private trial_data: {
    rt: number;
    stimulus: string;
    response: string;
    estimated_stimulus_onset: number;
  };
  private trial_complete: (value?: unknown) => void;

  constructor(private jsPsych: JsPsych) {}

  async trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.params = trial;

    this.recorder = this.jsPsych.pluginAPI.getMicrophoneRecorder();

    this.setupRecordingEvents(display_element, trial);

    this.startRecording();

    return new Promise((resolve) => (this.trial_complete = resolve));
  }

  private showDisplay(display_element, trial) {
    const ro = new ResizeObserver((entries, observer) => {
      this.stimulus_start_time = performance.now();
      observer.unobserve(display_element);
      //observer.disconnect();
    });

    ro.observe(display_element);

    let html = `<div id="jspsych-html-audio-response-stimulus">${trial.stimulus}</div>`;

    if (trial.prompt !== null) {
      html += `<div id="jspsych-html-audio-response-prompt">${trial.prompt}</div>`;
    }

    if (trial.show_done_button) {
      html += `<p><button class="jspsych-btn" id="finish-trial">${trial.done_button_label}</button></p>`;
    }

    display_element.innerHTML = html;
  }

  private hideStimulus(display_element: HTMLElement) {
    const el: HTMLElement = display_element.querySelector("#jspsych-html-audio-response-stimulus");
    if (el) {
      el.style.visibility = "hidden";
    }
  }

  private addButtonEvent(display_element, trial) {
    const btn = display_element.querySelector("#finish-trial");
    if (btn) {
      btn.addEventListener("click", () => {
        const end_time = performance.now();
        this.rt = Math.round(end_time - this.stimulus_start_time);
        this.stopRecording().then(async () => {
          await this.getTranscript();
          if (trial.allow_playback) {
            this.showPlaybackControls(display_element, trial);
          } else {
            this.endTrial(display_element, trial);
          }
        });
      });
    }
  }

  private setupRecordingEvents(display_element, trial) {
    this.data_available_handler = (e) => {
      if (e.data.size > 0) {
        this.recorded_data_chunks.push(e.data);
        this.audio_url = URL.createObjectURL(e.data);
      }
    };

    this.stop_event_handler = async () => {
      const data = new Blob(this.recorded_data_chunks, { type: "audio/wav" });
      this.audio_url = URL.createObjectURL(data);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const base64 = (reader.result as string).split(",")[1];
        this.response = base64;
      });
      reader.readAsDataURL(data);
      this.load_resolver();
    };

    this.start_event_handler = (e) => {
      // resets the recorded data
      this.recorded_data_chunks.length = 0;

      this.recorder_start_time = e.timeStamp;
      this.showDisplay(display_element, trial);
      this.addButtonEvent(display_element, trial);

      // setup timer for hiding the stimulus
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.hideStimulus(display_element);
        }, trial.stimulus_duration);
      }

      // setup timer for ending the trial
      if (trial.recording_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          // this check is necessary for cases where the
          // done_button is clicked before the timer expires
          if (this.recorder.state !== "inactive") {
            this.stopRecording().then(async () => {
              await this.getTranscript();
              if (trial.allow_playback) {
                this.showPlaybackControls(display_element, trial);
              } else {
                this.endTrial(display_element, trial);
              }
            });
          }
        }, trial.recording_duration);
      }
    };

    this.recorder.addEventListener("dataavailable", this.data_available_handler);

    console.log("Setting up recorder");

    this.recorder.addEventListener("stop", this.stop_event_handler);

    this.recorder.addEventListener("start", this.start_event_handler);
  }

  private startRecording() {
    this.recorder.start();
  }

  private async stopRecording() {
    this.recorder.stop();

    return new Promise((resolve) => {
      this.load_resolver = resolve;
    });
  }

  private async getTranscript() {
    const out = await eval(`
      (async () => {
        const module = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
        let url = '${this.audio_url}';
        console.log('URL', url);
        let transcriber = await module.pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
        let output = await transcriber(url, { return_timestamps: 'word' });
        //console.log(output);
        return output; // Assigning value to the outer scope variable
      })();
    `);

    this.transcript = out["text"];
    for (const chunk of out["chunks"]) {
      for (const choice of this.params.choices) {
        console.log(chunk["text"]);
        if (chunk["text"].includes(choice)) {
          let timeObj;
          timeObj[choice.trim()] = chunk["timestamp"];
          this.timestamp = timeObj;
          break;
        }
      }
    }
  }

  private showPlaybackControls(display_element, trial) {
    display_element.innerHTML = `
      <p><audio id="playback" src="${this.audio_url}" controls></audio></p>
      <button id="record-again" class="jspsych-btn">${trial.record_again_button_label}</button>
      <button id="continue" class="jspsych-btn">${trial.accept_button_label}</button>
    `;

    display_element.querySelector("#record-again").addEventListener("click", () => {
      // release object url to save memory
      URL.revokeObjectURL(this.audio_url);
      this.startRecording();
    });
    display_element.querySelector("#continue").addEventListener("click", () => {
      this.endTrial(display_element, trial);
    });

    // const audio = display_element.querySelector('#playback');
    // audio.src =
  }

  private endTrial(display_element, trial) {
    // clear recordering event handler

    this.recorder.removeEventListener("dataavailable", this.data_available_handler);
    this.recorder.removeEventListener("start", this.start_event_handler);
    this.recorder.removeEventListener("stop", this.stop_event_handler);

    // kill any remaining setTimeout handlers
    this.jsPsych.pluginAPI.clearAllTimeouts();

    // gather the data to store for the trial
    var trial_data: any = {
      rt: this.rt,
      stimulus: trial.stimulus,
      response: this.response,
      estimated_stimulus_onset: Math.round(this.stimulus_start_time - this.recorder_start_time),
      transcript: this.transcript,
      timestamp: this.timestamp,
    };

    if (trial.save_audio_url) {
      trial_data.audio_url = this.audio_url;
    } else {
      URL.revokeObjectURL(this.audio_url);
    }

    // clear the display
    display_element.innerHTML = "";

    // move on to the next trial
    this.trial_complete(trial_data);
    //this.jsPsych.finishTrial(trial_data);
  }
}

export default SpeechRecognitionPlugin;
