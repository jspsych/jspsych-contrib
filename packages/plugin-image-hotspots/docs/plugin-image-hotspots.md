# image-hotspots

A plugin for displaying an image with clickable regions (hotspots). This plugin allows researchers to present an image to participants and define rectangular regions that can be clicked like buttons. When a region is clicked or touched, visual feedback is provided and the trial records which region was selected along with response time and click coordinates.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter               | Type     | Default Value                                                    | Description                                                                                           |
| ----------------------- | -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| stimulus                | image    | undefined                                                        | The image to display. Can be a path to an image file or a data URL.                                 |
| hotspots                | complex  | []                                                               | Array of hotspot regions. Each hotspot should have x, y, width, height, and id properties.         |
| trial_duration          | int      | null                                                             | How long to show the trial in milliseconds. If null, the trial will wait for a response.          |
| hotspot_highlight_css   | string   | "background-color: rgba(255, 255, 0, 0.3); border: 2px solid yellow;" | CSS string to style the hotspot highlight overlay that appears when clicking/touching a region.    |

### Hotspot Object Properties

Each object in the `hotspots` array should have the following properties:

| Property | Type   | Description                                          |
| -------- | ------ | ---------------------------------------------------- |
| id       | string | Unique identifier for the hotspot region           |
| x        | number | X coordinate of the top-left corner (in pixels)    |
| y        | number | Y coordinate of the top-left corner (in pixels)    |
| width    | number | Width of the hotspot region (in pixels)            |
| height   | number | Height of the hotspot region (in pixels)           |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name            | Type   | Value                                                           |
| --------------- | ------ | --------------------------------------------------------------- |
| hotspot_clicked | string | The ID of the clicked hotspot region, or null if no click     |
| rt              | int    | The response time in milliseconds, or null if no response     |
| click_x         | int    | The x coordinate of the click relative to the image (rounded)  |
| click_y         | int    | The y coordinate of the click relative to the image (rounded)  |

## Install

Using the CDN-hosted JavaScript file:

```html
<script src="https://unpkg.com/@jspsych/plugin-image-hotspots@1.0.0"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```html
<script src="jspsych/plugin-image-hotspots.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-image-hotspots
```

```javascript
import imageHotspots from '@jspsych/plugin-image-hotspots';
```

## Examples

### Basic Example

```javascript
var trial = {
  type: jsPsychImageHotspots,
  stimulus: 'images/scene.jpg',
  hotspots: [
    {
      id: 'object1',
      x: 100,
      y: 150,
      width: 80,
      height: 60
    },
    {
      id: 'object2',
      x: 250,
      y: 200,
      width: 90,
      height: 70
    }
  ]
};
```

### Custom Styling Example

```javascript
var trial = {
  type: jsPsychImageHotspots,
  stimulus: 'images/map.png',
  hotspots: [
    {
      id: 'region_north',
      x: 50,
      y: 50,
      width: 200,
      height: 100
    },
    {
      id: 'region_south',
      x: 50,
      y: 200,
      width: 200,
      height: 100
    }
  ],
  hotspot_highlight_css: 'background-color: rgba(255, 0, 0, 0.4); border: 3px solid red; border-radius: 10px;'
};
```

### Timed Trial Example

```javascript
var trial = {
  type: jsPsychImageHotspots,
  stimulus: 'images/faces.jpg',
  hotspots: [
    {
      id: 'face1',
      x: 80,
      y: 120,
      width: 60,
      height: 80
    },
    {
      id: 'face2',
      x: 200,
      y: 120,
      width: 60,
      height: 80
    }
  ],
  trial_duration: 5000  // Trial ends after 5 seconds if no response
};
```
