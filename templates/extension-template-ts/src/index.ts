import { JsPsych, JsPsychExtension, JsPsychExtensionInfo, ParameterType } from "jspsych";

import { version } from "../package.json";

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
    version: version,
    data: {
      /** Provide a clear description of the data1 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
      data1: {
        type: ParameterType.INT,
      },
      /** Provide a clear description of the data2 that could be used as documentation. We will eventually use these comments to automatically build documentation and produce metadata. */
      data2: {
        type: ParameterType.STRING,
      },
    },
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
      data1: 99, // Make sure this type and name matches data1
      data2: "hello world!", // Make this this type and name matches data2
    };
  };
}

export default ExtensionNameExtension;
