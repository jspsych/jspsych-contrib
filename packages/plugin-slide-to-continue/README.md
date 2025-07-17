# plugin-slider

## Overview

The `plugin-slide-to-continue` is a jsPsych plugin that creates an interactive slider interface similar to the "slide to unlock" functionality found on mobile devices. Users must drag a slider handle to complete the trial, making it useful for consent screens, engagement checks, or transition screens in psychological experiments.

## Features

- **Customizable appearance**: Control color, shape, size, and orientation
- **Flexible direction**: Support for left-to-right or right-to-left sliding
- **Smooth animations**: Optional smooth transitions and visual feedback
- **Touch-friendly**: Works on both desktop and mobile devices
- **Progress tracking**: Records completion status, response time, and final position

## Installation

### Using npm

```bash
npm install plugin-slide-to-continue
```

### Using a CDN

```html
<script src="https://unpkg.com/plugin-slide-to-continue@latest/dist/index.browser.min.js"></script>
```

## Compatibility

`plugin-slide-to-continue` requires jsPsych v8.0.0 or later.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter      | Type    | Default Value      | Description                                                    |
| -------------- | ------- | ------------------ | -------------------------------------------------------------- |
| `color`        | string  | "purple"           | The color of the slider track and handle (hex, rgb, or named) |
| `direction`    | string  | "left-to-right"    | The sliding direction ("left-to-right" or "right-to-left")    |
| `object_sliding` | string | "round"           | The shape of the slider handle ("round" or "square")          |
| `length`       | number  | 300                | The length of the slider in pixels                            |
| `orientation`  | string  | "horizontal"       | The slider orientation ("horizontal" or "vertical")           |
| `width`        | number  | 60                 | The width/height of the slider track in pixels                |
| `animation`    | string  | "smooth"           | Animation style ("smooth" or "ticks")                         |
| `prompt`       | string  | null               | HTML content displayed above the slider                       |
| `slider_text`  | string  | "Slide to continue" | Text displayed on the slider                                  |
| `duration`     | number  | null               | Maximum trial duration in milliseconds                        |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name             | Type    | Value                                                      |
| ---------------- | ------- | ---------------------------------------------------------- |
| `rt`             | number  | The response time in milliseconds to complete the slide   |
| `response`       | boolean | Whether the slider was successfully completed              |
| `final_position` | number  | The final position of the slider (0-100)                  |

## Examples

### Basic Usage

```javascript
var trial = {
  type: jsPsychPluginSlider,
  prompt: '<h2>Welcome to the Experiment</h2>',
  slider_text: 'Slide to continue'
};
```

### Vertical Red Slider

```javascript
var trial = {
  type: jsPsychPluginSlider,
  color: 'red',
  orientation: 'vertical',
  length: 200,
  width: 80,
  object_sliding: 'square',
  slider_text: 'Slide up'
};
```

### Right-to-Left Slider

```javascript
var trial = {
  type: jsPsychPluginSlider,
  direction: 'right-to-left',
  color: '#2196F3',
  animation: 'ticks',
  prompt: '<p>Slide from right to left to proceed</p>'
};
```

### Timed Trial

```javascript
var trial = {
  type: jsPsychPluginSlider,
  duration: 10000, // 10 seconds maximum
  prompt: '<p>Quick! Slide to continue before time runs out!</p>',
  color: 'orange'
};
```

## Documentation

See [documentation](docs/plugin-slider.md) for detailed usage information.

## Author / Citation

[Vishnu Lakshman](https://github.com/lakshmanvishnu)