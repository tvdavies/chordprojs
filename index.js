var chordMagic = require("chord-magic");

var ChordPhrase = function () {};
ChordPhrase.prototype = {

};

var ChordPro = function () {};
ChordPro.prototype = {

};

var ChordProParser = function () {};
ChordProParser.prototype = {
	parse: function (text) {
		var chordPattern = /\[([^\]]*)\]/;
		var commandPattern = /^{.*}/;
		var chords, lyrics, chordLength, dash;

		if (!text) {
			return;
		}

		text.split("\n").forEach(function (line, i) {
			// Ignore any comments
			if (line.match(/^#/)) {
				return;
			}

			// Command line
			if (line.match(commandPattern)) {
				// Parse command
			} else {
				// Lyrics/chords
				line.split(chordPattern).forEach(function (word, i) {
					// The chord(s) will always come first
					// Create the block of lyrics with chords

				});
			}

		})
	}
};

module.exports = {
	ChordPro: ChordPro,
	ChordProParser: ChordProParser
};