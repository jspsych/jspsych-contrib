# jspsych-pipe plugin

This plugin facilitates communication with DataPipe (https://pipe.jspsych.org), a service that enables sending data directly to an OSF component. This plugin is under v0.x to reflect that the API of DataPipe is still under development.

The plugin enables sending data collected by the experiment to DataPipe, which is then routed to an OSF component. This allows hosting an experiment without using a backend server, such as through a free service like [GitHub Pages](https://pages.github.com/). DataPipe also allows sending base64 encoded files (such as audio or video recordings), which are decoded into their original form before being sent to the OSF component. It also supports a simple balanced condition assignment, which allows for sequential assignment to conditions without the need for a backend server.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter | Type | Default Value | Description |
| ----------|------|---------------|------------ |
| experiment_id | string | undefined | The ID of the experiment. This ID is provided by pipe.jspsych.org. |
| action | string | undefined | The action to perform. Possible values are `save`, `saveBase64`, and `condition`. |
| filename | null | undefined | The filename to use when saving data. It should be unique. If the file already exists, no data will be saved. |
| data_string | string | null | The string of data to save. If action is `save` then this can be text data in any format (e.g., CSV, JSON, TXT, etc.). If `action` is `saveBase64`, then this should be a base64 encoded string and the `filename` should have the appropriate extension. |
| wait_message | HTML_string | `<p>Saving data. Please do not close this page.</p>` | An HTML message to be displayed above the loading graphics in the experiment during data upload. |
| compression | boolean | `true` | Whether to gzip-compress the request body before sending. See the [Compression](#compression) section below for details. |


## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
| response | JSON | The response from the server. |
| success | boolean | If the response was successful or not. |

## Static Methods

The pipe plugin provides three static methods that can be used to save data to DataPipe without using a trial. These methods are `save`, `saveBase64Data`, and `getCondition`.

### save

```js
jsPsychPipe.save(experiment_id, filename, data)
```

The `save` method accepts an optional fourth boolean argument to control compression:

```js
jsPsychPipe.save(experiment_id, filename, data, true)  // compressed (default)
jsPsychPipe.save(experiment_id, filename, data, false) // uncompressed
```

### saveBase64Data

```js
jsPsychPipe.saveBase64Data(experiment_id, filename, data)
```

Like `save`, an optional fourth boolean argument controls compression:

```js
jsPsychPipe.saveBase64Data(experiment_id, filename, data, true)  // compressed (default)
jsPsychPipe.saveBase64Data(experiment_id, filename, data, false) // uncompressed
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

## Compression

By default, the plugin compresses request bodies using gzip before sending them to DataPipe. This is primarily useful for large datasets because DataPipe has a 32 MB limit on incoming request size. Text-based data (JSON, CSV) typically compresses by 2-10x or more, effectively raising the upload limit to 60-300+ MB for most experiment data.

Compression uses the browser's built-in [`CompressionStream`](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream) API. If the browser does not support this API, data will be sent uncompressed and a warning will be logged to the console. No action is needed from the researcher in this case; the upload will still work as long as the uncompressed data is under 32 MB.

### Browser compatibility

`CompressionStream` is supported in:

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 80 |
| Edge | 80 |
| Firefox | 113 |
| Safari | 16.4 |
| Opera | 67 |
| Chrome Android | 80 |
| Safari iOS | 16.4 |

Unsupported browsers include Internet Explorer and older versions of the browsers listed above. In these browsers the plugin will fall back to sending uncompressed data.

### Disabling compression

Compression can be disabled by setting the `compression` parameter to `false`:

```javascript
const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: expID,
  filename: `${participantID}.csv`,
  data_string: ()=>jsPsych.data.get().csv(),
  compression: false,
};
```

Or when using the static methods:

```javascript
jsPsychPipe.save(expID, filename, data, false);
```

## Examples

### Saving all of the data to a CSV file.

```javascript
// This ID is provided by pipe.jspsych.org.
const expID = "ABCDEF123456";

// Generate a random participant ID.
const participantID = jsPsych.randomization.randomID(10);

const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: expID,
  filename: `${participantID}.csv`,
  data_string: ()=>jsPsych.data.get().csv()
};
```

### Saving an audio response to a .webm file.

```javascript
// This ID is provided by pipe.jspsych.org.
const expID = "ABCDEF123456";

// Generate a random participant ID.
const participantID = jsPsych.randomization.randomID(10);

var trial = {
  type: jsPsychHtmlAudioResponse,
  stimulus: `
      <p>Please record a few seconds of audio and click the button when you are done.</p>
  `,
  recording_duration: 15000,
  allow_playback: true,
  on_finish: function(data){
    const filename = `${participantID}_${jsPsych.getProgress().current_trial_global}_audio.webm`;
    jsPsychPipe.saveBase64Data(expID,  filename, data.response);
    // optionally, delete the base64 data to save space. store the filename instead.
    data.response = filename;
  }
};
```

### Get the condition assignment for a participant.

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
