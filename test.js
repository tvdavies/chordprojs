var ChordProParser = require(".").ChordProParser,
	SongRenderer = require(".").SongRenderer,
	request = require("request"),
	github = require("./lib/github"),
	pdf = require("html-pdf");

var parser = new ChordProParser();
var renderer = new SongRenderer();

// Read file from interweb

var url = "http://localhost:8080/need_you.txt";
// var url = "https://raw.githubusercontent.com/mattgraham/worship/master/10000%20Reasons.onsong";

request.get(url, (err, response, body) => {
	var song = parser.parse(body);
	var rendered = renderer.render(song, { transpose: 2 });
	console.log(rendered);
});

// Save a PDF
// pdf.create(rendered, {
// 	format: 'A4'
// }).toFile('./test.pdf');

// Get list of some files from GitHub
// githubl.getFilesInRepo("mattgraham", "worship", function (err, files) {
//     files.forEach(file => console.log(file));
// });