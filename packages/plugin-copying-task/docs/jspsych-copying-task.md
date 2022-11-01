# jspsych-copying-task plugin

This plugin runs a copying task. In a trial, an example grid (the "model", containing various stimuli) on the left must replicated in the middle grid (the "workspace"). To do this stimuli from the right grid (the "resources") can be picked up and dragged to the middle grid. You can use imgage files (e.g., .jpg/.png/.gif) as stimuli, or built in 'nonsense' shape stimuli in any color. The plugin records the actions of the participant what items are picked up and where they are placed.    

## Parameters

Parameters can be left unspecified if the default value is acceptable. If more then one aperture is displayed most of the parameters should be specified as array (specified by the array column).
The elements of the array then apply to the corresponding aperture. Features that are not fully implemented yet are marked with an x

|Parameter|Type|Default Value| Descripton|
|---------|----|-------------|-----------|
|model_grid_contents|array of arrays of stings|undefined|The set of items to be used as model stimuli. They should be arranged in a nested array of the desired dimensions.|
|resource_grid_contents|array of arrays of stings|undefined|The set of items to be used as resource stimuli. They should be arranged in a nested array of the desired dimensions.
|item_file_type|string|`'img'`| The image file type. If this parameter is set to `'img'`, almost any image file type can be used (e.g., .png, .jpg, .gif, etc.).  If this parameter is set to `'svg_path'`, 20 shapes and any rgb color can be used to define the stimuli. The stimuli in the grid contents should be a string in the following format: `'num--color'`, where `num` is a number between 0 and 19, and `color` is a set of rgb values or a color name. A few valid example strings: `'3--rgb(5,223,34)'`, `'16--rgb(0,0,255)'`,  `'19--red'`,  `'0--teal'`.
|item_scale|numeric|0.8|The relative size of items to a grid box.
|grid_box_scale|numeric|0.05| The scale of a single box in the grid in relation to the canvas width.
|grid_colors|array of strings|`['green', 'black', 'darkblue']`|The colors of the grids as such [model color, workspace color, resource color].
|prompt|string|null|Any content here will be displayed below the stimulus.
|stimulus_duration|numeric|null|How long to hide the stimulus. 
|trial_duration|numeric|null|How long to show trial before it ends. 
|canvas_width|numeric|1500|The width of the canvas element.
|grid_offset|object|`{model_x:0.5, model_y:0.5, resource_x:0.79, resource_y:0.5,}`|Offset the location of the grids.
|mid_border_specs|object|`{width:0.17, left:0.35, color:'rgba(0,0,0,0.5)'}`| sd 
|canvas_aspect_ratio|numeric|3|The aspect ratio the canvas element (width / height).
|allow_incorr_placement|boolean|false|If true, it is allowed to place items in incorrect grid posititons.
|lock_correct_placement|boolean|true|If true, a correctly placed items cannot be moved anymore.
|twenty_svg_paths|array of strings|`[svg_path_shape_0, ..., svg_path_shape_19]`| SVG paths of 20 shapes. The numbers provided in the grid contents (when `item_file_type=='svg_paths'`) is the index of this array. Optionally other svg paths can be provided to create shapes with. 


## Data Generated

In addition to the default data collected by all plugins, this plugin collects all parameter data described above and the following data for each trial.

|Name|Type|Description|
|rt|numeric|-----|
|key_press|sting|null|
|grid_contents|array of arrays of string|The state of the arrays (model, workspace, resource, respectively) when the trial ends|
|trial_events|array|Timestamped trial events, such as items pick ups and placements.|
|trial_completed|boolean|Whether the trial was succesfully completed.|
|canvas_offset_top_left|array of numeric|The offset of the canvas topleft coordinate.|
                
## Examples

### Ensure fabric.js (version 5.2.4) is imported in \<head>
```
<script src="https://www.unpkg.com/fabric@5.2.4-browser/dist/fabric.js"></script> 
```

### Basic example
```javascript
// 12 shapes
const shapes = ['img/card.png', 'img/2.gif', 'img/happy_face_2.jpg', 'img/4.gif', 'img/sad_face_4.jpg', 'img/6.gif','img/7.gif', 'img/8.gif', 'img/9.gif', 'img/10.gif', 'img/11.gif', 'img/12.gif']

// optionally preload stimuli
const preload = {
      type: jsPsychPreload,
      images: shapes
};

// create a nested array (3 rows by 4 columns, for this example) of items that should be in the resource grid (items form this grid are used as building blocks)
var resource_grid_contents = [
    [shapes[0], shapes[1],  shapes[2],  shapes[3], ],
    [shapes[4], shapes[5],  shapes[6],  shapes[7], ],
    [shapes[8], shapes[9], shapes[10], shapes[11], ],
]


// create a nested array (5 by 5, for this example) of items selected from the resource grid of items in the model (the grid that should be copied)
// spacing is here for overview 
var model_grid_contents = [
    [shapes[11],  shapes[6],       null,  shapes[3],       null, ],
    [      null,       null,  shapes[0],       null,  shapes[4], ],
    [      null,       null,       null,       null,       null, ],
    [      null, shapes[11],       null,       null,       null, ],
    [      null,  shapes[7],  shapes[7],  shapes[2], shapes[11], ],
]

const copying_task_1 = {
    type: jsPsychCopyingTask,
    model_grid_contents: model_grid_contents,
    resource_grid_contents: resource_grid_contents,
}
```
### A bit more advanced example

```javascript
// programmatically create a resource grid (3 by 3)  with randomized items
var n_rows = 3
var n_cols = 3

var resource_items = jsPsych.randomization.sampleWithoutReplacement(shapes, (n_rows*n_cols))

var resource_grid_contents = []
for (var r=0;r<n_rows;r++){    
    resource_grid_contents[r] = []
    for (var c=0; c<n_cols; c++){
        let item_num = r*n_cols + c 
        resource_grid_contents[r][c] = resource_items[item_num]
    }
}


// programmatically create a model grid (4 by 4)  with 6 items 
var n_rows = 4
var n_cols = 4
var n_model_items = 6

// Note: all model grid items should be in the resource grid, such that the model can be recreated,
// therefore I recommend sampling items from the resource grid (could be done WITH replacement)
var selected_model_items = jsPsych.randomization.sampleWithReplacement(resource_items, n_model_items)

// select unique (sample WITHOUT replacement) positions in the model grid to place the items in
var selected_model_grid_indices = jsPsych.randomization.sampleWithoutReplacement([...Array((n_rows*n_cols)).keys()], n_model_items)


var model_grid_contents = []

for (var r=0;r<n_rows;r++){    
    model_grid_contents[r] = []
    for (var c=0; c<n_cols; c++){
        let index = r*n_cols + c 
        if (selected_model_grid_indices.includes(index)) {
            model_grid_contents[r][c] = selected_model_items.pop()
        } else {
            model_grid_contents[r][c] = null
        }
    }
}

const copying_task_2 = {
    type: jsPsychCopyingTask,
    model_grid_contents: model_grid_contents,
    resource_grid_contents: resource_grid_contents,
}

timeline.push(copying_task_2)
```


### Using the provided stimuli
```javascript
// the plugin also contains 20 unique "nonsense" shapes adopted form Arnoult (1955) DOI:  https://doi.org/10.1037/h0047772
// the colors can be set by literal color names or rgb values
// an item should a a string formatted like this: "[shape number]--[color string]". For example "0--red" or "19--rgb(54,233,98)" 
// NOTE: the item_file_type parameter of the plugin should be set to 'svg_path'

// programmatically create a resource grid (4 by 4)  with randomized items
var n_rows = 2
var n_cols = 3
var n_resource_items = n_rows * n_cols

// 16 shapes
var selected_shape_numbers = jsPsych.randomization.sampleWithoutReplacement([...Array(20).keys()], n_resource_items)

// 12 colors
const colors = ['orange', 'red', 'blue', 'teal', 'pink', 'darkgreen', 'rgb(255, 255 ,0)',   'rgb(128, 128 ,128)',  'rgb(0, 255, 255)',  'rgb(0, 255, 0)',  'rgb(100, 255, 100)',]

var resource_items = []
var selected_colors = jsPsych.randomization.sampleWithoutReplacement(colors, n_resource_items)

for (var i=0; i<n_resource_items; i++){
    var item_string = selected_shape_numbers[i] + '--' + selected_colors[i]
    resource_items.push(item_string)
}

var resource_grid_contents = []
for (var r=0;r<n_rows;r++){    
    resource_grid_contents[r] = []
    for (var c=0; c<n_cols; c++){
        let item_num = r*n_cols + c 
        resource_grid_contents[r][c] = resource_items[item_num]
    }
}


// programmatically create a model grid ( by 53)  with 4 items 
var n_rows = 5
var n_cols = 3
var n_model_items = 4

// Note: all model grid items should be in the resource grid, such that the model can be recreated,
// therefore I recommend sampling items from the resource grid (could be done WITH replacement)
var selected_model_items = jsPsych.randomization.sampleWithReplacement(resource_items, n_model_items)

// select unique (sample WITHOUT replacement) positions in the model grid to place the items in
var selected_model_grid_indices = jsPsych.randomization.sampleWithoutReplacement([...Array((n_rows*n_cols)).keys()], n_model_items)

var model_grid_contents = []

for (var r=0;r<n_rows;r++){    
    model_grid_contents[r] = []
    for (var c=0; c<n_cols; c++){
        let index = r*n_cols + c 
        if (selected_model_grid_indices.includes(index)) {
            model_grid_contents[r][c] = selected_model_items.pop()
        } else {
            model_grid_contents[r][c] = null
        }
    }
}

// copying task with stimuli adapted from Arnoult (1955) (https://doi.org/10.1037/h0044049)
const copying_task_3 = {
    type: jsPsychCopyingTask,
    model_grid_contents: model_grid_contents,
    resource_grid_contents: resource_grid_contents,
    item_file_type:'svg_path'                       // NOTE THIS PARAMETER
}


timeline.push(copying_task_3);
```