import path from "node:path";
import { fileURLToPath } from "node:url";

import { deleteSync } from "del";
import gulp from "gulp";
import rename from "gulp-rename";
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
          name: "TypeScript",
          value: "ts",
        },
        {
          name: "JavaScript",
          value: "js",
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
  .then(async (answers) => {
    const camelCaseName =
      answers.name.charAt(0).toUpperCase() +
      answers.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    const globalName =
      "jsPsych" + (answers.type === "extension" ? "Extension" : "") + camelCaseName;

    const destPath = `${answers.type}-${answers.name}`;

    gulp.task("processTemplates", function () {
      return gulp
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
        .pipe(replace("_globalName_", globalName))
        .pipe(replace("{globalName}", globalName))
        .pipe(replace("{camelCaseName}", camelCaseName))
        .pipe(replace("PluginNamePlugin", `${camelCaseName}Plugin`))
        .pipe(replace("ExtensionNameExtension", `${camelCaseName}Extension`))
        .pipe(gulp.dest(`${repoRoot}/packages/${destPath}`));
    });
    gulp.task("renameDocsTemplate", function () {
      return gulp
        .src(`${repoRoot}/packages/${destPath}/docs/docs-template.md`)
        .pipe(rename(`jspsych-${answers.name}.md`))
        .pipe(gulp.dest(`${repoRoot}/packages/${destPath}/docs`))
        .on("end", function () {
          deleteSync(`${repoRoot}/packages/${destPath}/docs/docs-template.md`);
        });
    });

    gulp.series("processTemplates", "renameDocsTemplate")();
  });
