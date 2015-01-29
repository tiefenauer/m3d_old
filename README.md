[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![Build Status](https://travis-ci.org/tiefenauer/m3d.svg?branch=master)](https://travis-ci.org/tiefenauer/m3d)
[![Dependency Status](https://david-dm.org/tiefenauer/m3d.svg)](https://david-dm.org/tiefenauer/m3d)
[![devDependency Status](https://david-dm.org/tiefenauer/m3d/dev-status.svg)](https://david-dm.org/tiefenauer/m3d#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/tiefenauer/m3d/badge.svg?branch=master)](https://coveralls.io/r/tiefenauer/m3d?branch=master)

* [Coverage report (alternative)](http://tiefenauer.github.io/m3d/coverage/)
* [Lint report](http://tiefenauer.github.io/m3d/jshint)
* [Unit Test report](http://tiefenauer.github.io/m3d/tests/unit)
* [E2E Test report](http://tiefenauer.github.io/m3d/tests/e2e)
* [Code Metrics](http://tiefenauer.github.io/m3d/metrics)
* [Code documentation](http://tiefenauer.github.io/m3d/doc)

m3d
===
m3d is a web app that can create a three-dimensional elevation profile for any part of the earth surface. The profile can be downloaded as STL file for 3d printing.

Demo
----
See http://m3d.tiefenauer.info for a running version of the most stable build.

Installation
------------
You will need the following tools:
- Node.js (http://nodejs.org/)
- Ruby (https://www.ruby-lang.org)

After checking out this repo, cd into the folder and run the following command:

    npm install

This will download all the dependencies for you. After the step completed, just type

    grunt

 to run the build script. After the build that you can start the application by typing

    grunt serve

This will start the server and open a new browsert tab with the application running in it.

Testing
-------
You can run the tests and create the test reports by running

    grunt test

You can release a minified and optimized verison of the app by runnning

    grunt dist

Features
--------
* Generate three-dimensional surface model for any part of the world
* visualize the generated 3d model right inside your browser
* import or export from/to STL or VRML format for 3d printing
* Square or polygonal footprint
* choose municipality boundary as footprint (only for Swiss municipalities)
* choose one of the following sources of elevation data
    *   Google Maps
    *   SRTM (USGS-Release)
    *   SRTM (CGIAR-Release)
    *   AsterDEM
    *   SwissTopo (only for areas inside Swiss territory)
