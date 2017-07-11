/* global __dirname describe it expect */

import _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import config from './webpack.config';
import AssetMapPlugin from '../src';
import asyncTestWrapper from './async-test-wrapper';

config = _.cloneDeep(config);

const baseDir = path.join(__dirname, 'app');

config.plugins = [
  new AssetMapPlugin('map.json')
];

const mapFilePath = path.join(baseDir, 'assets', config.plugins[0].outputFile);

describe('Should work with relative and absolute publicPath', () => {
  it('Generates map.json with relative urls if publicPath is relative', done => {
    config.plugins[0].previousChunks = {};
    rimraf(config.output.path, () => {
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          const mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          const map = JSON.parse(mapSrc).assets;

          expect(map['../smiley.jpeg']).to.match(/^\/assets\/smiley-[0-9a-f]+\.jpeg$/);
          expect(map['../test-checklist.jpeg']).to.match(/^\/assets\/test-checklist-[0-9a-f]+\.jpeg$/);
        }, done);
      });
    });
  });

  it('Generates map.json with absolute urls if publicPath is absolute', done => {
    config.plugins[0].previousChunks = {};
    rimraf(config.output.path, () => {
      config.output.publicPath = 'https://mycdn.mysite.com/';
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          const mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          const map = JSON.parse(mapSrc).assets;

          expect(map['../smiley.jpeg']).to.match(/^https:\/\/mycdn.mysite.com\/smiley-[0-9a-f]+\.jpeg$/);
          expect(map['../test-checklist.jpeg']).to.match(/^https:\/\/mycdn.mysite.com\/test-checklist-[0-9a-f]+\.jpeg$/);
        }, done);
      });
    });
  });
});
