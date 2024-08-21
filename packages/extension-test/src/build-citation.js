import { exec } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "path";

const srcDir = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.dirname(srcDir);
const cffFilePath = path.join(templateDir, "CITATION.cff");
const indexFilePath = path.join(srcDir, "index.js");

const apaCommand = `cffconvert --input ${cffFilePath} --outputformat apa`;
const bibtexCommand = `cffconvert --input ${cffFilePath} --outputformat bibtex`;

const updateCitations = (indexFilePath, apaCitation, bibtexCitation) => {
  let fileContent = fs.readFileSync(indexFilePath, "utf-8");
  fileContent = fileContent.replace(/`{apaCitation}`/g, apaCitation);
  fileContent = fileContent.replace(/`{bibtexCitation}`/g, bibtexCitation);
  fs.writeFileSync(indexFilePath, fileContent, "utf-8");
};

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout.trim);
    });
  });
};

Promise.all([runCommand(apaCommand), runCommand(bibtexCommand)])
  .then(([apaResult, bibtexResult]) => {
    console.log(`APA Citation:\n${apaResult}`);
    console.log(`BibTeX Citation:\n${bibtexResult}`);
    updateCitations(indexFilePath, apaResult, bibtexResult);
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
  });
