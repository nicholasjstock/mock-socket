var Funnel           = require('broccoli-funnel');
var uglifyJavaScript = require('broccoli-uglify-js');
var mergeTrees       = require('broccoli-merge-trees');
var pickFiles        = require('broccoli-static-compiler');
var compileModules   = require('broccoli-es6-module-transpiler');

var transpiledLib = compileModules('src', {
  formatter: 'bundle',
  output   : 'mock-socket.js'
});

var minifiedTree = new Funnel(transpiledLib, {
  getDestinationPath: function(relativePath) {
	return 'mock-socket.min.js';
  }
});

var uglyJS = uglifyJavaScript(minifiedTree);

module.exports = mergeTrees([transpiledLib, uglyJS]);
