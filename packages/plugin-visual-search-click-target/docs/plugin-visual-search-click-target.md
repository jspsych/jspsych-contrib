# plugin-visual-search-click-target

Displays a set of images in a random scatter pattern along with an "Absent" button. The participant clicks on a target image or the "Absent" button if no target is present. This plugin is designed for visual search experiments where the response is a mouse click on the identified target.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| images              | ARRAY of STRING  | *undefined*        | Array of image URLs to display in the search array. |
| target_present      | BOOL             | `true`             | Whether a target is present in the display. |
| target_index        | INT              | `0`                | Index of the target in the `images` array (used when `target_present` is `true`). |
| image_size          | FLOAT            | `10`               | Size of each image as a percentage of the viewport minimum dimension (vmin). |
| search_area_width   | FLOAT            | `90`               | Width of the search area as a percentage of viewport width (vw). |
| search_area_height  | FLOAT            | `80`               | Height of the search area as a percentage of viewport height (vh). |
| background_color    | STRING           | `"#ffffff"`        | Background color of the search display. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name           | Type    | Value                                    |
| -------------- | ------- | ---------------------------------------- |
| rt             | INT     | Response time in milliseconds from the onset of the search display. |
| response       | STRING  | `"target"` if an image was clicked, `"absent"` if the absent button was clicked. |
| correct        | BOOL    | `true` if the response was correct. When `target_present` is `true`, the response is correct if the participant clicked the image at `target_index`. When `target_present` is `false`, the response is correct if the participant clicked the absent button. |
| clicked_index  | INT     | The index of the clicked image in the `images` array. `null` if the absent button was clicked. |

## Install

Using the CDN-hosted JavaScript file:

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-visual-search-click-target"></script>
```

Using the JavaScript file downloaded from a GitHub release:

```html
<script src="plugin-visual-search-click-target.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-visual-search-click-target
```

```javascript
import jsPsychVisualSearchClickTarget from '@jspsych-contrib/plugin-visual-search-click-target';
```

## Examples

### Basic visual search with target present

```javascript
var trial = {
  type: jsPsychVisualSearchClickTarget,
  images: ['img/target.png', 'img/distractor1.png', 'img/distractor2.png', 'img/distractor3.png'],
  target_present: true,
  target_index: 0,
};
```

### Visual search with target absent

```javascript
var trial = {
  type: jsPsychVisualSearchClickTarget,
  images: ['img/distractor1.png', 'img/distractor2.png', 'img/distractor3.png', 'img/distractor4.png'],
  target_present: false,
};
```

### Customizing the display

```javascript
var trial = {
  type: jsPsychVisualSearchClickTarget,
  images: ['img/target.png', 'img/distractor1.png', 'img/distractor2.png'],
  target_present: true,
  target_index: 0,
  image_size: 8,
  search_area_width: 80,
  search_area_height: 70,
  background_color: '#cccccc',
};
```
