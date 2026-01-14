# plugin-trail-making

A jsPsych plugin for the Trail Making Test (TMT), a neuropsychological test of visual attention and task switching. Participants connect circles in sequence as quickly as possible.

## Loading

### In browser

```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-trail-making"></script>
```

### Via NPM

```
npm install @jspsych-contrib/plugin-trail-making
```

```js
import jsPsychTrailMaking from "@jspsych-contrib/plugin-trail-making";
```

## Compatibility

`@jspsych-contrib/plugin-trail-making` requires jsPsych v8.0.0 or later.

## Usage

### Part A (Numbers Only)

```javascript
const trial = {
  type: jsPsychTrailMaking,
  test_type: "A",
  num_targets: 25,
  prompt: "<p>Connect the circles in order (1-2-3-4...)</p>"
};
```

### Part B (Alternating Numbers and Letters)

```javascript
const trial = {
  type: jsPsychTrailMaking,
  test_type: "B",
  num_targets: 24,  // Should be even for equal numbers/letters
  prompt: "<p>Alternate between numbers and letters (1-A-2-B-3-C...)</p>"
};
```

### Custom Target Positions

```javascript
const trial = {
  type: jsPsychTrailMaking,
  targets: [
    { x: 100, y: 100, label: "1" },
    { x: 300, y: 200, label: "2" },
    { x: 200, y: 400, label: "3" }
  ]
};
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| test_type | string | "A" | Type of test: "A" (numbers only) or "B" (alternating numbers/letters) |
| num_targets | int | 25 | Number of targets to display |
| canvas_width | int | 600 | Width of the display area in pixels |
| canvas_height | int | 600 | Height of the display area in pixels |
| target_radius | int | 25 | Radius of each target circle in pixels |
| min_separation | int | 80 | Minimum distance between target centers |
| target_color | string | "#ffffff" | Color of unvisited targets |
| target_border_color | string | "#000000" | Border color of targets |
| visited_color | string | "#90EE90" | Color of visited targets |
| line_color | string | "#000000" | Color of connecting line |
| line_width | int | 2 | Width of connecting line |
| error_color | string | "#FF6B6B" | Color flash on error |
| error_duration | int | 500 | Duration of error feedback (ms) |
| targets | array | null | Custom target positions (overrides num_targets) |
| prompt | string | null | HTML prompt displayed above canvas |
| seed | int | null | Random seed for reproducible layouts |

## Data Generated

| Name | Type | Description |
|------|------|-------------|
| test_type | string | The type of test ("A" or "B") |
| targets | array | Array of target objects with x, y, and label |
| clicks | array | Array of click events with target_index, label, time, x, y, and correct |
| completion_time | int | Total time from first to last click (ms) |
| num_errors | int | Number of incorrect clicks |
| total_path_distance | float | Total distance traveled between targets (pixels) |
| inter_click_times | array | Response times between consecutive correct clicks |

## Example

See the [examples](examples/) folder for a complete demonstration.

```javascript
const jsPsych = initJsPsych({
  on_finish: function() {
    const data = jsPsych.data.get().filter({trial_type: 'trail-making'});
    console.log('Part A time:', data.values()[0].completion_time);
    console.log('Part B time:', data.values()[1].completion_time);
  }
});

const partA = {
  type: jsPsychTrailMaking,
  test_type: "A",
  num_targets: 25
};

const partB = {
  type: jsPsychTrailMaking,
  test_type: "B",
  num_targets: 24
};

jsPsych.run([partA, partB]);
```

## References

- Reitan, R. M. (1958). Validity of the Trail Making Test as an indicator of organic brain damage. Perceptual and Motor Skills, 8(3), 271-276.
- Tombaugh, T. N. (2004). Trail Making Test A and B: normative data stratified by age and education. Archives of Clinical Neuropsychology, 19(2), 203-214.

## Author

[Josh de Leeuw](https://github.com/jodeleeuw)
