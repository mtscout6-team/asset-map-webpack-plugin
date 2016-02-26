import _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import config from './webpack.config';
import touch from 'touch';
import AssetMapPlugin from '../src';
import asyncTestWrapper from './async-test-wrapper';

config = _.cloneDeep(config);

var baseDir = path.join(__dirname, 'app');

config.plugins = [
  new AssetMapPlugin(baseDir + '/assets/map.json')
];

var mapFilePath = config.plugins[0].outputFile;

describe('Basic use case', () => {
  it('Generates map.json with map to asset entries', done => {
    rimraf(config.output.path, () => {
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          var map = JSON.parse(mapSrc).assets;

          map['../smiley.jpeg'].should.match(/\/smiley-[0-9a-f]+\.jpeg$/);
          map['../test-checklist.jpeg'].should.match(/\/test-checklist-[0-9a-f]+\.jpeg$/);
        }, done);
      });
    })
  });

  it('Generates map.json with map to chunk entries', done => {
    rimraf(config.output.path, () => {
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          var map = JSON.parse(mapSrc).chunks;

          expect(map.entry1.length).to.equal(1);
          map.entry1[0].should.match(/^\/assets\/entry1-[0-9a-f]+\.js$/);
          expect(map.entry2.length).to.equal(1);
          map.entry2[0].should.match(/^\/assets\/entry2-[0-9a-f]+\.js$/);
        }, done);
      });
    })
  });

  // Since both Webpack and Mocha watch muck with module loading if you run
  // mocha in watch mode it will keep re-running this module even without a
  // file save.
  it('Only emits if an asset has changed', function(done) {
    this.timeout(6000);

    rimraf(config.output.path, () => {
      var compiler = webpack(config);
      var watcher;
      var lastMapStats;
      var assetMap = __dirname + '/app/assets/map.json';
      var entry1Js = __dirname + '/app/entry1.js'
      var smiley = __dirname + '/app/smiley.jpeg';
      let buffer;
      var watchCompletions = [
        function FirstWatchComplete() {
          lastMapStats = fs.statSync(assetMap);
          touch.sync(entry1Js);
        },
        function SecondWatchComplete() {
          var newStats = fs.statSync(assetMap);
          newStats.mtime.should.eql(lastMapStats.mtime);
          touch.sync(smiley);
        },
        function ThirdWatchComplete() {
          var newStats = fs.statSync(assetMap);
          newStats.mtime.should.not.eql(lastMapStats.mtime);
          lastMapStats = newStats;
          buffer = fs.readFileSync(entry1Js, 'utf8');
          fs.writeFileSync(entry1Js, buffer + "console.log('we made it!');", null, 2);
        },
        function TestChunkRewrite() {
          let newStats = fs.statSync(assetMap);
          newStats.mtime.should.not.eql(lastMapStats.mtime);
          fs.writeFileSync(entry1Js, buffer, null, 2);
        },
        function LastWatchComplete() {
          watcher.close(done);
        }
      ];
      var next = watchCompletions.reverse()
        .reduce((acc, func) => {
          return () => {
            next = acc;
            func();
          };
        }, () => { /* NO OP */ });

      watcher = compiler.watch(1000, (err, stats) => {
        try {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          next();
        } catch (e) {
          if (watcher) {
            watcher.close();
          }

          done(e);
        }
      });
    })
  });
});
