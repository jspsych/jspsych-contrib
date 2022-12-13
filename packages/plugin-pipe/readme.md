# pipe plugin

## Overview

This plugin facilitates communication with DataPipe (https://pipe.jspsych.org), a service that enables sending data directly to an OSF component. This plugin is under v0.1 to reflect that the API of DataPipe is still under development.

The plugin enables sending data collected by the experiment to DataPipe, which is then routed to an OSF component. This allows hosting an experiment without using a backend server, such as through a free service like [GitHub Pages](https://pages.github.com/). DataPipe also allows sending base64 encoded files (such as audio or video recordings), which are decoded into their original form before being sent to the OSF component. It also supports a simple balanced condition assignment, which allows for sequential assignment to conditions without the need for a backend server.

## Loading

### In browser

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-pipe@0.1">
```

### Via NPM

```
npm install @jspsych-contrib/plugin-pipe
```

```js
import jsPsychPipe from '@jspsych-contrib/plugin-pipe';
```

## Compatibility

jsPsych v7.0.

## Documentation

See [documentation](docs/jspsych-pipe.md)

## Author / Citation

This plugin was developed by [Josh de Leeuw](https://github.com/jodeleeuw). 