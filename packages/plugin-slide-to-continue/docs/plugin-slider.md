# jsPsych Slide-to-continue Plugin Documentation

The jsPsych Slide-to-continue Plugin provides a customizable slider interface that requires users to drag to continue, similar to mobile "slide to unlock" functionality. This plugin is ideal for creating interactive engagement checkpoints in psychological experiments.

## Overview

- **Plugin Name**: `slide-to-continue`
- **Version**: 0.0.1
- **Purpose**: Interactive slider requiring drag completion to proceed
- **Completion Threshold**: 95% slide completion required
- **Supported Interactions**: Mouse and touch events

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

### Core Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `color` | STRING | `"purple"` | No | Color of slider track and handle. Accepts named colors (purple, red, blue, green, yellow, orange, pink, black, white, gray, grey) or hex values (e.g., "#FF5733") |
| `direction` | SELECT | `"left-to-right"` | No | Direction of sliding. Options: `"left-to-right"`, `"right-to-left"` |
| `object_sliding` | SELECT | `"round"` | No | Shape of the sliding handle. Options: `"round"` (50% border-radius), `"square"` (4px border-radius) |
| `length` | INT | `300` | No | Length of the slider in pixels (width for horizontal, height for vertical) |
| `orientation` | SELECT | `"horizontal"` | No | Slider orientation. Options: `"horizontal"`, `"vertical"` |
| `width` | INT | `60` | No | Width/thickness of the slider track in pixels |
| `animation` | SELECT | `"smooth"` | No | Animation style. Options: `"smooth"` (CSS transitions), `"ticks"` (discrete movement) |
| `prompt` | HTML_STRING | `null` | No | HTML content displayed above the slider |
| `slider_text` | STRING | `"Slide to continue"` | No | Text displayed on the slider (fades as slider progresses) |
| `duration` | INT | `null` | No | Maximum trial duration in milliseconds. Auto-ends if not completed |

### Parameter Details

#### Color Parameter
The `color` parameter accepts multiple formats:
- **Named colors**: `"purple"`, `"red"`, `"blue"`, `"green"`, `"yellow"`, `"orange"`, `"pink"`, `"black"`, `"white"`, `"gray"`, `"grey"`
- **Hex colors**: `"#FF5733"`, `"#00A1C9"`, etc.
- **Color application**: Applied to handle and used to generate translucent versions for track and fill

#### Direction Parameter
Controls initial handle position and required sliding direction:
- `"left-to-right"`: Handle starts on left, slide right to complete
- `"right-to-left"`: Handle starts on right, slide left to complete

#### Object Sliding Parameter
Determines handle appearance:
- `"round"`: Circular handle with 50% border-radius
- `"square"`: Rectangular handle with 4px border-radius

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial:

| Name | Type | Value |
|------|------|-------|
| `rt` | INT | Response time in milliseconds from trial start to completion |
| `response` | BOOL | Whether the slider was completed (`true`) or not (`false`) |
| `final_position` | INT | Final position of the slider (0-100 scale) |

## Installation

### NPM Installation
```bash
npm install @jspsych-contrib/plugin-slide-to-continue
```

### CDN Installation
```html
<script src="https://unpkg.com/@jspsych-contrib/plugin-slide-to-continue@latest/dist/index.browser.min.js"></script>
```

### ES6 Module Import
```javascript
import SliderPlugin from '@jspsych-contrib/plugin-slide-to-continue';
```

## Usage Examples

### Basic Example
```javascript
var trial = {
  type: jsPsychSlider,
  slider_text: "Slide to continue"
};
```

### Customized Appearance
```javascript
var trial = {
  type: jsPsychSlider,
  color: "#FF5733",
  object_sliding: "square",
  length: 400,
  width: 80,
  slider_text: "Swipe to proceed",
  animation: "smooth"
};
```

### Vertical Slider
```javascript
var trial = {
  type: jsPsychSlider,
  orientation: "vertical",
  direction: "right-to-left",
  length: 250,
  width: 50,
  color: "blue",
  slider_text: "Slide up"
};
```

### With Prompt and Timeout
```javascript
var trial = {
  type: jsPsychSlider,
  prompt: "<h3>Please complete the slider to proceed</h3>",
  duration: 10000, // 10 seconds
  color: "green",
  slider_text: "Slide within 10 seconds"
};
```

### Advanced Color Customization
```javascript
var trial = {
  type: jsPsychSlider,
  color: "#8A2BE2", // Blue violet
  object_sliding: "round",
  length: 350,
  width: 70,
  animation: "ticks",
  slider_text: "Drag to unlock"
};
```

## API Reference

### Trial Object Properties
All parameters can be functions that return values, allowing for dynamic configuration:

```javascript
var trial = {
  type: jsPsychSlider,
  color: function() {
    return jsPsych.randomization.sampleWithoutReplacement(['red', 'blue', 'green'], 1)[0];
  },
  length: function() {
    return Math.floor(Math.random() * 200) + 200; // Random length 200-400px
  }
};
```

### Data Access
Access trial data in the `on_finish` callback:

```javascript
var trial = {
  type: jsPsychSlider,
  on_finish: function(data) {
    console.log('Response time:', data.rt);
    console.log('Completed:', data.response);
    console.log('Final position:', data.final_position);
  }
};
```

## Advanced Customization

### CSS Styling
The plugin generates HTML with specific classes that can be styled:

```css
/* Customize slider container */
.jspsych-slider-container {
  margin: 20px 0;
  padding: 10px;
}

/* Customize slider text */
.jspsych-slider-text {
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-weight: bold;
}

/* Customize handle */
.jspsych-slider-handle {
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  border: 2px solid white;
}
```

## Integration with Other Plugins

### Conditional Trials
Use slider response to control experiment flow:

```javascript
var slider_trial = {
  type: jsPsychSlider,
  slider_text: "Slide to begin the experiment"
};

var conditional_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Welcome to the experiment!",
  conditional_function: function() {
    var last_trial = jsPsych.data.get().last(1).values()[0];
    return last_trial.response === true;
  }
};
```

### Timeline Integration
Incorporate into complex experimental designs:

```javascript
var timeline = [
  {
    type: jsPsychSlider,
    slider_text: "Slide to start Block 1",
    color: "blue"
  },
  {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Block 1 content...",
    choices: [' ']
  },
  {
    type: jsPsychSlider,
    slider_text: "Slide to start Block 2",
    color: "green"
  }
];
```

## Edge Cases and Warnings

### Important Considerations

1. **Completion Threshold**: The slider must reach 95% completion to register as successful. Releasing before this threshold causes the handle to snap back to the starting position.

2. **Touch vs Mouse Events**: The plugin handles both touch and mouse events, but behavior may vary slightly between devices. Test on target devices.

3. **Duration Parameter**: If `duration` is set, the trial will end automatically even if the slider isn't completed, resulting in `response: false`.

4. **Color Validation**: Invalid color values will fall back to the default purple. Always test color values in your target browsers.

5. **Orientation and Direction**: When using `"vertical"` orientation, `"right-to-left"` direction means bottom-to-top sliding.

### Best Practices

#### Performance Optimization
- Use named colors when possible for better performance
- Avoid very long sliders (>500px) on mobile devices
- Test animation settings on target devices

#### User Experience
- Provide clear instructions in the `prompt` parameter
- Use appropriate `slider_text` that matches the `direction`
- Consider using timeouts (`duration`) for engagement studies

#### Accessibility
- Ensure sufficient color contrast for the chosen color
- Test with screen readers if accessibility is required
- Provide alternative input methods for users with motor disabilities

#### Cross-Platform Considerations
- Test on both desktop and mobile devices
- Verify touch sensitivity on different devices
- Consider different screen sizes when setting `length` and `width`

#### Data Collection
- Always validate that `response` is `true` before considering the trial successful
- Use `rt` data to measure engagement time
- Monitor `final_position` to understand user behavior patterns

### Troubleshooting

#### Common Issues
1. **Slider not responding**: Check for CSS conflicts with touch-action properties
2. **Inconsistent colors**: Verify color format and browser compatibility
3. **Layout issues**: Ensure container has sufficient space for the specified dimensions
4. **Performance problems**: Reduce animation complexity or disable transitions

---

For additional support and examples, visit the [jsPsych documentation](https://www.jspsych.org/) or the [plugin repository](https://github.com/jspsych/jspsych-contrib).