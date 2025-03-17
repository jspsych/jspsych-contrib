import * as tf from "@tensorflow/tfjs";
import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

interface InitializeParameters {}
interface OnStartParameters {}
interface OnLoadParameters {}
interface OnFinishParameters {}

/**
 * **extension-meye**
 *
 * An extension that captures pupil diameter. Configured via the mEye plugin.
 *
 * @author Adam Vasarhelyi
 * @see {@link https://../docs/extension-meye}
 */
class MeyeExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "meye-extension",
  };
  threshold: number;
  rx: number;
  ry: number;
  rs: number;
  modelUrl: string;
  videoStream: MediaStream;
  beginInterval: ReturnType<typeof setInterval>;
  updatePredictionTimeout: ReturnType<typeof setTimeout>;
  model: tf.GraphModel;
  mode: string;
  timeToSubtract: number;
  pupilSideLength: number;
  pluginPupilData: Array<Record<string, number>>;
  samples: Array<Array<number>>;
  video: HTMLVideoElement;
  pupilXLocator: HTMLDivElement;
  pupilYLocator: HTMLDivElement;
  output: HTMLCanvasElement;
  filledLastTrial: boolean;

  constructor(private jsPsych: JsPsych) {}

  initialize = ({}: InitializeParameters): Promise<void> => {
    this.model = null;

    // Create invisible placeholders for mEye.
    this.video = document.createElement("video");
    this.pupilXLocator = document.createElement("div");
    this.pupilYLocator = document.createElement("div");
    this.output = document.createElement("canvas");

    this.video.addEventListener("canplaythrough", () => {
      this.video.muted = true;
      this.video.play();
    });

    // I've spent a lot of time exploring toggling the camera off when not in use and back on when needed but
    // unless promises are used, this causes a race condition, and if promises are used, then it (theoretically)
    // shouldn't sync up the camera loading with the plugin loading which can invalidate data. Plus, if you're
    // using this extension for research, you would have gotten participant consent for data recording anyway
    // so participants shouldn't be worried about being recorded when not strictly needed. Lastly, this helps
    // the model track the eye between plugins without collecting data.
    if (!this.videoStream) {
      var constraints = {
        video: true,
        audio: false,
      };

      // Activate the webcam stream.
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.videoStream = stream;
          this.video.srcObject = stream;
        })
        .catch((err) => {
          console.error(
            err +
              ". Check that your webcam is plugged in and nothing else is using it, then refresh the page."
          );
        });
    }

    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  on_start = (params: any): void => {
    this.filledLastTrial = false;
    this.beginInterval = this.updatePredictionTimeout = this.pupilSideLength = null;
    this.timeToSubtract = 0;
    this.pluginPupilData = [];
    this.samples = [];
  };

  on_load = (params: any): void => {
    if (typeof params.detection_interval != "undefined") {
      this.snapshotHandler();
      this.beginInterval = setInterval(this.snapshotHandler, params.detection_interval);
    } else
      console.error("You must set a detection interval for the js-mEye extension. Refer to /docs.");
  };

  on_finish = ({}: OnFinishParameters): any => {
    clearInterval(this.beginInterval);
    return this.snapshotHandler().then(() => {
      return {
        raw_meye_data: JSON.parse(JSON.stringify(this.pluginPupilData)),
      };
    });
  };

  setup = (
    ThreshValue: number,
    AvgRx: number,
    AvgRy: number,
    RoiSize: number,
    ModelUrl: string
  ): Promise<void> => {
    this.threshold = ThreshValue;
    this.rx = AvgRx;
    this.ry = AvgRy;
    this.rs = RoiSize;
    this.mode = null;

    return tf.loadGraphModel(ModelUrl).then((loadedModel) => {
      this.model = loadedModel;
      tf.tidy(() => {
        if (this.model instanceof tf.GraphModel)
          this.model.predict(tf.zeros([1, 128, 128, 1]))[0].data();
        this.updatePrediction();
      });
    });
  };

  updatePrediction = (delay?: number): void => {
    delay = delay ?? 100;
    clearTimeout(this.updatePredictionTimeout);
    if (this.video.readyState >= 2)
      this.updatePredictionTimeout = setTimeout(this.predictOnce, delay);
  };

  predictFrame = (): any => {
    var timestamp = new Date();
    var timecode = this.video.currentTime;

    // Now var's start classifying a frame in the stream.
    var frame: any = tf.browser
      .fromPixels(this.video, 3)
      .slice([this.ry, this.rx], [this.rs, this.rs])
      .resizeBilinear([128, 128])
      .mul(tf.tensor1d([0.2989, 0.587, 0.114]))
      .sum(2);

    frame = frame.clipByValue(0, 255);
    frame = frame.div(tf.scalar(255));

    if (this.model instanceof tf.GraphModel) {
      var [maps, eb] = this.model.predict(frame.expandDims(0).expandDims(-1)) as [
        tf.Tensor,
        tf.Tensor
      ];
    }

    // some older models have their output order swapped
    if (maps.rank < 4) [maps, eb] = [eb, maps];

    // take first channel in last dimension
    var pupil: tf.Tensor | Promise<number[]> = maps.slice([0, 0, 0, 0], [-1, -1, -1, 1]).squeeze();
    var [eye, blink] = eb.squeeze().split(2);

    pupil = tf.cast(pupil.greaterEqual(this.threshold), "float32").squeeze();

    var pupilArea = pupil.sum().data();
    var blinkProb = blink.data();

    pupil = (pupil as tf.Tensor).array() as Promise<number[]>;

    return [pupil, timestamp, timecode, pupilArea, blinkProb];
  };

  keepLargestComponent = (array: Array<Array<number>>): number => {
    var h = array.length;
    var w = array[0].length;

    // invert binary map
    for (var i = 0; i < h; ++i) for (var j = 0; j < w; ++j) array[i][j] = -array[i][j];

    // label and measure connected components using iterative depth first search
    var label = 1;
    var maxCount = 0;
    var maxLabel = 0;

    for (var i = 0; i < h; ++i) {
      for (var j = 0; j < w; ++j) {
        if (array[i][j] >= 0) continue;

        var stack = [i * h + j];
        var pool = new Set();
        var count = 0;

        while (stack.length) {
          var node = stack.pop();
          if (pool.has(node)) continue;

          pool.add(node);
          var c = node % h;
          var r = Math.floor(node / h);
          if (array[r][c] === -1) {
            array[r][c] = label;
            if (r > 0 + 1) stack.push((r - 1) * h + c);
            if (r < h - 1) stack.push((r + 1) * h + c);
            if (c > 0 + 1) stack.push(r * h + c - 1);
            if (c < w - 1) stack.push(r * h + c + 1);
            ++count;
          }
        }

        if (count > maxCount) {
          maxCount = count;
          maxLabel = label;
        }

        ++label;
      }
    }

    // keeping largest component
    for (var i = 0; i < h; ++i) {
      for (var j = 0; j < w; ++j) {
        // array[i][j] = (array[i][j] == maxLabel) ? 1 : 0;
        if (array[i][j] > 0) array[i][j] = array[i][j] == maxLabel ? 1 : 0.3; // for debug purposes
      }
    }

    // returning area of the largest component
    return maxCount;
  };

  findZero = (array: Array<Array<number>>): null | Array<number> => {
    var h = array.length;
    var w = array[0].length;
    for (var i = 0; i < h; ++i) for (var j = 0; j < w; ++j) if (array[i][j] < 0.5) return [i, j];
    return null;
  };

  floodFill = (array: Array<Array<number>>): void => {
    var h = array.length;
    var w = array[0].length;
    var [r0, c0] = this.findZero(array);
    var stack = [r0 * h + c0];

    while (stack.length) {
      var node = stack.pop();
      var [r, c] = [Math.floor(node / h), node % h];
      if (array[r][c] != 1) {
        array[r][c] = 1;
        if (r > 0 + 1) stack.push((r - 1) * h + c);
        if (r < h - 1) stack.push((r + 1) * h + c);
        if (c > 0 + 1) stack.push(r * h + c - 1);
        if (c < w - 1) stack.push(r * h + c + 1);
      }
    }
  };

  fillHoles = (array: Array<Array<number>>): number => {
    var h = array.length;
    var w = array[0].length;
    var filled = array.map((r) => r.map((c) => c));
    this.floodFill(filled);

    var filledCount = 0;
    for (var i = 0; i < h; ++i) {
      for (var j = 0; j < w; ++j) {
        if (filled[i][j] == 0) {
          array[i][j] = 0.7; // debug
          ++filledCount;
        }
      }
    }
    return filledCount;
  };

  findCentroid = (array: Array<Array<number>>): Array<number> => {
    var nRows = array.length;
    var nCols = array[0].length;

    var m01 = 0,
      m10 = 0,
      m00 = 0;
    for (var i = 0; i < nRows; ++i) {
      for (var j = 0; j < nCols; ++j) {
        var v = array[i][j] > 0.5 ? 1 : 0;
        m01 += j * v;
        m10 += i * v;
        m00 += v;
      }
    }

    return [m01 / m00, m10 / m00];
  };

  snapshotHandler = (): Promise<void> | null => {
    if (!this.model) return null;

    // Force one async prediction
    return this.predictOnce().then((outs) => {
      let [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY] = outs;

      blinkProb = Number(blinkProb.toFixed(3));

      this.samples.push([pupilArea, blinkProb, timecode]);
      let mostRecentSnapshot = this.samples[this.samples.length - 1];

      // Convert mEye's unit of measurement for pupil area into something understandable by humans (in this case, diameter since we assume circular pupils).
      this.pupilSideLength = (this.rs * Math.sqrt(mostRecentSnapshot[0])) / 128;
      mostRecentSnapshot[0] = Number(this.pupilSideLength.toFixed(2));

      if (this.pluginPupilData.length == 0) this.timeToSubtract = mostRecentSnapshot[2];

      this.pluginPupilData.push({
        pupil_diameter: mostRecentSnapshot[0],
        blink_prob: mostRecentSnapshot[1],
        timecode: Number((mostRecentSnapshot[2] - this.timeToSubtract).toFixed(3)),
        threshold: this.threshold,
      });
    });
  };

  predictLoop = (): void | null => {
    if (!this.model || (!this.video.paused && this.video.readyState < 3)) {
      window.requestAnimationFrame(this.predictLoop); // This literally just keeps the loop going.
      return null;
    }

    this.predictOnce().then((outs) => {
      let [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY] = outs;

      // follow eye
      if (pupilX > 0) {
        var curX = this.rx;
        var curY = this.ry;

        var newX = Math.round(pupilX - this.rs / 2);
        var newY = Math.round(pupilY - this.rs / 2);

        newX = Math.round((1 - blinkProb) * newX + blinkProb * curX);
        newY = Math.round((1 - blinkProb) * newY + blinkProb * curY);

        var m = 0.2;
        newX = Math.round((1 - m) * newX + m * curX);
        newY = Math.round((1 - m) * newY + m * curY);

        var maxX = this.video.videoWidth - this.rs;
        var maxY = this.video.videoHeight - this.rs;

        newX = Math.min(Math.max(0, newX), maxX);
        newY = Math.min(Math.max(0, newY), maxY);

        this.rx = newX;
        this.ry = newY;
      }

      // pause prediction when video is paused
      if (!this.video.paused) window.requestAnimationFrame(this.predictLoop);
    });
  };

  predictOnce = (): null | Promise<Array<number>> => {
    var outs: any = tf.tidy(this.predictFrame);

    return Promise.all(outs).then((outs) => {
      var [pupil, timestamp, timecode, pupilArea, blinkProb] = outs;

      pupilArea = pupilArea[0];
      blinkProb = blinkProb[0];

      var pupilX = -1;
      var pupilY = -1;

      if (pupilArea > 0) {
        pupilArea = this.keepLargestComponent(pupil);
        pupilArea += this.fillHoles(pupil);

        [pupilX, pupilY] = this.findCentroid(pupil);

        pupilX = (pupilX * this.rs) / 128 + this.rx;
        pupilY = (pupilY * this.rs) / 128 + this.ry;
      }

      // for Array, toPixel wants [0, 255] values
      for (var i = 0; i < pupil.length; ++i)
        for (var j = 0; j < pupil[0].length; ++j)
          if (pupil[i][j] > 0.5) pupil[i][j] = [255 * pupil[i][j], 0, 0]; // red
          else {
            var v = Math.round(pupil[i][j] * 255);
            pupil[i][j] = [v, v, v]; // gray
          }

      tf.browser.toPixels(pupil, this.output);

      if (this.mode == null) {
        this.updatePrediction(5);
        this.mode = "loop";
        this.predictLoop();
      }

      return [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY];
    });
  };
}

export default MeyeExtension;
