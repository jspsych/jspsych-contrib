# extension-tts

this extension enables jsPsych trials to have be spoken via Web Speech API's SpeechSynteSynthesis interfaces.

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`

```js
initJsPsych({
  extensions: [
    {type: jsPsychExtensionTts, params: {...}}
  ]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
          |      |               |

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: jsPsych...,
  extensions: [
    {type: jsPsychExtensionTts, params: {...}}
  ]
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
          |      |               |

## Data Generated

Name | Type | Value
-----|------|------
     |      |

## Functions

If the extension adds any static functions, list them here.

### function()

