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
    const globalName =
      "jsPsych" +
      (answers.type === "plugin" ? "Plugin" : "Extension") +
      answers.name.charAt(0).toUpperCase() +
      answers.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    /*
    gulp
      .src(`templates/${answers.type}-template-${answers.language}/`)
      .pipe(
        rename((path) => {
          path.dirname = path.dirname.replace("template-ts", answers.name);
        })
      )
      .pipe(gulp.dest(`packages/${answers.name}`))
      .on("end", () => {
        gulp
          .src(`packages/${answers.type}-${answers.name}/package.json`)
          .pipe(replace("{name}", answers.name))
          .pipe(replace("{description}", answers.description))
          .pipe(replace("{author}", answers.author))
          .pipe(replace("{globalName}", globalName))
          .pipe(gulp.dest(`packages/${answers.name}`));

        gulp
          .src(`packages/${answers.type}-${answers.name}/README.md`)
          .pipe(replace("{name}", answers.name))
          .pipe(replace("{description}", answers.description))
          .pipe(replace("{author}", answers.author))
          .pipe(replace("{globalName}", globalName))
          .pipe(gulp.dest(`packages/${answers.name}`));

        gulp
          .src(`packages/${answers.type}-${answers.name}/examples/index.html`)
          .pipe(replace("{globalName}", globalName))
          .pipe(gulp.dest(`packages/${answers.name}/examples/`));
      });
      */
  });
