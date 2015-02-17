import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import config from './webpack.relativeTo.config';

var mapFilePath = config.plugins[0].outputFile;

describe('Relative to use case', function() {
  it('Generates map.json with map to asset entries, relative to alternate path', function (done) {
    rimraf(config.output.path, function() {
      webpack(config, function(err, stats) {
        if (err) throw err;
        if (stats.hasErrors()) throw 'webpack has errors';
        if (stats.hasWarnings()) throw 'webpack has warnings';

        var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
        var map = JSON.parse(mapSrc).assets;

        map['./smiley.jpeg'].should.match(/\/smiley-[0-9a-f]+\.jpeg$/);
        map['./test-checklist.jpeg'].should.match(/\/test-checklist-[0-9a-f]+\.jpeg$/);

        done();
      });
    })
  });

  it('Generates map.json with map to chunk entries', function (done) {
    rimraf(config.output.path, function() {
      webpack(config, function(err, stats) {
        if (err) throw err;
        if (stats.hasErrors()) throw 'webpack has errors';
        if (stats.hasWarnings()) throw 'webpack has warnings';

        var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
        var map = JSON.parse(mapSrc).chunks;

        map.index.should.match(/\/index-[0-9a-f]+\.js$/);

        done();
      });
    })
  });
});
