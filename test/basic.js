var webpack = require('webpack');
var rimraf = require('rimraf');
var fs = require('fs');
var basicConfig = require('./basic/webpack.config');
var mapFilePath = basicConfig.plugins[0].outputFile;

describe('Basic use case', function() {
  it('Generates map.json with map to asset entries', function (done) {
    rimraf(basicConfig.output.path, function() {
      webpack(basicConfig, function(err, stats) {
        if (err) throw err;
        if (stats.hasErrors()) throw 'webpack has errors';
        if (stats.hasWarnings()) throw 'webpack has warnings';

        var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
        var map = JSON.parse(mapSrc);

        map['../smiley.jpeg'].should.match(/\/smiley.*\.jpeg$/);
        map['../test-checklist.jpeg'].should.match(/\/test-checklist.*\.jpeg$/);

        done();
      });
    })
  });
});
