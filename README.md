# jspsych-contrib: jsPsych community contributions

This is an open repository of jsPsych plugins and extensions developed by members of the jsPsych community.

## `jspsych` vs. `jspsych-contrib` 

Plugins and extensions in the [main jspsych repository](https://github.com/jspsych/jsPsych/) are maintained by the core jsPsych team. 
The team takes responsibility for fixing bugs and updating plugins to take advantage of new features in jsPsych. 

Plugins and extensions in this repository are contributed by community members. 
They are not extensively tested or verified by the core jsPsych team. 

Contributions to `jspsych-contrib` that are broadly useful, well documented, and well tested may be added to the main repository, with the contributor's permission.

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

