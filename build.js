#!node

const owbslib = require("./index");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const argv = require("yargs").argv;

(async function() {
    const code = await owbslib.generate();
    const outputPath = argv.output || "dist/owbs.min.js";
    const outputFolder = path.dirname(outputPath);
    await mkdirp(outputFolder);
    fs.writeFileSync(outputPath, code);
})()
.catch((error) => {
    console.error("failed", error);
});
