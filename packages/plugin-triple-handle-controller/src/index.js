/**
 * jspsych-triple-handle-controller
 * version 0.1.0
 *
 * A jsPsych plugin for real-time annotation of videos using a game controller.
 *
 * Created by Caluã de Lacerda Pataca and Russell Lee
 *
 * This plugin allows participants to watch a video and use a game controller to provide continuous ratings along three axes in real time. The plugin records the data at specified intervals and provides a visual representation of the controller's axes on the screen.
 *
 * Features:
 *  - Collects real-time responses to a video using a game controller with multiple axes.
 *  - Displays visual feedback of the controller's axes on the screen.
 *  - Allows recording, playing, and resetting of annotations.
 *
 *
 * Parameters:
 *  - **title**: The title displayed above the video.
 *  - **video_src**: The source URL of the video to be annotated.
 *  - **axis_1**, **axis_2**, **axis_3**: Indices of the game controller axes to be used.
 *  - **axis_location**: The location of the axes on the screen. L = left, H = hidden, R = right.
 *  - **mode**: Mode of operation (e.g., "DEBUG").
 *  - **axes_labels**: Labels for each axis.
 *  - **axis1_labels**, **axis2_labels**, **axis3_labels**: Labels for the scales of each axis.
 *  - **rate**: The sampling rate (in milliseconds) for recording data.
 *  - **controller_detection_message**: The message to tell the user to connect or activate a controller.
 *  - **play_string**, **pause_string**, **record_string**, **try_again_string**, **save_string**: Strings for button labels.
 */

var jsTripleHandleController = (function (jspsych) {
  "use strict";

  /* Set up constants */
  const info = {
    name: "3-axis video annotation",
    version: "1.0.0",
    parameters: {
      title: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "The title displayed above the video",
      },
      video_src: {
        type: jspsych.ParameterType.STRING,
        default: undefined,
        description: "The source URL of the video",
      },
      axis_1: {
        type: jspsych.ParameterType.INT,
        default: undefined,
        description:
          "Indices of the game controller axis that will control measurement axis 1.",
      },
      axis_2: {
        type: jspsych.ParameterType.INT,
        default: undefined,
        description:
          "Indices of the game controller axis that will control measurement axis 2.",
      },
      axis_3: {
        type: jspsych.ParameterType.INT,
        default: undefined,
        description:
          "Indices of the game controller axis that will control measurement axis 3.",
      },
      axis_location: {
        type: jspsych.ParameterType.STRING,
        array: true,
        default: ["L", "H", "R"],
        description:
          "The location of the axes on the screen. L = left, H = hidden, R = right.",
      },
      mode: {
        type: jspsych.ParameterType.STRING,
        default: "DEBUG",
        description: "Mode of operation (e.g., 'DEBUG').",
      },
      axes_labels: {
        type: jspsych.ParameterType.COMPLEX,
        default: ["axis1", "axis2", "axis3"],
        description: "Labels for each axis",
      },
      axis1_labels: {
        type: jspsych.ParameterType.COMPLEX,
        default: ["low", "neutral", "high"],
        description: "Labels for the scales of axis 1",
      },
      axis2_labels: {
        type: jspsych.ParameterType.COMPLEX,
        default: ["negative", "neutral", "positive"],
        description: "Labels for the scales of axis 2",
      },
      axis3_labels: {
        type: jspsych.ParameterType.COMPLEX,
        default: ["a", "b", "c"],
        description: "Labels for the scales of axis 3",
      },
      rate: {
        type: jspsych.ParameterType.INT,
        default: 1000,
        description: "The sampling rate in milliseconds",
      },
      controller_detection_message: {
        type: jspsych.ParameterType.STRING,
        default: `A controller with throttles has not been detected.
          If you have already plugged one in, please try pressing any
          of its buttons or sliding its throttles to activate it.`,
        description: "Message to tell the user to connect or activate a controller."
      },
      play_string: {
        type: jspsych.ParameterType.STRING,
        default: "Play",
        description: "String to represent the play button.",
      },
      pause_string: {
        type: jspsych.ParameterType.STRING,
        default: "Pause",
        description: "String to represnt the pause button.",
      },
      record_string: {
        type: jspsych.ParameterType.STRING,
        default: "Record",
        description: "String to represnt the record button.",
      },
      try_again_string: {
        type: jspsych.ParameterType.STRING,
        default: "Try again",
        description: "String to represnt the 'Try Again' button.",
      },
      save_string: {
        type: jspsych.ParameterType.STRING,
        default: "Save",
        description: "String to represnt the save button.",
      },
    },
  };

  /**
   * **Subjective Perception Logger**
   *
   * This plugin collects responses to an video file in real time
   * using a game controller.
   *
   * @author YOUR NAME
   * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
   */
  class jsTripleHandleControllerPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.playButtonClick = this.playButtonClick.bind(this);
      this.recordButtonClick = this.recordButtonClick.bind(this);
      this.resetButtonClick = this.resetButtonClick.bind(this);
      this.saveButtonClick = this.saveButtonClick.bind(this);
      this.updateStatus = this.updateStatus.bind(this);
      this.connectHandler = this.connectHandler.bind(this);
      this.disconnectHandler = this.disconnectHandler.bind(this);
      this.videoEnded = this.videoEnded.bind(this);
    }

    /**
     * Finds (seeks) out gamepads.
     * @returns {Array} An Array of Gamepad objects
     */
    seekGamepads() {
      return navigator.getGamepads
        ? navigator.getGamepads()
        : webkitGetGamepads
        ? webkitGetGamepads()
        : [];
    }

    /**
     * Converts a value from one range to another.
     * @param {Number} value Value to convert.
     * @param {Number} in_min Minimum value of the old range.
     * @param {Number} in_max Maximum value of the old range.
     * @param {Number} out_min Minimum value of the new range.
     * @param {Number} out_max Minimum value of the new range.
     * @returns {Number} The value from the old range converted to the new range.
     */
    mapValue(value, in_min, in_max, out_min, out_max) {
      return (
        ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
      );
    }

    /**
     * Collects and update values from a controller.
     * @returns {undefined} No value.
     */
    updateStatus() {
      if (!this.animate) {
        return;
      }
      const gamepads = this.seekGamepads();
      if (gamepads.length == 0) {
        return;
      }
      for (const i in gamepads) {
        // this assumes only one plugged in controller
        if (gamepads[i] && "axes" in gamepads[i]) {
          let axis3 = gamepads[i].axes[this.axis3],
            axis2 = gamepads[i].axes[this.axis2],
            axis1 = gamepads[i].axes[this.axis1];
          let axis3Meter = 1 - (axis3 + 1) / 2,
            axis2Meter = 1 - (axis2 + 1) / 2,
            axis1Meter = 1 - (axis1 + 1) / 2;

          this.currentAxis1 = Math.max(
            0,
            this.mapValue(axis1Meter, this.zeroThreshold, 1, 0, 1)
          );
          this.currentAxis2 = Math.max(
            0,
            this.mapValue(axis2Meter, this.zeroThreshold, 1, 0, 1)
          );
          this.currentAxis3 = Math.max(
            0,
            this.mapValue(axis3Meter, this.zeroThreshold, 1, 0, 1)
          );
          try {
            document
              .getElementById("thc-measuring-dimension-2")
              .style.setProperty(
                `--meter-height`,
                Math.ceil(100 * this.currentAxis3) / 100
              );
          } catch {}
          try {
            document
              .getElementById("thc-measuring-dimension-1")
              .style.setProperty(
                `--meter-height`,
                Math.ceil(100 * this.currentAxis2) / 100
              );
          } catch {}
          try {
            document
              .getElementById("thc-measuring-dimension-0")
              .style.setProperty(
                `--meter-height`,
                Math.ceil(100 * this.currentAxis1) / 100
              );
          } catch {}
        }
      }
      requestAnimationFrame(this.updateStatus);
    }

    /**
     * Ends a trial.
     */
    endIt() {
      window.clearInterval(this.interval);
      this.animate = false;
      // end trial
      this.jsPsych.finishTrial({
        data_arrays: this.dataArrays,
        rate: this.rate,
        video_src: this.videoSrc,
        duration: this.videoDuration,
      });
    }

    /**
     * Checks if there is a controller with at least two axises are plugged in.
     * @returns {Boolean} True if a controller with at least two axes are pluged in, false otherwise
     */
    validControllerPluggedIn() {
      const gamepads = this.seekGamepads();
      if (gamepads.length == 0) {
        return false;
      }
      let foundAxis3Throttle = false,
        foundAxis2Throttle = false,
        foundAxis1Throttle = false;
      for (const i in gamepads) {
        if (gamepads[i] && "axes" in gamepads[i]) {
          if (gamepads[i].axes[this.axis3] !== undefined) {
            foundAxis3Throttle = true;
          }
          if (gamepads[i].axes[this.axis2] !== undefined) {
            foundAxis2Throttle = true;
          }
          if (gamepads[i].axes[this.axis1] !== undefined) {
            foundAxis1Throttle = true;
          }
        }
      }
      return foundAxis1Throttle && foundAxis2Throttle && foundAxis3Throttle;
    }

    /**
     * Connects a gamepad.
     * @param {Gamepad} e The gamepad object to be connected.
     */
    connectHandler(e) {
      this.controllers[e.gamepad.index] = e.gamepad;
      if (this.validControllerPluggedIn()) {
        document.getElementById("thc-overlay").style.display = "none";
        this.startDataCollection();
      }
    }
    /**
     * Disconnects a gamepad.
     * @param {Gamepad} e The gamepad object to be disconnected.
     */
    disconnectHandler(e) {
      delete this.controllers[e.gamepad.index];
      if (!this.validControllerPluggedIn()) {
        document.getElementById("thc-overlay").style.display = "flex";
        this.pauseRecording();
        this.pausePlaying();
      }
    }
    /**
     * Starts the data collection
     * @returns {undefined} No value if there is data collection already started.
     */
    startDataCollection() {
      if (this.interval != null) {
        // has already started!
        return;
      }

      if (Object.keys(this.controllers).length > 0) {
        this.animate = true;
        requestAnimationFrame(this.updateStatus);
        this.interval = window.setInterval(() => {
          this.recordData();
        }, this.rate);
      }
    }

    /**
     * Records data from the controller.
     * @returns {undefined} No data
     */
    recordData() {
      if (
        this.currentAxis1 == null ||
        this.currentAxis2 == null ||
        this.currentAxis3 == null ||
        this.videoPlayer.paused ||
        !this.recordingData
      ) {
        this.recordingFeedback.innerText = "";
        return;
      }
      if (this.mode == "DEBUG") {
        this.recordingFeedback.innerText = "Recording";
      }
      let i = this.dataArrays.length - 1;
      this.dataArrays[i].axis1Array.push(this.currentAxis1);
      this.dataArrays[i].axis2Array.push(this.currentAxis2);
      this.dataArrays[i].axis3Array.push(this.currentAxis3);
      console.log(this.currentAxis1, this.currentAxis2, this.currentAxis3);
    }

    /**
     * Resets all axis data
     */
    resetData() {
      this.dataArrays.pop();
      this.dataArrays.push({ axis1Array: [], axis2Array: [], axis3Array: [] });
    }

    /**
     * Starts the video.
     */
    startPlaying() {
      this.playBtn.textContent = this.pauseStr;
      this.playBtn.classList.add("active-btn");
      this.videoPlayer.classList.add("playing");
      this.recordBtn.disabled = true;
      this.videoPlayer.play();
    }

    /**
     * Pauses the video.
     */
    pausePlaying() {
      this.playBtn.textContent = this.playStr;
      this.playBtn.classList.remove("active-btn");
      this.videoPlayer.classList.remove("playing");
      this.recordBtn.disabled = false;
      this.videoPlayer.pause();
    }

    /**
     * Starts recording of data. Also starts the video in the video player.
     */
    startRecording() {
      if (!this.recordingData) {
        this.recordingData = true;
        this.videoPlayer.currentTime = 0;
      }
      this.resetBtn.disabled = false;
      this.videoPlayer.classList.add("recording");
      this.measuringNeedles[0].classList.add("recording");
      this.measuringNeedles[1].classList.add("recording");
      this.measuringNeedles[2].classList.add("recording");
      this.recordBtn.textContent = this.pauseStr;
      this.recordBtn.classList.add("active-btn");
      this.playBtn.disabled = true;
      this.videoPlayer.play();
    }

    /**
     * Pauses recording of data.
     */
    pauseRecording() {
      this.videoPlayer.pause();
      this.videoPlayer.classList.remove("recording");
      this.measuringNeedles[0].classList.remove("recording");
      this.measuringNeedles[1].classList.remove("recording");
      this.measuringNeedles[2].classList.remove("recording");
      this.recordBtn.textContent = this.recordStr;
      this.recordBtn.classList.remove("active-btn");
      this.playBtn.disabled = false;
    }

    /**
     * Stops recording of data.
     */
    stopRecording() {
      this.pauseRecording();
      this.recordingData = false;
      this.resetData();
    }

    /**
     * Starts the video. Does not record data.
     * @returns {undefined} No value
     */
    playButtonClick() {
      if (this.playBtn.textContent == this.playStr) {
        if (this.recordingData) {
          // ask user if they want to reset previous recording
          /*if (
            !window.confirm(
              `There is a current recording in progress. Do you want to erase it?`
            )
          ) {
            console.log("where is this message")
            return;
          }*/
          this.stopRecording();
          this.videoPlayer.currentTime = 0;
        }

        this.startPlaying();
      } else {
        this.pausePlaying();
      }
    }

    /**
     * Starts recording data.
     */
    recordButtonClick() {
      // when the video is playing but not recording
      // this button will be disabled, so no need to
      // test those cases
      if (this.videoPlayer.paused) {
        this.startRecording();
      } else {
        this.pauseRecording();
      }
    }

    /**
     * Locks the video player button and unlocks the data buttons.
     */
    videoEnded() {
      if (this.recordingData) {
        // locks player buttons
        this.recordBtn.disabled = true;
        this.recordBtn.textContent = this.recordStr;
        this.recordBtn.classList.remove("active-btn");
        this.playBtn.disabled = true;
        this.playBtn.textContent = this.playStr;
        this.playBtn.classList.remove("active-btn");

        this.videoPlayer.classList.remove("recording", "playing");
        this.measuringNeedles[0].classList.remove("recording");
        this.measuringNeedles[1].classList.remove("recording");
        this.measuringNeedles[2].classList.remove("recording");
        // unlocks data button
        this.saveBtn.disabled = false;
      } else {
        this.videoPlayer.currentTime = 0;
        this.pausePlaying();
      }
    }

    /**
     * Resets the video and the recording.
     * @returns {undefined} No data
     */
    resetButtonClick() {
      if (this.recordingData) {
        // this might not always be needed, but it's probably
        // fine to call it just in case
        this.pauseRecording();
      }
      /*if (
        !window.confirm(
          `This will remove the already recorded data and start again. Are you sure?`
        )
      ) {
        return;
      }*/
      this.videoPlayer.currentTime = 0;
      this.resetData();
      this.recordBtn.disabled = false;
      this.playBtn.disabled = false;
      this.resetBtn.disabled = true;
      this.saveBtn.disabled = true;
    }

    /**
     * Saves data.
     */
    saveButtonClick() {
      this.endIt();
    }

    /**
     * Combines labels together
     * @param {*} labels The labels to be formatted
     * @returns {String} None if no labels,
     * HTML containing a span of the cominbed string otherwise.
     */
    formatLabels(labels) {
      if (!labels) {
        return ``;
      }
      return labels.map((s) => "<span>" + s + "</span>").join("");
    }

    /*containerFormatter(){
      console.log(this.axis_location);
      let leftHolder = 0;
      let rightHolder = 0;
      let gridBuilder = "";
      let gridIndex = 1;
      for (const item of this.axis_location){
        console.log(item);
        if (item == "L"){
          leftHolder++;
        } else if(item == "R"){
          rightHolder++;
        }
      }
      console.log(leftHolder, rightHolder);
      
      //return "50%";
    } */

    /**
     * Sets up a trial to record controller in real time
     * while watching a video.
     * @param {HTMLElement} display_element The DOM element
     * where jsPsych content is being rendered.
     * @param {object} trial Object containing all of the
     * parameters specified in the corresponding TimelineNode.
     */
    trial(display_element, trial) {
      this.animate = false;
      this.currentAxis1 = null;
      this.currentAxis2 = null;
      this.currentAxis3 = null;
      this.controllers = {};
      this.rate = trial.rate;
      this.mode = trial.mode ? trial.mode : "DEBUG";
      this.interval = null;
      this.axis1 = trial.axis_1;
      this.axis2 = trial.axis_2;
      this.axis3 = trial.axis_3;
      this.axis_location = trial.axis_location;
      this.dataArrays = [{ axis1Array: [], axis2Array: [], axis3Array: [] }];
      this.videoSrc = trial.video_src;
      this.controller_detection_message = trial.controller_detection_message;
      this.play_string = trial.play_string;
      this.pause_string = trial.pause_string;
      this.record_string = trial.record_string;
      this.try_again_string = trial.try_again_string;
      this.save_string = trial.save_string;
      /* actual zero on the throttle is `sticky,` so to avoid 
      forcing users to apply an excess of strength to move 
      the throttle out of 0, we slightly reduce the scale */
      this.zeroThreshold = 0.2;

      const throttleIndexesNew = [],
        throttleIndexesOld = [];

      let L = 0,
        R = 0;
      let axisIndex = 0,
        axis1Index = 0,
        axis2Index = 0,
        axis3Index = 0,
        videoIndex = 0;

      for (const item of this.axis_location) {
        //console.log("item = " + item);
        if (item == "R") {
          R++;
        } else if (item == "L") {
          L++;
        }
      }
      console.log(L, R);

      let gridTemplateColumns = "";
      for (let i = 0; i < L; i++) {
        gridTemplateColumns +=
          " minmax(min-content, var(--measuring-needle-w)) ";
      }
      gridTemplateColumns += " minmax(min-content, auto) ";
      for (let i = 0; i < R; i++) {
        gridTemplateColumns +=
          " minmax(min-content, var(--measuring-needle-w)) ";
      }

      console.log(gridTemplateColumns);
      //console.log("this.axis_location[0]");
      let i = 0;
      for (const j of this.axis_location) {
        console.log("item = " + j);
        if (j == "L") {
          //console.log(this.axis_location[item2]);
          throttleIndexesOld[axisIndex] = i.toString();
          throttleIndexesNew[axisIndex] = j;
          //console.log(i);
          axisIndex++;
        }
        i++;
      }
      console.log("/////////////");
      i = 0;
      for (const j of this.axis_location) {
        console.log("item = " + j);
        if (j == "R") {
          //console.log(this.axis_location[item2]);
          throttleIndexesOld[axisIndex] = i.toString();
          throttleIndexesNew[axisIndex] = j;
          axisIndex++;
        }
        i++;
      }
      console.log("/////////////");
      i = 0;
      for (const j of this.axis_location) {
        console.log("item = " + j);
        if (j == "H") {
          console.log(this.axis_location[j]);
          throttleIndexesOld[axisIndex] = i.toString();
          throttleIndexesNew[axisIndex] = j;
          axisIndex++;
        }
        i++;
      }
      //console.log(axisIndex);
      console.log(throttleIndexesOld);
      console.log(throttleIndexesNew);
      console.log("/////////////");

      i = 0;
      for (const [j, value] of throttleIndexesOld.entries()) {
        let valueInt = parseInt(value);
        // Add 1 to valueInt, as the var names are 1 indexed
        let varNameNumber = valueInt + 1;
        let axisColValue = 0;
        console.log("The axis number is = " + varNameNumber);
        // Column values are 1 indexed
        if (throttleIndexesNew[j] == "L") {
          //console.log(j);
          axisColValue = j + 1;
        } else if (throttleIndexesNew[j] == "R") {
          //console.log(j + 1);
          axisColValue = j + 2;
        } else {
          axisColValue = -1;
        }

        if (varNameNumber == 1) {
          axis1Index = axisColValue;
        } else if (varNameNumber == 2) {
          axis2Index = axisColValue;
        } else if (varNameNumber == 3) {
          axis3Index = axisColValue;
        }
      }

      this.playStr = `► ${this.play_string}`;
      this.pauseStr = `⏸ ${this.pause_string}`;
      this.recordStr = `● ${this.record_string}`;

      display_element.innerHTML =
        `
      <style>
        :root {
          --meter-height: 0.5;
          --meter-width: 3rem;
          --meter-margin: 3px;
          --meter-max-height: 80vh;
          --roundness: 3rem;
          --needle-gap: 3rem;
          --fast-transition: 0.2s;
          --meter-bg: 0, 0, 0;
          --meter-fg: 0, 0, 0;
          --meter-border-color: 255, 255, 255;
        }

        #js-thc-container {
          display: grid;
          gap: var(--needle-gap);
          padding-left: var(--needle-gap);
          padding-right: var(--needle-gap);
          box-sizing: border-box;
          --measuring-needle-w: calc(var(--meter-width) + var(--needle-gap));
          grid-template-columns: ${gridTemplateColumns};
          width: 100%;
        }

        .thc-measuring-needle-container {
          display: flex;
          justify-content: center;
          align-items: center;
          grid-row: 1;
        }

        .thc-measuring-needle {
          position: relative;
          height: var(--meter-max-height);
          width: var(--meter-width);
          background-color: rgb(var(--meter-bg));
          border-radius: var(--roundness);
        }

        .thc-measuring-needle.recording {
          --meter-fg: 255, 255, 255;
        }
        .thc-measuring-needle:after {
          content: "";
          transition: var(--fast-transition) ease background-color;
          position: absolute;
          bottom: var(--meter-margin);
          right: var(--meter-margin);
          left: var(--meter-margin);
          background-color: rgb(var(--meter-fg));
          border: var(--meter-margin) solid rgb(var(--meter-border-color));
          border-radius: var(--roundness);
          box-sizing: border-box;
          height: calc(
            (var(--meter-max-height) - 1 * var(--meter-margin) - var(--roundness)) *
              var(--meter-height) + var(--roundness) - var(--meter-margin)
          );
        }

        /* $ {this.axis_location[0] != "H" ?
        "#thc-measuring-dimension-0 {\
          grid-column: " + 0 + ";\
        }" : ""} */
        
        #thc-measuring-dimension-0 {
          grid-column: ` +
        axis1Index +
        `;
        }

        #thc-measuring-dimension-1 {
          grid-column: ` +
        axis2Index +
        `;
        }

         #thc-measuring-dimension-2 {
          grid-column: ` +
        axis3Index +
        `;
        } 

        .thc-measuring-labels, .thc-axis-label {
          display: flex;
          width: calc(var(--meter-max-height) - 1 * var(--roundness));
          height: 1rem;
          position: absolute;
          align-items: center;
          justify-content: space-between;
          text-transform: uppercase;
        }

        .thc-axis-label {
          font-weight: 700;
          justify-content: center;
        }

        /* face right of bar */
        #thc-measuring-dimension-0 .thc-measuring-labels, #thc-measuring-dimension-1 .thc-axis-label, #thc-measuring-dimension-2 .thc-axis-label  {
          transform: rotate(90deg)
            translateY(calc(var(--meter-width) * -0.5 - var(--meter-margin) * 4));
          flex-direction: row-reverse;
        }

        /* face left of bar */
        #thc-measuring-dimension-1 .thc-measuring-labels, #thc-measuring-dimension-0 .thc-axis-label, #thc-measuring-dimension-2 .thc-measuring-labels {
          transform: rotate(-90deg)
            translateY(calc(var(--meter-width) * -1 + var(--meter-margin) * 3.5));
          flex-direction: row;
        }

        /*
        #thc-video-container,
        #thc-measurements-plots {
          grid-column: 2;
        } */

        #thc-video-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 960px;
          gap: 1rem;
        }

        #thc-title {
          margin: 0;
          text-align: center;
        }

        #thc-video-toolbar {
          display: grid;
          grid-template-columns: max-content auto max-content;
          gap: 1rem;
        }

        #thc-video-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          grid-column: ${videoIndex}
        }

        #thc-player {
          width: 100%;
          box-sizing: border-box;
          transition: var(--fast-transition) ease border-color;
          border: calc(2 * var(--meter-margin)) solid black;
          border-radius: 0.25rem;
        }

        #thc-player.recording {
          border-color: tomato;
        }

        #thc-player.playing {
          border-color: mediumseagreen;
        }

        #thc-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(242, 242, 239, 0.9);
          backdrop-filter: blur(20px);
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
        }
  
        #thc-overlay p {
          max-width: 40ch;
          text-align: center;
          font-size: 1.5rem;
          line-height: 1.4;
        }

        #play-btn {
          color: seagreen;
          border-color: seagreen;
        }

        #play-btn:hover:not(disabled):not(.active-btn):not(:active) {
          background-color: #b7f7d3;
        }

        #play-btn:active, #play-btn.active-btn {
          background-color: seagreen;
          color: white;
        }

        #record-btn {
          border-color: tomato;
          color: tomato;
        }

        #record-btn:hover:not(disabled):not(.active-btn):not(:active) {
          background-color: mistyrose;
        }

        #record-btn:active, #record-btn.active-btn {
          background-color: tomato;
          color: white;
        }

        #play-btn:disabled, #record-btn:disabled {
          border-color: lightgray;
          color: lightgray;
          background-color: white !important;
        }

        #record-btn::first-letter {
        }

        #recording-feedback {
          position: fixed;
          left: 1rem;
          bottom: 1rem;
        }
      </style>
      <div id="thc-overlay">
        <p>
          ${this.controller_detection_message}
        </p>
      </div>
      <div id="recording-feedback">...</div>
      <div id="js-thc-container">
        <div id="thc-video-column">
          <div id="thc-video-container">
            ${trial.title ? '<h1 id="thc-title">' + trial.title + "</h1>" : ""}
            <video id="thc-player" width="100%" src="${
              trial.video_src ? trial.video_src : ""
            }"></video>
            <div id="thc-video-toolbar">
              <div class="thc-toolbar-group">
                <button id="play-btn" class="jspsych-btn player-btn">► ${this.play_string}</button>
                <button id="record-btn" class="jspsych-btn player-btn">● ${this.record_string}</button>
              </div>
              <span></span>

              <div class="thc-toolbar-group">
                <button id="reset-btn" class="jspsych-btn" disabled>${this.try_again_string}</button>
                <button id="save-btn" class="jspsych-btn" disabled>${this.save_string}</button>
              </div>
            </div>
          </div>
          <div id="thc-measurements-plots"></div>
        </div>
        ${
          axis1Index != -1
            ? `<div
            class="thc-measuring-needle-container"
            id="thc-measuring-dimension-0"
          >
            ${
              trial.axes_labels
                ? '<div class="thc-axis-label">' +
                  trial.axes_labels[0] +
                  "</div>"
                : ""
            }
            <div class="thc-measuring-needle"></div>
            <div class="thc-measuring-labels">
              ${this.formatLabels(trial.axis1_labels)}
            </div>
          </div>`
            : ``
        }
        ${
          axis2Index != -1
            ? `<div
            class="thc-measuring-needle-container"
            id="thc-measuring-dimension-1"
          >
            <div class="thc-measuring-needle"></div>
            ${
              trial.axes_labels
                ? '<div class="thc-axis-label">' +
                  trial.axes_labels[1] +
                  "</div>"
                : ""
            }
            <div class="thc-measuring-labels">
              ${this.formatLabels(trial.axis2_labels)}
            </div>
          </div>`
            : ``
        }
        ${
          axis3Index != -1
            ? `<div
          class="thc-measuring-needle-container"
          id="thc-measuring-dimension-2"
        >

          <div class="thc-measuring-needle"></div>
          ${
            trial.axes_labels
              ? '<div class="thc-axis-label">' + trial.axes_labels[2] + "</div>"
              : ""
          }
          <div class="thc-measuring-labels">
            ${this.formatLabels(trial.axis3_labels)}
          </div>
        </div>`
            : ``
        }
      </div>`;

      this.playBtn = document.getElementById("play-btn");
      this.recordBtn = document.getElementById("record-btn");
      this.resetBtn = document.getElementById("reset-btn");
      this.saveBtn = document.getElementById("save-btn");

      this.recordingData = false;

      this.recordingFeedback = document.getElementById("recording-feedback");
      if (this.mode !== "DEBUG") {
        this.recordingFeedback.style.display = "none";
      }

      this.playBtn.addEventListener("click", this.playButtonClick);
      this.recordBtn.addEventListener("click", this.recordButtonClick);
      this.resetBtn.addEventListener("click", this.resetButtonClick);
      this.saveBtn.addEventListener("click", this.saveButtonClick);

      this.videoPlayer = document.getElementById("thc-player");
      this.videoPlayer.addEventListener("ended", this.videoEnded);
      this.videoPlayer.addEventListener("loadedmetadata", () => {
        this.videoDuration = this.videoPlayer.duration;
      });

      this.measuringNeedles = document.getElementsByClassName(
        "thc-measuring-needle"
      );

      /**
       * Looks to see if a gamepad is connected.
       */
      window.addEventListener("gamepadconnected", (e) => {
        this.connectHandler(e);
      });

      /**
       * Looks to see if a gamepad is disconnected.
       */
      window.addEventListener("gamepaddisconnected", (e) => {
        this.disconnectHandler(e);
      });
    }
  }
  jsTripleHandleControllerPlugin.info = info;

  return jsTripleHandleControllerPlugin;
})(jsPsychModule);
