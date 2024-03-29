import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "{name}",
  parameters: {
    parameter_name: {
      type: ParameterType.INT, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
    },
    parameter_name2: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
  },
};

type Info = typeof info;

/**
 * **{name}**
 *
 * {description}
 *
 * @author {author}
 * @see {@link {documentation-url}}}
 */
class PluginNamePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // data saving
    var trial_data = {
      parameter_name: "parameter value",
    };

    // end trial
    this.jsPsych.finishTrial(trial_data);
  }
}

export default PluginNamePlugin;
