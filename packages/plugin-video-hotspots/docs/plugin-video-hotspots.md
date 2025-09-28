# video-hotspots

A plugin for displaying a video that automatically plays and then freezes on the final frame with clickable hotspot regions. This plugin is ideal for experiments where participants need to respond to specific elements or regions visible in the last frame of a video after watching the complete video content.

## Key Features

- Video plays automatically and cannot be controlled by participants during playback
- Hotspots only become active after the video completely finishes
- Response timing is measured from when the video ends, not when the trial starts
- Supports both mouse and touch interactions
- Records click coordinates, response times, and video duration
- Customizable visual feedback for hotspot interactions

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter               | Type     | Default Value                                                    | Description                                                                                           |
| ----------------------- | -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| stimulus                | video    | undefined                                                        | The video to display. Can be a path to a video file or a data URL.                                  |
| hotspots                | complex  | []                                                               | Array of hotspot regions. Each hotspot should have x, y, width, height, and id properties.         |
| trial_duration          | int      | null                                                             | How long to show the trial in milliseconds after video ends. If null, trial waits for response.   |
| hotspot_highlight_css   | string   | "background-color: rgba(255, 255, 0, 0.3); border: 2px solid yellow;" | CSS string to style the hotspot highlight overlay that appears when clicking/touching a region.    |
| video_preload           | boolean  | true                                                             | Whether to preload the video for smoother playback.                                                |

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

| Name            | Type   | Value                                                                |
| --------------- | ------ | -------------------------------------------------------------------- |
| hotspot_clicked | string | The ID of the clicked hotspot region, or null if no response       |
| rt              | int    | Response time in milliseconds from when video ended, or null       |
| click_x         | int    | X coordinate of the click relative to the video (rounded)          |
| click_y         | int    | Y coordinate of the click relative to the video (rounded)          |
| video_duration  | float  | Duration of the video in milliseconds                              |

## Behavioral Notes

- **Video Control**: Participants cannot pause, rewind, or control video playback
- **Response Timing**: Participants cannot interact with hotspots until the video completely finishes
- **Response Measurement**: Response time (rt) is measured from the moment the video ends, not from trial start
- **Video Format**: Supports standard web video formats (MP4, WebM, OGG) - ensure browser compatibility
- **Final Frame**: Video remains frozen on the final frame after completion

## Install

Using the CDN-hosted JavaScript file:

```html
<script src="https://unpkg.com/@jspsych/plugin-video-hotspots@1.0.0"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```html
<script src="jspsych/plugin-video-hotspots.js"></script>
```

Using NPM:

```
npm install @jspsych/plugin-video-hotspots
```

```javascript
import videoHotspots from '@jspsych/plugin-video-hotspots';
```

## Examples

### Basic Example

```javascript
var trial = {
  type: jsPsychVideoHotspots,
  stimulus: 'videos/instruction-video.mp4',
  hotspots: [
    {
      id: 'target_object',
      x: 150,
      y: 200,
      width: 100,
      height: 80
    },
    {
      id: 'distractor_object',
      x: 300,
      y: 150,
      width: 90,
      height: 70
    }
  ]
};
```

### Social Interaction Study Example

```javascript
var trial = {
  type: jsPsychVideoHotspots,
  stimulus: 'videos/social-interaction.mp4',
  hotspots: [
    {
      id: 'person_a_face',
      x: 120,
      y: 50,
      width: 80,
      height: 100
    },
    {
      id: 'person_b_face',
      x: 280,
      y: 45,
      width: 85,
      height: 105
    },
    {
      id: 'shared_object',
      x: 200,
      y: 180,
      width: 60,
      height: 40
    }
  ],
  hotspot_highlight_css: 'background-color: rgba(0, 150, 255, 0.4); border: 3px solid blue; border-radius: 12px;'
};
```

### Timed Response Example

```javascript
var trial = {
  type: jsPsychVideoHotspots,
  stimulus: 'videos/memory-test.mp4',
  hotspots: [
    {
      id: 'location_1',
      x: 100,
      y: 100,
      width: 80,
      height: 80
    },
    {
      id: 'location_2',
      x: 220,
      y: 100,
      width: 80,
      height: 80
    },
    {
      id: 'location_3',
      x: 160,
      y: 200,
      width: 80,
      height: 80
    }
  ],
  trial_duration: 3000,  // Participants have 3 seconds to respond after video ends
  video_preload: true    // Ensure smooth video playback
};
```

### Educational Content Example

```javascript
var trial = {
  type: jsPsychVideoHotspots,
  stimulus: 'videos/anatomy-lesson.mp4',
  hotspots: [
    {
      id: 'heart',
      x: 180,
      y: 120,
      width: 60,
      height: 80
    },
    {
      id: 'lungs',
      x: 120,
      y: 100,
      width: 120,
      height: 100
    },
    {
      id: 'liver',
      x: 190,
      y: 200,
      width: 70,
      height: 50
    }
  ],
  hotspot_highlight_css: 'background-color: rgba(255, 165, 0, 0.5); border: 2px solid orange; box-shadow: 0 0 8px rgba(255, 165, 0, 0.8);'
};
```
