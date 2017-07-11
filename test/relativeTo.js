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
  new AssetMapPlugin('map.json', baseDir)
];

const mapFilePath = path.join(baseDir, 'assets', config.plugins[0].outputFile);

describe('Relative to use case', () => {
  it('Generates map.json with map to asset entries, relative to alternate path', done => {
    config.plugins[0].previousChunks = {};
    rimraf(config.output.path, () => {
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          const mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          const map = JSON.parse(mapSrc).assets;

          map['./smiley.jpeg'].should.match(/\/smiley-[0-9a-f]+\.jpeg$/);
          map['./test-checklist.jpeg'].should.match(/\/test-checklist-[0-9a-f]+\.jpeg$/);
        }, done);
      });
    })
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
          map.entry1[0].should.match(/^\/assets\/entry1-[0-9a-f]+\.js$/);
          expect(map.entry2.length).to.equal(1);
          map.entry2[0].should.match(/^\/assets\/entry2-[0-9a-f]+\.js$/);
        }, done);
      });
    })
  });
});
