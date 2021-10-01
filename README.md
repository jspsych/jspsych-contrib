# jspsych-contrib: jsPsych community contributions

This is an open repository of jsPsych plugins and extensions developed by members of the jsPsych community.

## `jspsych` vs. `jspsych-contrib` 

Plugins and extensions in the [main jspsych repository](https://github.com/jspsych/jsPsych/) are maintained by the core jsPsych team. 
The team takes responsibility for fixing bugs and updating plugins to take advantage of new features in jsPsych. 

Plugins and extensions in this repository are contributed by community members. 
They are not extensively tested or verified by the core jsPsych team. 

Contributions to `jspsych-contrib` that are broadly useful, well-documented, and well-tested may be added to the main `jsPsych` repository, with the contributor's permission.

## Guidelines for contributions

Contributions to this repository must:

* Be *functional* -- they must work in at least some particular circumstance.
* Include the complete code for the plugin or extension.
* Include a `readme.md` file following our [template](readme-template.md).
* Include a `package.json` file.

Optionally, contributions can include:

* A `/docs` directory with documentation matching the template for docs on jspsych.org 
* An `/examples` directory with a working `.html` demo.
* A test suite following the testing framework in our `-ts` templates.


To submit a contribution, [open a pull request](https://github.com/jspsych/jspsych-contrib/pulls).
In the pull request, please make it clear how we can verify that the contribution is functional. 
This could be accomplished with a link to a demonstration experiment, the inclusion of an example file and/or testing files, or through some other means.
We try to review pull requests quickly and add new contributions as soon as the minimal standards are met.

## Plugin templates

There are two plugin template directories inside the `/packages` directory that you can as a reference when creating a directory for your plugin contribution. Both templates are compatible with jsPsych v7+.

* `plugin-template-ts`: This template uses TypeScript source files that are complied into JavaScript using Node.js and npm. This is the format used for plugins in the main jsPsych repo. For more details, please see the jsPsych documentation page [Configuring the jsPsych development environment](https://www.jspsych.org/developers/configuration).
* `plugin-template`: This template allows you to put your plugin's JavaScript code directly into a JavaScript template file, rather than using TypeScript and Node.js/npm. 

## jsPsych version compatibility

We would like to encourage you to contribute plugins that are compatible with the latest jsPsych version. At the same time, we realize that there may be jsPsych users who have created very useful plugins with jsPsych v6 that they would like to share with the community, but don't have the time/resources to convert into the jsPsych v7+ Node package format. Therefore we welcome plugins that are compatible with v6 as well as v7+. 

If you'd like to contribute a jsPsych v6 plugin, please do the following:
* Use the `plugin-template` directory as a reference
* Delete everything inside of the `index.js` template file and replace it with your v6-compatible plugin code
* Edit the `package.json` file with the information about your plugin
* Delete the "devDependencies" property and values in the `package.json` files (this is only relevant for plugins that are compatible with jsPsych v7+)
* Add a `readme.md` file, which must state the jsPsych version that your plugin is compatible with
* Optional: add a `/docs` directory with a markdown documentation file, and/or `/examples` directory with an HTML example file