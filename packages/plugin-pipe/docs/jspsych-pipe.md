# jspsych-pipe plugin

This plugin facilitates communication with DataPipe (https://pipe.jspsych.org), a service that enables sending data directly to an OSF component. This plugin is under v0.1 to reflect that the API of DataPipe is still under development.

The plugin enables sending data collected by the experiment to DataPipe, which is then routed to an OSF component. This allows hosting an experiment without using a backend server, such as through a free service like [GitHub Pages](https://pages.github.com/). DataPipe also allows sending base64 encoded files (such as audio or video recordings), which are decoded into their original form before being sent to the OSF component. It also supports a simple balanced condition assignment, which allows for sequential assignment to conditions without the need for a backend server.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| ----------|------|---------------|------------ |
| experiment_id | string | undefined | The ID of the experiment. This ID is provided by pipe.jspsych.org. |
| action | string | undefined | The action to perform. Possible values are `save`, `saveBase64`, and `condition`. |
| filename | null | undefined | The filename to use when saving data. It should be unique. If the file already exists, no data will be saved. |
| data | string | null | The string of data to save. If action is `save` then this can be text data in any format (e.g., CSV, JSON, TXT, etc.). If `action` is `saveBase64`, then this should be a base64 encoded string and the `filename` should have the appropriate extension. | 


## Data Generated

In addition to the [default data collected by all plugins](../overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response | string | The response from the server. |

## Static Methods

The pipe plugin provides three static methods that can be used to save data to DataPipe without using a trial. These methods are `save`, `saveBase64Data`, and `getCondition`.

### save

```js
jsPsychPipe.save(experiment_id, filename, data)
```

### saveBase64Data

```js
jsPsychPipe.saveBase64Data(experiment_id, filename, data)
```

### getCondition

#### using async/await
```js
const condition = await jsPsychPipe.getCondition(experiment_id)
```

#### using promises
```js
jsPsychPipe.getCondition(experiment_id).then(condition => {
  // do something with the condition
})
```

## Examples

### Saving all of the data to a CSV file.

```javascript
// This ID is provided by pipe.jspsych.org.
const expID = "ABCDEF123456";

// Generate a random subject ID.
const subjectID = jsPsych.randomization.randomID(10);

const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: expID,
  filename: `${subjectID}.csv`,
  data: ()=>jsPsych.data.get().csv()
};
```

### Saving an audio response to a .webm file.

```javascript
// This ID is provided by pipe.jspsych.org.
const expID = "ABCDEF123456";

// Generate a random subject ID.
const subjectID = jsPsych.randomization.randomID(10);

var trial = {
  type: jsPsychHtmlAudioResponse,
  stimulus: `
      <p>Please record a few seconds of audio and click the button when you are done.</p>
  `,
  recording_duration: 15000,
  allow_playback: true,
  on_finish: function(data){
    const filename = `${subjectID}_${jsPsych.getProgress().current_trial_global}_audio.webm`;
    jsPsychPipe.saveBase64Data(expID,  filename, data.response);
    // optionally, delete the base64 data to save space. store the filename instead.
    data.response = filename;
  }
};
```

### Get the condition assignment for a subject.

```javascript
// This ID is provided by pipe.jspsych.org.
const expID = "ABCDEF123456";

// jsPsychPipe.getCondition returns a promise that resolves with the condition assignment,
// so we need to use async/await to wait for the promise to resolve before we have the condition assignment.
// We can then use the condition assignment to run the appropriate timeline.
// This requires that we wrap the code in an async function, and then call that function.
async function createExperiment(){
  const condition = await jsPsychPipe.getCondition(expID);

  const timeline_condition_1 = [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'Condition 1. Press any key to continue.',
    }
  ]

  const timeline_condition_2 = [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'Condition 2. Press any key to continue.',
    }
  ]

  if(condition==0){
    jsPsych.run([timeline_condition_1])
  } else {
    jsPsych.run([timeline_condition_2])
  }
}

createExperiment();
```
