var Funnel           = require('broccoli-funnel');
var concat           = require('broccoli-concat');
var uglifyJavaScript = require('broccoli-uglify-js');
var mergeTrees       = require('broccoli-merge-trees');
var compileModules   = require('broccoli-es6-module-transpiler');
var ES6Modules = require('broccoli-es6modules');


var amdFiles = new ES6Modules('src', {
  format: 'umd',
  bundleOptions: {
    entry: 'main.js',
    name: 'myLib'
  }
});

var compiledSrc = compileModules('src', {
  output   : 'mock-socket.js'
});

var compiledTests = compileModules('tests', {
  output   : '/tests/tests.js'
});

var minFileName = new Funnel(compiledSrc, {
  files: ['mock-socket.js'],
  getDestinationPath: function(relativePath) {
    return 'mock-socket.min.js';
  }
});

var vendor = new Funnel('node_modules/setImmediate', {
  files: ['setImmediate.js']
});

var uglyJS = uglifyJavaScript(minFileName);

module.exports = mergeTrees([compiledSrc, compiledTests, uglyJS, amdFiles]);
