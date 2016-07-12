/*
 * ChordProJS - Parse and render ChordPro formatted songs.
 * Copyright (c) 2016 Tom Davies
 *
 * chords.js
 * Module for processing chords in song, handling key detection and chord transposition.
 */

var _ = require('lodash'),
    chordMagic = require('chord-magic');

var notes = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
var sharps = ['A', 'B', 'D', 'E', 'G'];
var intervals = [
    { step: 2, minor: true },
    { step: 2, minor: true },
    { step: 1 },
    { step: 2 },
    { step: 2, minor: true },
    { step: 2 },
    { step: 1 }
];

function getSharpEquivalent(chordText) {
    return chordText.split("/").map(function (val) {
        if (val.indexOf('b') === 1) {
          var idx = notes.indexOf(val.substring(0, 2)) - 1;

          if (idx < 0) {
              idx = notes.length - 1;
          }

          return notes[idx] + '#' + val.substring(2);
        }

        return val;
    }).join("/");
}

function getTranspose(origKey, targetKey) {
    var origKeyIdx = notes.indexOf(origKey);
    var targetKeyIdx = notes.indexOf(targetKey);

    if (origKeyIdx > -1 && targetKeyIdx > -1) {
        return targetKeyIdx - origKeyIdx;
    }

    return 0;
}

function getNoteInterval(note, interval) {
    var i = notes.indexOf(note) + interval;

    if (i >= notes.length) {
        i = i - notes.length;
    }

    return notes[i];
}

function getScale(note, minor) {
    var intervals = minor ? intervalsMinor : intervalsMajor;
    var scale = [note];
    var prevNote = note;

    intervals.forEach(function (interval) {
        prevNote = getNoteInterval(prevNote, interval.step);
        scale.push(prevNote);
    });

    return scale;
}

function getKeysContainingChord(chord) {
    var keys = [];

    notes.forEach(function (key) {
        var note = key;
        // For each key, go over each chord and check for match
        intervals.forEach(function (interval) {
            note = getNoteInterval(note, interval.step);
            var noteChord = note + (interval.minor ? 'm' : '');
            if (chord === noteChord) {
                // Add this key to keys
                keys.push(key);
                return;
            }
        });
    });

    return keys;
}

function getRootNote(chord) {
    var note = chord.charAt(0);
    var intonation = chord.charAt(1);

    if (intonation === '#') {
        intonation = 'b';
        note = getNoteInterval(note, 2);
    } else if (intonation !== 'b') {
        intonation = '';
    }

    return note + intonation;
}

function findKey(chords) {
    var keys = _.countBy(_.flatten(chords.map(function (chord) {
        var note = getRootNote(chord);
        var chord = chord.substring(note.length);
        if ((chord.indexOf('m') === 0 && chord.indexOf('maj') !== 0) || chord.indexOf('min') === 0) {
            note = note + 'm';
        }

        return getKeysContainingChord(note);
    })));

    // Return the most likely (most frequent) key for the chords passed in.
    return _.maxBy(_.map(keys, function (val, key) {
        return {key: key, count: val};
    }), 'count').key;
}

function Chord(chordText, transposeProperties) {
    this.transposeProperties = transposeProperties;
    this.chordMagicked = chordMagic.parse(chordText);
}

Chord.prototype.getText = function () {
    var chord = this.chordMagicked;
    var transpose = this.transposeProperties.transpose;

    if (this.transposeProperties.targetKey !== null) {
        // Work out transpose from original key
        transpose = getTranspose(this.transposeProperties.origKey, this.transposeProperties.targetKey);
    } else {
        // Get the target key from the transpose
        this.transposeProperties.targetKey = chordMagic.prettyPrint(chordMagic.transpose(chordMagic.parse(this.transposeProperties.origKey), transpose));
    }

    if (transpose !== 0) {
        chord = chordMagic.transpose(this.chordMagicked, transpose);
    }

    var chordText = chordMagic.prettyPrint(chord);

    if (chordText.length > 1 && chordText.indexOf('b') > -1 && sharps.indexOf(this.transposeProperties.targetKey) > -1) {
        chordText = getSharpEquivalent(chordText);
    }

    return chordText;
};

Chord.prototype.getOrigText = function () {
    return chordMagic.prettyPrint(this.chordMagicked);
};

function Chords() {
    this.chords = [];
    this.transposeProperties = {
        origKey: '',
        targetKey: null,
        transpose: 0
    };
}

Chords.prototype.getOrigKey = function () {
    return this.transposeProperties.origKey;
};

Chords.prototype.getTargetKey = function () {
    return this.transposeProperties.targetKey;
};

Chords.prototype.setTargetKey = function (targetKey) {
    targetKey = chordMagic.parse(targetKey).root;
    if (notes.indexOf(targetKey) > -1) {
        this.transposeProperties.targetKey = targetKey;
    }
};

Chords.prototype.setTranspose = function (transpose) {
    this.transposeProperties.transpose = transpose;
    this.transposeProperties.targetKey = null;
};

Chords.prototype.createChord = function (chordText) {
    var chord = new Chord(chordText, this.transposeProperties);
    this.chords.push(chord);
    // Detect key
    this.transposeProperties.origKey = findKey(this.chords.map(function (chord) {
        return chord.getOrigText();
    }));
    return chord;
};

module.exports = Chords;
