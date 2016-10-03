var chai = require('chai'),
	chordprojs = require('../src/');

var expect = chai.expect;

describe('Parse Directives', function () {

	it('{title:Song Title} should set song.title property to \'Song Title\'', function () {
		var song = chordprojs.parse('{title:Song Title}');
		expect(song.title).to.equal('Song Title');
	});

	it('{subtitle:Song Subtitle} should set song.subtitle property to \'Song Subtitle\'', function () {
		var song = chordprojs.parse('{subtitle:Song Subtitle}');
		expect(song.subtitle).to.equal('Song Subtitle');
	});

});
