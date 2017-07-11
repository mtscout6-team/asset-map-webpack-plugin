/* global __dirname describe it expect */

import _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import defaultConfig from './webpack.config';
import AssetMapPlugin from '../src';
import asyncTestWrapper from './async-test-wrapper';

const config = _.cloneDeep(defaultConfig);

const baseDir = path.join(__dirname, 'app');

config.plugins = [
  new AssetMapPlugin('map.json')
];

config.devtool = 'sourcemap';

const mapFilePath = path.join(baseDir, 'assets', config.plugins[0].outputFile);

describe('With source maps enabled', () => {
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

  it('Generates map.json with map to chunk entries, without map files', done => {
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
});
