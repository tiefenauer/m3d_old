[![Build Status](https://travis-ci.org/tiefenauer/m3d.svg?branch=master)](https://travis-ci.org/tiefenauer/m3d)
[![Dependency Status](https://david-dm.org/tiefenauer/m3d.svg)](https://david-dm.org/tiefenauer/m3d)
[![devDependency Status](https://david-dm.org/tiefenauer/m3d/dev-status.svg)](https://david-dm.org/tiefenauer/m3d#info=devDependencies)
[![Coverage Status](https://img.shields.io/coveralls/tiefenauer/m3d.svg)](https://coveralls.io/r/tiefenauer/m3d)
[![Code Metrics](http://img.shields.io/badge/metrics-report-yellowgreen.svg)](http://tiefenauer.github.io/m3d/metrics/)
[![Code Metrics](http://img.shields.io/badge/test-report-yellowgreen.svg)](http://tiefenauer.github.io/m3d/tests/)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
m3d
===
m3d is a web app that creates a three-dimensional elevation profile for any part of the earth surface. The profile can be downloaded as STL file for 3d printing.

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
Coming soon
