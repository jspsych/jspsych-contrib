const fs = require("node:fs");
const path = require("path");
require("@citation-js/plugin-software-formats");
const { Cite } = require("@citation-js/core");

const srcDir = __dirname;
const indexFilePath = path.join(srcDir, "index.js");

const updateCitations = (indexFilePath, apaCitation, bibtexCitation) => {
  let fileContent = fs.readFileSync(indexFilePath, "utf-8");
  fileContent = fileContent.replace(/`{apaJson}`/g, apaCitation);
  fileContent = fileContent.replace(/`{bibtexJson}`/g, bibtexCitation);
  fs.writeFileSync(indexFilePath, fileContent, "utf-8");
};

function cffToJson() {
  const templateDir = path.dirname(srcDir);
  const cffFilePath = path.join(templateDir, "CITATION.cff");
  let cffCitation = fs.readFileSync(cffFilePath, "utf-8").toString();
  Cite.async(cffCitation).then((data) => {
    const apaJson = JSON.stringify(
      data.format("data", {
        format: "object",
        template: "citation-apa",
        lang: "en-US",
      }),
      null,
      2
    );
    const bibtexJson = JSON.stringify(
      data.format("data", {
        format: "object",
        template: "citation-bibtex",
        lang: "en-US",
      }),
      null,
      2
    );
    updateCitations(indexFilePath, apaJson, bibtexJson);
  });
}

module.exports = { cffToJson, updateCitations };
