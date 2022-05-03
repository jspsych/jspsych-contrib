import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "rok",
  parameters: {
    /** The valid keys that the subject can press to indicate a response. */
    choices: {
      type: ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS",
    },
    /** The correct keys for that trial. */
    correct_choice: {
      type: ParameterType.KEYS,
      pretty_name: "Correct choice",
      default: undefined,
    },
    /** The length of stimulus presentation. Zero for endless loop. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: 0,
    },
    /** If true, then any valid key will end the trial. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /** The number of oriented objects per set in the stimulus. */
    number_of_oobs: {
      type: ParameterType.INT,
      pretty_name: "Number of oriented objectes",
      default: 300,
    },
    /** The direction of coherent motion in degrees (0 degre meaning right). */
    coherent_movement_direction: {
      type: ParameterType.INT,
      pretty_name: "Coherent movement direction",
      default: 0,
    },
    /** The orientation of the objects in degree (0 degree meaning right). */
    coherent_orientation: {
      type: ParameterType.INT,
      pretty_name: "Coherent object orientation",
      default: 0,
    },
    /** The percentage of oriented objects moving in the coherent direction. */
    coherence_movement: {
      type: ParameterType.INT,
      pretty_name: "Movement coherence",
      default: 50,
    },
    /** The percentage of objects that are oriented in the coherent orientation. */
    coherence_orientation: {
      type: ParameterType.INT,
      pretty_name: "Orientation coherence",
      default: 50,
    },
    /** The percentage of oriented objects moving in the direction opposite of the coherent direction. */
    coherence_movement_opposite: {
      type: ParameterType.INT,
      pretty_name: "Opposite movement coherence",
      default: 0,
    },
    /** The percentage of objects that are oriented opposite of the coherent orientation. */
    coherence_orientation_opposite: {
      type: ParameterType.INT,
      pretty_name: "Opposite orientation coherence",
      default: 0,
    },
    /** The movement speed of the oobs in (percentage of aperature_width)/second. */
    movement_speed: {
      type: ParameterType.INT,
      pretty_name: "Movement Speed",
      default: 10,
    },
    /** The percentage of randomisation in movement speed " +
         "(0 meaning all orientated objects move with speed defined in movement_speed," +
         " 100 meaning movement speeds from 0 to 2x movement_speed). */
    movement_speed_randomisation: {
      type: ParameterType.INT,
      pretty_name: "Movement speed randomisation",
      default: 0,
    },
    /** The size of the orientated objects in percentage of aperture_width. */
    oob_size: {
      type: ParameterType.INT,
      pretty_name: "Object size",
      default: 2,
    },
    /** The width of the aperture in pixels. */
    aperture_width: {
      type: ParameterType.INT,
      pretty_name: "Aperture width",
      default: 600,
    },
    /** The height of the aperture in pixels. */
    aperture_height: {
      type: ParameterType.INT,
      pretty_name: "Aperture height",
      default: 400,
    },
    /** The color of the dots. */
    oob_color: {
      type: ParameterType.STRING,
      pretty_name: "Dot color",
      default: "white",
    },
    /** The background of the stimulus. */
    background_color: {
      type: ParameterType.STRING,
      pretty_name: "Background color",
      default: "gray",
    },
    /** The presence of a border around the aperture. */
    border: {
      type: ParameterType.BOOL,
      pretty_name: "Border",
      default: false,
    },
    /** The thickness of the border in pixels. */
    border_thickness: {
      type: ParameterType.INT,
      pretty_name: "Border width",
      default: 1,
    },
    /**The color of the border. */
    border_color: {
      type: ParameterType.STRING,
      pretty_name: "Border Color",
      default: 1,
    },
    /** Apperance of stimulus (0-triangles, 1-circle, 2-square, 3-origami_birds, 4-image). */
    stimulus_type: {
      type: ParameterType.INT,
      pretty_name: "Stimulus type",
      default: 0,
    },
    /** Shade of aperture (0 - rectangular, 1 - elliptic). */
    aperture_shape: {
      type: ParameterType.INT,
      pretty_name: "aperture shape",
      default: 0,
    },
    /** Backgroundcolor of aperture */
    aperture_background_color: {
      type: ParameterType.STRING,
      pretty_name: "Background of aperture",
      default: "#0000",
    },
    /** Type of random movement (0 direction is random but fixed, 1 movement direction of incoherent oobs changes over time). */
    random_movement_type: {
      type: ParameterType.INT,
      pretty_name: "Random movement type",
      default: 0,
    },
    /** Type of random movement (0 - orientation is random but fixed, 1 - orientation of incoherent oobs changes over time). */
    random_orientation_type: {
      type: ParameterType.INT,
      pretty_name: "Random orientation type",
      default: 0,
    },
    /** Number of apertures. If greater then one, other parameters of trial should be arrays. */
    number_of_apertures: {
      type: ParameterType.INT,
      pretty_name: "Number of apertures",
      default: 1,
    },
    /** If this parameter is set, number_of_objects is interpreted as average number_of_objects per density_unit_area (in pixels). */
    density_unit_area: {
      type: ParameterType.INT,
      pretty_name: "Density area",
      default: null,
    },
    /** Position of midpoint of aperture in x direction in percentage of window width (50 being middle). */
    aperture_position_left: {
      type: ParameterType.INT,
      pretty_name: "Horizontal position of aperature",
      default: 50,
    },
    /** Position of midpoint of aperture in y direction in percentage of window width (0 being top, 50 being middle, 100 being bot). */
    aperture_position_top: {
      type: ParameterType.INT,
      pretty_name: "Vertical position of aperature",
      default: 50,
    },
    /** Prompt that is presented above the stimulus. */
    prompt: {
      type: ParameterType.STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** Fade the oobs on the edges of the aperture. */
    fade_out: {
      type: ParameterType.INT,
      pretty_name: "Fade out on edges",
      default: 0,
    },
    /** Pictures of stimuli, can be key-framed(animated) or randomised, see documentation. */
    stimulus_image: {
      type: ParameterType.IMAGE,
      pretty_name: "Stimuli pictures",
      default: null,
    },
    /** Background image, can be key-framed(animated) or randomised, see documentation. */
    background_image: {
      type: ParameterType.IMAGE,
      pretty_name: "Background image",
      default: null,
    },
    /** Number of keyframes in stimulus images. */
    stimulus_image_keyframes: {
      type: ParameterType.INT,
      pretty_name: "Keyframes of stimulus pictures",
      default: 1,
    },
    /** Number of keyframes in background pictures. */
    background_image_keyframes: {
      type: ParameterType.INT,
      pretty_name: "Keframse of background pictures",
      default: 1,
    },
    /** Time between keyframes. */
    stimulus_keyframe_time: {
      type: ParameterType.FLOAT,
      pretty_name: "Keyframe time",
      default: 0.1,
    },
    /** Mirror image instead of rotating (1 - x axis, 2 - y axis). */
    stimulus_mirror: {
      type: ParameterType.INT,
      pretty_name: "Mirror image time",
      default: 0,
    },
    /** Sets experiment to congruency mode: experiment_main_task has to be  set (0 = movement or 1 = orientation) if this is set to 1 or 2. The" +
         "congruency of the task does only apply to coherent oobs of main task. If this is set to 1 the remaining oobs secondary feature (the non task feature) is set at random." +
         "If this is set to 2 the remaining oobs have the same direction and orientation .*/
    experiment_congruency_mode: {
      type: ParameterType.INT,
      pretty_name: "Experiment congruency mode",
      default: 0,
    },
    /** Sets the main task when experiment is in congruency mode. The congruency of the other task then only" +
         "applies to non random oobs of main task. */
    experiment_main_task: {
      type: ParameterType.INT,
      pretty_name:
        "Main task when experiment is set to congruency mode (0- movement, 1-orientation)",
      default: 0,
    },
    /** Units in which size and speed of oobs is expressed (null - percentage of aperture width, px - pixels). */
    units: {
      type: ParameterType.STRING,
      pretty_name: "Units in which size and speed of oobs is expressed",
      default: null,
    },
    /** Should stimuli be drawn on top of each other or intermixed **/
    aperture_draw_mode: {
      type: ParameterType.STRING,
      pretty_name:
        "When in overlay draws stimuli of different apertures on top of each other. When in intermixed oobs all show up in one aperture intermixed",
      default: "overlay",
    },
  },
};

type Info = typeof info;

/**
 * **ROK**
 *
 * jsPsych plugin for showing a random object kinematogram stimulus and recording a keyboard response
 *
 * @author Younes Strittmatter
 * @see {@link https://www.jspsych.org/plugins/jspsych-rok/ RDK plugin documentation on jspsych.org}
 * @copyright
 *
 *    We would appreciate it if you cited this paper when you use the ROK:
 *
 * ----------------------
 *
 * Copyright (C) 2021 Younes Strittmatter
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 */
class RokPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    //--------------------------------------
    //---------SET PARAMETERS BEGIN---------
    //--------------------------------------

    //Note on '||' logical operator: If the first option is 'undefined', it evalutes to 'false' and the second option is returned as the assignment
    // Note: trial properties are now read-only, so these params have all been changed to separate variables here and throughout trial function
    var choices = assignParameterValue(trial.choices, []); //info.parameters.choices.default);
    var correct_choice = assignParameterValue(trial.correct_choice, undefined); //info.parameters.correct_choice.default);
    var trial_duration = assignParameterValue(trial.trial_duration, 0); //info.parameters.trial_duration.default);
    var response_ends_trial = assignParameterValue(trial.response_ends_trial, true); //info.parameters.response_ends_trial.default);
    var number_of_oobs = assignParameterValue(trial.number_of_oobs, 300); //info.parameters.number_of_oobs.default);
    var coherent_movement_direction = assignParameterValue(trial.coherent_movement_direction, 0); // info.parameters.coherent_movement_direction.default);
    var coherent_orientation = assignParameterValue(trial.coherent_orientation, 0); // info.parameters.coherent_orientation.default);
    var coherence_movement = assignParameterValue(trial.coherence_movement, 50); //info.parameters.coherence_movement.default);
    var coherence_orientation = assignParameterValue(trial.coherence_orientation, 50); //info.parameters.coherence_orientation.default);
    var coherence_movement_opposite = assignParameterValue(trial.coherence_movement_opposite, 50); //info.parameters.coherence_movement_opposite.default);
    var coherence_orientation_opposite = assignParameterValue(
      trial.coherence_orientation_opposite,
      50
    ); //info.parameters.coherence_orientation_opposite.default);
    var movement_speed = assignParameterValue(trial.movement_speed, 10); //info.parameters.movement_speed.default);
    var movement_speed_randomisation = assignParameterValue(trial.movement_speed_randomisation, 0); // info.parameters.movement_speed_randomisation.default);
    var oob_size = assignParameterValue(trial.oob_size, 2); //info.parameters.oob_size.default);
    var aperture_width = assignParameterValue(trial.aperture_width, 600); //info.parameters.aperture_width.default);
    var aperture_height = assignParameterValue(trial.aperture_height, 400); //info.parameters.aperture_height.default);
    var oob_color = assignParameterValue(trial.oob_color, "white"); //info.parameters.oob_color.default);
    var background_color = assignParameterValue(trial.background_color, "gray"); //info.parameters.background_color.default);
    var aperture_background_color = assignParameterValue(trial.aperture_background_color, "#0000");
    var border = assignParameterValue(trial.border, false); //info.parameters.border.default);
    var border_thickness = assignParameterValue(trial.border_thickness, 1); //info.parameters.border_thickness.default);
    var border_color = assignParameterValue(trial.border_color, "white"); //info.parameters.border_color.default);
    var stimulus_type = assignParameterValue(trial.stimulus_type, 0); //info.parameters.stimulus_type.default);
    var aperture_shape = assignParameterValue(trial.aperture_shape, 0); //info.parameters.aperture_shape.default);
    var random_movement_type = assignParameterValue(trial.random_movement_type, 0); //info.parameters.random_movement_type.default);
    var random_orientation_type = assignParameterValue(trial.random_orientation_type, 0); //info.parameters.random_orientation_type.default);
    var number_of_apertures = assignParameterValue(trial.number_of_apertures, 1); //info.parameters.number_of_apertures.default);
    var density_unit_area = assignParameterValue(trial.density_unit_area, null); //info.parameters.number_of_apertures.default);
    var aperture_position_left = assignParameterValue(trial.aperture_position_left, 50); //info.parameters.aperture_position_left.default);
    var aperture_position_top = assignParameterValue(trial.aperture_position_top, 50); //info.parameters.aperture_position_top.default);
    var prompt = assignParameterValue(trial.prompt, null); //info.parameters.prompt.default);
    var fade_out = assignParameterValue(trial.fade_out, 0); //info.parameters.fade_out.default);
    var stimulus_image = assignParameterValue(trial.stimulus_image, null); //info.parameters.stimulus_image.default);
    var background_image = assignParameterValue(trial.background_image, null); //info.parameters.background_image.default);
    var stimulus_image_keyframes = assignParameterValue(trial.stimulus_image_keyframes, 1); //info.parameters.stimulus_image_keyframes.default);
    var background_image_keyframes = assignParameterValue(trial.background_image_keyframes, 1); //info.parameters.background_image_keyframes.default);
    var stimulus_keyframe_time = assignParameterValue(trial.stimulus_keyframe_time, 0.1); //info.parameters.stimulus_keyframe_time.default);
    var stimulus_mirror = assignParameterValue(trial.stimulus_mirror, 0); //info.parameters.stimulus_mirror.default);
    var experiment_congruency_mode = assignParameterValue(trial.experiment_congruency_mode, 0); //info.parameters.experiment_congruency_mode.default);
    var experiment_main_task = assignParameterValue(trial.experiment_main_task, 0); //info.parameters.experiment_main_task.default);
    var units = assignParameterValue(trial.units, null);
    var aperture_mode = assignParameterValue(trial.aperture_draw_mode, "overlay");

    //--------------------------------------
    //----------SET PARAMETERS END----------
    //--------------------------------------

    //--------Set up canvases BEGIN -------
    let nApertures = number_of_apertures;
    let nAperturesTmp = nApertures;
    if (aperture_mode !== "overlay") {
      nApertures = 1;
    }

    //Create canvas elements and append it to the DOM
    var canvasArray = [];
    var containerArray = [];
    if (nApertures > 1) {
      for (let i = 0; i < nApertures; i++) {
        containerArray.push(document.createElement("div"));
        canvasArray.push(document.createElement("canvas"));
      }
    } else {
      containerArray.push(document.createElement("div"));
      canvasArray.push(document.createElement("canvas"));
    }
    for (let i = 0; i < nApertures; i++) {
      let imgPath = getValueFromArrayOrNot(background_image, i);
      if (imgPath != null) {
        containerArray[i].style.backgroundImage =
          "url(" + getValueFromArrayOrNot(background_image, i) + ")";
        containerArray[i].style.backgroundRepeat = "no-repeat";
        containerArray[i].style.backgroundSize = "cover";
      }

      display_element.appendChild(containerArray[i]);

      containerArray[i].appendChild(canvasArray[i]);
      if (Array.isArray(prompt)) {
        let p = document.createElement("div");
        p.style.margin = "0";
        p.style.padding = "0";
        containerArray[i].appendChild(p);
        p.style.textAlign = "center";
        p.innerHTML = prompt[i];
        p.style.position = "absolute";
        p.style.transform = "translate(-50%, 100%)";
        p.style.textAlign = "center";
        p.style.top = 10 + getValueFromArrayOrNot(aperture_height, 0) / 2 + "px";
        p.style.width = getValueFromArrayOrNot(aperture_width, 0) + "px";
      }
    }

    if (prompt != null && !Array.isArray(prompt)) {
      let p = document.createElement("div");
      p.style.margin = "0";
      p.style.padding = "0";
      containerArray[0].appendChild(p);
      p.style.textAlign = "center";
      p.innerHTML = prompt;
      p.style.position = "absolute";
      p.style.transform = "translate(-50%, 100%)";
      p.style.textAlign = "center";
      p.style.top = 10 + getValueFromArrayOrNot(aperture_height, 0) / 2 + "px";
      p.style.width = getValueFromArrayOrNot(aperture_width, 0) + "px";
    }

    //Get body element from jsPsych
    let body = document.getElementsByClassName("jspsych-display-element")[0] as HTMLElement;

    //Save the current settings to be restored later
    let originalMargin = body.style.margin;
    let originalPadding = body.style.padding;
    let originalBackgroundColor = body.style.backgroundColor;

    //Remove the margins and paddings of the display_element
    body.style.margin = "0";
    body.style.padding = "0";

    //Remove the margins and padding of the canvas, center it
    for (let i = 0; i < nApertures; i++) {
      containerArray[i].style.margin = "0px";
      containerArray[i].style.margin = "0px";
      canvasArray[i].style.margin = "0px";
      canvasArray[i].style.padding = "0px";
      canvasArray[i].style.position = "absolute";
      canvasArray[i].style.transform = "translate(-50%, -50%)";
    }

    //Set background color of body to be the same as
    body.style.backgroundColor = background_color;

    //Get the contexts of the canvases
    let ctxArray = [];
    for (let i = 0; i < nApertures; i++) {
      ctxArray.push(canvasArray[i].getContext("2d"));
    }

    // get dimensions of display element
    const disp_size = body.getBoundingClientRect();

    //Set canvases width, height, position and color;
    for (let i = 0; i < nApertures; i++) {
      canvasArray[i].width = getValueFromArrayOrNot(aperture_width, i);
      canvasArray[i].height = getValueFromArrayOrNot(aperture_height, i);
      canvasArray[i].style.backgroundColor = getValueFromArrayOrNot(aperture_background_color, i);
      containerArray[i].style.position = "absolute";

      if (Array.isArray(aperture_position_left) && Array.isArray(aperture_position_top)) {
        // calculate top from display size (resize module doesn't work with top beeing a percentage)
        let top = Math.round((aperture_position_top[i] * disp_size.height) / 100);
        containerArray[i].style.top = top.toString() + "px";

        containerArray[i].style.left = aperture_position_left[i].toString() + "%";
      } else {
        if (nApertures > 1) {
          let x;
          if (nApertures % 2 == 0) {
            x = i * (100 / nApertures) + 100 / (2 * nApertures);
          } else {
            x = i * (100 / (nApertures + 1)) + 100 / (2 * (nApertures - 1));
          }

          // calculate top from display size (resize module doesn't work with top being a percentage)
          let top = Math.round((aperture_position_top * disp_size.height) / 100);
          containerArray[i].style.top = top.toString() + "px";

          containerArray[i].style.left = x.toString() + "%";
        } else {
          // calculate top from display size (resize module doesn't work with top being a percentage)
          let top = Math.round((aperture_position_top * disp_size.height) / 100);
          containerArray[i].style.top = top.toString() + "px";

          containerArray[i].style.left = aperture_position_left.toString() + "%";
        }
      }
    }

    //--------Set up canvases END-------

    //--------rok variables and function calls begin--------

    //Initialize stopping condition for animation function that runs in a loop
    let stopOobMotion = false;

    //Variable to control the frame rate, to ensure that the first frame is skipped because it follows a different timing
    let firstFrame = true;

    //Variable to start the timer
    let timerHasStarted = false;

    //Initialize object to store the response data. Default values of -1 are used if the trial times out and the subject has not pressed a valid key
    let response = {
      rt: -1,
      key: "",
    };

    //Declare a global timeout ID to be initialized below in animateDotMotion function and to be used in after_response function
    let timeoutID;

    //Declare global variable to be defined in startKeyboardListener function and to be used in end_trial function
    let keyboardListener;

    //Declare global variable to store the frame rate of the trial
    var frameRate: number | number[] = []; //How often the monitor refreshes, in ms. Currently an array to store all the intervals. Will be converted into a single number (the average) in end_trial function.

    //variable to store how many frames were presented.
    let numberOfFrames = 0;

    // get the images if specified
    let img = [];
    if (stimulus_image != null) {
      let imgSrc = stimulus_image;
      if (!Array.isArray(imgSrc)) {
        let i = document.createElement("img");
        i.src = imgSrc;
        img.push(i);
      } else {
        for (let j = 0; j < imgSrc.length; j++) {
          let iS = imgSrc[j];
          if (!Array.isArray(iS)) {
            let i = document.createElement("img");
            i.src = iS;
            img.push(i);
          } else {
            let i = [];
            for (let k = 0; k < iS[j].length; k++) {
              let p = document.createElement("img");
              p.src = iS[k];
              i.push(p);
            }
            img.push(i);
          }
        }
      }
    }

    let oobs = [];

    //Calculate the number of coherent, opposite coherent, and incoherent oobs for movement/orientation
    for (let i = 0; i < nAperturesTmp; i++) {
      let nOob = getValueFromArrayOrNot(number_of_oobs, i);

      // set number of objects, if density_unit_area is set
      if (density_unit_area != null) {
        let width = getValueFromArrayOrNot(aperture_width, i);
        let height = getValueFromArrayOrNot(aperture_height, i);
        let area = width * height;
        nOob = (nOob * area) / density_unit_area;
      }

      let tmpCoherenceMovement = getValueFromArrayOrNot(coherence_movement, i);
      let tmpOppositeCoherenceMovement = getValueFromArrayOrNot(coherence_movement_opposite, i);
      let tmpCoherenceOrientation = getValueFromArrayOrNot(coherence_orientation, i);
      let tmpOppositeCoherenceOrientation = getValueFromArrayOrNot(
        coherence_orientation_opposite,
        i
      );

      let experimentMode = getValueFromArrayOrNot(experiment_congruency_mode, i);
      let mainTask = getValueFromArrayOrNot(experiment_main_task, i);

      let tmpOrientation = [];
      let tmpMovementDirection = [];

      if (experimentMode === 0) {
        let [nCoherentMovement, nCoherentOppositeMovement, nIncoherentMovement] = getNumbers(
          tmpCoherenceMovement,
          tmpOppositeCoherenceMovement,
          nOob
        );
        let [nCoherentOrientation, nCoherentOppositeOrientation, nIncoherentOrientation] =
          getNumbers(tmpCoherenceOrientation, tmpOppositeCoherenceOrientation, nOob);
        for (let j = 0; j < nCoherentMovement; j++) {
          tmpMovementDirection.push(1);
        }
        for (let j = 0; j < nCoherentOppositeMovement; j++) {
          tmpMovementDirection.push(-1);
        }
        for (let j = 0; j < nIncoherentMovement; j++) {
          tmpMovementDirection.push(0);
        }
        for (let j = 0; j < nCoherentOrientation; j++) {
          tmpOrientation.push(1);
        }
        for (let j = 0; j < nCoherentOppositeOrientation; j++) {
          tmpOrientation.push(-1);
        }
        for (let j = 0; j < nIncoherentOrientation; j++) {
          tmpOrientation.push(0);
        }
        tmpOrientation = shuffleArray(tmpOrientation);
        tmpMovementDirection = shuffleArray(tmpMovementDirection);
      } else if (mainTask === 0) {
        let [nCoherentMovement, nCoherentOppositeMovement, nIncoherentMovement] = getNumbers(
          tmpCoherenceMovement,
          tmpOppositeCoherenceMovement,
          nOob
        );
        let nCoherentOrientation = Math.floor((tmpCoherenceOrientation / 100) * nCoherentMovement);
        let nCoherentOppositeOrientation = Math.floor(
          (tmpOppositeCoherenceOrientation / 100) * nCoherentMovement
        );
        if (tmpCoherenceOrientation + tmpOppositeCoherenceOrientation === 100) {
          nCoherentOppositeOrientation = nCoherentMovement - nCoherentOrientation;
        }
        for (let j = 0; j < nCoherentMovement; j++) {
          tmpMovementDirection.push(1);
        }
        for (let j = 0; j < nCoherentOppositeMovement; j++) {
          tmpMovementDirection.push(-1);
        }
        for (let j = 0; j < nIncoherentMovement; j++) {
          tmpMovementDirection.push(0);
        }
        for (let j = 0; j < nCoherentOrientation; j++) {
          tmpOrientation.push(1);
        }
        for (let j = 0; j < nCoherentOppositeOrientation; j++) {
          tmpOrientation.push(-1);
        }

        for (let j = 0; j < nOob - (nCoherentOrientation + nCoherentOppositeOrientation); j++) {
          tmpOrientation.push(0);
        }
      } else if (mainTask === 1) {
        let [nCoherentOrientation, nCoherentOppositeOrientation, nIncoherentOrientation] =
          getNumbers(tmpCoherenceOrientation, tmpOppositeCoherenceOrientation, nOob);
        let nCoherentMovement = Math.floor((tmpCoherenceMovement / 100) * nCoherentOrientation);
        let nCoherentOppositeMovement = Math.floor(
          (tmpOppositeCoherenceMovement / 100) * nCoherentOrientation
        );
        if (tmpCoherenceMovement + tmpOppositeCoherenceMovement === 100) {
          nCoherentOppositeMovement = nCoherentOrientation - nCoherentMovement;
        }
        for (let j = 0; j < nCoherentOrientation; j++) {
          tmpOrientation.push(1);
        }
        for (let j = 0; j < nCoherentOppositeOrientation; j++) {
          tmpOrientation.push(-1);
        }
        for (let j = 0; j < nIncoherentOrientation; j++) {
          tmpOrientation.push(0);
        }
        for (let j = 0; j < nCoherentMovement; j++) {
          tmpMovementDirection.push(1);
        }
        for (let j = 0; j < nCoherentOppositeMovement; j++) {
          tmpMovementDirection.push(-1);
        }
        if (experimentMode === 1) {
          for (let j = 0; j < nOob - (nCoherentMovement + nCoherentOppositeMovement); j++) {
            tmpMovementDirection.push(0);
          }
        } else {
          for (let j = 0; j < nOob - (nCoherentMovement + nCoherentOppositeMovement); j++) {
            tmpOrientation.push(tmpOrientation[j + nCoherentMovement + nCoherentOppositeMovement]);
          }
        }
      }

      let oobColor = getValueFromArrayOrNot(oob_color, i);

      let stimulusType = getValueFromArrayOrNot(stimulus_type, i);
      if (stimulusType === 3) {
        oobColor = standardColor(oobColor);
      }
      let apertureType = getValueFromArrayOrNot(aperture_shape, i);
      let speed = getValueFromArrayOrNot(movement_speed, i);
      let speedRandomisation = getValueFromArrayOrNot(movement_speed_randomisation, i);
      let size = getValueFromArrayOrNot(oob_size, i);

      let isFade = getValueFromArrayOrNot(fade_out, i);

      for (let j = 0; j < nOob; j++) {
        let randomWalk = 0;
        let randomOrient = 0;
        let orientation = getValueFromArrayOrNot(coherent_orientation, i);
        if (tmpOrientation[j] === -1) {
          orientation += 180;
        } else if (tmpOrientation[j] === 0) {
          orientation = Math.floor(Math.random() * 360);
          randomOrient = getValueFromArrayOrNot(random_orientation_type, i);
        }
        let movementDirection = getValueFromArrayOrNot(coherent_movement_direction, i);
        if (tmpMovementDirection[j] === -1) {
          movementDirection += 180;
        } else if (tmpMovementDirection[j] === 0) {
          movementDirection = Math.floor(Math.random() * 360);
          randomWalk = getValueFromArrayOrNot(random_movement_type, i);
        }
        if (
          experimentMode === 2 &&
          mainTask === 0 &&
          tmpOrientation[j] === 0 &&
          tmpMovementDirection[j] != 1
        ) {
          orientation = movementDirection;
        } else if (
          experimentMode === 2 &&
          mainTask === 1 &&
          tmpMovementDirection[j] === 0 &&
          tmpOrientation[j] != 1
        ) {
          movementDirection = orientation;
        }

        let oob;

        let ctx = ctxArray[i];
        let cvs = canvasArray[i];
        if (aperture_mode !== "overlay") {
          ctx = ctxArray[0];
          cvs = canvasArray[0];
        }

        if (stimulusType === 0) {
          oob = new Oob(
            size,
            oobColor,
            orientation,
            movementDirection,
            speed,
            speedRandomisation,
            apertureType,
            randomWalk,
            randomOrient,
            isFade,
            cvs,
            ctx,
            units
          );
        } else if (stimulusType === 1) {
          oob = new OobCircle(
            size,
            oobColor,
            orientation,
            movementDirection,
            speed,
            speedRandomisation,
            apertureType,
            randomWalk,
            randomOrient,
            isFade,
            cvs,
            ctx,
            units
          );
        } else if (stimulusType === 2) {
          oob = new OobSquare(
            size,
            oobColor,
            orientation,
            movementDirection,
            speed,
            speedRandomisation,
            apertureType,
            randomWalk,
            randomOrient,
            isFade,
            cvs,
            ctx,
            units
          );
        } else if (stimulusType === 3) {
          oob = new OobBird(
            size,
            oobColor,
            orientation,
            movementDirection,
            speed,
            speedRandomisation,
            apertureType,
            randomWalk,
            randomOrient,
            isFade,
            cvs,
            ctx,
            units
          );
        } else if (stimulusType === 4) {
          let imageArray, keyframes, keyframeTime, mirrorType;
          if (nAperturesTmp === 1) {
            imageArray = img;
            keyframes = stimulus_image_keyframes;
            keyframeTime = stimulus_keyframe_time;
            mirrorType = stimulus_mirror;
          } else {
            imageArray = getValueFromArrayOrNot(img, i);
            keyframes = getValueFromArrayOrNot(stimulus_image_keyframes, i);
            keyframeTime = getValueFromArrayOrNot(stimulus_keyframe_time, i);
            mirrorType = getValueFromArrayOrNot(stimulus_mirror, i);
          }

          oob = new OobImage(
            size,
            oobColor,
            orientation,
            movementDirection,
            speed,
            speedRandomisation,
            apertureType,
            randomWalk,
            randomOrient,
            isFade,
            imageArray,
            keyframes,
            keyframeTime,
            mirrorType,
            cvs,
            ctx,
            units
          );
        }
        oobs.push(oob);
      }
    }

    oobs = shuffleArray(oobs);

    //--------RDK variables and function calls end--------

    //-------------------------------------
    //-----------FUNCTIONS BEGIN-----------
    //-------------------------------------

    //----JsPsych Functions Begin----

    //Function to start the keyboard listener
    const startKeyboardListener = () => {
      //Start the response listener if there are choices for keys
      if (choices != "NO_KEYS") {
        //Create the keyboard listener to listen for subjects' key response
        keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response, //Function to call once the subject presses a valid key
          valid_responses: choices, //The keys that will be considered a valid response and cause the callback function to be called
          rt_method: "performance", //The type of method to record timing information.
          persist: false, //If set to false, keyboard listener will only trigger the first time a valid key is pressed. If set to true, it has to be explicitly cancelled by the cancelKeyboardResponse plugin API.
          allow_held_key: false, //Only register the key once, after this getKeyboardResponse function is called. (Check JsPsych docs for better info under 'jsPsych.pluginAPI.getKeyboardResponse').
        });
      }
    };

    //Function to end the trial proper
    const end_trial = () => {
      //Stop the dot motion animation
      stopOobMotion = true;

      //Store the number of frames
      numberOfFrames = (frameRate as number[]).length;

      //Variable to store the frame rate array
      let frameRateArray = frameRate;

      //Calculate the average frame rate
      if (numberOfFrames > 0) {
        //Check to make sure that the array is not empty
        frameRate =
          (frameRate as number[]).reduce((total, current) => total + current) / numberOfFrames; //Sum up all the elements in the array
      } else {
        frameRate = 0; //Set to zero if the subject presses an answer before a frame is shown (i.e. if frameRate is an empty array)
      }

      //Cancel the keyboard listener if keyboardListener has been defined
      if (typeof keyboardListener !== "undefined") {
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      //Place all the data to be saved from this trial in one data object
      let trial_data = {
        rt: response.rt, //The response time
        key_press: response.key, //The key that the subject pressed
        correct: correctOrNot(), //If the subject response was correct
        choices: choices, //The set of valid keys
        correct_choice: correct_choice, //The correct choice
        trial_duration: trial_duration, //The trial duration
        response_ends_trial: response_ends_trial, //If the response ends the trial
        number_of_oobs: number_of_oobs,
        coherent_movement_direction: coherent_movement_direction,
        coherence_movement: coherence_movement,
        opposite_coherence_movement: coherence_movement_opposite,
        coherent_orientation: coherent_orientation,
        coherence_orientation: coherence_orientation,
        opposite_coherence_orientation: coherence_orientation_opposite,
        movement_speed: movement_speed,
        oob_size: oob_size,
        oob_color: oob_color,
        movement_speed_randomisation: movement_speed_randomisation,
        aperture_width: aperture_width,
        aperture_height: aperture_height,
        background_color: background_color,
        aperture_background_color: aperture_background_color,
        frame_rate: frameRate, //The average frame rate for the trial
        frame_rate_array: frameRateArray, //The array of ms per frame in this trial, in the form of a JSON string
        number_of_frames: numberOfFrames, //The number of frames in this trial
        stimulus_type: stimulus_type,
        aperture_shape: aperture_shape,
        random_movemet_type: random_movement_type,
        random_orientation_type: random_orientation_type,
        number_of_apertures: number_of_apertures,
        density_unit_area: density_unit_area,
        prompt: prompt,
        aperture_position_left: aperture_position_left,
        aperture_position_top: aperture_position_top,
        aperture_mode: aperture_mode,
      };

      //Clear the body
      display_element.innerHTML = "";

      //Restore the settings to JsPsych defaults
      body.style.margin = originalMargin;
      body.style.padding = originalPadding;
      body.style.backgroundColor = originalBackgroundColor;

      //End this trial and move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    }; //End of end_trial

    //start animation
    animateDotMotion();

    //Function to record the first response by the subject
    function after_response(info) {
      //If the response has not been recorded, record it
      if (response.key == "") {
        response = info; //Replace the response object created above
      }

      //If the parameter is set such that the response ends the trial, then kill the timeout and end the trial
      if (response_ends_trial) {
        window.clearTimeout(timeoutID);
        end_trial();
      }
    } //End of after_response

    //Function that determines if the response is correct
    const correctOrNot = () => {
      //Check that the correct_choice has been defined and that it is an array
      if (typeof correct_choice !== "undefined" && correct_choice.constructor === Array) {
        if (typeof correct_choice[0] === "string" || correct_choice[0] instanceof String) {
          var key_in_choices = correct_choice.every((x: string) => {
            return this.jsPsych.pluginAPI.compareKeys(x, response.key);
          });
          return key_in_choices; //If the response is included in the correct_choice array, return true. Else, return false.
        } else if (typeof correct_choice[0] === "number") {
          // the elements are numbers (javascript character codes)
          console.error(
            "Error in ROK plugin: elements in the correct_choice array must be key characters (strings)."
          );
          return false; // added due to TS error: not all code paths return a value
        } else {
          console.error(
            "Error in ROK plugin: elements in the correct_choice array must be key characters (strings)."
          );
          return false; // added due to TS error: not all code paths return a value
        }
      } else {
        console.error(
          "Error in ROK plugin: you must specify an array of key characters for the correct_choice parameter."
        );
        return false; // added due to TS error: not all code paths return a value
      }
    };

    //Function that clears the dots on the canvas by drawing over it with the color of the baclground

    function update(deltaTime) {
      for (let i = 0; i < oobs.length; i++) {
        oobs[i].update(deltaTime);
      }
    }

    //Draw the dots on the canvas after they're updated
    function draw() {
      for (let i = 0; i < canvasArray.length; i++) {
        ctxArray[i].clearRect(0, 0, canvasArray[i].width, canvasArray[i].height);
      }
      for (let i = 0; i < oobs.length; i++) {
        oobs[i].draw();
      }
    } //End of draw

    //Function to make the dots move on the canvas
    function animateDotMotion() {
      let previousTimestamp;
      let dT = 0;
      //frameRequestID saves a long integer that is the ID of this frame request. The ID is then used to terminate the request below.
      let frameRequestID = window.requestAnimationFrame(animate);

      //Start to listen to subject's key responses
      startKeyboardListener();

      //Declare a timestamp

      function animate() {
        //If stopping condition has been reached, then stop the animation
        if (stopOobMotion) {
          window.cancelAnimationFrame(frameRequestID); //Cancels the frame request
        }
        //Else continue with another frame request
        else {
          frameRequestID = window.requestAnimationFrame(animate); //Calls for another frame request

          //If the timer has not been started and it is set, then start the timer
          if (!timerHasStarted && trial_duration > 0) {
            //If the trial duration is set, then set a timer to count down and call the end_trial function when the time is up
            //(If the subject did not press a valid keyboard response within the trial duration, then this will end the trial)
            timeoutID = window.setTimeout(end_trial, trial_duration); //This timeoutID is then used to cancel the timeout should the subject press a valid key
            //The timer has started, so we set the variable to true so it does not start more timers
            timerHasStarted = true;
          }

          update(dT);

          draw(); //Draw each of the dots in their respective apertures

          //If this is before the first frame, then start the timestamp
          if (previousTimestamp === undefined) {
            previousTimestamp = performance.now();
          }
          //Else calculate the time and push it into the array
          else {
            let currentTimeStamp = performance.now(); //Variable to hold current timestamp
            if (document.hasFocus()) {
              dT = currentTimeStamp - previousTimestamp;
            } else {
              previousTimestamp = performance.now();
            }

            (frameRate as number[]).push(Math.round(currentTimeStamp - previousTimestamp)); //Push the interval into the frameRate array
            previousTimestamp = currentTimeStamp; //Reset the timestamp
          }
        }
      }
    }

    //----RDK Functions End----

    //----General Functions Begin//----

    //Function to assign the default values for the staircase parameters
    function assignParameterValue(argument, defaultValue) {
      return typeof argument !== "undefined" ? argument : defaultValue;
    }

    //----General Functions End//----

    //-------------------------------------
    //-----------FUNCTIONS END-------------
    //-------------------------------------
  } // END OF TRIAL
}

//Return the plugin object which contains the trial
//----RDK Functions End----

//----General Functions Begin//----

//Function to assign the default values for the staircase parameters

//----General Functions End//----

//-------------------------------------
//-----------FUNCTIONS END-------------
//-------------------------------------

export default RokPlugin;

function getValueFromArrayOrNot(arrayOrNot, l) {
  if (Array.isArray(arrayOrNot)) {
    return arrayOrNot[l];
  }
  return arrayOrNot;
}

function standardColor(color) {
  let cvs = document.createElement("canvas");
  cvs.height = 1;
  cvs.width = 1;
  let ctx = cvs.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
}

function brighten(color, value) {
  let col = [0, 0, 0, 255];
  for (let i = 0; i < 3; i++) {
    let tmp = color[i] + value;
    tmp = tmp > 255 ? 255 : tmp;
    tmp = tmp < 0 ? 0 : tmp;
    col[i] = tmp;
  }
  return col;
}

function byteToHex(num) {
  // Turns a number (0-255) into a 2-character hex number (00-ff)
  return ("0" + num.toString(16)).slice(-2);
}

function stdColorToHex(color) {
  // Convert any CSS color to a hex representation
  // Examples:
  // colorToHex('red')            # '#ff0000'
  // colorToHex('rgb(255, 0, 0)') # '#ff0000'
  let hex;
  hex = [0, 1, 2]
    .map(function (idx) {
      return byteToHex(color[idx]);
    })
    .join("");
  return "#" + hex;
}

function getX(angle) {
  let rad = (angle * Math.PI) / 180;
  return Math.cos(rad);
}

function getY(angle) {
  let rad = (angle * Math.PI) / 180;
  return -Math.sin(rad);
}

function getNumbers(per, perOpp, n) {
  let nC = Math.round((per / 100) * n);
  let nCO;
  if (per + perOpp == 100) {
    nCO = n - nC;
  } else {
    nCO = Math.round((perOpp / 100) * n);
  }
  let nR = n - nC - nCO;
  if (nC + nCO > 100 && per == 50) {
    nC = 100 - nCO;
  }
  return [nC, nCO, nR];
}

function shuffleArray(array) {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

function shuffleArraysParalell(arrays) {
  for (let j = arrays[0].length - 1; j > 0; j--) {
    for (let i = 0; i < arrays.length; i++) {
      const k = Math.floor(Math.random() * (j + 1));
      [arrays[i][j], arrays[i][k]] = [arrays[i][k], arrays[i][j]];
    }
  }
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

/// O(rientated) ob(ject)
class Oob {
  protected canvas: any;
  protected size: number;
  protected color: any;
  protected ctx: any;
  protected pos: {
    y: number;
    x: number;
  };
  protected vel: {
    x: number;
    y: number;
  };
  protected alpha: number;
  protected speedRes: number;
  protected orientation: any;
  protected movementDirection: any;
  protected ld: {
    y: number;
    x: number;
  };
  protected lu: {
    y: number;
    x: number;
  };
  protected r: {
    y: number;
    x: number;
  };
  protected isRandomWalk: any;
  protected rW: number;
  protected rO: number;
  protected isRandomOrientated: any;
  protected apertureType: any;
  protected timeToChangeMovement: number;
  protected timeToChangeOrientation: number;
  protected isFade: any;

  constructor(
    size,
    color,
    orientation,
    movementDirection,
    speed,
    randomisation,
    apertureType,
    isRandomWalk,
    isRandomOrientated,
    isFade,
    canvas,
    ctx,
    units
  ) {
    this.canvas = canvas;
    if (units === "px") {
    }
    this.size = (canvas.width * size) / 100;
    if (units === "px") {
      this.size = size;
    }
    this.color = color;
    this.ctx = ctx;
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    if (apertureType == 0) {
      this.pos.x = Math.random() * canvas.width;
      this.pos.y = Math.random() * canvas.height;
    }
    if (apertureType == 1) {
      let angle = Math.random() * 2 * Math.PI;
      let r = Math.sqrt(Math.sqrt(Math.random())) - 0.5;
      this.pos.x = r * Math.sin(angle) * canvas.width + canvas.width / 2;
      this.pos.y = r * Math.cos(angle) * canvas.height + canvas.height / 2;
    }
    this.speedRes =
      ((canvas.width * speed) / 100) *
      (1 + ((randomisation / 100) * Math.random() - randomisation / 100));
    if (units === "px") {
      this.speedRes = speed * (1 + ((randomisation / 100) * Math.random() - randomisation / 100));
    }
    this.orientation = orientation;
    this.movementDirection = movementDirection;
    this.setVel();
    // corners of triangle rel
    this.ld = { x: 0, y: 0 };
    this.lu = { x: 0, y: 0 };
    this.r = { x: 0, y: 0 };
    this.setOrient();
    this.isRandomWalk = isRandomWalk;
    this.rW = (Math.random() - 0.5) * 10;
    this.isRandomOrientated = isRandomOrientated;
    this.rO = (Math.random() - 0.5) * 10;
    this.apertureType = apertureType;
    this.timeToChangeMovement = Math.random();
    this.timeToChangeOrientation = Math.random();
    this.isFade = isFade;
    this.alpha = 1;
  }

  setVel() {
    this.vel.x = getX(this.movementDirection) * this.speedRes;
    this.vel.y = getY(this.movementDirection) * this.speedRes;
  }

  setOrient() {
    this.ld.x = getX(this.orientation + 270) * this.size;
    this.ld.y = getY(this.orientation + 270) * this.size;
    this.lu.x = getX(this.orientation + 90) * this.size;
    this.lu.y = getY(this.orientation + 90) * this.size;
    this.r.x = getX(this.orientation) * this.size;
    this.r.y = getY(this.orientation) * this.size;
  }

  randomMovement(deltaTime) {
    this.movementDirection += (this.rW * deltaTime) / 1000;
    this.setVel();
    this.timeToChangeMovement += deltaTime / 1000;
    let d = 1 - this.timeToChangeMovement;
    if (d < 0) {
      this.rW = (Math.random() - 0.5) * 30;
      this.timeToChangeMovement = -d;
    }
  }

  randomOrientation(deltaTime) {
    this.orientation += (this.rO * deltaTime) / 1000;
    if (this.orientation < 0) {
      this.orientation = 360 - this.orientation;
    } else if (this.orientation > 360) {
      this.orientation = this.orientation - 360;
    }
    this.setOrient();
    this.timeToChangeOrientation += deltaTime / 1000;
    let d = 1 - this.timeToChangeOrientation;
    if (d < 0) {
      this.rO = (Math.random() - 0.5) * 60;
      this.setOrient();
      this.timeToChangeOrientation = -d;
    }
  }

  handleOutOfBounds() {
    if (this.apertureType == 0) {
      this.alpha = 0.1;
      if (this.pos.x < -this.size) {
        this.pos.x = this.canvas.width + this.size;
      } else if (this.pos.x > this.canvas.width + this.size) {
        this.pos.x = -this.size;
      }
      if (this.pos.y < -this.size) {
        this.pos.y = this.canvas.height + this.size;
      } else if (this.pos.y > this.canvas.height + this.size) {
        this.pos.y = -this.size;
      }
      let d = Math.min(
        this.pos.x - this.size,
        this.pos.y - this.size,
        this.canvas.width - (this.pos.x + this.size),
        this.canvas.height - (this.pos.y + this.size)
      );
      if (d < this.canvas.width / 20 && this.isFade) {
        this.alpha = d / (this.canvas.width / 20);
        if (this.alpha < 0) this.alpha = 0;
      } else {
        this.alpha = 1;
      }
    }
    if (this.apertureType == 1) {
      this.alpha = 0.1;
      let a = this.canvas.width / 2;
      let b = this.canvas.height / 2;
      let x = this.pos.x - a;
      let y = this.pos.y - b;
      let d = (x * x) / (a * a) + (y * y) / (b * b);
      if (d > 0.7 && this.isFade) {
        this.alpha = (1 - d) / 0.3;
        if (this.alpha < 0) this.alpha = 0;
      } else {
        this.alpha = 1;
      }
      if (d > 1) {
        // (a + this.size / 2) * (a + this.size / 2) + (b + this.size / 2) * (b + this.size / 2)) {
        x *= -0.99;
        y *= -0.99;
        this.pos.x = x + a;
        this.pos.y = y + b;
      }
    }
  }

  // deltaTime is given in ms!
  update(deltaTime) {
    // updatePosition
    this.pos.x += (this.vel.x * deltaTime) / 1000;
    this.pos.y += (this.vel.y * deltaTime) / 1000;
    if (this.isRandomWalk) this.randomMovement(deltaTime);
    if (this.isRandomOrientated) this.randomOrientation(deltaTime);
    this.handleOutOfBounds();
  }

  draw() {
    this.ctx.globalAlpha = this.alpha;
    this.ctx.beginPath();
    let x = this.pos.x + this.ld.x;
    let y = this.pos.y + this.ld.y;
    this.ctx.moveTo(x, y);
    x = this.pos.x + this.lu.x;
    y = this.pos.y + this.lu.y;
    this.ctx.lineTo(x, y);
    x = this.pos.x + this.r.x;
    y = this.pos.y + this.r.y;
    this.ctx.lineTo(x, y);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
}

class OobBird extends Oob {
  protected animationTime: number;
  protected animationFrame: number;
  protected animdir: number;
  protected colorsLeft: any[];
  protected colorsRight: any[];

  constructor(
    size,
    color,
    orientation,
    movementDirection,
    speed,
    randomisation,
    apertureType,
    isRandomWalk,
    isRandomOrientated,
    isFade,
    canvas,
    ctx,
    units
  ) {
    super(
      size,
      color,
      orientation,
      movementDirection,
      speed,
      randomisation,
      apertureType,
      isRandomWalk,
      isRandomOrientated,
      isFade,
      canvas,
      ctx,
      units
    );
    this.animationTime = Math.random();
    this.animationFrame = 4;
    if (this.animationTime < 0.8) this.animationFrame = 3;
    if (this.animationTime < 0.6) this.animationFrame = 2;
    if (this.animationTime < 0.4) this.animationFrame = 1;
    if (this.animationTime < 0.2) this.animationFrame = 0;
    this.animationTime *= 0.1;
    this.animdir = 1;
    let stdColor = color;
    this.makeColors(stdColor, orientation);
  }

  makeColors(color, orientation) {
    this.colorsLeft = [];
    this.colorsRight = [];
    let brightenStartR = Math.round(-getY(orientation) * 5);
    let brightenStartL = Math.round(getX(orientation) * 5);
    let colR = brighten(color, brightenStartR);
    let colL = brighten(color, brightenStartL);
    this.colorsRight.push(stdColorToHex(colR));
    this.colorsLeft.push(stdColorToHex(colL));
    for (let i = 0; i < 6; i++) {
      colR = brighten(colR, brightenStartR);
      colL = brighten(colL, brightenStartL);
      this.colorsRight.push(stdColorToHex(colR));
      this.colorsLeft.push(stdColorToHex(colL));
    }
  }

  update(deltaTime) {
    super.update(deltaTime);
    this.animationTime += deltaTime / 1000;
    let d = 0.1 - this.animationTime;
    if (d < 0) {
      this.animationFrame += this.animdir;
      this.animationTime = -d;
      if (this.animationFrame > 5 || this.animationFrame < 1) {
        this.animationTime -= 0.1;
        this.animdir *= -1;
      }
    }
    //this.animationFrame = 5;
  }

  draw() {
    this.ctx.globalAlpha = this.alpha;
    let px = this.pos.x + 0.2 * this.r.x;
    let py = this.pos.y + 0.2 * this.r.y;
    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    let x = this.pos.x + this.ld.x / (this.animationFrame * 0.1 + 1);
    let y = this.pos.y + this.ld.y / (this.animationFrame * 0.1 + 1);
    this.ctx.lineTo(x, y);
    x = this.pos.x + this.r.x;
    y = this.pos.y + this.r.y;
    this.ctx.lineTo(x, y);
    this.ctx.fillStyle = this.colorsRight[this.animationFrame];
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    x = this.pos.x + this.lu.x / (this.animationFrame * 0.1 + 1);
    y = this.pos.y + this.lu.y / (this.animationFrame * 0.1 + 1);
    this.ctx.lineTo(x, y);
    x = this.pos.x + this.r.x;
    y = this.pos.y + this.r.y;
    this.ctx.lineTo(x, y);
    this.ctx.fillStyle = this.colorsLeft[this.animationFrame];
    this.ctx.fill();
  }
}

class OobCircle extends Oob {
  draw() {
    this.ctx.globalAlpha = this.alpha;
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.size / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
}

class OobSquare extends Oob {
  draw() {
    this.ctx.globalAlpha = this.alpha;
    this.ctx.beginPath();
    let x = this.pos.x - this.size / 2;
    let y = this.pos.y - this.size / 2;
    this.ctx.moveTo(x, y);
    x = this.pos.x + this.size / 2;
    y = this.pos.y - this.size / 2;
    this.ctx.lineTo(x, y);
    x = this.pos.x + this.size / 2;
    y = this.pos.y + this.size / 2;
    this.ctx.lineTo(x, y);
    x = this.pos.x - this.size / 2;
    y = this.pos.y + this.size / 2;
    this.ctx.lineTo(x, y);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
}

class OobImage extends Oob {
  private img: any;
  private keyframes: any;
  private keyframeTime: any;
  private mirrorType: any;
  private imgWidth: number;
  private imgHeight: number;
  private actualKeyframe: number;
  private animationTime: number;

  constructor(
    size,
    color,
    orientation,
    movementDirection,
    speed,
    randomisation,
    apertureType,
    isRandomWalk,
    isRandomOrientated,
    isFade,
    imageArray,
    keyframes,
    keyframeTime,
    mirrorType,
    canvas,
    ctx,
    units
  ) {
    super(
      size,
      color,
      orientation,
      movementDirection,
      speed,
      randomisation,
      apertureType,
      isRandomWalk,
      isRandomOrientated,
      isFade,
      canvas,
      ctx,
      units
    );
    if (Array.isArray(imageArray)) {
      let i = Math.floor(Math.random() * imageArray.length);
      this.img = imageArray[i];
      this.keyframes = getValueFromArrayOrNot(keyframes, i);
      this.keyframeTime = getValueFromArrayOrNot(keyframeTime, i);
      this.mirrorType = getValueFromArrayOrNot(mirrorType, i);
    } else {
      this.img = imageArray;
      this.keyframes = keyframes;
      this.keyframeTime = keyframeTime;
      this.mirrorType = mirrorType;
    }
    this.imgWidth = this.img.naturalWidth / this.keyframes;
    this.imgHeight = this.img.naturalHeight;
    this.actualKeyframe = Math.floor(Math.random() * this.keyframes);
    this.animationTime = Math.random() * this.keyframeTime;
  }

  update(deltaTime) {
    super.update(deltaTime);
    this.animationTime += deltaTime / 1000;
    let d = this.keyframeTime - this.animationTime;
    if (d < 0) {
      this.animationTime = 0;
      this.actualKeyframe++;
      if (this.actualKeyframe >= this.keyframes) this.actualKeyframe = 0;
    }
  }

  draw() {
    this.ctx.globalAlpha = this.alpha;
    this.ctx.translate(this.pos.x, this.pos.y);
    if (this.mirrorType === 0) {
      this.ctx.rotate((-Math.PI * this.orientation) / 180);
    } else if (this.mirrorType == 1) {
      if (this.orientation > 90 && this.orientation < 270) {
        this.ctx.rotate((-Math.PI * (this.orientation - 180)) / 180);
      } else {
        this.ctx.rotate((-Math.PI * this.orientation) / 180);
      }
    }
    this.ctx.translate(-this.pos.x, -this.pos.y);
    if (this.mirrorType === 0) {
      this.ctx.drawImage(
        this.img,
        this.actualKeyframe * this.imgWidth,
        0,
        this.imgWidth,
        this.imgHeight,
        this.pos.x - this.size / 2,
        this.pos.y - this.size / 2,
        this.size,
        this.size
      );
    } else if (this.mirrorType === 1) {
      if (this.orientation > 90 && this.orientation < 270) {
        this.ctx.drawImage(
          this.img,
          this.actualKeyframe * this.imgWidth,
          this.imgHeight / 2,
          this.imgWidth,
          this.imgHeight / 2,
          this.pos.x - this.size / 2,
          this.pos.y - this.size / 2,
          this.size,
          this.size
        );
      } else {
        this.ctx.drawImage(
          this.img,
          this.actualKeyframe * this.imgWidth,
          0,
          this.imgWidth,
          this.imgHeight / 2,
          this.pos.x - this.size / 2,
          this.pos.y - this.size / 2,
          this.size,
          this.size
        );
      }
    }
    this.ctx.translate(this.pos.x, this.pos.y);
    if (this.mirrorType === 0) {
      this.ctx.rotate((Math.PI * this.orientation) / 180);
    } else if (this.mirrorType === 1) {
      if (this.orientation > 90 && this.orientation < 270) {
        this.ctx.rotate((Math.PI * (this.orientation - 180)) / 180);
      } else {
        this.ctx.rotate((Math.PI * this.orientation) / 180);
      }
    }
    this.ctx.translate(-this.pos.x, -this.pos.y);
  }
}
