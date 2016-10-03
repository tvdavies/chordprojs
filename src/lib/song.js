/*
 * ChordProJS - Parse and render ChordPro formatted songs.
 * Copyright (c) 2016 Tom Davies
 *
 * song.js
 * Classes for Song, Section, Line, and LineSegment - the data structures for the parsed song.
 */

var Chords = require('./chords'),
	_ = require('lodash'),
	mustache = require('mustache');

function Section() {
	this.name = "";
	this.lines = [];
}

Section.prototype.addLine = function (line) {
	this.lines.push(line);
};

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

function Song() {
	this.title = '';
	this.subtitle = '';
	this.album = '';
	this.author = '';
	this.copyright = '';
	this.key = '';
	this.tempo = '';
	this.time = '';
	this.keywords = '';
	this.sections = [];
	this.chords = new Chords();
}

Song.prototype.addSection = function (section) {
	this.sections.push(section);
};

Song.prototype.createSection = function () {
	return new Section();
};

Song.prototype.createLine = function () {
	return new Line();
};

Song.prototype.createLineSegment = function (chord, text) {
	return new LineSegment(chord, text);
};

Song.prototype.render = function (songTemplate, transpose) {
	// Is songTemplate a template, or is it a transpose property?
	if (_.isUndefined(transpose) && !_.isUndefined(songTemplate) && ((_.isString(songTemplate) && songTemplate.length < 3) || _.isNumber(songTemplate))) {
		transpose = songTemplate;
		songTemplate = null;
	}

	var song = this;
	songTemplate = songTemplate || '{{#song}}\n' +
		'<div class="song">\n' +
		'<div class="song-heading">' +
		'<h1 class="song-title">{{title}}</h1>\n' +
		'<h3 class="song-subtitle">({{subtitle}})</h3>\n' +
		'</div>' +
		'{{#sections}}\n' +
		'<div class="song-section">\n' +
		'<h3 class="song-section-name">{{name}}</h3>\n' +
		'{{#lines}}\n' +
		'<table class="song-line" cellspacing="0" cellpadding="0">\n' +
		'<tr class="song-chords">\n' +
		'{{#lineSegments}}\n' +
		'<td>{{{formattedChord}}}</td>\n' +
		'{{/lineSegments}}\n' +
		'</tr>\n' +
		'<tr class="song-text">\n' +
		'{{#lineSegments}}\n' +
		'<td><span class="song-text-segment">{{{formattedText}}}</span></td>\n' +
		'{{/lineSegments}}\n' +
		'</tr>\n' +
		'</table>\n' +
		'{{/lines}}\n' +
		'</div>\n' +
		'{{/sections}}\n' +
		'</div>' +
		'{{/song}}';

	if (_.isNumber(transpose)) {
		song.chords.setTranspose(transpose);
	} else if (_.isString(transpose)) {
		song.chords.setTargetKey(transpose);
	}

	return mustache.render(songTemplate, {
		song: song,
		formattedChord: function () {
			if (this.chord !== null) {
				return this.chord.getText().split('').map(function (value) {
					if (value === '#') {
						return '<span class="music-symbol" style="font-family: Arial Unicode MS, Lucida Sans Unicode;">♯</span>';
					} else if (value === "b") {
						return '<span class="music-symbol" style="font-family: Arial Unicode MS, Lucida Sans Unicode;">♭</span>';
					}

					return value;
				}).join('') + '&nbsp;';
			}

			return '';
		},
		formattedText: function () {
			// If there are leading or trailing spaces, replace with &nbsp;
			// Check for leading spaces
			var leadingSpaceCount = this.text.search(/\S|$/);
			var trailingSpaceCount = this.text.length - (leadingSpaceCount + this.text.trim().length);
			var newText;
			var i;

			if (leadingSpaceCount > 0) {
				newText = '';
				for (i = 0; i < leadingSpaceCount; i++) {
					newText = newText + '&nbsp;';
				}
				newText = newText + this.text.trim();
			} else {
				newText = this.text.trim();
			}

			// Check for trailing spaces
			if (trailingSpaceCount > 0) {
				for (i = 0; i < trailingSpaceCount; i++) {
					newText = newText + '&nbsp;';
				}
			}

			return newText;
		}
	});
};

module.exports = Song;