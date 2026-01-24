# plugin-free-recall-response

A plugin for collecting free recall responses one word at a time with mobile-friendly UI

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|                     |                  |                    |                                          |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|           |         |                                          |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-free-recall-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-free-recall-response.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-free-recall-response
```

```js
import FreeRecallResponse from "@jspsych-contrib/plugin-free-recall-response";
```


## Examples

### Title of Example

```javascript
var trial = {
  type: jsPsychFreeRecallResponse
}
```
