import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "free-recall-response",
  version: version,
  parameters: {
    /** Prompt/instruction text shown above the input */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: "<p>Type the words you remember, one at a time.</p>",
    },
    /** Label for the add word button */
    add_button_label: {
      type: ParameterType.STRING,
      default: "Add",
    },
    /** Label for the done button */
    done_button_label: {
      type: ParameterType.STRING,
      default: "Done",
    },
    /** Placeholder text for the input field */
    placeholder: {
      type: ParameterType.STRING,
      default: "Type a word...",
    },
    /** Minimum number of words before done button is enabled (0 = always enabled) */
    minimum_words: {
      type: ParameterType.INT,
      default: 0,
    },
    /** Maximum time allowed for recall in ms (null = unlimited) */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** Label for words list header */
    words_list_label: {
      type: ParameterType.STRING,
      default: "Words recalled:",
    },
    /** CSS class for the container to allow custom styling */
    css_classes: {
      type: ParameterType.STRING,
      default: "",
    },
  },
  data: {
    /** Array of recalled words with timing. Each entry has {word: string, rt: number} */
    responses: {
      type: ParameterType.COMPLEX,
      nested: {
        word: { type: ParameterType.STRING },
        rt: { type: ParameterType.INT },
      },
      array: true,
    },
    /** Total time from trial start to completion */
    rt: {
      type: ParameterType.INT,
    },
  },
  citations: "__CITATIONS__",
};

type Info = typeof info;

/**
 * **free-recall-response**
 *
 * A plugin for collecting free recall responses one word at a time.
 * Optimized for mobile devices with touch-friendly buttons and
 * proper virtual keyboard handling.
 *
 * @author Josh de Leeuw
 * @see {@link https://github.com/jspsych/jspsych-contrib/packages/plugin-free-recall-response/README.md}
 */
class FreeRecallResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const startTime = performance.now();
    const responses: Array<{ word: string; rt: number }> = [];

    // Build the HTML
    const html = `
      <div class="free-recall-container ${trial.css_classes}" style="
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      ">
        <div class="free-recall-prompt" style="margin-bottom: 20px;">
          ${trial.prompt}
        </div>

        <div class="free-recall-input-row" style="
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        ">
          <input
            type="text"
            id="free-recall-input"
            class="free-recall-input"
            placeholder="${trial.placeholder}"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            style="
              flex: 1;
              max-width: 250px;
              padding: 12px 16px;
              font-size: 18px;
              border: 2px solid #ccc;
              border-radius: 8px;
              outline: none;
              text-transform: uppercase;
            "
          />
          <button
            type="button"
            id="free-recall-add-btn"
            class="jspsych-btn free-recall-add-btn"
            style="
              padding: 12px 24px;
              font-size: 18px;
              min-width: 80px;
            "
          >${trial.add_button_label}</button>
        </div>

        <div class="free-recall-words-container" style="
          min-height: 100px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
          text-align: left;
        ">
          <div class="free-recall-words-label" style="
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          ">${trial.words_list_label}</div>
          <div id="free-recall-words-list" class="free-recall-words-list" style="
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          "></div>
        </div>

        <button
          type="button"
          id="free-recall-done-btn"
          class="jspsych-btn free-recall-done-btn"
          style="
            padding: 14px 40px;
            font-size: 18px;
            min-width: 120px;
          "
          ${trial.minimum_words > 0 ? "disabled" : ""}
        >${trial.done_button_label}</button>
      </div>
    `;

    display_element.innerHTML = html;

    // Get element references
    const input = display_element.querySelector<HTMLInputElement>("#free-recall-input")!;
    const addBtn = display_element.querySelector<HTMLButtonElement>("#free-recall-add-btn")!;
    const doneBtn = display_element.querySelector<HTMLButtonElement>("#free-recall-done-btn")!;
    const wordsList = display_element.querySelector<HTMLDivElement>("#free-recall-words-list")!;

    // Focus input on start
    setTimeout(() => input.focus(), 100);

    // Update the words list display
    const updateWordsList = () => {
      wordsList.innerHTML = responses
        .map(
          (r) => `
          <span style="
            background: #fff;
            border: 1px solid #ddd;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 16px;
          ">${r.word}</span>
        `
        )
        .join("");

      // Update done button state
      if (trial.minimum_words > 0) {
        doneBtn.disabled = responses.length < trial.minimum_words;
      }
    };

    // Add word function
    const addWord = () => {
      const word = input.value.trim().toUpperCase();
      if (word.length > 0) {
        const rt = Math.round(performance.now() - startTime);
        responses.push({ word, rt });
        updateWordsList();
        input.value = "";
        // Keep focus on input for next word
        input.focus();
      }
    };

    // End trial function
    const endTrial = () => {
      const endTime = performance.now();
      const rt = Math.round(endTime - startTime);

      // Clear display
      display_element.innerHTML = "";

      // Save data and end trial
      this.jsPsych.finishTrial({
        responses: responses,
        rt: rt,
      });
    };

    // Event listeners
    addBtn.addEventListener("click", addWord);

    // Handle Enter key to add word
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addWord();
      }
    });

    doneBtn.addEventListener("click", endTrial);

    // Handle trial duration timeout
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(endTrial, trial.trial_duration);
    }
  }
}

export default FreeRecallResponsePlugin;
