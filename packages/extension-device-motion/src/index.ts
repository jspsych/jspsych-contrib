import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

interface InitializeParameters {
}

interface OnStartParameters {
  /**
   * An array of string selectors. The selectors should identify one unique element on the page.
   * The DOMRect of the element will be stored in the data.
   */
  targets?: Array<string>;
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

  private domObserver: MutationObserver;
  private currentTrialData: Array<object>;
  private currentTrialTargets: Map<string, DOMRect>;
  private currentTrialSelectors: Array<string>;
  private currentTrialStartTime: number;
  private lastSampleTime: number;
  private eventsToTrack: Array<string>;

  initialize = async () => {
    this.domObserver = new MutationObserver(this.mutationObserverCallback);
  };

  on_start = (params: OnStartParameters): void => {
    params = params || {};

    this.currentTrialData = [];
    this.currentTrialTargets = new Map();
    this.currentTrialSelectors = params.targets || [];
    this.lastSampleTime = null;
    this.eventsToTrack = params.events || ["devicemotion"];

    this.domObserver.observe(this.jsPsych.getDisplayElement(), { childList: true });
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
    this.domObserver.disconnect();

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

    var x = eventA.acceleration.x;
    var y = eventA.acceleration.y;
    var z = eventA.acceleration.z;

    var interval = eventA.interval; //gets interval between samples in ms
    this.lastSampleTime = event_time;
    this.currentTrialData.push({ x, y, z, interval, t, event: "devicemotion" });
  };

  private mutationObserverCallback = (mutationsList, observer) => {
    for (const selector of this.currentTrialSelectors) {
      if (!this.currentTrialTargets.has(selector)) {
        const target = this.jsPsych.getDisplayElement().querySelector(selector);
        if (target) {
          this.currentTrialTargets.set(selector, target.getBoundingClientRect());
        }
      }
    }
  };
}

export default DeviceMotionExtension;
