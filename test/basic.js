var webpack = require('webpack');
var rimraf = require('rimraf');
var fs = require('fs');
var basicConfig = require('./basic/webpack.config');
var touch = require('touch');
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

  it('Only emits if an asset has changed', function(done){
    this.timeout(5000);
    rimraf(basicConfig.output.path, function() {
      var compiler = webpack(basicConfig);
      var watcher;
      var lastMapStats;
      var assetMap = __dirname + '/basic/assets/map.json';
      var indexJs = __dirname + '/basic/index.js';
      var smiley = __dirname + '/basic/smiley.jpeg';
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
