import _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
import rimraf from 'rimraf';
import fs from 'fs';
import config from './webpack.config';
import touch from 'touch';
import AssetMapPlugin from '../src';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import asyncTestWrapper from './async-test-wrapper';

config = _.cloneDeep(config);

var baseDir = path.join(__dirname, 'app');

config.module.loaders = config.module.loaders.map(l => {
  if (l.loader.indexOf('less') === -1) {
    return l;
  }

  l.loader = ExtractTextPlugin.extract('style', 'css!less');
  return l;
});

config.plugins = [
  new AssetMapPlugin('map.json'),
  new ExtractTextPlugin('[name]-[chunkhash].css')
];

var mapFilePath = path.join(baseDir, 'assets', config.plugins[0].outputFile);

describe('Extract text plugin use case', () => {
  it('Generates map.json with map to asset entries', done => {
    config.plugins[0].previousChunks = {};
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
    config.plugins[0].previousChunks = {};
    rimraf(config.output.path, () => {
      webpack(config, (err, stats) => {
        asyncTestWrapper(() => {
          if (err) throw err;
          if (stats.hasErrors()) throw 'webpack has errors';
          if (stats.hasWarnings()) throw 'webpack has warnings';

          var mapSrc = fs.readFileSync(mapFilePath, {encoding: 'utf-8'});
          var map = JSON.parse(mapSrc).chunks;

          expect(map.entry1.length).to.equal(2);
          map.entry1[0].should.match(/^\/assets\/entry1-[0-9a-f]+\.js$/);
          map.entry1[1].should.match(/^\/assets\/entry1-[0-9a-f]+\.css/);
          expect(map.entry2.length).to.equal(2);
          map.entry2[0].should.match(/^\/assets\/entry2-[0-9a-f]+\.js$/);
          map.entry2[1].should.match(/^\/assets\/entry2-[0-9a-f]+\.css/);
        }, done);
      });
    })
  });
});
