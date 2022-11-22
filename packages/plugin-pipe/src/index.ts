import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "pipe",
  parameters: {
    experiment_id: {
      type: ParameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    filename: {
      type: ParameterType.STRING,
      default: undefined,
    },
    data: {
      type: ParameterType.STRING,
      default: undefined,
    },
  },
};

type Info = typeof info;

/**
 * **jsPsychPipe**
 *
 * This plugin facilitates communication with Pipe My Data (https://pipe.jspsych.org), a tool for
 * sending data from jsPsych experiments to the OSF (https://osf.io/).
 *
 * @author Josh de Leeuw
 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
 */
class PipePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.run(display_element, trial);
  }

  private async run(display_element: HTMLElement, trial: TrialType<Info>) {
    // show circular progress bar
    const progressCSS = `
      .spinner {
        animation: rotate 2s linear infinite;
        z-index: 2;
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -25px 0 0 -25px;
        width: 50px;
        height: 50px;
        
        & .path {
          stroke: rgb(25,25,25);
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }
        
      }
      
      @keyframes rotate {
        100% {
          transform: rotate(360deg);
        }
      }
      
      @keyframes dash {
        0% {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -35;
        }
        100% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -124;
        }
      }
    `;

    const progressHTML = `
    <style>${progressCSS}</style>
    <svg class="spinner" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>`;

    display_element.innerHTML = progressHTML;

    const result = await this.sendDataToPipe(trial.experiment_id, trial.filename, trial.data);

    display_element.innerHTML = "";

    // data saving
    var trial_data = {
      result: result,
    };

    // end trial
    this.jsPsych.finishTrial(trial_data);
  }

  private async sendDataToPipe(expID: string, filename: string, data: string) {
    let response: Response;
    try {
      response = await fetch("https://pipe.jspsych.org/api/data/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          experimentID: expID,
          filename: filename,
          data: data,
        }),
      });
    } catch (error) {
      return error;
    }
    return await response.json();
  }
}

export default PipePlugin;
