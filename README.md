ChordProJS
==========

[![Build Status](https://travis-ci.org/tvdavies/chordprojs.svg)](https://travis-ci.org/tvdavies/chordprojs)

```js
// Parse some ChordPro formatted text
var song = chordprojs.parse("He[Am]llo, [C] it's [G]me [F]");

// Render as HTML
var html = song.render();

// Transpose the HTML output by passing your desired transpose steps into the render function.
var html = song.render(4);
```
