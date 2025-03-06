# jspsych-contrib: jsPsych community contributions

This is an open repository of jsPsych plugins and extensions developed by members of the jsPsych community. If you've written a jsPsych plugin or extension that you think others might be interested in using, this is the place to share it!

## `jspsych` vs. `jspsych-contrib` 

Plugins and extensions in the [main `jsPsych` repository](https://github.com/jspsych/jsPsych/) are maintained by the core jsPsych team. 
The team takes responsibility for fixing bugs and updating plugins to take advantage of new features in jsPsych. 

Plugins and extensions in this `jspsych-contrib` repository are contributed by community members. 
They are not extensively tested or verified by the core jsPsych team, and there is no guarantee that anyone will be available to fix bugs, push updates, or answer questions about these plugins/extensions.
However we would encourage contributors to respond to issues/questions and to maintain their code.

Contributions to `jspsych-contrib` that are broadly useful, well-documented, and well-tested may be added to the main `jsPsych` repository, with the contributor's permission.

## List of available plugins/extensions

The jsPsych plugins/extensions that have been contributed by community members can be found in the `/packages` directory. 
The `/packages` directory also contains four template sub-folders that can be used as a starting point for contributing a plugin/extension (see the [Guidelines for contributions](#guidelines-for-contributions) section).


  
  
  
  
  ### Plugins

  Plugin | Contributor | Description
  ----------- | ----------- | -----------
[audio-multi-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-audio-multi-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an audio file using both button clicks and key presses. 
[audio-swipe-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-audio-swipe-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an audio file using swipe gestures and keyboard responses. 
[copying-task](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-copying-task/README.md) | [Andre Sahakian](https://github.com/Andre3582) | _Description for copying-task._ 
[corsi-blocks](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-corsi-blocks/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin displays a configurable Corsi blocks task and records a series of click responses. 
[gamepad](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-gamepad/README.md) | [Shaobin Jiang](https://github.com/Shaobin-Jiang) | This plugin allows one to use gamepads in a jsPsych experiment. 
[html-choice](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-html-choice/README.md) | [Younes Strittmatter](https://github.com/younesStrittmatter) | This plugin displays clickable html elements that can be used to present a choice. 
[html-keyboard-response-raf](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-html-keyboard-response-raf/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin uses the same functionality as the html-keyboard-response plugin, but uses requestAnimationFrame internally for timing 
[html-keyboard-slider](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-html-keyboard-slider/README.md) | [Max Lovell](https://github.com/Max-Lovell) | Sliders which allow for keyboard responses. 
[html-multi-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-html-multi-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an arbitrary HTML string using both button clicks and key presses. 
[html-swipe-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-html-swipe-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an arbitrary HTML string using swipe gestures and keyboard responses. 
[html-vas-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-html-vas-response/README.md) | [Isaac Kinley](https://github.com/kinleyid) | This plugin collects responses to an arbitrary HTML string using a point-and-click visual analogue scale. 
[image-array-keyboard-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-image-array-keyboard-response/README.md) | [Younes Strittmatter](https://github.com/younesStrittmatter) | This plugin displays an arbitrary number of images and records responses generated with the keyboard. 
[image-multi-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-image-multi-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an image stimulus using both button clicks and key presses. 
[image-swipe-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-image-swipe-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an image stimulus using swipe gestures and keyboard responses. 
[ios](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-ios/README.md) | [Isaac Kinley](https://github.com/kinleyid) | This plugin implements a continuous version of the Inclusion of Other in the Self (IOS) Scale ([Aron et al., 1992](https://psycnet.apa.org/doiLanding?doi=10.1037%2F0022-3514.63.4.596)). 
[libet-intentional-binding](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-libet-intentional-binding/README.md) | [Isaac Kinley](https://github.com/kinleyid) | This plugin measures intentional binding using a Libet clock, and allows the participant to estimate the timing of events by adjusting the clock hand themselves. 
[nextcloud-filedrop](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-nextcloud-filedrop/README.md) | [C. Martin Grewe](https://github.com/mgrewe) | This plugin provides permanent storage of data collected during an experiment using a nextcloud instance. 
[pipe](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-pipe/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | jsPsych plugin to faciliate communication with [DataPipe](https://pipe.jspsych.org) 
[rdk](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-rdk/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin displays a Random Dot Kinematogram (RDK) and allows the subject to report the primary direction of motion by pressing a key on the keyboard. 
[rok](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-rok/README.md) | [Younes Strittmatter](https://github.com/younesStrittmatter) | This plugin displays a Random Object Kinematogram (ROK) and allows the subject to report the primary direction of motion or the primary orientation by pressing a key on the keyboard. 
[self-paced-reading](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-self-paced-reading/README.md) | [igmmgi](https://github.com/igmmgi) | Self-paced reading tasks with different display options. 
[survey-number](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-survey-number/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin displays a survey question and collects a numeric response. 
[survey-slider](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-survey-slider/README.md) | [Dominique Makowski](https://github.com/DominiqueMakowski) | Add several analogue scales on the same page for use in questionnaires. 
[video-several-keyboard-responses](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-video-several-keyboard-responses/README.md) | [Maria Emine Nylund](https://github.com/marianylund) | jsPsych plugin for playing a video file and getting several keyboard responses 
[vsl-animate-occlusion](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-vsl-animate-occlusion/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | he VSL (visual statistical learning) animate occlusion plugin displays an animated sequence of shapes that disappear behind an occluding rectangle while they change from one shape to another. 
[vsl-grid-scene](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/plugin-vsl-grid-scene/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | The VSL (visual statistical learning) grid scene plugin displays images arranged in a grid. 

  

  
### Extensions

   Extension | Contributor | Description
  ----------- | ----------- | -----------
[countdown](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/extension-countdown/README.md) | [Shaobin Jiang](https://github.com/Shaobin-Jiang) | This extension adds a countdown during a trial. 
[device-motion](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/extension-device-motion/README.md) | [Pedro Neto](https://github.com/pasoneto) | jsPsych extension for tracking device motion 
[mediapipe-face-mesh](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/extension-mediapipe-face-mesh/README.md) | [C. Martin Grewe](https://github.com/mgrewe) | This extension provides online tracking of facial posture during trials using the [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh) library. 
[touchscreen-buttons](https://github.com/jspsych/jspsych-contrib/blob/main/packages/@jspsych-contrib/extension-touchscreen-buttons/README.md) | [Younes Strittmatter](https://github.com/younesStrittmatter) | _Description for touchscreen-buttons._ 

## Guidelines for contributions
Contributions to this repository must:

* Work as described
* Include the complete code for the plugin or extension.
* Include a `readme.md` file following our [template]([identical for plugins and extensions](https://github.com/jspsych/jspsych-dev/blob/main/packages/new-plugin/templates/plugin-template-ts/README.md)).
* Include a `package.json` file.

Optionally, contributions are encouraged to include:

* A `/docs` directory with documentation matching the template for docs on jspsych.org 
* An `/examples` directory with a working `.html` demo.
* A test suite following the testing framework in our `-ts` [templates]([plugin test template](https://github.com/jspsych/jspsych-dev/blob/main/packages/new-plugin/templates/plugin-template-ts/src/index.spec.ts); [extension test template](https://github.com/jspsych/jspsych-dev/blob/main/packages/new-extension/templates/extension-template-ts/src/index.spec.ts)).


To submit a contribution, [open a pull request](https://github.com/jspsych/jspsych-contrib/pulls) that contains a directory for your plugin or extension inside the `/packages` directory.
In the pull request comments, please make it clear how we can verify that the contribution is functional. 
This could be accomplished with a link to a demonstration experiment, the inclusion of an example file and/or testing files, or through some other means.
We try to review pull requests quickly and add new contributions as soon as the minimal standards are met.

## Creating a new plugin or extension

We have a tool for building new plugins and extensions at [jspsych-dev](https://github.com/jspsych/jspsych-dev/tree/main). Instructions for using the tools can be found at the [`README.md`](https://github.com/jspsych/jspsych-dev/blob/main/README.md) of this repository.

You may also want to read the jsPsych documentation on [plugin development](https://www.jspsych.org/latest/developers/plugin-development/) to understand how to work with the `index.ts` file (for TypeScript development) and `index.js` file (for JavaScript development).


## jsPsych version compatibility

We would like to encourage you to contribute plugins and extensions that are compatible with the latest jsPsych version. 
At the same time, we realize that there may be jsPsych users who have created very useful plugins/extensions with jsPsych v6 that they would like to share with the community, but don't have the time/resources to convert into the jsPsych v7+ Node package format. 
Therefore we welcome contributions that are compatible with v6 as well as v7+. 

If you'd like to contribute a **jsPsych v6 plugin**, please do the following:
* Use the [`templates/plugin-template-js`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-plugin/templates/plugin-template-js) folder under the [`new-plugin`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-plugin) directory in [jspsych-dev](https://github.com/jspsych/jspsych-dev/tree/main) as a reference
* Delete everything inside of the `index.js` template file and replace it with your v6-compatible plugin code
* In the `package.json` file, change the "jspsych" version field in "devDependencies" to "6.3.1"

And remember to follow the other steps for contributing:
* Edit the `package.json` file with the information about your plugin
* Add a `readme.md` file for your plugin, based on the [readme template](https://github.com/jspsych/jspsych-dev/blob/main/packages/new-plugin/templates/plugin-template-js/README.md). This must state the jsPsych version that your plugin is compatible with.
* Optional: add a `/docs` directory with a markdown documentation file, and/or `/examples` directory with an HTML example file
