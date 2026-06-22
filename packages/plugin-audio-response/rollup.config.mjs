import { makeRollupConfig } from "@jspsych/config/rollup";
import esbuild from "rollup-plugin-esbuild";

function onwarn(warning, warn) {
  if (warning.code === "INVALID_ANNOTATION" && warning.id?.includes("@huggingface/transformers")) return;
  if (warning.code === "CIRCULAR_DEPENDENCY" && warning.message?.includes("onnxruntime-common")) return;
  warn(warning);
}

const newConfig = makeRollupConfig("jsPsychPluginAudioResponse").map((config) => {
  const isBrowserBuild =
    config.output?.file?.endsWith(".browser.js") ||
    config.output?.file?.endsWith(".browser.min.js");

  let updatedConfig = isBrowserBuild ? { ...config, onwarn } : config;

  if (Array.isArray(updatedConfig.plugins) && updatedConfig.output?.file?.endsWith(".browser.min.js")) {
    const updatedPlugins = updatedConfig.plugins.map((plugin) => {
      if (plugin.name === "esbuild") {
        return esbuild({
          loaders: { ".json": "json" },
          minify: true,
          target: "es2020",
        });
      }
      return plugin;
    });
    updatedConfig = { ...updatedConfig, plugins: updatedPlugins };
  }

  return updatedConfig;
});

export default newConfig;
