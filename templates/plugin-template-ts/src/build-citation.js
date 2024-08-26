import "@citation-js/plugin-software-formats";

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "path";

import { Cite } from "@citation-js/core";

const srcDir = path.dirname(fileURLToPath(import.meta.url));
const indexFilePath = path.join(srcDir, "index.ts");

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
    const apaJson = JSON.stringify(
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

export { cffToJson, updateCitations };
