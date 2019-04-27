# Terrain Builder

This is a web app that displays a 3D rendering of a tabletop RPG terrain tile,
with controls for changing its size and walls. You can also download the tile as
a standard STL file for 3D printing.

## Technologies

This app uses [ThreeJS](https://threejs.org) to render the tile, and the
meshes are all custom-made by the author. The scene is exported as an STL file
using [STLExporter](https://github.com/atnartur/three-STLexporter) and
downloaded using [FileSaver.js](http://purl.eligrey.com/github/FileSaver.js).
Everything else is pure HTML and vanilla JavaScript.

## Credits

Written by [Brent P. Newhall](http://brentnewhall.com).