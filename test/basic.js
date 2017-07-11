/* global __dirname describe it expect */

import _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import defaultConfig from './webpack.config';
import touch from 'touch';
import AssetMapPlugin from '../src';
import asyncTestWrapper from './async-test-wrapper';

const config = _.cloneDeep(defaultConfig);

const baseDir = path.join(__dirname, 'app');

config.plugins = [
  new AssetMapPlugin('map.json')
];

const mapFilePath = path.join(baseDir, 'assets', config.plugins[0].outputFile);

describe('Basic use case', () => {
  it('Generates map.json with map to asset entries', done => {
    config.plugins[0].previousChunks = {};
    rimraf(config.output.path, () => {
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          const mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          const map = JSON.parse(mapSrc).assets;

          expect(map['../smiley.jpeg']).to.match(/\/smiley-[0-9a-f]+\.jpeg$/);
          expect(map['../test-checklist.jpeg']).to.match(/\/test-checklist-[0-9a-f]+\.jpeg$/);
        }, done);
      });
    });
  });

  it('Generates map.json with map to chunk entries', done => {
    config.plugins[0].previousChunks = {};
    rimraf(config.output.path, () => {
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          const mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          const map = JSON.parse(mapSrc).chunks;

          expect(map.entry1.length).to.equal(1);
          expect(map.entry1[0]).to.match(/^\/assets\/entry1-[0-9a-f]+\.js$/);
          expect(map.entry2.length).to.equal(1);
          expect(map.entry2[0]).to.match(/^\/assets\/entry2-[0-9a-f]+\.js$/);
        }, done);
      });
    });
  });

  // Since both Webpack and Mocha watch muck with module loading if you run
  // mocha in watch mode it will keep re-running this module even without a
  // file save.
  it('Only emits if an asset has changed', (done) => {
    config.plugins[0].previousChunks = {};
    rimraf(config.output.path, () => {
      const compiler = webpack(config);
      let watcher;
      let lastMapStats;
      let buffer;

      const assetMap = path.join(__dirname, 'app', 'assets', 'map.json');
      const entry1Js = path.join(__dirname, 'app', 'entry1.js');
      const entry2Js = path.join(__dirname, 'app', 'entry2.js');
      const smiley = path.join(__dirname, 'app', 'smiley.jpeg');
      
      let watchCompletions = [
        function StartWatch() {
          touch.sync(entry2Js);
        },
        function TouchAsset() {
          lastMapStats = fs.statSync(assetMap);
          touch.sync(entry1Js);
        },
        function Wait() {
          touch.sync(entry2Js);
        },
        function ExpectNoChangeAndTouchImage() {
          const newStats = fs.statSync(assetMap);
          expect(newStats.mtime).to.eql(lastMapStats.mtime);
          touch.sync(smiley);
        },
        function Wait() {
          touch.sync(entry2Js);
        },
        function ExpectChangeAndRewriteAsset() {
          const newStats = fs.statSync(assetMap);
          expect(newStats.mtime).to.not.eql(lastMapStats.mtime);
          lastMapStats = newStats;
          buffer = fs.readFileSync(entry1Js, 'utf8');
          fs.writeFileSync(entry1Js, `${buffer}console.log('we made it!');`, null, 2);
        },
        function Wait() {
          touch.sync(entry2Js);
        },
        function ExpectChange() {
          let newStats = fs.statSync(assetMap);
          expect(newStats.mtime).to.not.eql(lastMapStats.mtime);
          fs.writeFileSync(entry1Js, buffer, null, 2);
        },
        function LastWatchComplete() {
          watcher.close(done);
        }
      ];
      let next = watchCompletions.reverse()
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
    });
  }).timeout(10000);
});
