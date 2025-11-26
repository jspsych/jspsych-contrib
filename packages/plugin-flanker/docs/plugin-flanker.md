# plugin-flanker

## Overview

The flanker plugin displays a configurable array of stimuli for the Eriksen Flanker Task. The task measures selective attention and response inhibition by requiring participants to respond to a central target while ignoring flanking distractors.

This plugin provides:
- **Generic stimulus support**: Arrows (default), letters, numbers, or custom HTML/SVG
- **Precise SOA timing**: Stimulus Onset Asynchrony using requestAnimationFrame
- **Dual response modes**: Keyboard or mobile-friendly buttons
- **Flexible configuration**: Spatial layout, timing parameters, and trial types

## Parameters

### Core Trial Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target_direction` | string | `"left"` | Direction of the target: `"left"` or `"right"` |
| `congruency` | string | `"congruent"` | Trial congruency: `"congruent"`, `"incongruent"`, or `"neutral"` |

### Stimulus Content (Generic)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `left_stimulus` | HTML string | `null` | Custom HTML/SVG for "left" target. If `null`, uses default left arrow SVG |
| `right_stimulus` | HTML string | `null` | Custom HTML/SVG for "right" target. If `null`, uses default right arrow SVG |
| `neutral_stimulus` | HTML string | `null` | Custom HTML/SVG for neutral flankers. If `null`, uses default dash SVG |

### Timing Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `soa` | integer | `0` | Stimulus Onset Asynchrony in milliseconds. Negative = flankers first, `0` = simultaneous, positive = target first |
| `stimulus_duration` | integer | `null` | Duration to display stimulus (ms). If `null`, waits for response |
| `response_timeout` | integer | `1500` | Maximum time allowed for response (ms) |

### Response Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `response_mode` | string | `"keyboard"` | Response mode: `"keyboard"` or `"buttons"` |
| `response_keys_left` | array | `["arrowleft"]` | Keys for left response (keyboard mode only) |
| `response_keys_right` | array | `["arrowright"]` | Keys for right response (keyboard mode only) |
| `button_label_left` | string | `"Left"` | Label for left button (button mode only) |
| `button_label_right` | string | `"Right"` | Label for right button (button mode only) |

### Spatial Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `stimulus_size` | string | `"48px"` | Width and height of each stimulus item |
| `target_flanker_separation` | string | `"10px"` | Spacing between target and flankers |
| `container_height` | string | `"100px"` | Height of stimulus container |
| `flanker_arrangement` | string | `"horizontal"` | Array orientation: `"horizontal"` or `"vertical"` |
| `num_flankers` | integer | `4` | Number of flankers: `4` (creates 5-item array) or `6` (creates 7-item array) |

## Data Generated

| Name | Type | Description |
|------|------|-------------|
| `target_direction` | string | Target direction: "left" or "right" |
| `congruency` | string | Trial congruency type |
| `soa` | integer | SOA value used (ms) |
| `response_mode` | string | Response mode used |
| `rt` | integer | Response time (ms) from when response collection began |
| `response` | string | Response given: "left" or "right", or `null` if no response |
| `correct` | boolean | Whether response was correct |

## Examples

### Default Arrow Flankers

```javascript
const arrowTrial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'incongruent'
  // Uses default arrow SVGs
};
```

### Letter Flankers (Original Eriksen Task)

```javascript
const letterTrial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'incongruent',
  left_stimulus: '<span style="font-size:48px;font-weight:bold">H</span>',
  right_stimulus: '<span style="font-size:48px;font-weight:bold">S</span>',
  neutral_stimulus: '<span style="font-size:48px;font-weight:bold">-</span>'
};
```

### SOA Manipulation (Negative SOA)

```javascript
const soaTrial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'incongruent',
  soa: -200,  // Flankers appear 200ms before target
  stimulus_duration: 100
};
```

### Button Response Mode (Mobile-Friendly)

```javascript
const buttonTrial = {
  type: jsPsychFlanker,
  target_direction: 'right',
  congruency: 'congruent',
  response_mode: 'buttons',
  button_label_left: '←',
  button_label_right: '→'
};
```

### Vertical Arrangement

```javascript
const verticalTrial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'incongruent',
  flanker_arrangement: 'vertical',
  num_flankers: 6  // 7-item array
};
```

### Number Flankers

```javascript
const numberTrial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'incongruent',
  left_stimulus: '<div style="font-size:48px">1</div>',
  right_stimulus: '<div style="font-size:48px">2</div>',
  neutral_stimulus: '<div style="font-size:48px">0</div>'
};
```

### Custom Response Keys

```javascript
const customKeysTrial = {
  type: jsPsychFlanker,
  target_direction: 'left',
  congruency: 'congruent',
  response_keys_left: ['f', 'F'],
  response_keys_right: ['j', 'J']
};
```

## SOA (Stimulus Onset Asynchrony)

The SOA parameter controls the relative timing of flanker and target onset:

- **Negative SOA** (e.g., `-200`): Flankers appear first, target appears after `|soa|` milliseconds
  - Tests early response activation
  - Maximizes interference from flankers

- **Zero SOA** (`0`): Flankers and target appear simultaneously
  - Standard flanker task configuration

- **Positive SOA** (e.g., `+200`): Target appears first, flankers appear after `soa` milliseconds
  - Reduces interference
  - Target processing begins before conflict

SOA timing is implemented using `requestAnimationFrame` for frame-accurate precision.

## Stimulus Customization

### Using Default Arrows

Simply omit the `left_stimulus`, `right_stimulus`, and `neutral_stimulus` parameters. The plugin will use built-in arrow SVGs.

### Custom Stimuli

Provide any HTML string for custom stimuli. Examples:

**Text/Letters:**
```javascript
left_stimulus: '<span style="font-size:48px;font-family:monospace">H</span>'
```

**Colored Squares:**
```javascript
left_stimulus: '<div style="width:48px;height:48px;background:red;border-radius:4px;"></div>'
```

**Custom SVG:**
```javascript
left_stimulus: '<svg width="48" height="48">...</svg>'
```

**Images:**
```javascript
left_stimulus: '<img src="stimulus_left.png" width="48" height="48">'
```

## Response Modes

### Keyboard Mode (Default)

- Participants press keys to respond
- Configurable via `response_keys_left` and `response_keys_right`
- Default: ArrowLeft and ArrowRight
- Best for desktop/laptop experiments

### Button Mode

- Displays clickable buttons below stimulus
- Mobile-friendly with touch support
- Button labels configurable via `button_label_left` and `button_label_right`
- Buttons are disabled during SOA phases, enabled during response collection
- Best for tablet/mobile experiments or participants unfamiliar with keyboards

## Research Applications

This plugin supports investigating:

1. **Selective Attention** - Ability to focus on target while ignoring distractors
2. **Response Inhibition** - Suppression of prepotent incorrect responses
3. **Cognitive Control** - Executive function and conflict resolution
4. **Temporal Dynamics** - SOA manipulation reveals time course of interference
5. **Stimulus Modality Effects** - Compare arrows, letters, colors, etc.

## Citation

If you use this plugin in your research, please cite:

```
Eriksen, B. A., & Eriksen, C. W. (1974). Effects of noise letters upon the
identification of a target letter in a nonsearch task. Perception & Psychophysics,
16(1), 143-149.
```
