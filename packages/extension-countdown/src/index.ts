import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

interface OnStartParameters {
  format: (time: number) => string;
  time: number;
  update_time: number;
}

/**
 * **Extension-Countdown**
 *
 * jsPsych extension for adding a countdown for a trial
 *
 * @author Shaobin Jiang
 */
class CountdownExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "countdown",
  };

  constructor(private jsPsych: JsPsych) {}

  private format: (time: number) => string;
  private time: number;
  private update_time: number;

  private countdown_element: HTMLElement;
  private timer: number;
  private last_recorded_time: number;
  private time_elapsed: number = 0;
  private is_running: boolean = true;

  initialize = (): Promise<void> => {
    return new Promise((resolve, _) => {
      resolve();
    });
  };

  on_start = ({
    format = (time: number) => String(Math.floor(time / 1000)),
    time,
    update_time = 50,
  }: OnStartParameters): void => {
    this.format = format;
    this.time = time;
    this.update_time = update_time;

    this.countdown_element = document.createElement("div");
    this.countdown_element.innerHTML = this.format(time);
    this.countdown_element.className = "jspsych-extension-countdown";
    this.countdown_element.style.cssText = "font-size: 18px; position: fixed; top: 5%; right: 5%;";
  };

  on_load = (): void => {
    this.jsPsych.getDisplayContainerElement().appendChild(this.countdown_element);
    this.last_recorded_time = performance.now();
    this.timer = window.setInterval(() => {
      let now: number = performance.now();
      if (this.is_running) {
        this.time_elapsed += now - this.last_recorded_time;
      }
      this.last_recorded_time = now;
      let time_left = this.time - this.time_elapsed;
      if (time_left <= 0) {
        window.clearInterval(this.timer);
      } else {
        this.countdown_element.innerHTML = this.format(time_left);
      }
    }, this.update_time);
  };

  on_finish = () => {
    window.clearInterval(this.timer);
    this.countdown_element.remove();
    return {};
  };

  pause = (): void => {
    this.is_running = false;
  };

  resume = (): void => {
    this.is_running = true;
  };
}

export default CountdownExtension;
