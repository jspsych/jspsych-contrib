import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

interface InitializeParameters {}

interface OnStartParameters {}

interface OnLoadParameters {}

interface OnFinishParameters {}

/**
 * **{name}**
 *
 * {description}
 *
 * @author {author}
 * @see {@link {documentation-url}}}
 */
class ExtensionNameExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "{name}",
  };

  constructor(private jsPsych: JsPsych) {}

  initialize = ({}: InitializeParameters): Promise<void> => {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  on_start = ({}: OnStartParameters): void => {};

  on_load = ({}: OnLoadParameters): void => {};

  on_finish = ({}: OnFinishParameters): { [key: string]: any } => {
    return {
      data_property: "data_value",
    };
  };
}

export default ExtensionNameExtension;
