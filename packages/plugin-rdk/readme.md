# rdk plugin

## Overview

This plugin displays a Random Dot Kinematogram (RDK) and allows the subject to report the primary direction of motion by pressing a key on the keyboard. The stimulus can be displayed until a keyboard response is given or until a certain duration of time has passed. The RDK is fully customizable (see documentation below) and can display multiple apertures at the same time, each with its own parameters.

## Loading

### In browser

```js
<script src="http://unpkg.com/@jspsych-contrib/plugin-rdk@1.0.0">
```

### Via NPM

```
npm install @jspsych-contrib/plugin-rdk
```

```js
import jsPsychRdk from '@jspsych-contrib/plugin-rdk';
```

## Compatibility

jsPsych v7.0.

## Documentation

See [documentation](docs/jspsych-rdk.md)

## Author / Citation

Created by [Sivananda Rajananda](https://github.com/vrsivananda), Hakwan Lau, and Brian Odegaard. Modified by the jsPsych core team for 7.0 compatibility.

We would appreciate it if you cited this paper when you use the RDK plugin.

Rajananda, S., Lau, H. & Odegaard, B., (2018). A Random-Dot Kinematogram for Web-Based Vision Research. *Journal of Open Research Software. 6*(1), p.6. doi:[10.5334/jors.194](http://doi.org/10.5334/jors.194)