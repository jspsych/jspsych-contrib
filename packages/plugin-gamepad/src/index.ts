import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { GamepadModel, GamepadModels } from "./gamepad-model";

const info = <const>{
  name: "gamepad",
  parameters: {
    /**
     * The size of the canvas element
     */
    canvas_size: {
      type: ParameterType.INT,
      default: [500, 500],
      array: true,
    },
    /**
     * Whether to display a minature gamepad on the page.
     * If set to true, a minature gamepad would be rendered, which simultaneously reflects the button presses and
     * joystick movements of the gamepad.
     * This should only be used for debug purposes, though.
     * Note: at the current stage, there is only limited support to this feature
     */
    display_minature_gamepad: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * The function which, when returning true, would terminate the current trial.
     * This function is called once every frame.
     *
     * @param {CanvasRenderingContext2D} context: The context to draw upon
     * @param {Gamepad} gamepad: The gamepad object connected
     * @param {number} time_stamp: The milliseconds that have elapsed since the first frame
     * @param {number} delta_time: The milliseconds that have elapsed since the last frame
     */
    end_trial: {
      type: ParameterType.FUNCTION,
      default: (
        _context: CanvasRenderingContext2D,
        _gamepad: Gamepad,
        _time_stamp: number,
        _delta_time: number
      ) => {
        return _time_stamp > 2000;
      },
    },
    /**
     * The message to display above the canvas when no gamepad is connected or when connection is lost.
     */
    gamepad_connection_prompt: {
      type: ParameterType.STRING,
      default: "Awaiting gamepad connection...",
    },
    /**
     * The function that runs in every frame update.
     *
     * @param {CanvasRenderingContext2D} context: The context to draw upon
     * @param {Gamepad} gamepad: The gamepad object connected
     * @param {number} time_stamp: The milliseconds that have elapsed since the first frame
     * @param {number} delta_time: The milliseconds that have elapsed since the last frame
     */
    on_frame_update: {
      type: ParameterType.FUNCTION,
      default: (
        _context: CanvasRenderingContext2D,
        _gamepad: Gamepad,
        _time_stamp: number,
        _delta_time: number
      ) => {},
    },
    /**
     * The function to draw on the canvas.
     * This function automatically takes a canvas context as its only argument
     * The content of the stimulus is only drawn once in the first frame, and is then copy-pasted in subsequent frames.
     * Therefore, this parameter is best suited for drawing contents that does not change throughout the entire trial.
     * One can return a Promise object with the function, which will be automatically detected by the plugin.
     */
    stimulus: {
      type: ParameterType.FUNCTION,
      default: (_context: CanvasRenderingContext2D) => {},
    },
  },
};

type Info = typeof info;

/**
 * **jspsych-gamepad**
 *
 * A jsPsych plugin for using gamepad in behavioral experiments.
 *
 * @author Shaobin Jiang
 */
class GamepadPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  private gamepad: Gamepad | null;
  private gamepad_is_connected: boolean = false;

  private minature_gamepad: GamepadModel | null = null;
  private minature_gamepad_wrapper: HTMLDivElement;

  private start_time_stamp: number = 0;
  private last_frame_time_stamp: number = 0;

  private animation_frame_id: number = -1;
  private frame_request_callback: FrameRequestCallback = (_time: DOMHighResTimeStamp) => {};

  private gamepad_inputs: Array<Gamepad> = [];

  private find_gamepad(): void {
    this.gamepad = null;
    this.gamepad_is_connected = false;
    for (let gamepad of navigator.getGamepads()) {
      if (gamepad instanceof Gamepad) {
        let previous_gamepad_id = this.gamepad?.id;

        this.gamepad = gamepad;
        this.gamepad_is_connected = true;

        if (gamepad.id !== previous_gamepad_id) {
          this.minature_gamepad_wrapper.innerHTML = "";
          this.minature_gamepad = GamepadModels[gamepad.id](gamepad, this.minature_gamepad_wrapper);
        }
        break;
      }
    }
  }

  public trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: Function) {
    // Initialize the canvas element
    let canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = trial.canvas_size[0];
    canvas.height = trial.canvas_size[1];

    // Initialize the prompt element
    let gamepad_connection_prompt: HTMLParagraphElement = document.createElement("p");
    gamepad_connection_prompt.style.textAlign = "center";
    gamepad_connection_prompt.innerHTML = trial.gamepad_connection_prompt;

    display_element.appendChild(canvas);
    display_element.appendChild(gamepad_connection_prompt);

    this.minature_gamepad_wrapper = document.createElement("div");
    this.minature_gamepad_wrapper.id = "gamepad-model-wrapper";
    this.minature_gamepad_wrapper.style.width = "10%";
    this.minature_gamepad_wrapper.style.position = "absolute";
    this.jsPsych.getDisplayContainerElement().appendChild(this.minature_gamepad_wrapper);

    let context: CanvasRenderingContext2D = canvas.getContext("2d", { willReadFrequently: true });

    let stimulus: any = trial.stimulus(context);
    let promise: Promise<any>;
    if (stimulus instanceof Promise) {
      promise = stimulus;
    } else {
      promise = Promise.resolve(stimulus);
    }

    promise.then(() => {
      let image_data: ImageData = context.getImageData(0, 0, canvas.width, canvas.height);

      this.frame_request_callback = (now: DOMHighResTimeStamp) => {
        if (this.start_time_stamp === 0) {
          this.start_time_stamp = now;
        }

        this.find_gamepad();

        // If gamepad_is_connected is true, then gamepad_connection_prompt should be empty and vice versa
        gamepad_connection_prompt.style.visibility = this.gamepad_is_connected ? "hidden" : "";

        let time_stamp: number = now - this.start_time_stamp;
        let delta: number = this.last_frame_time_stamp === 0 ? 0 : now - this.last_frame_time_stamp;

        context.putImageData(image_data, 0, 0);
        trial.on_frame_update(context, this.gamepad, time_stamp, delta);

        if (trial.display_minature_gamepad && this.minature_gamepad_wrapper !== null) {
          this.minature_gamepad?.update(this.gamepad);
        }

        this.gamepad_inputs.push(this.gamepad);

        if (trial.end_trial(context, this.gamepad, time_stamp, delta)) {
          finish_trial({
            rt: time_stamp,
            input: this.gamepad_inputs,
          });
        }

        this.last_frame_time_stamp = now;

        this.animation_frame_id = window.requestAnimationFrame(this.frame_request_callback);
      };

      on_load();

      this.animation_frame_id = window.requestAnimationFrame(this.frame_request_callback);
    });

    let finish_trial: Function = (data: object) => {
      window.cancelAnimationFrame(this.animation_frame_id);
      display_element.innerHTML = "";
      this.minature_gamepad_wrapper.remove();
      this.jsPsych.finishTrial(data);
    };
  }
}

export default GamepadPlugin;
