# touchscreen-buttons extension

This extension displays touch buttons allows the subject to respond to stimuli via touchscreen on mobile devices. The
touch button send key press events so that all jsPsych plugins that use keyboard input are compatible.

## Citation

## Parameters

### Layouts

In the initialisation stage of the extension you can initialize layouts of buttons. These can then be used in the
trials.

| Parameter | Description              |
|-----------|--------------------------|
| params    | An dictionary of layouts |

#### Example

```javascript
let jsPsych = initJsPsych({
  extensions: [{
    type: jsPsychExtensionTouchscreenButtons, params: {
      instruction_layout: [{ key: 'm' }], // first layout
      direction_layout: [{ key: 'l', preset: 'left'}, { key: 'r', preset: 'right'}], // second layout
      stroop_layout: [
        { key: 'r', preset: 'bottom_left' },
        { key: 'g', preset: 'top_left' },
        { key: 'y', preset: 'bottom_right'},
        { key: 'b', preset: 'top_right' }
        ]
      }
  }]
});
```

Every layout can contain an array of buttons of arbitrary length.

### Buttons

The buttons can be initialised with the following parameters

| Parameter  | Description                                                                                                                                              |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| key        | This is a mandatory parameter. The key press that is send when touching the button                                                                       |
| position_x | Not mandatory. The x-position in % of screen width (from the left) of the button. Can be given as a css-string to use (for example, 50vw, 120px, ...)    |
| position_y | Not mandatory. The y-position in % of screen height (from the bottom) of the button. Can be given as a css-string to use (for example, 50vw, 120px, ...) |
| size       | Not mandatory. The size in % of screen width (diameter) of the button. Can be given as a css-string to use (for example, 50vw, 120px, ...)               |
| color      | Not mandatory. The color of the button                                                                                                                   |
| innerText  | Not mandatory. Inner text of the button                                                                                                                  |
| style      | Not mandatory. Here most css styles can be customized (including the position and size of the button                                                     |
| preset     | Not mandatory. A selection of predefined positions/sizes: [left, right, bottom_left, bottom_right, top_left, top_right]                                  |

#### Example

```javascript
let jsPsych = initJsPsych({
    extensions: [{
      type: jsPsychExtensionTouchscreenButtons,
      params: {
        example_layout: [
          {
            key: 'm',
            color: 'blue',
            style: { top: '2vw', fontWeight: 'bold', boxShadow: "1vw 1vw 2vw 1vw #0009" },
            innerText: 'press'
          }
        ] // array of buttons (here one)
      }
    }]
  })
;
```

### Trial

In the jsPsych trials you only have to choose from the specified layouts. ATTENTION: The choices and correct_choices
parameter of the trial must match the keys specified in the extension initialisation.

#### Example

```javascript
let trial = {
  type: jsPsychRok, // can be used with plugins that use keyboard as input
  response_ends_trial: true,
  choices: ['l', 'r'],
  correct_choice: ['r'],
  extensions: [
    {
      type: jsPsychExtensionTouchscreenButtons, params: { layout: 'example_layout' }
    }
  ]
};
```
