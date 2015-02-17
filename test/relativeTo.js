var webpack = require('webpack');
var rimraf = require('rimraf');
var fs = require('fs');
var config = require('./webpack.relativeTo.config');
var mapFilePath = config.plugins[0].outputFile;

describe('Relative to use case', function() {
  it('Generates map.json with map to asset entries, relative to alternate path', function (done) {
    rimraf(config.output.path, function() {
      webpack(config, function(err, stats) {
        if (err) throw err;
        if (stats.hasErrors()) throw 'webpack has errors';
        if (stats.hasWarnings()) throw 'webpack has warnings';

        var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
        var map = JSON.parse(mapSrc);

        map['./smiley.jpeg'].should.match(/\/smiley.*\.jpeg$/);
        map['./test-checklist.jpeg'].should.match(/\/test-checklist.*\.jpeg$/);

        done();
      });
    })
  });
});
