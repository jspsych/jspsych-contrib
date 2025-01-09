import * as tf from "@tensorflow/tfjs";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "meye-config",
  parameters: {
	/** Determines whether the plugin will be calibrated using an automatic algorithm versus manual calibration by the participant. */
	auto_calibrate: {
		type: ParameterType.BOOL,
		default: true
	}
  },
};

type Info = typeof info;

/**
 * **plugin-meye-config**
 *
 * Sets up extension-meye to capture participant pupil diameter.
 *
 * @author Adam Vasarhelyi
 * @see {@link https://../docs/extension-meye}
 */
class MeyeConfigPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    console.log("Loaded TensorFlow.js - version: " + tf.version.tfjs);
	
    const passedPerformanceCheck = new Event("passedPerformanceCheck", { bubbles: true });
    const passedSetup2 = new Event("passedSetup2", { bubbles: true });
    const exit = new Event("exit", { bubbles: true });

    // Present instructions
    display_element.innerHTML = `<section style="font-family: helvetica, arial, sans-serif; width: 100%; height: 100%; margin: 10px; display: flex; flex-flow: column wrap; box-sizing: border-box">
									<h3>Eye tracking calibration</h3>
										<p><br>To ensure that the data collected is high-quality, and to reduce the likelihood that you will need to recalibrate, proceed with this experiment <b>only if there is daylight outside.</b><br>
										<ul>
											<li>If you are using a laptop, turn as much as possible toward your window and try to get the daylight onto your beautiful face, or go outside.</li>
											<li>If you are using a desktop, please continue only if the daylight from your window is not coming from behind you.</li>
										</ul>
										<p>If possible, make as much daylight enter your room as possible (e.g. by opening curtains). It is ideal if your webcam is positioned on the same monitor used to view this page.</p>
										<button id='goto-phase-one' style="width: fit-content">Continue</button>
										</section>`;
    
	document.getElementById("goto-phase-one").addEventListener("click", () => {
		display_element.innerHTML = `<section id="main" style="font-family: helvetica, arial, sans-serif; width: 100%; height: 100%; margin: 0; display: flex; flex-flow: row nowrap; box-sizing: border-box">
										<aside class="pre-post-params">
											<fieldset id="roi-preview" style="display: flex; flex-direction: column; width: 200px; border: none; background-color: #eee; margin: 5px; line-height: 1.6em">
												<legend style="font-size: 0.9em; background-color: gainsboro; text-transform: uppercase; padding: 0px 10px">INPUT PREVIEW</legend>
												<canvas id="net-input" width="128" height="128"></canvas>
												<img src="../../plugin-meye-config/img/eyeExample.png" width="217" height="188">
											</fieldset>
											<fieldset id="filter-params" style="display: flex; flex-direction: column; width: 200px; border: none; background-color: #eee; margin: 5px; line-height: 1.6em">
												<legend style="font-size: 0.9em; background-color: gainsboro; text-transform: uppercase; padding: 0px 10px">Calibration</legend>
												<div id="completion-div">
													<b>0%</b> complete
												</div>
											</fieldset>
										</aside>

										<aside class="pre-post-params">
											<fieldset id="video-params" style="display: flex; flex-direction: column; width: 200px; border: none; background-color: #eee; margin: 5px; line-height: 1.6em">
												<legend style="display: flex; align-items: center; font-size: 0.9em; background-color: gainsboro; text-transform: uppercase; padding: 0px 10px">
													<div class="flex-legend">
														Output
														<label style="margin-left: 15px"><meter id="fps-meter" min=0 low=8 optimum=24 max=30></meter> FPS: <span id="fps-preview"></span></label>
														<label id="backend-preview" style="font-size: .75em; text-transform: none">(Backend: <span id="backend-text"></span>)</label>
													</div>
												</legend>
												<div id="preview" style="padding: 0; border: 0; margin: 0; position: relative; display: inline-block">
													<div id="roi" style="overflow: auto; position: absolute; border: 1px dashed red; margin: 0; padding: 0; background-color: red; opacity: 0.5; z-index: 7; box-sizing: content-box; overflow: hidden; pointer-events: none">
														<div draggable="true" id="roi-dragger" style="-khtml-user-drag: element; -webkit-user-drag: element; cursor: grab; top: 0; left: 0; background-image: url('/packages/plugin-meye-config/img/baseline_open_with_white_18dp.png'); pointer-events: auto; position: absolute; height: 20%; width: 20%; min-width: 24px; min-height: 24px; max-width: 32px; max-height: 32px; display: block; z-index: 9; background-size: 80%; background-repeat: no-repeat; background-position: center center; border: 0; padding: 0; margin: 0; visibility: hidden"></div>
														<div draggable="true" id="roi-resizer" style="-khtml-user-drag: element; -webkit-user-drag: element; cursor: se-resize; bottom: 0; right: 0; background-image: url('/packages/plugin-meye-config/img/baseline_open_in_full_white_18dp.png'); -webkit-transform: scaleX(-1); -moz-transform: scaleX(-1); -o-transform: scaleX(-1); transform: scaleX(-1); filter: FlipH; -ms-filter: 'FlipH'; pointer-events: auto; position: absolute; height: 20%; width: 20%; min-width: 24px; min-height: 24px; max-width: 32px; max-height: 32px; display: block; z-index: 9; background-size: 80%; background-repeat: no-repeat; background-position: center center; border: 0; padding: 0; margin: 0; visibility: hidden"></div>
														<canvas id="output" style="resize: both; position: absolute; top: 0; width: 100%; height: 100%; border: 0; box-sizing: border-box; z-index: 8"></canvas>
													</div>
													<div id="pupil-x" style="z-index: 10; display: none; position: absolute; box-sizing: border-box; top: 0; width: 1px; border-right: 1px dashed rgba(255, 0, 0, 0.7);"></div>
													<div id="pupil-y" style="z-index: 10; display: none; position: absolute; box-sizing: border-box; left: 0; height: 1px; border-bottom: 1px dashed rgba(255, 0, 0, 0.7);"></div>
													<video id="webcam" style="display: inline-block; z-index: 5"></video>
												</div>	
											</fieldset>
										</aside>
										<aside id="info-box">
										</aside>
									</section>`;

		mainDisplayElement = document.getElementById("main");

		mainDisplayElement.addEventListener("dragover", dragover);
		mainDisplayElement.addEventListener("dragover", resizeover);
		mainDisplayElement.addEventListener("drop", drop);
		mainDisplayElement.addEventListener("exit", () => {
		  this.jsPsych.endExperiment();
		});
		mainDisplayElement.addEventListener("passedPerformanceCheck", () => {
		  continueBtn.addEventListener("click", () => {
			mainDisplayElement.dispatchEvent(passedSetup2);
		  });
		});

		mainDisplayElement.addEventListener("passedSetup2", () => {
		  data = { settings: idealObject };
		  this.jsPsych.finishTrial(data);
		});
		
		// This is so the event stuff above works when the mouse crosses the entire screen, not just the trimmed-down display_element.
		mainDisplayElement.style.height = "100%";
		mainDisplayElement.style.position = "fixed";
			
		if (trial.auto_calibrate) {
			document.getElementById("info-box").innerHTML = `<h3>Calibration</h3>
									<p>Measuring your computer's power...<br><b>Please do not leave this window until this is done.</b><br>It will only take a few seconds 🥵</p>`;
		}
		
		calPhaseOneSetup();
    });

    var mainDisplayElement,
		input,
		output,
		video,
		roiDragger,
		roiResizer,
		roi,
		pupilXLocator,
		pupilYLocator,
		phaseOneInfoDiv,
		backendIndicator,
		infoBox,
		fpsPreview,
		fpsMeter,
		videoStream,
		rx,
		ry,
		rs,
		calibrateBtn,
		freezeBtn,
		invertGuiBtn,
		continueBtn,
		ruleCheck,
		freezeWarning,
		controlThrPreview,
		controlThr,
		completeMessage,
		beginInterval,
		updatePredictionTimeout,
		idealObject,
		mode,
		totalPa,
		totalPx,
		totalPy,
		totalRx,
		totalRy,
		brightnessFactor,
		timeToSubtract,
		contrastFactor,
		gammaFactor,
		threshold,
		exitBtn,
		data: { settings: {
		  avgPa: number 
		  avgPx: number,
		  avgPy: number,
		  avgRx: number,
		  avgRy: number,
		  roiSize: number,
		  threshValue: number,
		}};

    var thresholdsPerVariance = 9; // Somewhat arbitrarily picked.
    var rgb = tf.tensor1d([0.2989, 0.587, 0.114]);
    var _255 = tf.scalar(255);
    var secondsCalibrationTakes = 20; // Helps to change this to lower value when debugging without my programmer socks :3
    var timeoutHandler = null;
    var samplesPerThresh;
    var threshAvg = [];

    var dragOffset = undefined;
    var resizeSize = undefined;
    var model = undefined;

    totalPa = totalPx = totalPy = totalRx = totalRy = brightnessFactor = timeToSubtract = 0;
    contrastFactor = gammaFactor = threshold = 1;

    const pluginPupilData = [];
    const samples = [];

    var calibrated = false;
    var debugMode = false;
    var threshHolder = 0.01;
    var benchmark = 0.0;

    function calPhaseOneSetup() {
		input = document.getElementById("net-input");
		output = document.getElementById("output");
		video = document.getElementById("webcam");
		roiDragger = document.getElementById("roi-dragger");
		roiResizer = document.getElementById("roi-resizer");
		roi = document.getElementById("roi");
		pupilXLocator = document.getElementById("pupil-x");
		pupilYLocator = document.getElementById("pupil-y");
		phaseOneInfoDiv = document.getElementById("completion-div");
		backendIndicator = document.getElementById("backend-text");
		infoBox = document.getElementById("info-box");
		fpsPreview = document.getElementById("fps-preview");
		fpsMeter = document.getElementById("fps-meter");
		
		videoStream = null;
		resetRoi();
		toggleCam();

		video.addEventListener("loadedmetadata", showRoi);
		video.addEventListener("loadeddata", () => {
			video.muted = true;
			video.volume = 0;
		});

		video.addEventListener("canplaythrough", () => {
			video.play();
			updatePrediction(null);
		});

		roiDragger.addEventListener("dragstart", dragstart);
		roiResizer.addEventListener("dragstart", resizestart);

		loadModel().then(() => {
			var backend = tf.getBackend();
			var styleClass = backend != "cpu" ? "accelerated" : "non-accelerated";

			backend = backend == "webgl" ? "WebGL" : backend.toUpperCase();
			backendIndicator.textContent = backend;
			backendIndicator.classList.add(styleClass);
		});

      setInterval(computeFps, 1000);
    }

    // Check if webcam access is supported.
    function getUserMediaSupported() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    // Enable the live webcam view and start classification.
    function toggleCam() {
      if (videoStream) {
        video.pause();
        videoStream.getTracks().forEach((t) => {
          t.stop();
        });
        videoStream = null;
        return;
      }

      var constraints = {
        video: true,
        audio: false,
      };

      // Activate the webcam stream.
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          videoStream = stream;
          video.srcObject = stream;
        })
        .catch((err) => {
          console.error(
            err +
              ". Check that your webcam is plugged in and nothing else is using it, then refresh the page."
          );
        });
    }

    function resetRoi() {
      rx = 139;
      ry = 59;
      rs = 342;
    }

    function showRoi() {
      roi.classList.remove("hide");
      pupilXLocator.classList.remove("hide");
      pupilYLocator.classList.remove("hide");
    }

    function updatePrediction(delay) {
      delay = delay ?? 100;
      clearTimeout(updatePredictionTimeout);
      if (video.readyState >= 2) updatePredictionTimeout = setTimeout(predictOnce, delay);
    }

    function setRoi() {
      if (!freezeROI) {
        var left = parseInt(rx);
        var top = parseInt(ry);
        var size = parseInt(rs);
        var roiStyle = window.getComputedStyle(roi);
        var border: number = Math.round(
          parseFloat(roiStyle.borderWidth || roiStyle.borderTopWidth)
        );

        roi.style.left = left - border + "px";
        roi.style.top = top - border + "px";
        roi.style.width = roi.style.height = size + "px";
      }
    }

    function dragstart(event) {
      event.dataTransfer.setData("application/node type", this);
      var style = window.getComputedStyle(roi, null);

      var offsetX = parseInt(style.getPropertyValue("left")) - event.clientX;
      var offsetY = parseInt(style.getPropertyValue("top")) - event.clientY;

      dragOffset = [offsetX, offsetY];

      event.dataTransfer.setDragImage(new Image(), 0, 0);
      event.dataTransfer.effectAllowed = "move";
	  
	  
    }

    function dragover(event) {
      if (dragOffset) {
        var [offsetX, offsetY] = dragOffset;

        var size = parseInt(rs);
        var roiStyle = window.getComputedStyle(roi);
        var border: number = Math.round(
          parseFloat(roiStyle.borderWidth || roiStyle.borderTopWidth)
        );

        var newX = Math.floor(event.clientX + parseInt(offsetX));
        var newY = Math.floor(event.clientY + parseInt(offsetY));

        var maxX = video.videoWidth - size - border;
        var maxY = video.videoHeight - size - border;

        newX = Math.max(-border, Math.min(newX, maxX));
        newY = Math.max(-border, Math.min(newY, maxY));

        roi.style.left = newX + "px";
        roi.style.top = newY + "px";

        rx = newX + border;
        ry = newY + border;

        event.preventDefault();
        return false;
      } else return true;
    }

    function resizestart(event) {
      event.dataTransfer.setData("application/node type", this);
      var style = window.getComputedStyle(roi, null);
      var offsetX = parseInt(style.getPropertyValue("width")) - event.clientX;
      var offsetY = parseInt(style.getPropertyValue("height")) - event.clientY;

      resizeSize = [offsetX, offsetY];

      event.dataTransfer.setDragImage(new Image(), 0, 0);
      event.dataTransfer.effectAllowed = "move";
    }

    function resizeover(event) {
      if (resizeSize) {
        var [offsetX, offsetY] = resizeSize;
        var width = video.videoWidth;
        var height = video.videoHeight;
        var maxSize = Math.min(width - rx, height - ry);
        var newW = Math.floor(event.clientX + parseInt(offsetX));
        var newH = Math.floor(event.clientY + parseInt(offsetY));
        var newSize = Math.min(Math.min(newW, newH), maxSize);

        rs = newSize;

        if (rs < 20) rs = 20;

        roi.style.width = rs + "px";
        roi.style.height = rs + "px";

        event.preventDefault();
        return false;
      } else return true;
    }

    function drop(event) {
      dragOffset = undefined;
      resizeSize = undefined;
      event.preventDefault();
      return false;
    }

    function updatePupilLocator(x, y) {
      if (x < 0 || y < 0) {
	    pupilXLocator.style.display = pupilYLocator.style.display = "none";
	  } else {
        pupilXLocator.style.left = x + "px";
        pupilXLocator.style.height = video.videoHeight + "px";

        pupilYLocator.style.width = video.videoWidth + "px";
        pupilYLocator.style.top = y + "px";

        pupilXLocator.style.display = pupilYLocator.style.display = "block";
      }
    }

    function loadModel() {
      var modelUrl =
        "../../plugin-meye-config/models/meye-segmentation_i128_s4_c1_f16_g1_a-relu-no-subj/model.json";

      return tf.loadGraphModel(modelUrl).then((loadedModel) => {
        model = loadedModel;
        tf.tidy(() => {
          model.predict(tf.zeros([1, 128, 128, 1]))[0].data();
        });
      });
    }

    function predictFrame() {
      var timestamp = new Date();
      var timecode = video.currentTime;

      var x = parseInt(rx);
      var y = parseInt(ry);
      var s = parseInt(rs);

      // Now var's start classifying a frame in the stream.
      var frame: any = tf.browser
        .fromPixels(video, 3)
        .slice([y, x], [s, s])
        .resizeBilinear([128, 128])
        .mul(rgb)
        .sum(2);

      frame = frame.clipByValue(0, 255);
      frame = frame.div(_255);

      tf.browser.toPixels(frame, input);

      var [maps, eb] = model.predict(frame.expandDims(0).expandDims(-1));

      // some older models have their output order swapped
      if (maps.rank < 4) [maps, eb] = [eb, maps];

      // take first channel in last dimension
      var pupil = maps.slice([0, 0, 0, 0], [-1, -1, -1, 1]).squeeze();
      var [eye, blink] = eb.squeeze().split(2);

      pupil = tf.cast(pupil.greaterEqual(threshold), "float32").squeeze();

      var pupilArea = pupil.sum().data();
      var blinkProb = blink.data();

      pupil = pupil.array();

      return [pupil, timestamp, timecode, pupilArea, blinkProb];
    }

    function keepLargestComponent(array) {
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
    }

    function findZero(array) {
      var h = array.length;
      var w = array[0].length;
      for (var i = 0; i < h; ++i) for (var j = 0; j < w; ++j) if (array[i][j] < 0.5) return [i, j];
      return null;
    }

    function floodFill(array) {
      var h = array.length;
      var w = array[0].length;
      var [r0, c0] = findZero(array);
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
    }

    function fillHoles(array) {
      var h = array.length;
      var w = array[0].length;
      var filled = array.map((r) => r.map((c) => c));
      floodFill(filled);

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
    }

    function findCentroid(array) {
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
    }

    function predictOnce() {
      if (!model) return null;
      else {
        var outs = tf.tidy(predictFrame);

        return Promise.all(outs).then((outs) => {
          var [pupil, timestamp, timecode, pupilArea, blinkProb] = outs;

          pupilArea = pupilArea[0];
          blinkProb = blinkProb[0];

          var pupilX = -1;
          var pupilY = -1;

          if (pupilArea > 0) {
            pupilArea = keepLargestComponent(pupil);
            pupilArea += fillHoles(pupil);

            if (freezeROI) {
			  var midRoiX = (rs / 2) + rx;
			  var midRoiY = (rs / 2) + ry;
			  [pupilX, pupilY] = [midRoiX, midRoiY];
			} else {
			  [pupilX, pupilY] = findCentroid(pupil);
              var x = parseInt(rx);
              var y = parseInt(ry);
              var s = parseInt(rs);
			
              pupilX = (pupilX * s) / 128 + x;
              pupilY = (pupilY * s) / 128 + y;
			}
          }

          updatePupilLocator(pupilX, pupilY);

          // for Array, toPixel wants [0, 255] values
          for (var i = 0; i < pupil.length; ++i)
            for (var j = 0; j < pupil[0].length; ++j)
              if (pupil[i][j] > 0.5) pupil[i][j] = [255 * pupil[i][j], 0, 0]; // red
              else {
                var v = Math.round(pupil[i][j] * 255);
                pupil[i][j] = [v, v, v]; // gray
              }

          tf.browser.toPixels(pupil, output);

          if (mode == null) {
            mode = "performanceCheck";
            threshHolder = 0.01;
            setThreshold();
            predictLoop();
          }

          return [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY];
        });
      }
    }

    function predictLoop() {
      // if no model OR performance check complete but not calibrating OR playback is started but video is not loaded, wait.
      if (trial.auto_calibrate && (!model || mode == "standby" || (!video.paused && video.readyState < 3))) {
        window.requestAnimationFrame(predictLoop); // This literally just keeps the loop going.
        return;
      }

      predictOnce().then((outs) => {
        video.play(); // TODO fix to work without.
        let [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY] = outs;

        // follow eye
        if (pupilX > 0) {
          var curX = rx;
          var curY = ry;

          var newX = Math.round(pupilX - rs / 2);
          var newY = Math.round(pupilY - rs / 2);

          newX = Math.round((1 - blinkProb) * newX + blinkProb * curX);
          newY = Math.round((1 - blinkProb) * newY + blinkProb * curY);

          var m = 0.2;
          newX = Math.round((1 - m) * newX + m * curX);
          newY = Math.round((1 - m) * newY + m * curY);

          var maxX = video.videoWidth - rs;
          var maxY = video.videoHeight - rs;

          newX = Math.min(Math.max(0, newX), maxX);
          newY = Math.min(Math.max(0, newY), maxY);

          rx = newX;
          ry = newY;

          setRoi();
        }

        // pause prediction when video is paused
        if (!video.paused) {
          if (threshHolder > 1) calculateOptimal();
          window.requestAnimationFrame(predictLoop);
        }

        if (!calibrated) {
          var sample = [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY];
          addSample(sample);
        }

        // update FPS counter
        framesThisSecond++;
      });
    }

    function startCalibration() {
      threshAvg = [];
      calibrated = false;
      mode = "calibrate";
      threshHolder = 0.01;
      setThreshold();
      hideRoiGUI();

      calibrateBtn.disabled =
        ruleCheck.disabled =
        continueBtn.disabled =
        freezeBtn.disabled =
        invertGuiBtn.disabled =
          true;
      freezeROI = false;
    }

    function clearData() {
      samples.length = 0;

      //pupil
      totalPa = 0;
      totalPx = 0;
      totalPy = 0;

      //ROI
      totalRx = 0;
      totalRy = 0;
    }

    function setThreshold() {
      threshold = threshHolder;
      updatePrediction(5);
    }

    function addSample(sample) {
		// sorry for the spaghetti code uwu
		var [timestamp, timecode, pupilArea, blinkProb, pupilX, pupilY] = sample;

		if (mode == "calibrate") {
			if (pupilArea != 0) {
				samples.push(sample);
				totalPa = totalPa + pupilArea;

				// We have this conditional because pupil x,y are both -1 if Meye can't detect the pupil, which throws off the true average calculated later.
				if (pupilX > 0 && pupilY > 0) {
					totalPx = totalPx + pupilX;
					totalPy = totalPy + pupilY;
				}

				totalRx = totalRx + rx;
				totalRy = totalRy + ry;

				if (samples.length == samplesPerThresh) {
				  var thresholdDataObject = {
					  avgPa: totalPa / samplesPerThresh,
					  avgPx: totalPx / samplesPerThresh,
					  avgPy: totalPy / samplesPerThresh,
					  avgRx: Math.round(totalRx / samplesPerThresh),
					  avgRy: Math.round(totalRy / samplesPerThresh),
					  roiSize: rs,
					  threshValue: parseFloat(threshHolder.toFixed(2)), // More decimal places are unnecessary bc of iteration size of threshold
				  };

				  phaseOneInfoDiv.innerHTML = "<b>" + Math.round(threshHolder * 100) + "%</b> complete";
				  threshAvg.push(thresholdDataObject); // The zeroth threshAvg is when the threshold is at 0.01. The threshold is also a property of the object above.
				  threshHolder = parseFloat(threshHolder.toString()) + 0.01;
				  setThreshold();
				  clearData();
				}
			} else {
				// Skip adding data object if any samples within it had Pa = 0. This is because Pa = 0 is really stinky data to calibrate off.
				phaseOneInfoDiv.innerHTML = "<b>" + Math.round(threshHolder * 100) + "%</b> complete";
				threshHolder = parseFloat(threshHolder.toString()) + 0.01;
				setThreshold();
			}
		} else if (mode == "performanceCheck") {
		  if (trial.auto_calibrate) {
			if (avgFps > benchmark) {
			  benchmark = avgFps;
			} else if (avgFps < benchmark) {
			  analyzePerformance(benchmark);
			  clearData();
			  prepForCalibration();
			}
		  } else {
		    postPerformanceCheck();
		    mode = "standby";
		  } 
		} else if (mode == "standby" && !trial.auto_calibrate) {
		  idealObject = {
			avgPa: pupilArea,
			avgPx: pupilX,
			avgPy: pupilY,
			avgRx: rx,
			avgRy: ry,
			roiSize: rs,
			threshValue: threshold,
		  }
		}
	}

    function prepForCalibration() {
      mode = "standby";
      resetRoi();
      roi.style.left = rx + "px";
      roi.style.top = ry + "px";
      roi.style.width = roi.style.height = rs + "px";
      threshHolder = 1;
      setThreshold();
      phaseOneInfoDiv.innerHTML = "<b>0%</b> complete";
    }

    function ruleChecked() {
      if (ruleCheck.checked) {
        if (trial.auto_calibrate) calibrateBtn.disabled = false;
        if ((calibrated && calibrationSuccess) || (!trial.auto_calibrate && continueBtn.disabled)) continueBtn.disabled = false;
      } else {
		if (trial.auto_calibrate) calibrateBtn.disabled;
		continueBtn.disabled = true;
      }
	}

    function analyzePerformance(parsedBenchmark) {
      // Formula: (numberOfThresholds * samplesPerThreshold) / benchmark = secondsCalibrationTakes. numberOfThresholds = 99 (since we go from 0.01 to 1).
      if (parsedBenchmark < 25) {
        // Solving for 5 samples per threshold (what I decided as the minimum number of samples PC's need for participation) and rounded up yielded a minimum fps requirement of 25
        infoBox.innerHTML =
          "<br />Your computer is unable to participate in this experiment. You may exit and collect your reward for participation.<br><br><input type='button' id='exit-btn' value='Exit'>";
        exitBtn = document.getElementById("exit-btn");
        exitBtn.addEventListener("click", () => {
          display_element.dispatchEvent(exit);
        });
      } else {
		// Performance check was successful - client computer is powerful enough.
        samplesPerThresh = Math.floor((secondsCalibrationTakes * parsedBenchmark) / 99);
		postPerformanceCheck();
      }
    }
	
	function postPerformanceCheck() {
		if (trial.auto_calibrate) {
			infoBox.innerHTML = `<h4>Step 1: Get as close as possible to the screen, but make sure that you can still see its corners without moving your head and that your webcam can still see an eye. It may help to rest your chin on your hand.</h4>
									<h4>Step 2: Resize and reposition the red-edged square so that it covers your eyeball without extending past your plica semilunaris. The input preview and image to the side can help. It doesn't have to be perfect, and it's normal for the preview to be a still image when not calibrating.</h4> 
									<h4>Step 3: Change your positioning if you see a white reflection in your <i>pupil</i>. This can be avoided if light comes from the side, rather than the front.</h4>
									<p>Red-edged box settings:</p>
									<form>
										<input type='button' id='invert-gui-btn' value='Hide / show box dragger and resizer'> 
										<input type='button' id='freeze-btn' value='Freeze / unfreeze box position' disabled>
									</form>
									<p>Calibration can take up to 20 seconds and can be reattempted. After you click calibrate below, do not blink nor try to look around while the completion percent rises, and ensure that you are comfortably positioned. Although unlikely, your camera's software may allow you to zoom in or adjust brightness.</p>
									<p>From the moment that calibration starts to the end of participation, the experiment requires that you keep your head and camera as still as possible, and your lighting as constant as possible.</p>
									<form>
										<input type='checkbox' id='rule-confirm'>Okay!<br>
										<input type='button' id='calibrate-btn' value='Calibrate' disabled> 
										<input type='button' id='continue-btn' value='Continue' disabled>
									</form>
									<p id='complete-message'></p>
									<p id='freeze-warning' style="color: red"></p>`;
			
			calibrateBtn = document.getElementById("calibrate-btn");
			calibrateBtn.addEventListener("click", startCalibration);
		} else {
			infoBox.innerHTML = `<h4>Step 1: Get as close as possible to the screen, but make sure that you can still see its corners without moving your head and that your webcam can still see an eye. It may help to rest your chin on your hand.</h4>
									<h4>Step 2: Resize and reposition the red-edged square so that it covers your eyeball without extending past your plica semilunaris. The input preview and image to the side can help. It doesn't have to be perfect, and it's normal for the preview to be a still image when not calibrating.</h4> 
									<h4>Step 3: Change your positioning if you see a white reflection in your <i>pupil</i>. This can be avoided if light comes from the side, rather than the front.</h4>
									<p>Red-edged box settings:</p>
									<form>
										<input type='button' id='invert-gui-btn' value='Hide / show box dragger and resizer'> 
										<input type='button' id='freeze-btn' value='Freeze / unfreeze box position'>
									</form>
									<p>Ensure that you're comfortably positioned. Although unlikely, your camera's software may allow you to zoom in or adjust brightness.</p>
									Input a number or use the slider to change the sensitivity of pupil detection:<br><input type="number" min="0" max="1" step="0.01" value="0.01" id="control-thr-preview">
									<label><input type="range" min="0" max="1" step="0.01" id="control-thr"></label><br>
									<p>After you've configured the settings as best as you can, the experiment requires that you keep your head and camera as still as possible, and your lighting as constant as possible.</p>
									<form>
										<input type='checkbox' id='rule-confirm'>Okay!<br>
										<input type='button' id='continue-btn' value='Continue' disabled>
									</form>
									<p id='freeze-warning' style="color: red"></p>`;
									
			controlThrPreview = document.getElementById("control-thr-preview");
			controlThr = document.getElementById("control-thr");
			
			// I used 1 - threshold in the following code and event handlers so that the GUI presents participants with increasing numbers = increasing sensitivity since I thought this would be more intuitive
			controlThrPreview.value = controlThr.value = 1 - threshold;
			
			controlThrPreview.addEventListener("input", (e) => {
				// Setting threshold to 0 (i.e., the GUI to 1) crashes the software even with the original meye (when morphology is enabled, which it is for js-mEye), so the following conditional safeguards against this.
				if (e.target.value > 0.99) {
				  e.target.value = 0.99;
				}
				controlThr.value = e.target.value;
				threshHolder = 1 - e.target.value;
				setThreshold();
			});
			
			controlThr.addEventListener("input", (e) => {
				if (e.target.value > 0.99) {
				  e.target.value = 0.99;
				}
				controlThrPreview.value = e.target.value;
				threshHolder = 1 - e.target.value;
				setThreshold();
			});
		}

        // Initialize common page elements that we just added
        freezeBtn = document.getElementById("freeze-btn");
		freezeWarning = document.getElementById("freeze-warning");
        invertGuiBtn = document.getElementById("invert-gui-btn");
        continueBtn = document.getElementById("continue-btn");
        ruleCheck = document.getElementById("rule-confirm");
        completeMessage = document.getElementById("complete-message");

        ruleCheck.addEventListener("click", ruleChecked);
        invertGuiBtn.addEventListener("click", invertRoiGUI);
        freezeBtn.addEventListener("click", toggleRoiFreeze);
		
		mainDisplayElement.dispatchEvent(passedPerformanceCheck);
		
        showRoiGUI();
	}

    function invertRoiGUI() {
      if (roiDragger.style.visibility == "visible" && roiResizer.style.visibility == "visible")
        hideRoiGUI();
      else if (roiDragger.style.visibility == "hidden" && roiResizer.style.visibility == "hidden")
        showRoiGUI();
    }

    function showRoiGUI() {
      roiDragger.style.visibility = roiResizer.style.visibility = "visible";
    }
    function hideRoiGUI() {
      roiDragger.style.visibility = roiResizer.style.visibility = "hidden";
    }

    var calibrationSuccess = false;
    var freezeROI = false;

    function toggleRoiFreeze() {
      if (freezeROI) {
	    freezeROI = false;
		freezeWarning.innerHTML = ``;
	  } else {
	    freezeROI = true;
		freezeWarning.innerHTML = `You must unfreeze the box to continue.`;
	  }
    }

    function calculateOptimal() {
      var variability = [];
      if (threshAvg.length - thresholdsPerVariance < 1) {
        badCalibration();
      } else {
        // Fill an array with variabilities
        for (var b = 0; b < threshAvg.length - thresholdsPerVariance; b++) {
          var bandTotal = 0;
          var diffSum = 0;

          // Get band average
          for (var c = b; c < b + thresholdsPerVariance; c++) bandTotal += threshAvg[c].avgPa;
          var bandAvg: number = Number((bandTotal / thresholdsPerVariance).toFixed(4));

          // Get band variability
          for (var c = b; c < b + thresholdsPerVariance; c++)
            diffSum += Math.abs(threshAvg[c].avgPa - bandAvg);

          if (diffSum == 0) badCalibration();

          variability.push((diffSum / thresholdsPerVariance).toFixed(4));
        }

        // Default cases
        var optimalBandValue = variability[0];
        var optimalBandPos = 0;

        // Find band with lowest variability (closest to zero)
        for (var a = 1; a < variability.length; a++) {
          if (Math.abs(variability[a]) < optimalBandValue) {
            optimalBandValue = Math.abs(variability[a]);
            optimalBandPos = a;
          }
        }

        // Use median element in optimal band, rounded down.
        var optimalThreshAvgPos = optimalBandPos + Math.floor(thresholdsPerVariance / 2);
        idealObject = threshAvg[optimalThreshAvgPos];

        updatePupilLocator(idealObject.avgPx, idealObject.avgPy);
        rx = idealObject.avgRx;
        ry = idealObject.avgRy;
        setRoi();
        threshHolder = idealObject.threshValue; // TODO parse this to setThreshold instead of setting separately
        setThreshold();

        phaseOneInfoDiv.innerHTML = "<b>Wowie, it's done!</b>";
        completeMessage.innerHTML = `<b>You may blink again.</b> Without moving your head, please check if: 
											<ul><li>There is a red dot covering your pupil in the video feed (you may have to click the button that temporarily hides the dragger and resizer),</li>
											<li>The dot isn't jumping around,</li><li>The dot doesn't leak over your iris.</li></ul>
											If the above are not met, you will need to recalibrate. Otherwise, continue without resizing or repositioning the red box. I love you very much.`;
        calibrationSuccess = calibrated = true;
      }

      // Housekeeping
      calibrateBtn.value = "Recalibrate";
	  
      calibrateBtn.disabled =
        ruleCheck.disabled =
        freezeBtn.disabled =
        invertGuiBtn.disabled =
        continueBtn.disabled =
          false;
		  
      showRoiGUI();
      clearData();
    }

    function badCalibration() {
      completeMessage.innerHTML =
        "Calibration quality was insufficient. Please adjust lighting, positioning, or the red box and try again. This can be tricky to get right.";
      calibrationSuccess = false;
      prepForCalibration();
    }

    var avgFps = 0.0;
    var alpha = 0.5;
    var framesThisSecond = 0;

    function computeFps() {
      avgFps = alpha * avgFps + (1.0 - alpha) * framesThisSecond;
      fpsPreview.textContent = avgFps.toFixed(1);
      fpsMeter.value = avgFps;
      framesThisSecond = 0;
    }
  }
}

export default MeyeConfigPlugin;
