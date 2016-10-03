/*
 * ChordProJS - Parse and render ChordPro formatted songs.
 * Copyright (c) 2016 Tom Davies
 */

var Song = require('./lib/song');

/**
 * Parse a ChordPro formatted string and return the generated Song object.
 * @param  {string}		chordProStr		The ChordPro string to parse
 * @return {Song}
 */
module.exports = {
  parse: function (chordProStr) {
    var commentPattern = /^\s*#.*/;
    var chordPattern = /\[([^\]]*)\]/;
    var directivePattern = /^{([\w]*):?(.*)?}/;
    var sectionHeadPattern = /^([A-z0-9\s]+):(\s*)$/;
    var song = new Song();
    var section = song.createSection();
    var line = null;
    var chord = null;

    chordProStr.split("\n").forEach(function (lineText) {
      if (lineText.trim() < 1 && section.lines.length > 0) {
        // Start a new section
        song.addSection(section);
        section = song.createSection();
        return;
      }

      line = song.createLine();

      // Ignore any comments
      if (!lineText.match(commentPattern)) {
        // Command line
        var directive = lineText.match(directivePattern);
        var sectionHead = lineText.match(sectionHeadPattern);
        if (directive) {
          var directiveName = directive[1];
          var directiveValue = directive[2];
          // Parse directive
          switch (directiveName) {
            case 'title':
            case 'subtitle':
            case 'album':
            case 'author':
            case 'copyright':
            case 'key':
            case 'tempo':
            case 'time':
            case 'keywords':
              song[directiveName] = directiveValue;
              break;
          }
        } else if (sectionHead) {
          if (section.lines.length > 0) {
            // Start a new section
            song.addSection(section);
            section = song.createSection();
          }

          section.name = sectionHead[1];
        } else {
          // Lyrics/chords
          lineText.split(chordPattern).forEach(function (word, i) {
            if (i % 2 > 0) {
              if (word.length > 0) {
                chord = song.chords.createChord(word);
              } else {
                chord = null;
              }
            } else if (chord !== null || word.length > 0) {
              line.addLineSegment(song.createLineSegment(chord, word));
              chord = null;
            }
          });
        }
      }

      if (line.lineSegments.length > 0) {
        section.addLine(line);
      }
    });

    song.addSection(section);

    return song;
  }
};