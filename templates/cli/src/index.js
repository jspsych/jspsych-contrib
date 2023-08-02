import gulp from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import inquirer from "inquirer";

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

    const globalName = "jsPsych" + camelCaseName;

    const templatePath = `${answers.type}-template-${answers.language}`;

    const destPath = `${answers.type}-${answers.name}`;

    gulp
      .src(`templates/${templatePath}/**/*`)
      .pipe(
        rename((path) => {
          path.dirname = path.dirname.replace(templatePath, destPath);
        })
      )
      .pipe(gulp.dest(`packages/${destPath}`))
      .on("end", () => {
        // edit package.json
        gulp
          .src(`packages/${destPath}/package.json`)
          .pipe(replace("{name}", answers.name))
          .pipe(replace("{description}", answers.description))
          .pipe(replace("{author}", answers.author))
          .pipe(replace(/"private": "true",?\r?\n/g, ""))
          .pipe(gulp.dest(`packages/${destPath}`));

        // edit README.md
        gulp
          .src(`packages/${destPath}/README.md`)
          .pipe(replace("{name}", answers.name))
          .pipe(replace("{description}", answers.description))
          .pipe(replace("{author}", answers.author))
          .pipe(replace("{full-name}", destPath))
          .pipe(replace("{globalName}", globalName))
          .pipe(gulp.dest(`packages/${destPath}`));

        // if this is a typescript package, edit rollup config
        if (answers.language === "ts") {
          gulp
            .src(`packages/${destPath}/rollup.config.mjs`)
            .pipe(replace("{globalName}", globalName))
            .pipe(gulp.dest(`packages/${destPath}`));

          // if this is a plugin, edit the index.ts file
          if (answers.type === "plugin") {
            gulp
              .src(`packages/${destPath}/src/index.ts`)
              .pipe(replace("{plugin-name}", answers.name))
              .pipe(replace("{description}", answers.description))
              .pipe(replace("{author}", answers.author))
              .pipe(replace("PluginNamePlugin", `${camelCaseName}Plugin`))
              .pipe(
                replace(
                  "{documentation-url}",
                  `https://github.com/jspsych/jspsych-contrib/packages/${destPath}/README.md`
                )
              )
              .pipe(gulp.dest(`packages/${destPath}/src`));

            // and edit the index.spec.ts file
            gulp
              .src(`packages/${destPath}/src/index.spec.ts`)
              .pipe(replace("globalName", globalName))
              .pipe(gulp.dest(`packages/${destPath}/src`));
          }

          // if this is an extension, edit the index.ts file
          if (answers.type === "extension") {
            gulp
              .src(`packages/${destPath}/src/index.ts`)
              .pipe(replace("{extension-name}", answers.name))
              .pipe(replace("{description}", answers.description))
              .pipe(replace("{author}", answers.author))
              .pipe(replace("ExtensionNameExtension", `${camelCaseName}Extension`))
              .pipe(
                replace(
                  "{documentation-url}",
                  `https://github.com/jspsych/jspsych-contrib/packages/${destPath}/README.md`
                )
              )
              .pipe(gulp.dest(`packages/${destPath}/src`));

            // and edit the index.spec.ts file
            gulp
              .src(`packages/${destPath}/src/index.spec.ts`)
              .pipe(replace("globalName", globalName))
              .pipe(gulp.dest(`packages/${destPath}/src`));
          }
        }

        if (answers.language === "js") {
          // if this is a plugin, edit the index.js file
          if (answers.type === "plugin") {
            gulp
              .src(`packages/${destPath}/index.js`)
              .pipe(replace("{plugin-name}", answers.name))
              .pipe(replace("{description}", answers.description))
              .pipe(replace("{author}", answers.author))
              .pipe(replace("PluginNamePlugin", `${camelCaseName}Plugin`))
              .pipe(replace("globalName", globalName))
              .pipe(
                replace(
                  "{documentation-url}",
                  `https://github.com/jspsych/jspsych-contrib/packages/${destPath}/README.md`
                )
              )
              .pipe(gulp.dest(`packages/${destPath}`));
          }

          // if this is an extension, edit the index.js file
          if (answers.type === "extension") {
            gulp
              .src(`packages/${destPath}/index.js`)
              .pipe(replace("{extension-name}", answers.name))
              .pipe(replace("{description}", answers.description))
              .pipe(replace("{author}", answers.author))
              .pipe(replace("ExtensionNameExtension", `${camelCaseName}Extension`))
              .pipe(replace("globalName", globalName))
              .pipe(
                replace(
                  "{documentation-url}",
                  `https://github.com/jspsych/jspsych-contrib/packages/${destPath}/README.md`
                )
              )
              .pipe(gulp.dest(`packages/${destPath}`));
          }
        }
      });
  });
