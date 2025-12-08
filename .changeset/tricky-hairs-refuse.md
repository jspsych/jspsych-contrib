---
"@jspsych-contrib/plugin-image-hotspots": minor
"@jspsych-contrib/plugin-video-hotspots": minor
---

Adds an optional `prompt` parameter to the `image-hotspots` and `video-hotspots` plugins, which is an HTML-formatted string displayed below the stimulus. This can be used to remind participants how to respond. By default, the `video-hotspots` plugin will display the prompt after the video ends, but this can be changed by setting the `show_prompt_on_video_end` parameter to `false`.