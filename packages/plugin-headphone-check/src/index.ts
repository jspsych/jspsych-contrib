import autobind from "auto-bind";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { AudioPlayerInterface } from "jspsych/src/modules/plugin-api/AudioPlayer";

import { version } from "../package.json";

const info = <const>{
  name: "headphone-check",
  version: version,
  parameters: {
    /** The list of tones that will be played. */
    stimuli: {
      type: ParameterType.AUDIO,
      default: undefined,
      array: true,
    },
    /** The list of correct answers, corresponding to each tone. Each number in the array is between 1-3,
     * corresponding to the first, second, and third being the correct response. */
    correct: {
      type: ParameterType.INT,
      default: undefined,
      array: true,
    },
    /** Number of trials that will be played. */
    total_trials: {
      type: ParameterType.INT,
      default: 6,
    },
    /** Threshold of correct trials needed to pass the headphone screening. */
    threshold: {
      type: ParameterType.INT,
      default: 5,
    },
    /** Number of trials that are rendered on a single page. Must be a factor of `total_trials` so each page gets their own equal set of trials. */
    trials_per_page: {
      type: ParameterType.INT,
      default: 3,
    },
    /** An HTML-formatted string presented to the participant above the audio questions. */
    prompt: {
      type: ParameterType.HTML_STRING,
      default:
        "<p>Listen to the following sounds and select which option is quietest. <br> Click the play button to listen to the sound, and select the correct option. <br> Test sounds can only be played once!</p>",
    },
    /** A 3 element array containing the labels of the three radio buttons. */
    labels: {
      type: ParameterType.STRING,
      array: true,
      default: ["FIRST sound is SOFTEST", "SECOND sound is SOFTEST", "THIRD sound is SOFTEST"],
    },
    /** The label of the play button. Will be used for calibration as well if enabled. */
    play_button_label: {
      type: ParameterType.STRING,
      default: "Play",
    },
    /** The label of the continue button. Will be used for calibration as well if enabled. */
    continue_button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** If true, each stimulus must be played and completed from first to last. */
    sequential: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If true, the trials will be shuffled before being displayed to the participant. */
    shuffle: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, on shuffle, the trials will be shuffled with replacement, meaning some trials may contain duplicates. */
    sample_with_replacement: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If true, a calibration sound will be played to allow the participant to adjust their volume. */
    calibration: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** The audio file that will be played for calibration. */
    calibration_stimulus: {
      type: ParameterType.AUDIO,
      default: null,
    },
    /** A function taking in the current amount of calibration attempts, which acts to present this info
     * along with a stimulus to the participant above the calibration button. */
    calibration_prompt: {
      type: ParameterType.FUNCTION,
      default: function (calibration_counter: number) {
        return `<p>Calibrating Volume: Press the play button below to play a sound. <br> Adjust the volume of the sound to a comfortable level, and click continue when you are ready. <br> You have ${calibration_counter} calibration attempts remaining.</p>`;
      },
    },
    /** The amount of times the user may play the calibration sound. */
    calibration_attempts: {
      type: ParameterType.INT,
      default: 3,
    },
  },
  data: {
    /** If the participant passed the headphone screen. */
    did_pass: {
      type: ParameterType.BOOL,
    },
    /** Total number of correct responses. */
    total_correct: {
      type: ParameterType.INT,
    },
    /** An array of objects indicating what the headphone check stimulus was, which option the participant selected, and if it was correct. */
    responses: {
      type: ParameterType.COMPLEX,
      array: true,
      nested: {
        /** Filepath of the stimulus object. */
        stimulus: {
          type: ParameterType.STRING,
        },
        /** The option the participant selected, from 1-3. */
        response: {
          type: ParameterType.INT,
        },
        /** If the participant's response was correct. */
        correct: {
          type: ParameterType.BOOL,
        },
      },
    },
  },
};

type Info = typeof info;

/**
 * **headphone-check**
 *
 * Allows for one to check if a participant is wearing headphones using an auditory task.
 *
 * @author jadeddelta (jade)
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-headphone-check/README.md}}
 */
class HeadphoneCheckPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private params: TrialType<Info>;
  private container: HTMLElement;
  private trialData: {
    did_pass: boolean;
    total_correct: number;
    responses: {
      stimulus: string;
      response: number;
      correct: boolean;
    }[];
  };

  private calibrationPlayButton: HTMLButtonElement;
  private calibrationContinueButton: HTMLButtonElement;
  private calibrationAudioResource: AudioPlayerInterface;
  private calibrationCounter: number;

  private trialResources: {
    fieldset: HTMLFieldSetElement;
    audioResource: AudioPlayerInterface;
    page: number;
    alreadyPlayed: boolean;
  }[];
  private trialContinueButton: HTMLButtonElement;
  private stimuliList: string[];
  private correctList: number[];

  private currentPage: number;

  private css: string =
    `<style id="jspsych-headphone-check-css">` +
    `.jspsych-headphone-check-box {display: flex; flex-direction: column; justify-content: center; align-items: center;}` +
    `.jspsych-headphone-check-fieldset {display: flex; flex-direction: row;}` +
    `.jspsych-headphone-check-fieldset-container {display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px;}` +
    `</style>`;

  private trialComplete: (trial_data) => void;

  constructor(private jsPsych: JsPsych) {
    autobind(this);
  }

  async trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    this.params = trial;
    this.container = display_element;
    this.container.innerHTML = this.css;
    this.trialResources = [];
    this.stimuliList = trial.stimuli;
    this.correctList = trial.correct;
    this.trialData = {
      did_pass: null,
      total_correct: 0,
      responses: [],
    };

    this.calibrationCounter = this.params.calibration_attempts;
    this.currentPage = 0;

    await this.setupParameters();

    on_load();

    if (trial.calibration) {
      await this.beginCalibration();
    } else {
      await this.beginCheck();
    }

    return new Promise((resolve) => {
      this.trialComplete = resolve;
    });
  }

  /** throws errors/warns developer if any trial parameters are invalid to prevent unwanted behaviors,
   * then handles the setup of default parameters. */
  private async setupParameters() {
    // Trial parameter verification
    if (this.params.total_trials < 5)
      console.warn(
        "Warning from HeadphoneCheckPlugin: The total number of trials is less than 5, and the test may be highly inaccurate."
      );
    if (this.params.threshold / this.params.total_trials < 0.8)
      console.warn(
        "Warning from HeadphoneCheckPlugin: The threshold is less than 80% of the total trials, and the test may produce more false positives."
      );
    if (this.params.total_trials % this.params.trials_per_page !== 0)
      throw new Error(
        "Error from HeadphoneCheckPlugin: The number of trials per page is not a factor of the total trials."
      );

    // Test parameter verification
    if (this.params.labels.length !== 3)
      throw new Error("Error from HeadphoneCheckPlugin: The number of labels are not equal to 3.");
    if (this.params.stimuli.length !== this.params.correct.length)
      throw new Error(
        "Error from HeadphoneCheckPlugin: The number of stimuli and correct answers are not equal."
      );

    // Calibration parameter verification
    if (this.params.calibration && !this.params.calibration_stimulus)
      throw new Error(
        "Error from HeadphoneCheckPlugin: Calibration is enabled, but no calibration stimulus was provided."
      );

    // shuffle stimuli
    this.stimuliList = this.params.stimuli;
    this.correctList = this.params.correct;
    if (this.params.shuffle) {
      if (this.params.sample_with_replacement) {
        this.stimuliList = this.jsPsych.randomization.sampleWithReplacement(
          this.stimuliList,
          this.params.total_trials
        );
        this.correctList = this.jsPsych.randomization.sampleWithReplacement(
          this.correctList,
          this.params.total_trials
        );
      } else {
        var shuffled = this.jsPsych.randomization.shuffle([
          ...Array(this.params.total_trials).keys(),
        ]);
        this.stimuliList = shuffled.map((i) => this.params.stimuli[i]);
        this.correctList = shuffled.map((i) => this.params.correct[i]);
      }
    }

    // instantiate trial resources
    for (const [stimuliIndex, stimuli] of this.stimuliList.entries()) {
      var fieldset = document.createElement("fieldset");
      fieldset.id = `jspsych-headphone-check-fieldset-${stimuliIndex}`;
      fieldset.className = "jspsych-headphone-check-fieldset";

      var audioRes = await this.jsPsych.pluginAPI.getAudioPlayer(stimuli);
      audioRes.addEventListener("ended", this.handleCheckAudioEnd(audioRes, fieldset));

      var play = document.createElement("button");
      play.id = `jspsych-headphone-check-play-${stimuliIndex}`;
      play.className = "jspsych-btn";
      play.style.alignSelf = "center";
      play.innerHTML = this.params.play_button_label;
      play.addEventListener("click", this.handleCheckPlay(audioRes, fieldset));
      fieldset.appendChild(play);

      var box = document.createElement("div");
      box.id = `jspsych-headphone-check-box-${stimuliIndex}`;
      box.className = `jspsych-headphone-check-box`;
      fieldset.appendChild(box);

      for (const [labelIndex, label] of this.params.labels.entries()) {
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `jspsych-headphone-check-radio-${stimuliIndex}`;
        radio.id = `jspsych-headphone-check-radio-${stimuliIndex}-${labelIndex}`;
        radio.value = labelIndex.toString();

        var radioLabel = document.createElement("label");
        radioLabel.setAttribute("for", radio.id);
        radioLabel.innerHTML = label;

        var radioBox = document.createElement("div");
        radioBox.id = `jspsych-headphone-check-radio-box-${stimuliIndex}`;

        radioBox.appendChild(radio);
        radioBox.appendChild(radioLabel);

        box.appendChild(radioBox);
      }

      this.trialResources.push({
        fieldset: fieldset,
        audioResource: audioRes,
        page: Math.floor(stimuliIndex / this.params.trials_per_page),
        alreadyPlayed: false,
      });
    }

    var continueButton = document.createElement("button");
    continueButton.id = `jspsych-headphone-check-continue`;
    continueButton.className = "jspsych-btn";
    continueButton.innerHTML = this.params.continue_button_label;
    continueButton.addEventListener("click", this.handleCheckContinue);

    this.trialContinueButton = continueButton;
  }

  // -- calibration --

  /** displays the calibration screen, this function will get replayed for each new calibration request
   * up to the amount of calibration attempts. */
  private async beginCalibration() {
    // regenerate the audio player
    this.calibrationAudioResource = await this.jsPsych.pluginAPI.getAudioPlayer(
      this.params.calibration_stimulus
    );

    this.calibrationAudioResource.addEventListener("ended", this.handleCalibrationAudioEnd);

    // check non-null calibration prompt
    if (this.params.calibration_prompt !== null) {
      this.container.insertAdjacentHTML(
        "beforeend",
        this.params.calibration_prompt(this.calibrationCounter)
      );
    }

    // calibration play button html
    this.calibrationPlayButton = document.createElement("button");
    this.calibrationPlayButton.id = "jspsych-headphone-check-play-calibration";
    this.calibrationPlayButton.className = "jspsych-btn";
    this.calibrationPlayButton.innerHTML = this.params.play_button_label;
    this.calibrationPlayButton.addEventListener("click", this.handleCalibrationPlay);

    // calibration continue button html
    this.calibrationContinueButton = document.createElement("button");
    this.calibrationContinueButton.id = "jspsych-headphone-check-continue-calibration";
    this.calibrationContinueButton.className = "jspsych-btn";
    // if equal, then we know the participant hasn't used a calibration attempt yet
    if (this.calibrationCounter === this.params.calibration_attempts) {
      this.calibrationContinueButton.setAttribute("disabled", "disabled");
    }
    this.calibrationContinueButton.innerHTML = this.params.continue_button_label;
    this.calibrationContinueButton.addEventListener("click", this.setupCheck);

    this.container.appendChild(this.calibrationPlayButton);
    this.container.appendChild(this.calibrationContinueButton);
  }

  /** disables the play button to prevent multiple clicks, and logs a calibration attempt. */
  private handleCalibrationPlay() {
    this.calibrationCounter--;

    this.calibrationPlayButton.setAttribute("disabled", "disabled");
    this.calibrationAudioResource.play();
  }

  /** finished up with play, reinstate new calibration attempt. */
  private handleCalibrationAudioEnd() {
    this.calibrationAudioResource.stop();
    this.cleanupCalibration();
    this.beginCalibration();
  }

  /** clear display and event listeners */
  private cleanupCalibration() {
    this.calibrationAudioResource.removeEventListener("ended", this.handleCalibrationAudioEnd);
    this.container.innerHTML = this.css;
  }

  // -- trial --

  /** begin headphone check from calibration */
  private async setupCheck() {
    this.cleanupCalibration();
    this.beginCheck();
  }

  /** rest of headphone check- similar to calibration this will get re-called */
  private async beginCheck() {
    const currentResources = this.getCurrentResources();

    // reset display
    this.container.innerHTML = "";
    this.container.insertAdjacentHTML("beforeend", this.css);
    this.container.insertAdjacentHTML("beforeend", this.params.prompt);

    var fieldsetContainer = document.createElement("div");
    fieldsetContainer.className = "jspsych-headphone-check-fieldset-container";
    for (const resource of currentResources) {
      fieldsetContainer.appendChild(resource.fieldset);
    }
    this.container.appendChild(fieldsetContainer);

    this.container.appendChild(this.trialContinueButton);
  }

  /** play the audio and disable all other controls to allow participant to focus on the audio. */
  private handleCheckPlay(audio: AudioPlayerInterface, fieldset: HTMLFieldSetElement) {
    return () => {
      audio.play();
      var playButton = document.querySelector(`#${fieldset.id} button`);
      playButton.setAttribute("disabled", "disabled");

      var fieldsets = document.querySelectorAll(`.${fieldset.className}`);
      fieldsets.forEach((fieldset) => {
        fieldset.setAttribute("disabled", "disabled");
      });
    };
  }

  /** cleanup audio resource, enable everything else */
  private handleCheckAudioEnd(audio: AudioPlayerInterface, fieldset: HTMLFieldSetElement) {
    return () => {
      audio.removeEventListener("ended", this.handleCheckAudioEnd(audio, fieldset));

      var fieldsets = document.querySelectorAll(`.${fieldset.className}`);
      fieldsets.forEach((fieldset) => {
        fieldset.removeAttribute("disabled");
      });
    };
  }

  /** if there's more pages, instantiate another test- otherwise we are ending the trial. */
  private async handleCheckContinue() {
    if (!this.checkData()) {
      return;
    }
    this.saveData();
    this.currentPage++;
    var currentResources = this.getCurrentResources();
    if (currentResources.length === 0) {
      this.endTrial();
    } else {
      await this.beginCheck();
    }
  }

  /** checks for and highlights fieldsets that the participant has not responded to */
  private checkData(): boolean {
    var isValidData = true;

    var currentResources = this.getCurrentResources();
    for (var i = 0; i < currentResources.length; i++) {
      var fieldset = currentResources[i].fieldset;
      var radioButtons = fieldset.querySelectorAll("input[type='radio']");
      var selected = Array.from(radioButtons).find((radio) => (radio as HTMLInputElement).checked);
      if (!selected) {
        isValidData = false;
        fieldset.style.border = "2px solid red";
      } else {
        fieldset.style.border = "";
      }
    }

    return isValidData;
  }

  /** saves the data for the current page */
  private saveData() {
    var currentResources = this.getCurrentResources();
    for (var i = 0; i < currentResources.length; i++) {
      var absoluteIndex = this.currentPage * this.params.trials_per_page + i;
      var radioButtons = currentResources[i].fieldset.querySelectorAll("input[type='radio']");
      var selected = Array.from(radioButtons).find((radio) => (radio as HTMLInputElement).checked);
      if (selected) {
        var selectedValue = parseInt((selected as HTMLInputElement).value);
        var correctValue = this.correctList[absoluteIndex] - 1;
        var correct = selectedValue === correctValue;
        this.trialData.total_correct += correct ? 1 : 0;
        this.trialData.responses.push({
          stimulus: this.stimuliList[absoluteIndex],
          response: selectedValue + 1,
          correct: correct,
        });
      }
    }
  }

  /** gets the resources for the current page */
  private getCurrentResources(): {
    fieldset: HTMLFieldSetElement;
    audioResource: AudioPlayerInterface;
    page: number;
    alreadyPlayed: boolean;
  }[] {
    return this.trialResources.filter((resource) => resource.page === this.currentPage);
  }

  private endTrial() {
    this.trialData.did_pass = this.trialData.total_correct >= this.params.threshold;

    this.jsPsych.finishTrial(this.trialData);
  }
}

export default HeadphoneCheckPlugin;
