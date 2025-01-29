# jspsych-ios plugin

This plugin allows for continuous responses on the Inclusion of Other in the Self (IOS) scale.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter                | Type             | Default Value        | Descripton                               |
| ------------------------ | ---------------- | -------------------- | ---------------------------------------- |
| prompt                     | HTML string           | `undefined`     | The prompt to be displayed above the circles. |
| movable_circle             | string                | `right`         | Specifies which circle `left` or `right` may be moved by the participant. |
| both_move                  | Boolean               | `true`          | Specifies if both circles move (`true`), or just one of them (`false`). |
| front_circle               | string                | `right`         | Specifies which circle is in front of the other. |
| [left/right]_label         | HTML string           | `undefined`     | The label for the left/right circle. |
| [left/right]_diam          | integer               | 200             | The diameter for the left/right circle, in pixels. |
| max_sep                    | integer               | 0               | The maximum allowable separation between the two circles. |
| [left/right]_border_width  | integer           | 2     | Width, in pixels, of the [left/right] circle's border. |
| [left/right]_border_style  | string           | `'solid'`     | Style argument for the [left/right] circle's border. |
| [left/right]_border_colour | string           | `'black'`     | Colour argument for the [left/right] circle's border. |
| [left/right]_style | string | `''` | Additional style arguments for the [left/right] circle. E.g., `'background-color: rgba(1, 0, 0, 0.5)';` |
| arrows | Boolean | `false` | Specifies whether lines should connect the circles to their labels, in case of any ambiguity (e.g., if one circle is smaller). |
| cursor | string | `'crosshair'` | Style of cursor when the user hovers over the clickable area. |
| button label | HTML string | `'continue'` | Text of the button the user clicks to submit their response. |
| required | Boolean | `false` | Specifies whether the user must make a response of some kind before clicking the submit button. |
| hide_initially | Boolean | `false` | If true, the circles are hidden until the user hovers over them. |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.

| Name             | Type      | Value                                    |
| ---------------- | --------- | ---------------------------------------- |
| response         | numeric   | The degree of overlap selected, where 1 means the circles are concentric, 0 means the circles have no overlap but no space between them, and negative numbers reflect separation between the circles (measured on the same scale as positive numbers representing overlap). Note that this number scales linearly, meaning it is not a measure of the overlapping area of the circles. |
| rt               | numeric   | The time in milliseconds, between when the trial began and when the paticipant clicked the continue button. |
| prompt           | string    | The prompt displayed during the trial. |

## Examples

### Simple replication of the original IOS scale

```javascript
var trial = {
  type: jsPsychIos,
  prompt: 'Move the circles so that they represent your relationship',
  left_label: 'Self',
  movable_circle: 'left'
  right_label: 'Other',
};
```

[Demonstration](https://kinleyid.github.io/rsrch/jspsych-ios/examples/classic.html)

### Integration of self into group

```javascript
var trial = {
  type: jsPsychIos,
  prompt: 'Move the circles so that they represent your relationship',
  left_label: 'Self',
  movable_circle: 'left',
  right_label: 'Group',
  arrows: true,
  left_diam: 100,
  right_diam: 200
};
```

[Demonstration](https://kinleyid.github.io/rsrch/jspsych-ios/examples/group.html)
