/**
 * This script updates the root README.md file with the list of all packages when a new one is
 * published, or when the description/author of an existing package is updated.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

import { dest, series, src } from "gulp";
import replace from "gulp-replace";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagesDir = path.join(__dirname, "packages");
const readmePath = path.join(__dirname, "README.md");

function getPackageInfo(packageDir) {
  const packageJsonPath = path.join(packageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) return null;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return {
    name: packageJson.name,
    description: packageJson.description,
    author: packageJson.author.name,
    authorUrl: packageJson.author.url,
  };
}

function updateRootReadme() {
  const packageInfos = fs
    .readdirSync(packagesDir)
    .map((dir) => path.join(packagesDir, dir))
    .filter((dir) => fs.lstatSync(dir).isDirectory())
    .map(getPackageInfo)
    .filter((info) => info !== null);

  const pluginListHead = `
  ### Plugins\n
  Plugin | Contributor | Description
  ----------- | ----------- | -----------\n`;

  const extensionListHead = `
  \n### Extensions\n
   Extension | Contributor | Description
  ----------- | ----------- | -----------\n`;

  const guidelinesHead = "## Guidelines for contributions\n";

  let pluginList = "";
  let extensionList = "";

  packageInfos.map((info) => {
    const packageReadmeLink = `https://github.com/jspsych/jspsych-contrib/blob/main/packages/${info.name}/README.md`;
    if (info.name.match(/^\@jspsych-contrib\/plugin-/g)) {
      const pluginName = info.name.replace(/^\@jspsych-contrib\/plugin-/g, "");
      const authorRender =
        info.authorUrl != "" ? `[${info.author}](${info.authorUrl})` : info.author;
      pluginList = pluginList.concat(
        `[${pluginName}](${packageReadmeLink}) | ${authorRender} | ${
          info.description ? info.description : "foo"
        } \n`
      );
    } else {
      extensionList = extensionList.concat(
        `[${info.name.replace(/^\@jspsych-contrib\/extension-/g, "")}](${packageReadmeLink}) | [${
          info.author
        }](${info.authorUrl}) | ${info.description ? info.description : "foo"} \n`
      );
    }
  });

  const pluginTable = [pluginListHead, pluginList, extensionListHead];
  const extensionTable = [extensionListHead, extensionList, guidelinesHead];

  function generatePluginTable() {
    return src(`${__dirname}/README.md`)
      .pipe(replace(/### Plugins[\s\S]*?### Extensions/g, pluginTable.join("")))
      .pipe(dest(__dirname));
  }

  function generateExtensionTable() {
    return src(`${__dirname}/README.md`)
      .pipe(
        replace(/### Extensions[\s\S]*?## Guidelines for contributions/g, extensionTable.join(""))
      )
      .pipe(dest(__dirname));
  }
  series(generatePluginTable, generateExtensionTable)();
}

export { updateRootReadme };
