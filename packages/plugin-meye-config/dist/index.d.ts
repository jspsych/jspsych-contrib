import { JsPsych, JsPsychPlugin, TrialType } from "jspsych";
declare const info: {
    readonly name: "meye-calibration";
    readonly parameters: {};
};
type Info = typeof info;
/**
 * **plugin-meye-config**
 *
 * Sets up an extension that captures pupil area. See readme for details.
 *
 * @author Adam Vasarhelyi
 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
 */
declare class meyePlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "meye-calibration";
        readonly parameters: {};
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}
export default meyePlugin;
