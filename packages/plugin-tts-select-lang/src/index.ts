import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

//TODO: change this to @jspsych-contrib/extension-tts when publishing
import type TtsExtension from "../../extension-tts/src/index.ts";
import { version } from "../package.json";

const info = <const>{
  name: "plugin-tts-select-lang",
  version: version,
  parameters: {
    /**
     * The prompt to be displayed above the language selection menu.
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /**
     * A language code to filter the available languages. If `null`, all available languages will be shown at the start.
     */
    filtered_language: {
      type: ParameterType.STRING,
      default: null,
    },
    /**
     * The text to display for the "all voices" option in the language selection menu.
     */
    all_voices_text: {
      type: ParameterType.STRING,
      default: "all voices",
    },
    /**
     * If a default voice is available, show it by default without requiring user selection.
     * Otherwise, the first voice in the list will be shown.
     */
    show_default: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * This will format the data of the SpeechSynthesisVoice to a string that will be put into the
     * HTML for the drop-down menu.
     */
    format_voice_option: {
      type: ParameterType.FUNCTION,
      default: (voice: SpeechSynthesisVoice) => {
        return `${voice.name} (${voice.lang}) ${voice.default ? "[default]" : ""}`;
      },
    },
    /**
     * The default sentence to be spoken in the demo utterance.
     */
    default_sentence: {
      type: ParameterType.STRING,
      default: undefined,
    },
    /**
     * If true, the demo utterance will be locked to `default_sentence`'s value. If false,
     * the participant is able to modify the sentence as they choose.
     */
    lock_sentence: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * The text that appears next to the sentence input box.
     */
    sentence_label: {
      type: ParameterType.STRING,
      default: "Enter here:",
    },
    /**
     * The text for the button to play the demo utterance.
     */
    utterance_button_text: {
      type: ParameterType.STRING,
      default: "Play",
    },
    /**
     * The text for the button to confirm language selection.
     */
    select_button_text: {
      type: ParameterType.STRING,
      default: "Select",
    },
    /**
     * The text for the button to skip language selection.
     */
    skip_button_text: {
      type: ParameterType.STRING,
      default: "Skip",
    },
    /**
     * If true, the participant will be required to select a language before proceeding,
     * and will not display the skip button. If false, the participant may skip.
     */
    force_selection: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
  data: {
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus
     * first began playing until the participant made a key response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The given voiceURI of the selected voice. */
    voice_uri: {
      type: ParameterType.STRING,
    },
    /** The given language of the selected voice. */
    language: {
      type: ParameterType.STRING,
    },
    /** The given name of the selected voice. */
    voice_name: {
      type: ParameterType.STRING,
    },
  },
};

type Info = typeof info;

/**
 * **plugin-tts-select-lang**
 *
 * this plugin enables `extension-tts` to function by selecting a language, offering paritcipants the ability to pick a language and demo the voice.
 *
 * @author jade
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-tts-select-lang/README.md}}
 */
class TtsSelectLangPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  filterVoiceList() {
    const voiceDropdown = document.getElementById(
      "jspsych-tts-select-lang-voice-dropdown"
    ) as HTMLSelectElement;
    const languageDropdown = document.getElementById(
      "jspsych-tts-select-lang-language-dropdown"
    ) as HTMLSelectElement;

    const selectedLang = languageDropdown.value;

    for (let i = 0; i < voiceDropdown.options.length; i++) {
      const option = voiceDropdown.options[i];
      const optionLang = option.getAttribute("data-lang");

      if (selectedLang === "all" || optionLang === selectedLang) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    }
  }

  populateVoiceList(trial: TrialType<Info>) {
    const synth = window.speechSynthesis;

    const voiceDropdown = document.getElementById(
      "jspsych-tts-select-lang-voice-dropdown"
    ) as HTMLSelectElement;
    voiceDropdown.innerHTML = "";

    for (const voice of synth.getVoices()) {
      const option = document.createElement("option");
      option.innerHTML = trial.format_voice_option(voice);

      option.setAttribute("value", voice.voiceURI);
      option.setAttribute("data-lang", voice.lang);
      option.setAttribute("data-name", voice.name);
      voiceDropdown.appendChild(option);
    }
  }

  endTrial(startTime: number, skipped: boolean = false) {
    const extension = this.jsPsych.extensions.ttsExtension as TtsExtension;

    if (skipped) {
      const data = {
        rt: Math.round(performance.now() - startTime),
        voice_uri: null,
        language: null,
        voice_name: null,
      };
      this.jsPsych.finishTrial(data);
    } else {
      const data = {
        rt: Math.round(performance.now() - startTime),
        voice_uri: (
          document.getElementById("jspsych-tts-select-lang-voice-dropdown") as HTMLSelectElement
        ).value,
        language: (
          document.getElementById("jspsych-tts-select-lang-voice-dropdown") as HTMLSelectElement
        ).selectedOptions[0].getAttribute("data-lang"),
        voice_name: (
          document.getElementById("jspsych-tts-select-lang-voice-dropdown") as HTMLSelectElement
        ).selectedOptions[0].getAttribute("data-name"),
      };

      this.jsPsych.finishTrial(data);
    }
  }

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const synth = window.speechSynthesis;

    if (trial.prompt !== null) {
      const prompt_div = document.createElement("div");
      prompt_div.innerHTML = trial.prompt;
      prompt_div.setAttribute("id", "jspsych-tts-select-lang-prompt");
      display_element.appendChild(prompt_div);
    }

    // container for all of it
    const form = document.createElement("div");
    form.setAttribute("id", "jspsych-tts-select-lang-stimulus");
    display_element.appendChild(form);

    // sentence input field
    const inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", "jspsych-tts-select-lang-sentence-container");
    form.appendChild(inputContainer);

    const sentenceLabel = document.createElement("label");
    sentenceLabel.setAttribute("for", "jspsych-tts-select-lang-sentence-input");
    sentenceLabel.innerText = trial.sentence_label + " ";
    inputContainer.appendChild(sentenceLabel);

    let sentenceInput: HTMLElement;
    if (trial.lock_sentence) {
      sentenceInput = document.createElement("p");
      sentenceInput.innerText = trial.default_sentence;
      sentenceInput.setAttribute("id", "jspsych-tts-select-lang-sentence-input");
      inputContainer.appendChild(sentenceInput);
    } else {
      sentenceInput = document.createElement("input");
      sentenceInput.setAttribute("type", "text");
      sentenceInput.setAttribute("id", "jspsych-tts-select-lang-sentence-input");
      sentenceInput.setAttribute("value", trial.default_sentence);
      inputContainer.appendChild(sentenceInput);
    }

    const playButton = document.createElement("button");
    playButton.setAttribute("id", "jspsych-tts-select-lang-play-button");
    playButton.setAttribute("class", "jspsych-btn");
    playButton.innerText = trial.utterance_button_text;
    inputContainer.appendChild(playButton);

    playButton.onclick = (e) => {
      e.preventDefault();

      const text = (
        document.getElementById("jspsych-tts-select-lang-sentence-input") as HTMLInputElement
      ).value;
      const voiceURI = (
        form.querySelector("#jspsych-tts-select-lang-voice-dropdown") as HTMLSelectElement
      ).value;
      const selectedVoice = synth.getVoices().find((v) => v.voiceURI === voiceURI);

      if (selectedVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        synth.speak(utterance);
      }
    };

    // voice and language dropdowns
    const voiceSelectContainer = document.createElement("div");
    voiceSelectContainer.setAttribute("class", "jspsych-tts-select-lang-voice-select-container");
    form.appendChild(voiceSelectContainer);

    const voiceDropdown = document.createElement("select");
    voiceDropdown.setAttribute("id", "jspsych-tts-select-lang-voice-dropdown");
    voiceSelectContainer.appendChild(voiceDropdown);

    const languageDropdown = document.createElement("select");
    languageDropdown.setAttribute("id", "jspsych-tts-select-lang-language-dropdown");
    voiceSelectContainer.appendChild(languageDropdown);

    // populate language dropdown
    const allOption = document.createElement("option");
    allOption.setAttribute("value", "all");
    allOption.innerText = trial.all_voices_text;
    languageDropdown.appendChild(allOption);
    const languages = new Set<string>();
    for (const voice of synth.getVoices()) {
      languages.add(voice.lang);
    }
    languages.forEach((lang) => {
      const option = document.createElement("option");
      option.setAttribute("value", lang);
      option.innerText = lang;
      languageDropdown.appendChild(option);
    });

    languageDropdown.onchange = () => {
      this.filterVoiceList();
    };

    this.populateVoiceList(trial);

    // buttons to select or skip
    const buttonContainer = document.createElement("div");
    buttonContainer.setAttribute("id", "jspsych-tts-select-lang-button-container");
    buttonContainer.setAttribute("class", "jspsych-btn-group-flex");
    form.appendChild(buttonContainer);

    const selectButton = document.createElement("button");
    selectButton.setAttribute("id", "jspsych-tts-select-lang-select-button");
    selectButton.setAttribute("class", "jspsych-btn");
    selectButton.innerText = trial.select_button_text;
    buttonContainer.appendChild(selectButton);

    const startTime = performance.now();
    selectButton.onclick = (e) => {
      e.preventDefault();
      this.endTrial(startTime);
    };

    if (!trial.force_selection) {
      const skipButton = document.createElement("button");
      skipButton.setAttribute("id", "jspsych-tts-select-lang-skip-button");
      skipButton.setAttribute("class", "jspsych-btn");
      skipButton.innerText = trial.skip_button_text;
      buttonContainer.appendChild(skipButton);

      skipButton.onclick = (e) => {
        e.preventDefault();
        this.endTrial(startTime, true);
      };
    }

    const css = `
#jspsych-tts-select-lang-prompt {
  margin: 4rem 0;
}

#jspsych-tts-select-lang-stimulus {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

#jspsych-tts-select-lang-sentence-input {
  width: 40vw;
}

.jspsych-tts-select-lang-voice-select-container select {
  font-family: "Open Sans", "Arial", sans-serif;
  font-size: 14px;
  margin: 0 0.5rem;
}
`;

    display_element.insertAdjacentHTML("beforeend", `<style>${css}</style>`);
  }
}

export default TtsSelectLangPlugin;
