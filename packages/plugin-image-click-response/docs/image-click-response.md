# image-click-response

This plugin shows an image on which the user can place points by clicking/touching the image. The x,y coordinates for each point are recorderd.

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|     preamble        | HTML_STRING      | <p>Click the image to add a point. Click a point to remove<p> | Instruction text that will appear above the image |
| stimulus              |IMAGE   | undefined | URL to the image that will be displayed|
| dot_radius            | INT    | 5| Radius of the dot in pixels|
| dot_color             | STRING | lightblue| Color name for the dot|
| button_label          | STRING | Continue| Label for the continue button |
| minimum_dots_required | INT    | 0| Minimum number of dots required before the Continue button becomes active.|

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| stimulus  | IMAGE   | URL to the image that will be displayed  |
| rt        | INT     | Time in milliseconds to compete the trial                                         |
| points    | ARRAY   | Array of objects with x, y and rt properties representing the location of the dot (using the top left corner as the origin), and the time the dot was made in milliseconds|

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-image-click-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-image-click-response.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-image-click-response
```

```js
import ImageClickResponse from '@jspsych-contrib/plugin-image-click-response';
```

## Examples

### Title of Example

```javascript
const trial = {
    type: jsPsychImageClickResponse,
    stimulus: "https://www.jspsych.org/7.3/img/jspsych-logo.jpg",
    dot_radius : 10
  };
```

See [example #1](../examples/index.html) for a live demonstration.