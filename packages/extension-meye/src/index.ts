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

  // I'm sorry for this ;_; but hey it works
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

  constructor(private jsPsych: JsPsych) {
    this.setup = () => {
      // Setup variables
      this.filledLastTrial = false;
      this.threshold = 0.5;
      this.rx = 0;
      this.ry = 0;
      this.rs = 347;
      this.input = null;
      this.videoStream = null;
      this.beginInterval = null;
      this.updatePredictionTimeout = null;
      this.model = undefined;
      this.mode = null;
      this.timeToSubtract = 0;
      this.debugMode = false;
      this.pupilSideLength = null;
      this.changeObserver = null;
      this.pluginPupilData = [];
      this.samples = [];
      this.pupilOutput = document.createElement("div");
      this.pupilOutput.id = "pupil-output";
      this.pupilOutputText = document.createTextNode("mEye pupil area:");
      this.pupilOutput.appendChild(this.pupilOutputText);

      // Create placeholders for mEye
      this.video = document.createElement("video");
      this.pupilXLocator = document.createElement("div");
      this.pupilYLocator = document.createElement("div");
      this.output = document.createElement("canvas");
      this.roi = document.createElement("div");

      // Check if webcam is supported
      if (this.getUserMediaSupported()) this.toggleCam();

      this.video.addEventListener("loadedmetadata", this.showRoi);
      this.video.addEventListener("loadeddata", () => {
        this.video.muted = true;
        this.video.volume = 0;
      });

      this.video.addEventListener("canplaythrough", () => {
        this.video.play();
        this.updatePrediction();
      });

      this.observer = new MutationObserver(() => {
        this.updatePrediction(30);
      }).observe(this.roi, {
        attributes: true,
      });

      this.loadModel();
    };

    // Check if webcam access is supported.
    this.getUserMediaSupported = () => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    };

    // Enable the live webcam view and start classification.
    this.toggleCam = () => {
      if (this.videoStream) {
        this.video.pause();
        this.videoStream.getTracks().forEach((t) => {
          t.stop();
        });
        this.videoStream = null;
        return;
      }

      var constraints = {
        video: true,
        audio: false,
      };

      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(constraints).then(
        (stream) => {
          this.videoStream = stream;
          this.video.srcObject = stream;
        },

        () => {
          console.log("error");
        }
      );
    };

    this.loadModel = () => {
      var modelUrl =
        "../../plugin-meye-config/models/meye-segmentation_i128_s4_c1_f16_g1_a-relu-no-subj/model.json";

      // Model must be undefined at this point or tf crashes.
      return tf.loadGraphModel(modelUrl).then((loadedModel) => {
        this.model = loadedModel;
        tf.tidy(() => {
          this.model.predict(tf.zeros([1, 128, 128, 1]))[0].data();
        });
      });
    };

    this.updatePrediction = (delay) => {
      delay = delay ?? 100;
      clearTimeout(this.updatePredictionTimeout);
      if (this.video.readyState >= 2)
        this.updatePredictionTimeout = setTimeout(this.predictOnce, delay);
    };

    this.predictFrame = () => {
      var timestamp = new Date();
      var timecode = this.video.currentTime;

      var x = parseInt(this.rx);
      var y = parseInt(this.ry);
      var s = parseInt(this.rs);

      // Now var's start classifying a frame in the stream.
      var frame: any = tf.browser
        .fromPixels(this.video, 3)
        .slice([y, x], [s, s])
        .resizeBilinear([128, 128])
        .mul(tf.tensor1d([0.2989, 0.587, 0.114]))
        .sum(2);

      frame = frame.clipByValue(0, 255);
      frame = frame.div(tf.scalar(255));

      tf.browser.toPixels(frame, this.input);

      var [maps, eb] = this.model.predict(frame.expandDims(0).expandDims(-1));

      // some older models have their output order swapped
      if (maps.rank < 4) [maps, eb] = [eb, maps];

      // take first channel in last dimension
      var pupil = maps.slice([0, 0, 0, 0], [-1, -1, -1, 1]).squeeze();
      var [eye, blink] = eb.squeeze().split(2);

      pupil = tf.cast(pupil.greaterEqual(this.threshold), "float32").squeeze();

      var pupilArea = pupil.sum().data();
      var blinkProb = blink.data();

      pupil = pupil.array();

      return [pupil, timestamp, timecode, pupilArea, blinkProb];
    };

    this.predictOnce = () => {
      if (!this.model) return null;
      else {
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
            var x = parseInt(this.rx);
            var y = parseInt(this.ry);
            var s = parseInt(this.rs);

            pupilX = (pupilX * s) / 128 + x;
            pupilY = (pupilY * s) / 128 + y;
          }

          this.updatePupilLocator(pupilX, pupilY);

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
            this.updateMode("loop");
            this.predictLoop();
          }

          return [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY];
        });
      }
    };

    this.updatePupilLocator = (x, y) => {
      if (x < 0 || y < 0)
        this.pupilXLocator.style.display = this.pupilYLocator.style.display = "none";
      else {
        this.pupilXLocator.style.left = x + "px";
        this.pupilXLocator.style.height = this.video.videoHeight + "px";

        this.pupilYLocator.style.width = this.video.videoWidth + "px";
        this.pupilYLocator.style.top = y + "px";

        this.pupilXLocator.style.display = this.pupilYLocator.style.display = "block";
      }
    };

    this.keepLargestComponent = (array) => {
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

    this.findZero = (array) => {
      var h = array.length;
      var w = array[0].length;
      for (var i = 0; i < h; ++i) for (var j = 0; j < w; ++j) if (array[i][j] < 0.5) return [i, j];
      return null;
    };

    this.floodFill = (array) => {
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

    this.fillHoles = (array) => {
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

    this.findCentroid = (array) => {
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

    this.updateMode = (mode) => {
      this.mode = mode;
    };

    this.snapshotHandler = (deeperItem = null, action = null) => {
      if (!this.model) return null;

      // Force one async prediction
      return this.predictOnce().then((outs) => {
        this.video.play(); // TODO fix to work without.
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

          this.updateVariables(newX, newY);
        }

        blinkProb = blinkProb.toFixed(3);

        this.samples.push([pupilArea, blinkProb, timecode]);

        this.addValDot(this.samples[this.samples.length - 1]);
      });
    };

    this.addValDot = (mostRecentSnapshot, isLate = false) => {
      // Convert mEye's unit of measurement for pupil area into something understandable by humans (in this case, diameter since we assume circular pupils).
      this.pupilSideLength = (this.rs * Math.sqrt(mostRecentSnapshot[0])) / 128;
      mostRecentSnapshot[0] = this.pupilSideLength.toFixed(2);

      // This commented-out section is for future functionality I intend to add.
      // var valNode = document.createElement('span');
      // valNode.className = "valDot";
      // valNode.id = "killme";
      // valNode.style.width = valNode.style.height = this.pupilSideLength + "px";

      // if (isLate) {
      // if (document.getElementById("killme")) document.getElementById("killme").remove();
      // if (document.getElementById("pupil-output")) document.getElementById("pupil-output").remove();
      // } else if (this.debugMode) {

      // // Wipe any existing valdots on the screen
      // if (document.getElementById("killme")) document.getElementById("killme").remove();

      // // Create a new output box if one doesn't already exist
      // if (!document.getElementById("pupil-output")) document.getElementById("jspsych-content").appendChild(this.pupilOutput);

      // valNode.style.left = (parseInt(window.getComputedStyle(this.pupilOutput).getPropertyValue("width")) / 2) + "px";
      // valNode.style.top = (parseInt(window.getComputedStyle(this.pupilOutput).getPropertyValue("height")) / 2) + "px";

      // document.getElementById("pupil-output").appendChild(valNode);
      // }

      if (this.pluginPupilData.length == 0) this.timeToSubtract = mostRecentSnapshot[2];

      this.pluginPupilData.push({
        pupil_diameter: mostRecentSnapshot[0],
        blink_prob: mostRecentSnapshot[1],
        timecode: (mostRecentSnapshot[2] - this.timeToSubtract).toFixed(3),
      });

      //console.log(this.pluginPupilData[this.pluginPupilData.length - 1]); debug
    };

    this.updateVariables = (newX, newY) => {
      this.rx = newX;
      this.ry = newY;
    };

    this.predictLoop = () => {
      // if no model OR performance check complete but not calibrating OR playback is started but video is not loaded, wait.
      if (!this.model || (!this.video.paused && this.video.readyState < 3)) {
        window.requestAnimationFrame(this.predictLoop); // This literally just keeps the loop going.
        return null;
      }

      this.predictOnce().then((outs) => {
        this.video.play(); // TODO fix to work without.
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

          this.updateVariables(newX, newY);
        }

        // pause prediction when video is paused
        if (!this.video.paused) window.requestAnimationFrame(this.predictLoop);
      });
    };
  }

  initialize = ({}: InitializeParameters): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.setup();
      resolve();
    });
  };

  on_start = (params: any): void => {
    this.pluginPupilData = [];
    this.filledLastTrial = false;

    // Parse ideal settings calculated from MEYE setup
    let obj = JSON.parse(this.jsPsych.data.get().filter({ trial_type: "meye-config" }).json());
    let settings = obj[0].settings;

    this.threshold = settings.threshValue;
    this.rx = settings.avgRx;
    this.ry = settings.avgRy;
    this.rs = settings.roiSize;

    if (typeof params != "undefined") {
      if (typeof params.debug != "undefined" && params.debug == true) this.debugMode = true;
      if (typeof params.detection_interval != "undefined") {
        this.snapshotHandler(null, "interval detection");
        this.beginInterval = setInterval(
          this.snapshotHandler,
          params.detection_interval,
          null,
          "interval detection"
        );
      }
    }
  };

  on_load = ({}: OnLoadParameters): void => {};

  on_finish = ({}: OnFinishParameters): any => {
    clearInterval(this.beginInterval);

    return this.snapshotHandler("Trial", "finished").then((test) => {
      // Handle the fact that setInterval will take another snapshot when we don't want it to that it saves to second last index
      this.pluginPupilData[this.pluginPupilData.length - 2] =
        this.pluginPupilData[this.pluginPupilData.length - 1];
      this.pluginPupilData.pop();

      return {
        raw_meye_data: JSON.parse(JSON.stringify(this.pluginPupilData)),
      };
    });
  };
}

export default MeyeExtension;
