import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";
interface InitializeParameters {
}
interface OnLoadParameters {
}
interface OnFinishParameters {
}
/**
 * **extension-meye**
 *
 * @author Adam Vasarhelyi
 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
 */
declare class meyeExtension implements JsPsychExtension {
    private jsPsych;
    static info: JsPsychExtensionInfo;
    setup: any;
    threshold: any;
    rx: any;
    ry: any;
    rs: any;
    input: any;
    videoStream: any;
    beginInterval: any;
    updatePredictionTimeout: any;
    model: any;
    mode: any;
    timeToSubtract: any;
    debugMode: any;
    pupilSideLength: any;
    changeObserver: any;
    pluginPupilData: any;
    samples: any;
    pupilOutput: any;
    pupilOutputText: any;
    getUserMediaSupported: any;
    toggleCam: any;
    showRoi: any;
    video: any;
    pupilXLocator: any;
    pupilYLocator: any;
    output: any;
    roi: any;
    updatePrediction: any;
    observer: any;
    loadModel: any;
    predictOnce: any;
    predictFrame: any;
    keepLargestComponent: any;
    fillHoles: any;
    findCentroid: any;
    updatePupilLocator: any;
    updateMode: any;
    predictLoop: any;
    snapshotHandler: any;
    updateVariables: any;
    addValDot: any;
    floodFill: any;
    findZero: any;
    filledLastTrial: boolean;
    tf: any;
    constructor(jsPsych: JsPsych);
    initialize: ({}: InitializeParameters) => Promise<void>;
    on_start: (params: any) => void;
    on_load: ({}: OnLoadParameters) => void;
    on_finish: ({}: OnFinishParameters) => any;
}
export default meyeExtension;
