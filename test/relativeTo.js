import path from 'path';
import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import config from './webpack.config';
import AssetMapPlugin from '../src';

describe('Relative to use case', function() {
  var mapFilePath;
  var baseDir = path.join(__dirname, 'app');

  beforeEach(function() {
    config.plugins = [
      new AssetMapPlugin(baseDir + '/assets/map.json', baseDir)
    ];

    mapFilePath = config.plugins[0].outputFile;
  });

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

        map.entry1.should.match(/\/entry1-[0-9a-f]+\.js$/);
        map.entry2.should.match(/\/entry2-[0-9a-f]+\.js$/);

        done();
      });
    })
  });
});
