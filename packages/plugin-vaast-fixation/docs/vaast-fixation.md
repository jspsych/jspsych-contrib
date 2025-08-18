# vaast-fixation

This plugin is meant to be used in a VAAST (Visual Approach and Avoidance by the Self Task) experiment.
The VAAST-fixation plugin displays a fixation text that is usually a cross.
This plugin is usually called before a vaast-text or vaast-image trial. The participant doesn't respond to the fixation trial.

## Parameters

| Parameter         | Type   | Default Value | Description                                                                             |
| ----------------- | ------ | ------------- | --------------------------------------------------------------------------------------- |
| fixation          | STRING | '+'           | The string that is displayed as fixation.                                               |
| font_size         | INT    | 200           | Font size of the fixation text.                                                         |
| min_duration      | INT    | 800           | Minimal duration (in ms).                                                               |
| max_duration      | INT    | 2000          | Maximal duration (in ms).                                                               |
| background_images | IMAGE  | undefined     | An array with the images displayed as background as function of the position.           |
| position          | INT    | 3             | The position in the "background_images" array which will be used to set the background. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name     | Type | Value                                   |
| -------- | ---- | --------------------------------------- |
| duration | INT  | Duration of the fixation trial (in ms). |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-vaast-fixation"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-vaast-fixation.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-vaast-fixation
```

```js
import VaastFixation from '@jspsych-contrib/plugin-vaast-fixation';
```

## Examples

```javascript
// VAAST background images:
// In the examples folder, 'eco_env' refers to an ecological environment but non-ecological visual flow, 'eco_vf' to an ecological visual flow but non-ecological environment and 'eco_vf_env' to an ecological visual flow and environment.

const background = [
  "../examples/background/eco_env/2.jpg",
  "../examples/background/eco_env/4.jpg",
  "../examples/background/eco_env/6.jpg"
];

const trial = {
  type: jsPsychVaastFixation,
  fixation: "+",
  font_size: 46,
  position: 1,
  background_images: background
};
```
