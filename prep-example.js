const owbslib = require("./index");
const fs = require("fs");
const path = require("path");

(async function() {
    const code = await owbslib.generate();
    fs.writeFileSync(path.join(__dirname, "example", "owbs.js"), code);
})()
.catch((error) => {
    console.error("failed", error);
});
