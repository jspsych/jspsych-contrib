# headphone-check

## Overview

Allows for one to check if a participant is wearing headphones using an auditory task. In the default configuration, participants listen to 6 audio samples with 3 tones each, and asked for which is the quietest. Upon meeting a threshold (at least 5), we can accurately conclude that the participant is wearing headphones, as per the findings in the [paper describing the original HeadphoneCheck](http://mcdermottlab.mit.edu/papers/Woods_etal_2017_headphone_screening.pdf). The default configuration is also meant to work immediately with the original sounds and no further setup.

## Loading

### In browser

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-headphone-check@1.0.0"></script>
```

### Via NPM

```
npm install @jspsych-contrib/plugin-headphone-check
```

```js
import jsPsychHeadphoneCheck from '@jspsych-contrib/plugin-headphone-check';
```

## Compatibility

jsPsych 8.0.0

## Documentation

See [documentation](https://github.com/jspsych/jspsych-contrib/blob/main/packages/plugin-headphone-check/docs/jspsych-headphone-check.md)

## Author / Citation

jadeddelta, adapted from the original [HeadphoneCheck](https://github.com/mcdermottLab/HeadphoneCheck) repository. The paper is:

[Woods KJP, Siegel MH, Traer J & McDermott JH (2017) Headphone screening to facilitate web-based auditory experiments. Attention, Perception & Psychophysics.](http://mcdermottlab.mit.edu/papers/Woods_etal_2017_headphone_screening.pdf)
