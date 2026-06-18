import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "plugin-video-text-response",
  version: version,
  parameters: {
    // --- Video display & playback ---
    /**
     * An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm)
     * to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats).
     * Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use the
     * first source file in the array that is compatible with the browser, so specify the files in order of preference.
     */
    stimulus: {
      type: ParameterType.VIDEO,
      default: undefined,
      array: true,
    },
    /** The width of the video in pixels. */
    width: {
      type: ParameterType.INT,
      default: null,
    },
    /** The height of the video in pixels. */
    height: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, the video begins playing as soon as it has loaded. */
    autoplay: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, the native HTML5 video controls (play/pause, seek bar, volume, etc.) are shown.
     * This allows the participant to scrub the video. Defaults to false so that only the custom
     * Pause/Resume button and/or keyboard shortcut are available. */
    controls: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * If true, a custom Pause/Resume button is displayed below the video. Native HTML5 video controls (which include
     * a seek bar) are intentionally never used, so the participant can pause/resume but cannot scrub or change the
     * playback position.
     */
    show_pause_button: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * A key that toggles pause/resume when pressed, in addition to (or instead of) `show_pause_button`. Defaults to
     * the spacebar. Set to null to disable keyboard pausing entirely.
     */
    pause_key: {
      type: ParameterType.KEY,
      default: " ",
    },
    /** Time, in seconds, to start the clip. If null, the video starts at the beginning. */
    start: {
      type: ParameterType.FLOAT,
      default: null,
    },
    /** Time, in seconds, to stop the clip. If null, the video plays to the end. */
    stop: {
      type: ParameterType.FLOAT,
      default: null,
    },
    /** The playback rate of the video. 1 is normal speed. */
    rate: {
      type: ParameterType.FLOAT,
      default: 1,
    },
    /** If true, the trial ends automatically as soon as the video finishes playing. */
    trial_ends_after_video: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** The maximum time, in milliseconds, to wait for a response before ending the trial. If null, there is no deadline. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** HTML content (e.g. instructions) displayed below the video and above the text response box. */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    // --- Text response & timing controls ---
    /**
     * If false (default), the response box and submit button are only enabled while the video is paused: each pause
     * opens a new response window, and submitting closes it again until the next pause. If true, the box stays
     * enabled continuously regardless of play/pause state.
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** How long, in milliseconds, after the *first* response window would open before the text box and submit button are actually enabled. Useful for enforcing a minimum viewing/think time before the participant can respond at all. Later response windows (subsequent pauses) are not delayed. */
    enable_response_after: {
      type: ParameterType.INT,
      default: 0,
    },
    /** Placeholder text shown in the empty text response box. */
    placeholder: {
      type: ParameterType.STRING,
      default: "",
    },
    /** The number of visible text rows in the response box. */
    rows: {
      type: ParameterType.INT,
      default: 1,
    },
    /** Label displayed on the submit button. */
    button_label: {
      type: ParameterType.STRING,
      default: "submit",
    },
    /** If true, blocks submission of an empty or whitespace-only response. */
    required: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If false, number characters (0-9) are stripped/blocked from the response box. */
    allow_numbers: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If false, letter characters are stripped/blocked from the response box. */
    allow_letters: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If false, symbol/punctuation characters are stripped/blocked from the response box. */
    allow_symbols: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, previously submitted responses are displayed on screen (e.g. as a running list) during the trial. */
    show_response_history: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Maximum number of past responses to show in the history list at one time. When the limit
     * is reached, the oldest entry is removed as each new one is added, keeping only the most
     * recent N responses visible. If null (default), all responses are shown. Only applies when
     * `show_response_history` is true. */
    response_history_limit: {
      type: ParameterType.INT,
      default: null,
    },
    /**
     * Only applies when `response_allowed_while_playing` is false (gated mode). If true
     * (default), submitting a response closes the response box — the participant must resume
     * the video and pause again to submit another. If false, the box clears and stays open
     * after each submission, allowing multiple responses within the same pause before resuming.
     */
    one_response_per_pause: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, the trial ends as soon as the participant submits a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, a button is shown below the response box that ends the trial when clicked. */
    show_done_button: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Label for the done button. Only applies when `show_done_button` is true. */
    done_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** HTML content displayed below the done button (e.g. instructions for what happens next).
     * Only applies when `show_done_button` is true. */
    done_prompt: {
      type: ParameterType.HTML_STRING,
      default: "",
    },
  },
  data: {
    /** The text entered by the participant for each response window, in submission order. One entry per pause-respond cycle. */
    response: {
      type: ParameterType.STRING,
      array: true,
    },
    /** Time, in milliseconds, from the start of the trial until each response was submitted. Same length and order as `response`. */
    rt: {
      type: ParameterType.INT,
      array: true,
    },
    /** Time, in milliseconds, from when each response window became enabled (i.e. the relevant pause) until that response was submitted. Isolates "thinking/typing" time from time spent watching the video. Same length and order as `response`. */
    response_duration: {
      type: ParameterType.INT,
      array: true,
    },
    /** The video's playback position (in seconds, matching `video.currentTime`) at the moment each response was submitted. In gated mode the video is still paused at this point, so this directly tells you which part of the video each response refers to. Same length and order as `response`. */
    response_video_time: {
      type: ParameterType.FLOAT,
      array: true,
    },
    /** The video file(s) that were displayed during the trial. */
    stimulus: {
      type: ParameterType.STRING,
      array: true,
    },
    /** For each pause, the video's playback position (in seconds, matching `video.currentTime`) at the moment it was paused. One entry per pause, in chronological order — independent of whether that pause led to a submitted response. */
    pause_video_time: {
      type: ParameterType.FLOAT,
      array: true,
    },
    /** For each pause, how long it lasted, in milliseconds, from the pause event to the next resume (or to the end of the trial, if the trial ended while still paused). Same order as `pause_video_time`. */
    pause_duration: {
      type: ParameterType.INT,
      array: true,
    },
    /** The total elapsed time, in milliseconds, from the start of the trial to the end of the trial. */
    total_trial_time: {
      type: ParameterType.INT,
    },
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **plugin-video-text-response**
 *
 * This plugin plays a video and records responses to a text box
 * that can be set to appear either only when the video is paused or continuously while the video is playing.
 * It also tracks the timing of pauses and responses, and can optionally display a history of submitted responses during the trial.
 *
 * The trial can be ended automatically when the video finishes or after a specified time limit,
 * and there are various options for controlling allowed characters in the response and enforcing a minimum viewing time before responses can be submitted.
 *
 * Video files can be automatically preloaded using the [`preload` plugin](preload.md).
 *
 * @author Gabriel Fajardo, Xinyi Guan
 * @see {@link https://github.com/fajardgb/plugin-video-text-response/blob/main/README.md}}
 */
class VideoTextResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // inject minimal default styling once per page, so the plugin renders reasonably without
    // requiring a separate CSS file to be loaded
    if (!document.getElementById("jspsych-video-text-response-css")) {
      const style = document.createElement("style");
      style.id = "jspsych-video-text-response-css";
      style.textContent = `
        #jspsych-video-text-response-pause {
          margin: 10px 0;
        }
        #jspsych-video-text-response-wrapper {
          margin-top: 10px;
        }
        #jspsych-video-text-response-textbox {
          display: block;
          width: 100%;
          max-width: 500px;
          margin: 0 auto 8px auto;
          font-family: inherit;
          font-size: 14px;
          padding: 6px;
          box-sizing: border-box;
        }
        #jspsych-video-text-response-history {
          max-width: 500px;
          margin: 0 auto 10px auto;
          text-align: left;
        }
        .jspsych-video-text-response-history-item {
          padding: 4px 8px;
          margin-bottom: 4px;
          background: #f0f0f0;
          border-radius: 4px;
        }
      `;
      document.head.appendChild(style);
    }

    const trial_start_time = performance.now();

    // ----- pause-tracking state -----
    // pause_video_time/pause_duration are logged per pause event, independent of whether a
    // response is ever submitted during that pause.
    const pause_video_time: number[] = [];
    const pause_duration: number[] = [];
    let pause_start_time: number | null = null;

    // ----- response-tracking state -----
    // One entry per submitted response (i.e. per pause-respond cycle, or per continuous
    // submission if response_allowed_while_playing is true).
    const responses: string[] = [];
    const rts: number[] = [];
    // null if a response is somehow submitted with no open window (shouldn't normally happen,
    // since the submit button is disabled whenever response_window_start is null)
    const response_durations: (number | null)[] = [];
    const response_video_times: number[] = [];
    // performance.now() timestamp marking when the currently-open response window started
    // (null when the response box is closed/disabled).
    let response_window_start: number | null = null;
    // Whether the very first response window has been opened yet, so enable_response_after
    // only delays that first window and not every subsequent pause.
    let first_window_opened = false;

    // True once the video is actually showing/playing for real. Used to ignore the synthetic
    // pause()/play() calls made internally by the `start` time workaround below, so they don't
    // get logged as participant-initiated pauses.
    let setup_complete = trial.start === null;
    // True once end_trial() has run. Guards against double-finishing and against any
    // asynchronously-queued pause/play events doing anything after the trial is already over.
    let trial_ended = false;

    // ----- video element -----
    const stimulusWrapper = document.createElement("div");
    display_element.appendChild(stimulusWrapper);

    const videoElement = document.createElement("video");
    stimulusWrapper.appendChild(videoElement);
    videoElement.id = "jspsych-video-text-response-stimulus";

    if (trial.width) {
      videoElement.width = trial.width;
    }
    if (trial.height) {
      videoElement.height = trial.height;
    }

    videoElement.controls = trial.controls;

    // if autoplay is true and the start time is specified, then the video will start automatically
    // via the play() method, rather than the autoplay attribute, to prevent showing the first frame
    videoElement.autoplay = trial.autoplay && trial.start == null;

    if (trial.start !== null) {
      // hide video element when page loads if the start time is specified,
      // to prevent the video element from showing the first frame
      videoElement.style.visibility = "hidden";
    }

    const videoPreloadBlob = this.jsPsych.pluginAPI.getVideoBuffer(trial.stimulus[0]);
    if (!videoPreloadBlob) {
      for (let filename of trial.stimulus) {
        if (filename.indexOf("?") > -1) {
          filename = filename.substring(0, filename.indexOf("?"));
        }
        const type = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        if (type === "mov") {
          console.warn("Warning: video-text-response plugin does not reliably support .mov files.");
        }

        const sourceElement = document.createElement("source");
        sourceElement.src = filename;
        sourceElement.type = "video/" + type;
        videoElement.appendChild(sourceElement);
      }
    }

    if (videoPreloadBlob) {
      videoElement.src = videoPreloadBlob;
    }

    videoElement.playbackRate = trial.rate;

    // if video start time is specified, hide the video and set the starting time
    // before showing and playing, so that the video doesn't automatically show the first frame
    if (trial.start !== null) {
      videoElement.pause();
      videoElement.onseeked = () => {
        videoElement.style.visibility = "visible";
        videoElement.muted = false;
        if (trial.autoplay) {
          videoElement.play();
        } else {
          videoElement.pause();
        }
        videoElement.onseeked = () => {};
        setup_complete = true;
      };
      videoElement.onplaying = () => {
        videoElement.currentTime = trial.start;
        videoElement.onplaying = () => {};
      };
      // fix for iOS/MacOS browsers: videos aren't seekable until they start playing, so need to hide/mute, play,
      // change current time, then show/unmute
      videoElement.muted = true;
      videoElement.play();
    }

    // pause the video once it reaches the stop time, if one was specified
    let stopped_at_boundary = false;
    if (trial.stop !== null) {
      videoElement.addEventListener("timeupdate", () => {
        if (videoElement.currentTime >= trial.stop && !stopped_at_boundary) {
          // guard against this firing more than once in quick succession before pause() takes effect
          stopped_at_boundary = true;
          videoElement.pause();
          if (trial.trial_ends_after_video) {
            // .pause() alone won't fire the native "ended" event (only reaching the actual end
            // of the file does), so if `stop` cuts the video short we have to end the trial here
            end_trial();
          }
        }
      });
    }

    videoElement.onended = () => {
      if (trial.trial_ends_after_video) {
        end_trial();
      }
    };

    // ----- custom pause/resume button -----
    let pauseButton: HTMLButtonElement | null = null;
    if (trial.show_pause_button) {
      pauseButton = document.createElement("button");
      pauseButton.id = "jspsych-video-text-response-pause";
      pauseButton.className = "jspsych-btn";
      pauseButton.textContent = "Pause";
      display_element.appendChild(pauseButton);
    }

    const toggle_pause = () => {
      if (videoElement.paused) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    };

    if (pauseButton) {
      pauseButton.addEventListener("click", toggle_pause);
    }

    // ----- response box -----
    const responseWrapper = document.createElement("div");
    responseWrapper.id = "jspsych-video-text-response-wrapper";
    display_element.appendChild(responseWrapper);

    let historyList: HTMLElement | null = null;
    if (trial.show_response_history) {
      historyList = document.createElement("div");
      historyList.id = "jspsych-video-text-response-history";
      responseWrapper.appendChild(historyList);
    }

    const textbox = document.createElement("textarea");
    textbox.id = "jspsych-video-text-response-textbox";
    textbox.rows = trial.rows;
    textbox.placeholder = trial.placeholder;
    textbox.disabled = true;
    responseWrapper.appendChild(textbox);

    const submitButton = document.createElement("button");
    submitButton.id = "jspsych-video-text-response-submit";
    submitButton.className = "jspsych-btn";
    submitButton.textContent = trial.button_label;
    submitButton.disabled = true;
    responseWrapper.appendChild(submitButton);

    let doneButton: HTMLButtonElement | null = null;
    if (trial.show_done_button) {
      doneButton = document.createElement("button");
      doneButton.id = "jspsych-video-text-response-done";
      doneButton.className = "jspsych-btn";
      doneButton.textContent = trial.done_button_label;
      display_element.appendChild(doneButton);
      if (trial.done_prompt !== "") {
        display_element.insertAdjacentHTML("beforeend", trial.done_prompt);
      }
    }

    // strips disallowed character classes from a candidate textbox value
    const filter_value = (value: string): string => {
      let result = value;
      if (!trial.allow_numbers) {
        result = result.replace(/[0-9]/g, "");
      }
      if (!trial.allow_letters) {
        result = result.replace(/[a-zA-Z]/g, "");
      }
      if (!trial.allow_symbols) {
        // keep letters, numbers, and whitespace; strip everything else
        result = result.replace(/[^a-zA-Z0-9\s]/g, "");
      }
      return result;
    };

    textbox.addEventListener("input", () => {
      const filtered = filter_value(textbox.value);
      if (filtered !== textbox.value) {
        textbox.value = filtered;
      }
    });

    const enable_textbox = () => {
      textbox.disabled = false;
      submitButton.disabled = false;
      textbox.focus();
    };

    const disable_textbox = () => {
      textbox.disabled = true;
      submitButton.disabled = true;
    };

    // opens a new response window: clears the box, marks the start time, and enables it
    // (respecting enable_response_after on the very first window only)
    const start_response_window = () => {
      textbox.value = "";
      response_window_start = performance.now();
      if (!first_window_opened) {
        first_window_opened = true;
        if (trial.enable_response_after > 0) {
          disable_textbox();
          this.jsPsych.pluginAPI.setTimeout(() => {
            // don't enable if the window was already closed again in the meantime
            if (response_window_start !== null) {
              enable_textbox();
            }
          }, trial.enable_response_after);
          return;
        }
      }
      enable_textbox();
    };

    const close_response_window = () => {
      textbox.value = "";
      disable_textbox();
      response_window_start = null;
    };

    const submit_response = () => {
      if (textbox.disabled) {
        return;
      }
      const text = textbox.value;
      if (trial.required && text.trim().length === 0) {
        return;
      }

      const now = performance.now();
      responses.push(text);
      rts.push(Math.round(now - trial_start_time));
      response_durations.push(
        response_window_start !== null ? Math.round(now - response_window_start) : null
      );
      response_video_times.push(videoElement.currentTime);
      textbox.value = "";

      if (trial.response_ends_trial) {
        end_trial();
        return;
      }

      if (historyList) {
        const item = document.createElement("div");
        item.classList.add("jspsych-video-text-response-history-item");
        item.textContent = text;
        historyList.appendChild(item);
        // trim oldest entries once we exceed the limit
        if (trial.response_history_limit !== null) {
          while (historyList.children.length > trial.response_history_limit) {
            historyList.removeChild(historyList.firstChild);
          }
        }
      }

      if (trial.response_allowed_while_playing || !trial.one_response_per_pause) {
        // continuous mode, or gated mode with multiple responses per pause allowed:
        // clear and reopen the box immediately for another response
        start_response_window();
      } else {
        // gated mode, one response per pause: close the box until the next pause
        close_response_window();
      }
    };

    submitButton.addEventListener("click", submit_response);

    // ----- native pause/play events drive all pause tracking, regardless of cause -----
    // (button click, spacebar, or the video reaching its `stop` time all end up calling
    // videoElement.pause()/play(), so listening here is the single source of truth)
    videoElement.addEventListener("pause", () => {
      if (!setup_complete || trial_ended || videoElement.ended) {
        return;
      }
      pause_start_time = performance.now();
      pause_video_time.push(videoElement.currentTime);
      if (pauseButton) {
        pauseButton.textContent = "Resume";
      }
      if (!trial.response_allowed_while_playing) {
        start_response_window();
      }
    });

    videoElement.addEventListener("play", () => {
      if (!setup_complete || trial_ended) {
        return;
      }
      if (pause_start_time !== null) {
        pause_duration.push(Math.round(performance.now() - pause_start_time));
        pause_start_time = null;
      }
      if (pauseButton) {
        pauseButton.textContent = "Pause";
      }
      if (!trial.response_allowed_while_playing) {
        close_response_window();
      }
    });

    // in continuous mode, the response window is open for the entire trial (re-opened after
    // each submission above), so start it immediately rather than waiting for a pause
    if (trial.response_allowed_while_playing) {
      start_response_window();
    }

    // ----- keyboard shortcut to pause/resume -----
    let pause_key_listener: ((e: KeyboardEvent) => void) | null = null;
    if (trial.pause_key !== null) {
      pause_key_listener = (e: KeyboardEvent) => {
        // don't intercept the key if the participant is typing in the response box
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
          return;
        }
        if (this.jsPsych.pluginAPI.compareKeys(e.key, trial.pause_key)) {
          e.preventDefault();
          toggle_pause();
        }
      };
      document.addEventListener("keydown", pause_key_listener);
    }

    // Show prompt if there is one
    if (trial.prompt !== null) {
      display_element.insertAdjacentHTML("beforeend", trial.prompt);
    }

    // function to end trial when it is time
    const end_trial = () => {
      if (trial_ended) {
        return;
      }
      trial_ended = true;

      // cancel any pending timeouts (trial_duration, enable_response_after) so they can't fire
      // after the trial has already ended
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // stop the video file if it is playing, and remove any remaining event handlers
      videoElement.pause();
      videoElement.onended = () => {};
      if (pause_key_listener) {
        document.removeEventListener("keydown", pause_key_listener);
      }

      // if the trial ends while still paused, close out the in-progress pause duration
      if (pause_start_time !== null) {
        pause_duration.push(Math.round(performance.now() - pause_start_time));
        pause_start_time = null;
      }

      const total_trial_time = Math.round(performance.now() - trial_start_time);

      // gather the data to store for the trial
      const trial_data = {
        response: responses,
        rt: rts,
        response_duration: response_durations,
        response_video_time: response_video_times,
        stimulus: trial.stimulus,
        pause_video_time,
        pause_duration,
        total_trial_time,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    if (doneButton) {
      doneButton.addEventListener("click", end_trial);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }
}

export default VideoTextResponsePlugin;
