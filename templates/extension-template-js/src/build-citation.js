const fs = require("node:fs");
const path = require("path");
require("@citation-js/plugin-software-formats");
const { Cite } = require("@citation-js/core");

const srcDir = __dirname;
const indexFilePath = path.join(srcDir, "index.js");

const updateCitations = (indexFilePath, citationJson) => {
  let fileContent = fs.readFileSync(indexFilePath, "utf-8");
  fileContent = fileContent.replace(/`{citationJson}`/g, citationJson);
  fs.writeFileSync(indexFilePath, fileContent, "utf-8");
};

function cffToJson() {
  const templateDir = path.dirname(srcDir);
  const cffFilePath = path.join(templateDir, "CITATION.cff");
  let cffCitation = fs.readFileSync(cffFilePath, "utf-8").toString();
  Cite.async(cffCitation).then((data) => {
    const citationJson = JSON.stringify(
      data.format("data", {
        format: "object",
        lang: "en-US",
      }),
      null,
      2
    );
    updateCitations(indexFilePath, citationJson);
  });
}

module.exports = { cffToJson, updateCitations };
