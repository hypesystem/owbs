const terser = require("terser");
const fs = require("fs");
const path = require("path");

module.exports = {
    generate: async () => {
        const code = fs.readFileSync(path.join(__dirname, "owbs.js"), "utf8");
        const result = await terser.minify(code);
        return result.code;
    },
};
