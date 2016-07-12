var chai = require('chai'),
	chordprojs = require('../');

var expect = chai.expect;

describe('Parse Directives', () => {

	it('{title:Song Title} should set song.title property to \'Song Title\'', () => {
		var song = chordprojs.parse('{title:Song Title}');
		expect(song.title).to.equal('Song Title');
	});

	it('{subtitle:Song Subtitle} should set song.subtitle property to \'Song Subtitle\'', () => {
		var song = chordprojs.parse('{subtitle:Song Subtitle}');
		expect(song.subtitle).to.equal('Song Subtitle');
	});

});