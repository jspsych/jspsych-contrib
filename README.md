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

Plugin/Extension | Contributor | Description
----------- | ----------- | -----------
[audio-multi-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-audio-multi-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an audio file using both button clicks and key presses.
[audio-swipe-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-audio-swipe-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an audio file using swipe gestures and keyboard responses.
[corsi-blocks](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-corsi-blocks/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin displays a configurable Corsi blocks task and records a series of click responses.
[countdown](https://github.com/jspsych/jspsych-contrib/blob/main/packages/extension-countdown/README.md) | [Shaobin Jiang](https://github.com/Shaobin-Jiang) | This extension adds a countdown during a trial.
[gamepad](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-gamepad/README.md) | [Shaobin Jiang](https://github.com/Shaobin-Jiang) | This plugin allows one to use gamepads in a jsPsych experiment.
[html-choice](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-html-choice/README.md) | [Younes Strittmatter](https://github.com/younesStrittmatter) | This plugin displays clickable html elements that can be used to present a choice.
[html-keyboard-response-raf](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-html-keyboard-response-raf/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin displays an arbitrary HTML string and collects responses using the keyboard. It uses requestAnimationFrame for timing.
[html-multi-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-html-multi-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an arbitrary HTML string using both button clicks and key presses.
[html-swipe-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-html-swipe-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an arbitrary HTML string using swipe gestures and keyboard responses.
[html-vas-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-html-vas-response/README.md) | [Isaac Kinley](https://github.com/kinleyid) | This plugin collects responses to an arbitrary HTML string using a point-and-click visual analogue scale.
[image-array-keyboard-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-image-array-keyboard-response/README.md) | [Younes Strittmatter](https://github.com/younesStrittmatter) | This plugin displays an arbitrary number of images and records responses generated with the keyboard.
[image-multi-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-image-multi-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an image stimulus using both button clicks and key presses.
[image-swipe-response](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-image-swipe-response/README.md) | [Adam Richie-Halford](https://github.com/richford) | This plugin collects responses to an image stimulus using swipe gestures and keyboard responses.
[ios](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-ios/README.md) | [Isaac Kinley](https://github.com/kinleyid) | This plugin implements a continuous version of the Inclusion of Other in the Self (IOS) Scale ([Aron et al., 1992](https://doi.org/10.1037/0022-3514.63.4.596)).
[libet-intentional-blinding](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-libet-intentional-binding/README.md) | [Isaac Kinley](https://github.com/kinleyid) | This plugin measures intentional binding using a Libet clock, and allows the participant to estimate the timing of events by adjusting the clock hand themselves.
[mediapipe-face-mesh](https://github.com/jspsych/jspsych-contrib/blob/main/packages/extension-mediapipe-face-mesh/README.md) | [Martin Grewe](https://github.com/mgrewe) | This extension provides online tracking of facial posture during trials using the [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh) library.
[nextcloud-filedrop](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-nextcloud-filedrop/README.md) | [Martin Grewe](https://github.com/mgrewe) | This plugin provides permanent storage of data collected during an experiment using a nextcloud instance.
[pipe](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-pipe/readme.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin facilitates communication with the DataPipe service (https://pipe.jspsych.org) for sending data to the OSF.
[rdk](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-rdk/docs/jspsych-rdk.md#jspsych-rdk-plugin) | [Sivananda Rajananda](https://github.com/vrsivananda) | This plugin displays a Random Dot Kinematogram (RDK) and allows the subject to report the primary direction of motion by pressing a key on the keyboard.
[rok](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-rok/docs/jspsych-rok.md#jspsych-rok-plugin) | [Younes Strittmatter](https://github.com/younesStrittmatter) | This plugin displays a Random Object Kinematogram (ROK) and allows the subject to report the primary direction of motion or the primary orientation by pressing a key on the keyboard.
[self-paced-reading](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-self-paced-reading/docs/jspsych-self-paced-reading.md) | [@igmmgi](https://github.com/igmmgi) | Self-paced reading tasks with different display options.
[survey-number](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-survey-number/README.md) | [Josh de Leeuw](https://github.com/jodeleeuw) | This plugin displays a survey question and collects a numeric response.
[vsl-animate-occlusion](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-vsl-animate-occlusion/docs/jspsych-vsl-animate-occlusion.md#jspsych-vsl-animate-occlusion-plugin) | [Josh de Leeuw](https://github.com/jodeleeuw) | The VSL (visual statistical learning) animate occlusion plugin displays an animated sequence of shapes that disappear behind an occluding rectangle while they change from one shape to another. 
[vsl-grid-scene](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-vsl-grid-scene/docs/jspsych-vsl-grid-scene.md#jspsych-vsl-grid-scene-plugin) | [Josh de Leeuw](https://github.com/jodeleeuw) | The VSL (visual statistical learning) grid scene plugin displays images arranged in a grid. 
[survey-slider](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-survey-slider/README.md) | [Max Lovell](https://github.com/Max-Lovell) & [Dominique Makowski](https://github.com/DominiqueMakowski) | Add several analogue scales on the same page for use in questionnaires. 
[html-keyboard-slider](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-html-keyboard-slider/docs/jspsych-html-keyboard-slider.md) | [Max Lovell](https://github.com/Max-Lovell) | Sliders which allow for keyboard responses.

## Guidelines for contributions

Contributions to this repository must:

* Work as described
* Include the complete code for the plugin or extension.
* Include a `readme.md` file following our [template](readme-template.md).
* Include a `package.json` file.

Optionally, contributions can include:

* A `/docs` directory with documentation matching the template for docs on jspsych.org 
* An `/examples` directory with a working `.html` demo.
* A test suite following the testing framework in our `-ts` templates.


To submit a contribution, [open a pull request](https://github.com/jspsych/jspsych-contrib/pulls) that contains a directory for your plugin/extension inside the `/packages` directory.
In the pull request comments, please make it clear how we can verify that the contribution is functional. 
This could be accomplished with a link to a demonstration experiment, the inclusion of an example file and/or testing files, or through some other means.
We try to review pull requests quickly and add new contributions as soon as the minimal standards are met.

## Creating a new plugin or extension

After cloning this repository, run `npm install` and then `npm run new`. 
This will prompt you through the process of creating a new plugin or extension. 
The tool will create a new directory in the `/packages` directory with the appropriate files and names. 

You may want to read the jsPsych documentation on [plugin development](https://www.jspsych.org/latest/developers/plugin-development/) to understand how to work with the `index.ts`file (for TypeScript development) and `index.js` file (for JavaScript development).

### TypeScript template

This template uses TypeScript source files that are complied into JavaScript using Node.js and npm.
This is the format used for plugins in the main jsPsych repo.
To use this template, you should edit the `src/index.ts` file, keeping the overall structure but changing the details as appropriate (parameters, trial method, etc.).
You can then use the `npm run build` command to compile your `index.ts` code into JavaScript files, which will appear in a `/dist` directory.
This format also allows you to add a Jest test file (optional).

For more details, including setup instructions and detailed explanations of files, please see the jsPsych documentation page: [Configuring the jsPsych development environment](https://www.jspsych.org/latest/developers/configuration).
You can also read the [plugin development documentation](https://www.jspsych.org/latest/developers/plugin-development/) and look at the plugin/extension folders in the main jsPsych repository `/packages` directory for more examples.

### JavaScript template

This template allows you to put your plugin's JavaScript code directly into a JavaScript template file, rather than using TypeScript and Node.js/npm. 
To use this template, you should keep the overall structure of the `index.js` file, but change the details as appropriate for your plugin (plugin name, parameters, etc.).
The JavaScript code that runs the trial goes inside the `trial` method for the plugin class.
More information about working with the `index.js` file can be found in the [plugin development documentation](https://www.jspsych.org/latest/developers/plugin-development/).

## jsPsych version compatibility

We would like to encourage you to contribute plugins and extensions that are compatible with the latest jsPsych version. 
At the same time, we realize that there may be jsPsych users who have created very useful plugins/extensions with jsPsych v6 that they would like to share with the community, but don't have the time/resources to convert into the jsPsych v7+ Node package format. 
Therefore we welcome contributions that are compatible with v6 as well as v7+. 

If you'd like to contribute a **jsPsych v6 plugin**, please do the following:
* Use the `templates/plugin-template-js` directory as a reference
* Delete everything inside of the `index.js` template file and replace it with your v6-compatible plugin code
* In the `package.json` file, change the "jspsych" version field in "devDependencies" to "6.3.1"

And remember to follow the other steps for contributing:
* Edit the `package.json` file with the information about your plugin
* Add a `readme.md` file for your plugin, based on the [readme template](https://github.com/jspsych/jspsych-contrib/blob/main/readme-template.md). This must state the jsPsych version that your plugin is compatible with.
* Optional: add a `/docs` directory with a markdown documentation file, and/or `/examples` directory with an HTML example file
