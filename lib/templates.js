var fs = require("fs");

var templatesDir = "templates";
var templates = {};

fs.readdirSync(templatesDir).forEach((file) => {
	templates[file] = fs.readFileSync(templatesDir + "/" + file, "utf8");
});

module.exports = templates;