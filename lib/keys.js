// Detect the key, given a selection of chord root notes
var _ = require("lodash");

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
    var keys = _.flatten(chords.map(chord => {
        var note = getRootNote(chord);
        var chord = chord.substring(note.length);
        if ((chord.indexOf("m") === 0 && chord.indexOf("maj") !== 0) || chord.indexOf("min") === 0) {
            note = note + "m";
        }

        return getKeysContainingChord(note);
    }));

    return _.maxBy(_.map(_.countBy(keys), (val, key) => {return {key: key, count: val}}), "count").key;
}

module.exports = {
    findKey: findKey
};