import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

// The deployment every request goes to unless overridden.
//
// Made configurable because it had to be: nothing in this plugin could be
// exercised against DataPipe's test deployment while the URL was written into
// three fetch calls, which meant every change here was first tried in
// production against real researchers' experiments.
const DEFAULT_BASE_URL = "https://pipe.jspsych.org";
let baseURL = DEFAULT_BASE_URL;

/**
 * Strip any trailing slash so `${base}/api/data/` never doubles it.
 *
 * Deliberately a loop and not `url.replace(/\/+$/, "")`. CodeQL flags that
 * regex as js/polynomial-redos: in the general backtracking model, every
 * starting position in a run of slashes matches `/+` to the end and then
 * fails the anchor. V8 appears to optimise the anchored case -- a 60k-slash
 * string showed no measurable slowdown -- and nothing hostile reaches this
 * anyway, since the value is the researcher's own base_url and not
 * participant input. So this is not a fix for an observed problem. It is
 * here because the loop is provably linear, reads no worse, and costs less
 * than re-arguing the alert every time someone scans this package.
 */
function normalizeBaseURL(url: string): string {
  let end = url.length;
  while (end > 0 && url.charCodeAt(end - 1) === 47 /* "/" */) end--;
  return url.slice(0, end);
}

function endpoint(path: string, override?: string): string {
  return `${normalizeBaseURL(override || baseURL)}/api/${path}/`;
}

const info = <const>{
  name: "pipe",
  version: version,
  parameters: {
    /**
     * The 12-character experiment ID provided by pipe.jspsych.org.
     */
    experiment_id: {
      type: ParameterType.STRING,
      default: undefined,
    },
    /**
     * The action to take. Can be `"save"`, `"saveBase64"`, or `"condition"`.
     * If `"save"`, the data will be saved to the OSF.
     * If `"saveBase64"`, the data should be a base64-encoded string and will be decoded to binary before being saved to the OSF.
     * If `"condition"`, this will get the next condition for the experiment and save it in the data for this trial.
     */
    action: {
      type: ParameterType.STRING,
      default: undefined,
    },
    /**
     * Name of the file to create on the OSF. It should include the extension.
     * If the file already exists, no data will be saved.
     */
    filename: {
      type: ParameterType.STRING,
      default: null,
    },
    /**
     * A string-based representation of the data to save.
     *
     * To save JSON, you can use `()=>jsPsych.data.get().json()`.
     * To save CSV, you can use `()=>jsPsych.data.get().csv()`.
     *
     * The use of a function is necessary to get the updated data at
     * the time of saving.
     */
    data_string: {
      type: ParameterType.STRING,
      default: null,
    },
    /**
     * An HTML message to be displayed above the loading graphics in the experiment during data upload.
     */
    wait_message: {
      type: ParameterType.HTML_STRING,
      default: `<p>Saving data. Please do not close this page.</p>`,
    },
    /**
     * Whether to compress the request body using gzip before sending.
     * This allows uploading data that is larger than the server's 32 MB request
     * size limit, as long as the compressed size is under 32 MB. Text data
     * (JSON, CSV) typically compresses by 2-10x or more, so this effectively
     * raises the upload limit to 60-300+ MB for most experiment data.
     *
     * Compression uses the browser's built-in `CompressionStream` API, which
     * is supported in Chrome 80+, Edge 80+, Safari 16.4+, and Firefox 113+.
     * If the browser does not support `CompressionStream`, the data will be
     * sent uncompressed and a warning will be logged to the console.
     *
     * Set to `false` to disable compression and send data uncompressed.
     */
    compression: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * The DataPipe deployment to talk to. Defaults to
     * `https://pipe.jspsych.org`. Set this (or call
     * `jsPsychPipe.setBaseURL()`) to point an experiment at a test deployment.
     */
    base_url: {
      type: ParameterType.STRING,
      default: null,
    },
  },
  data: {
    /**
     * The response given upon sending the data, in the form of a JSON object.
     */
    result: {
      type: ParameterType.OBJECT,
      default: null,
    },
    /** Whether the action was successful. */
    success: {
      type: ParameterType.BOOL,
      default: null,
    },
  },
};

type Info = typeof info;

/**
 * Compress a string using the browser's CompressionStream API (gzip).
 * Returns a gzipped Blob, or null if CompressionStream is not supported.
 */
async function gzipCompress(data: string): Promise<Blob | null> {
  if (typeof CompressionStream === "undefined") {
    console.warn(
      "plugin-pipe: CompressionStream API is not supported in this browser. " +
        "Data will be sent uncompressed. Consider using a modern browser " +
        "(Chrome 80+, Edge 80+, Safari 16.4+, Firefox 113+) to enable compression."
    );
    return null;
  }

  const encoder = new TextEncoder();
  const stream = new Blob([encoder.encode(data)]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
  return new Response(compressedStream).blob();
}

/**
 * Did an action succeed?
 *
 * `result.error ? false : true` looked right and was wrong twice over:
 *
 *  - A NETWORK FAILURE READ AS SUCCESS. saveData and friends catch a failed
 *    fetch and return the thrown Error itself, and an Error has no `.error`
 *    property -- so a participant whose data never left the browser was
 *    recorded with `success: true`.
 *  - A CONDITION REFUSAL CRASHED THE TRIAL. getCondition returns
 *    `response.condition`, which is undefined when DataPipe answers with an
 *    error (condition assignment switched off, say), and `undefined.error`
 *    throws inside the trial -- which then never finishes, and the experiment
 *    hangs on the spinner.
 *
 * A number is a success (a condition, including condition 0). A 202 counts:
 * DataPipe answers `error: null` when it has queued the data for retry, and it
 * holds that copy durably.
 */
function isSuccessfulResult(result: unknown): boolean {
  if (result === undefined || result === null) return false;
  if (result instanceof Error) return false;
  if (typeof result === "object" && (result as { error?: unknown }).error) return false;
  return true;
}

/**
 * Send a POST request, optionally gzip-compressing the body.
 */
async function sendRequest(
  url: string,
  body: Record<string, unknown>,
  compress: boolean
): Promise<Response> {
  const jsonString = JSON.stringify(body);

  if (compress) {
    try {
      const compressed = await gzipCompress(jsonString);
      if (compressed) {
        return fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Encoding": "gzip",
            Accept: "*/*",
          },
          body: compressed,
        });
      }
    } catch (error) {
      console.warn("plugin-pipe: Compression failed. Falling back to uncompressed upload.", error);
    }
  }

  // Fallback: send uncompressed
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    body: jsonString,
  });
}

/**
 * **jsPsychPipe**
 *
 * This plugin facilitates communication with DataPipe (https://pipe.jspsych.org), a tool for
 * sending data from jsPsych experiments to the OSF (https://osf.io/). You will need a DataPipe
 * account to use this plugin.
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
        width: 50px;
        height: 50px;
      }

      .spinner .path {
        stroke: rgb(25,25,25);
        stroke-linecap: round;
        animation: dash 1.5s ease-in-out infinite;
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
      ${trial.wait_message}
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>`;

    display_element.innerHTML = progressHTML;

    let result: any;
    if (trial.action === "save") {
      result = await PipePlugin.saveData(
        trial.experiment_id,
        trial.filename,
        trial.data_string,
        trial.compression,
        { base_url: trial.base_url }
      );
    }
    if (trial.action === "saveBase64") {
      result = await PipePlugin.saveBase64Data(
        trial.experiment_id,
        trial.filename,
        trial.data_string,
        trial.compression,
        { base_url: trial.base_url }
      );
    }
    if (trial.action === "condition") {
      result = await PipePlugin.getCondition(trial.experiment_id, { base_url: trial.base_url });
    }

    // data saving
    var trial_data = {
      result: result,
      success: isSuccessfulResult(result),
    };

    // end trial
    this.jsPsych.finishTrial(trial_data);
  }

  /**
   * Save data to the OSF using pipe.jspsych.org.
   *
   * @param expID The 12-character experiment ID provided by pipe.jspsych.org.
   * @param filename A unique filename to save the data to. It should include the extension.
   * @param data The data as a string. Any text-based format (e.g., JSON, CSV, TXT) is acceptable.
   * @param compress Whether to gzip-compress the request body. Default is `true`.
   * @returns The response from the server.
   */
  static async saveData(
    expID: string,
    filename: string,
    data: string,
    compress: boolean = true,
    options: { base_url?: string } = {}
  ): Promise<any> {
    if (!expID || !filename || !data) {
      throw new Error("Missing required parameter(s).");
    }
    try {
      const response = await sendRequest(
        endpoint("data", options.base_url),
        {
          experimentID: expID,
          filename: filename,
          data: data,
        },
        compress
      );
      return await response.json();
    } catch (error) {
      return error;
    }
  }

  /**
   * Point every request at a different DataPipe deployment.
   *
   * The reason to want this is testing: an experiment can be run end to end
   * against a test deployment without touching production. Call it once,
   * before the timeline runs. Individual trials can override it with
   * `base_url`.
   */
  static setBaseURL(url: string): void {
    baseURL = url ? normalizeBaseURL(url) : DEFAULT_BASE_URL;
  }

  /** The deployment requests currently go to. */
  static getBaseURL(): string {
    return baseURL;
  }

  /**
   * Save base64-encoded data to the OSF using pipe.jspsych.org.
   *
   * @param expID The 12-character experiment ID provided by pipe.jspsych.org.
   * @param filename A unique filename to save the data to. It should include the extension.
   * @param data The data as a base64-encoded string. It will be decoded by the server before being stored in the OSF.
   * @param compress Whether to gzip-compress the request body. Default is `true`.
   * @returns The response from the server.
   */
  static async saveBase64Data(
    expID: string,
    filename: string,
    data: string,
    compress: boolean = true,
    options: { base_url?: string } = {}
  ): Promise<any> {
    if (!expID || !filename || !data) {
      throw new Error("Missing required parameter(s).");
    }
    try {
      const response = await sendRequest(
        endpoint("base64", options.base_url),
        { experimentID: expID, filename: filename, data: data },
        compress
      );
      return await response.json();
    } catch (error) {
      return error;
    }
  }

  /**
   * Get the condition assignment for the current participant using pipe.jspsych.org.
   *
   * @param expID The 12-character experiment ID provided by pipe.jspsych.org.
   * @returns The condition assignment as an integer.
   */
  static async getCondition(expID: string, options: { base_url?: string } = {}): Promise<any> {
    if (!expID) {
      throw new Error("Missing required parameter(s).");
    }
    let response: Response;
    try {
      response = await fetch(endpoint("condition", options.base_url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          experimentID: expID,
        }),
      });
    } catch (error) {
      return error;
    }
    const result = await response.json();
    return result.condition;
  }
}

export default PipePlugin;
