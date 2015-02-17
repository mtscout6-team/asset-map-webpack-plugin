import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import config from './webpack.basic.config';
import touch from 'touch';

var mapFilePath = config.plugins[0].outputFile;

describe('Basic use case', () => {
  it('Generates map.json with map to asset entries', function (done) {
    rimraf(config.output.path, function() {
      webpack(config, function(err, stats) {
        if (err) throw err;
        if (stats.hasErrors()) throw 'webpack has errors';
        if (stats.hasWarnings()) throw 'webpack has warnings';

        var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
        var map = JSON.parse(mapSrc).assets;

        map['../smiley.jpeg'].should.match(/\/smiley-[0-9a-f]+\.jpeg$/);
        map['../test-checklist.jpeg'].should.match(/\/test-checklist-[0-9a-f]+\.jpeg$/);

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

  it('Only emits if an asset has changed', function(done){
    this.timeout(5000);
    rimraf(config.output.path, function() {
      var compiler = webpack(config);
      var watcher;
      var lastMapStats;
      var assetMap = __dirname + '/app/assets/map.json';
      var indexJs = __dirname + '/app/index.js';
      var smiley = __dirname + '/app/smiley.jpeg';
      var watchCompletions = [
        function FirstWatchComplete() {
          lastMapStats = fs.statSync(assetMap);
          touch.sync(indexJs);
        },
        function SecondWatchComplete() {
          var newStats = fs.statSync(assetMap);
          newStats.mtime.should.eql(lastMapStats.mtime);
          touch.sync(smiley);
        },
        function SecondWatchComplete() {
          var newStats = fs.statSync(assetMap);
          newStats.mtime.should.not.eql(lastMapStats.mtime);
          touch.sync(indexJs);
        },
        function LastWatchComplete() {
          watcher.close(done);
        }
      ];
      var next = watchCompletions.reverse()
        .reduce(function(acc, func) {
          return function() {
            next = acc;
            func();
          };
        }, function() { /* NO OP */ });

      watcher = compiler.watch(1000, function(err, stats) {
        if (err) throw err;
        if (stats.hasErrors()) throw 'webpack has errors';
        if (stats.hasWarnings()) throw 'webpack has warnings';

        next();
      });
    })
  });
});
