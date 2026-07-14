import { makeRollupConfig } from "@jspsych/config/rollup";

// Step 2: Generate the base configuration
const baseConfig = makeRollupConfig("jsPsychSpeechRecognition");

// Step 3: Modify the base configuration to use `output.dir` instead of `output.file`
// Check if the base configuration has an `output` property and it's an array
if (Array.isArray(baseConfig.output)) {
  baseConfig.output = baseConfig.output.map((output) => ({
    ...output,
    // Remove `file` property if exists
    file: undefined,
    // Add or overwrite `dir` property
    dir: "./dir",
  }));
} else if (typeof baseConfig.output === "object") {
  // If `output` is a single object, modify it directly
  baseConfig.output.file = undefined; // Remove `file` property
  baseConfig.output.dir = "desired/output/directory"; // Set `dir` property
}

// Step 4: Export the modified configuration
export default baseConfig;
