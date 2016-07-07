var templates = require("./lib/templates"),
	mustache = require("mustache"),
	chordMagic = require("chord-magic");

function Song() {
	this.title = "";
	this.subtitle = "";
	this.album = "";
	this.author = "";
	this.copyright = "";
	this.key = "";
	this.tempo = "";
	this.time = "";
	this.keywords = "";
	this.sections = [];
}

Song.prototype.addSection = function (section) {
	this.sections.push(section);
};

function Section() {
	this.name = "";
	this.lines = [];
}

Section.prototype.addLine = function (line) {
	this.lines.push(line);
}

function Line() {
	this.lineSegments = [];
}

Line.prototype.addLineSegment = function (lineSegment) {
	this.lineSegments.push(lineSegment);
};

function LineSegment(chord, text) {
	this.chord = chord;
	this.text = text;
}

function ChordProParser() {}
ChordProParser.prototype.parse = (text) => {
	var commentPattern = /^\s*#.*/;
	var chordPattern = /\[([^\]]*)\]/;
	var directivePattern = /^{([\w]*):?(.*)?}/;
	var song = new Song();
	var section = new Section();
	var line = null;
	var chord = "";

	text.split("\n").forEach((lineText) => {
		if (lineText.trim() < 1) {
			// Start a new section
			song.addSection(section);
			section = new Section();
			return;
		}

		line = new Line();

		// Ignore any comments
		if (!lineText.match(commentPattern)) {

			// Command line
			var directive = lineText.match(directivePattern);
			if (directive) {
				var directiveName = directive[1];
				var directiveValue = directive[2];
				// Parse directive
				switch (directiveName) {
					case "title":
					case "subtitle":
					case "album":
					case "author":
					case "copyright":
					case "key":
					case "tempo":
					case "time":
					case "keywords":
						song[directiveName] = directiveValue;
						break;
				}
			} else {
				// Lyrics/chords
				lineText.split(chordPattern).forEach((word, i) => {
					if (i % 2 > 0) {
						chord = word;
					} else if (chord.length > 0 || word.length > 0) {
						line.addLineSegment(new LineSegment(chord, word));
						chord = "";
					}
				});
			}
		}

		section.addLine(line);
	});

	song.addSection(section);

	return song;
};

function SongRenderer() {}
SongRenderer.prototype.render = function (song, options) {
	if (!options) {
		options = {};
	}

	return mustache.render(templates.song, {
		song: song,
		formattedChord: function () {
			if (this.chord.length > 0) {
				var transpose = options.transpose || 0;
				var chord = chordMagic.parse(this.chord);

				if (transpose !== 0) {
					chord = chordMagic.transpose(chord, transpose);
				}

				return chordMagic.prettyPrint(chord).split("").map(value => {
					if (value === "#") {
						return '<span class="music-symbol" style="font-family: Arial Unicode MS, Lucida Sans Unicode;">♯</span>';
					} else if (value === "b") {
						return '<span class="music-symbol" style="font-family: Arial Unicode MS, Lucida Sans Unicode;">♭</span>';
					}

					return value;
				}).join("");
			}

			return "";
		},
		formattedText: function () {
			// If there are leading or trailing spaces, replace with &nbsp;
			// Check for leading spaces
			var leadingSpaceCount = this.text.search(/\S|$/);
			var trailingSpaceCount = this.text.length - (leadingSpaceCount + this.text.trim().length);
			var newText;
			var i;

			if (leadingSpaceCount > 0) {
				newText = "";
				for (i = 0; i < leadingSpaceCount; i++) {
					newText = newText + "&nbsp;";
				}
				newText = newText + this.text.trim();
			} else {
				newText = this.text.trim();
			}

			// Check for trailing spaces
			if (trailingSpaceCount > 0) {
				for (i = 0; i < trailingSpaceCount; i++) {
					newText = newText + "&nbsp;";
				}
			}

			return newText;
		}
	});
};

module.exports = {
	ChordProParser: ChordProParser,
	SongRenderer: SongRenderer
};