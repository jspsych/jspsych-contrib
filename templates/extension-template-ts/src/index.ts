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
      /** This comment will be scraped as metadata for data_name when running the metadata module.  */
      data_name: {
        type: ParameterType.INT,
      },
      /** This comment will be scraped as metadata for data_name2 when running the metadata module.  */
      data_name2: {
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
      data_name: 99, // Make sure this type and name matches data_name
      data_name2: "hello world!", // Make this this type and name matches data_name2
    };
  };
}

export default ExtensionNameExtension;
