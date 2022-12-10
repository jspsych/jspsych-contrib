import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

class DeviceMotionExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "device-motion-tracking",
  };

  constructor(private jsPsych: JsPsych) {}

  private currentTrialData: Array<object>;
  private currentTrialStartTime: number;

  initialize = async () => {};

  on_start = (): void => {
    this.currentTrialData = [];
  };

  on_load = () => {
    // set current trial start time
    this.currentTrialStartTime = performance.now();

    // start data collection
    window.addEventListener("devicemotion", this.deviceMotionEventHandler, true);
  };

  on_finish = () => {
    window.removeEventListener("devicemotion", this.deviceMotionEventHandler, true);

    return {
      device_motion_data: this.currentTrialData,
    };
  };

  private deviceMotionEventHandler = (eventA) => {
    const event_time = performance.now();
    const t = Math.round(event_time - this.currentTrialStartTime);

    const { x, y, z } = eventA.acceleration;
    const interval = eventA.interval; //gets interval between samples in ms
    this.currentTrialData.push({ x, y, z, interval, t });
  };
}

export default DeviceMotionExtension;
