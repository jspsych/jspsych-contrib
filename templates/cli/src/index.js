import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { input, select } from "@inquirer/prompts";
import { deleteSync } from "del";
import { dest, series, src } from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import slash from "slash";

const repoRoot = slash(path.resolve(fileURLToPath(import.meta.url), "../../../.."));

function formatName(input) {
  return input
    .trim()
    .replace(/[\s_]+/g, "-") // Replace all spaces and underscores with hyphens
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Replace camelCase with hyphens
    .replace(/[^\w-]/g, "") // Remove all non-word characters
    .toLowerCase();
}

async function runPrompts() {
  const type = await select({
    message: "What do you want to create?",
    choices: [
      {
        name: "Plugin",
        value: "plugin",
        description:
          "A jsPsych plugin is usually a widget that handles particular displays, like displaying an image and recording a keyboard response, or displaying particular kinds of stimuli.",
      },
      {
        name: "Extension",
        value: "extension",
        description:
          "A jsPsych extension is a module that can interface with any plugin to extend its functionality. For instance, an eye tracking extension allows a plugin to gather gaze data and add it to the plugin's data object.",
      },
    ],
    loop: false,
  });

  const language = await select({
    message: "What language do you want to use?",
    choices: [
      {
        name: "JavaScript",
        value: "js",
      },
      {
        name: "TypeScript",
        value: "ts",
      },
    ],
    loop: false,
  });

  const name = await input({
    message: `What do you want to call this ${type == "plugin" ? "plugin" : "extension"} package?`,
    required: true,
    transformer: (input) => {
      // convert to hyphen case
      return formatName(input);
    },
    validate: (input) => {
      const fullDestPath = `${repoRoot}/packages/${type}-${formatName(input)}`;
      if (fs.existsSync(fullDestPath)) {
        return `A ${
          type == "plugin" ? "plugin" : "extension"
        } package with this name already exists. Please choose a different name.`;
      } else {
        return true;
      }
    },
  });

  const description = await input({
    message: `Enter a brief description of the ${
      type == "plugin" ? "plugin" : "extension"
    } package.`,
    required: true,
  });

  const author = await input({
    message: `Who is the author of this ${type == "plugin" ? "plugin" : "extension"} package?`,
    required: true,
  });

  return {
    type: type,
    language: language,
    name: name,
    description: description,
    author: author,
  };
}

async function processAnswers(answers) {
  answers.name = formatName(answers.name);
  const camelCaseName =
    answers.name.charAt(0).toUpperCase() +
    answers.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  const globalName = "jsPsych" + (answers.type === "extension" ? "Extension" : "") + camelCaseName;

  const destPath = `${answers.type}-${answers.name}`;

  function processTemplate() {
    return src(`${repoRoot}/templates/${answers.type}-template-${answers.language}/**/*`)
      .pipe(replace("{name}", answers.name))
      .pipe(replace("{full-name}", destPath))
      .pipe(replace("{author}", answers.author))
      .pipe(
        replace(
          "{documentation-url}",
          `https://github.com/jspsych/jspsych-contrib/packages/${destPath}/README.md`
        )
      )
      .pipe(replace("{description}", answers.description))
      .pipe(replace("_globalName_", globalName))
      .pipe(replace("{globalName}", globalName))
      .pipe(replace("{camelCaseName}", camelCaseName))
      .pipe(replace("PluginNamePlugin", `${camelCaseName}Plugin`))
      .pipe(replace("ExtensionNameExtension", `${camelCaseName}Extension`))
      .pipe(dest(`${repoRoot}/packages/${destPath}`));
  }

  function renameExampleTemplate() {
    return src(`${repoRoot}/packages/${destPath}/examples/index.html`)
      .pipe(replace("{name}", answers.name))
      .pipe(replace("{globalName}", globalName))
      .pipe(dest(`${repoRoot}/packages/${destPath}/examples`));
  }

  function renameDocsTemplate() {
    return src(`${repoRoot}/packages/${destPath}/docs/docs-template.md`)
      .pipe(rename(`${answers.name}.md`))
      .pipe(dest(`${repoRoot}/packages/${destPath}/docs`))
      .on("end", function () {
        deleteSync(`${repoRoot}/packages/${destPath}/docs/docs-template.md`);
      });
  }

  series(processTemplate, renameExampleTemplate, renameDocsTemplate)();
}

const answers = await runPrompts();
await processAnswers(answers);
