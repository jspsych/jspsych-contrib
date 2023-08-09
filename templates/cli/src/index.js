import path from "node:path";
import { fileURLToPath } from "node:url";

import gulp from "gulp";
import replace from "gulp-replace";
import inquirer from "inquirer";
import slash from "slash";

const repoRoot = slash(path.resolve(fileURLToPath(import.meta.url), "../../../.."));

inquirer
  .prompt([
    {
      type: "list",
      name: "type",
      message: "What do you want to create?",
      choices: [
        {
          name: "Plugin",
          value: "plugin",
        },
        {
          name: "Extension",
          value: "extension",
        },
      ],
    },
    {
      type: "list",
      name: "language",
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
    },
    {
      type: "input",
      name: "name",
      message: "What do you want to call this package?",
      filter: (input) => {
        // convert to hyphen case
        return input
          .trim()
          .replace(/[\s_]+/g, "-") // Replace all spaces and underscores with hyphens
          .replace(/([a-z])([A-Z])/g, "$1-$2") // Replace camelCase with hyphens
          .replace(/[^\w-]/g, "") // Remove all non-word characters
          .toLowerCase();
      },
    },
    {
      type: "input",
      name: "description",
      message: "Enter a brief description of the package",
    },
    {
      type: "input",
      name: "author",
      message: "Who is the author of this package?",
    },
  ])
  .then((answers) => {
    const camelCaseName =
      answers.name.charAt(0).toUpperCase() +
      answers.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    const destPath = `${answers.type}-${answers.name}`;

    gulp
      .src(`${repoRoot}/templates/${answers.type}-template-${answers.language}/**/*`)
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
      .pipe(replace("_globalName_", "jsPsych" + camelCaseName))
      .pipe(replace(/"private": "true",?\r?\n/g, ""))
      .pipe(replace("PluginNamePlugin", `${camelCaseName}Plugin`))
      .pipe(replace("ExtensionNameExtension", `${camelCaseName}Extension`))
      .pipe(gulp.dest(`${repoRoot}/packages/${destPath}`));
  });
