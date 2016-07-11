var _ = require("lodash"),
    chordMagic = require("chord-magic");

var notes = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
var intervals = [
    { step: 2, minor: true },
    { step: 2, minor: true },
    { step: 1 },
    { step: 2 },
    { step: 2, minor: true },
    { step: 2 },
    { step: 1 }
];

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
    }

    if (transpose !== 0) {
        chord = chordMagic.transpose(this.chordMagicked, transpose);
    }

    return chordMagic.prettyPrint(chord);
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
    this.transposeProperties.origKey = findKey(this.chords.map(chord => chord.getOrigText()));
    return chord;
};

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

    intervals.forEach(interval => {
        prevNote = getNoteInterval(prevNote, interval.step);
        scale.push(prevNote);
    });

    return scale;
}

function getKeysContainingChord(chord) {
    var keys = [];

    notes.forEach(key => {
        var note = key;
        // For each key, go over each chord and check for match
        intervals.forEach(interval => {
            note = getNoteInterval(note, interval.step);
            var noteChord = note + (interval.minor ? "m" : "");
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

    if (intonation === "#") {
        intonation = "b";
        note = getNoteInterval(note, 2);
    } else if (intonation !== "b") {
        intonation = "";
    }

    return note + intonation;
}

function findKey(chords) {
    var keys = _.countBy(_.flatten(chords.map(chord => {
        var note = getRootNote(chord);
        var chord = chord.substring(note.length);
        if ((chord.indexOf("m") === 0 && chord.indexOf("maj") !== 0) || chord.indexOf("min") === 0) {
            note = note + "m";
        }

        return getKeysContainingChord(note);
    })));

    // Return the most likely (most frequent) key for the chords passed in.
    return _.maxBy(_.map(keys, (val, key) => {return {key: key, count: val}}), "count").key;
}

module.exports = {
    Chords: Chords
};