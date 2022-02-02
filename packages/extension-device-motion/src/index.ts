import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

interface OnStartParameters {
  /**
   * An array of mouse events to track. Can include `"mousemove"`, `"mousedown"`, and `"mouseup"`.
   * @default ['devicemotion']
   */
  events?: Array<string>;
}

class DeviceMotionExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "device-motion-tracking",
  };

  constructor(private jsPsych: JsPsych) {}

  private currentTrialData: Array<object>;
  private currentTrialStartTime: number;
  private eventsToTrack: Array<string>;

  initialize = async () => {};

  on_start = ({ events = ["devicemotion"] }: OnStartParameters = {}): void => {
    this.currentTrialData = [];
    this.eventsToTrack = events;
  };

  on_load = () => {
    // set current trial start time
    this.currentTrialStartTime = performance.now();

    // start data collection
    if (this.eventsToTrack.includes("devicemotion")) {
      window.addEventListener("devicemotion", this.deviceMotionEventHandler, true);
    }
  };

  on_finish = () => {
    if (this.eventsToTrack.includes("devicemotion")) {
      window.removeEventListener("devicemotion", this.deviceMotionEventHandler, true);
    }

    return {
      device_motion_data: this.currentTrialData,
    };
  };

  private deviceMotionEventHandler = (eventA) => {
    const event_time = performance.now();
    const t = Math.round(event_time - this.currentTrialStartTime);

    const { x, y, z } = eventA.acceleration;
    const interval = eventA.interval; //gets interval between samples in ms
    this.currentTrialData.push({ x, y, z, interval, t, event: "devicemotion" });
  };
}

export default DeviceMotionExtension;
