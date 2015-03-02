import fs from 'fs';
import path from 'path';
import RequestShortener from 'webpack/lib/RequestShortener';

function ExtractAssets(modules, requestShortener, publicPath) {
  var emitted = false;
  var assets = modules
    .map(m => {
      var assets = Object.keys(m.assets || {});

      if (assets.length === 0) {
        return undefined;
      }

      var asset = assets[0];
      emitted = emitted || m.assets[asset].emitted;

      return {
        name: m.readableIdentifier(requestShortener),
        asset: asset
      };
    }).filter(m => {
      return m !== undefined;
    }).reduce((acc, m) => {
      acc[m.name] = path.join(publicPath, m.asset);
      return acc;
    }, {});

  return [emitted, assets];
}

function ExtractChunks(chunks, publicPath) {
  var emitted = false;
  var chunks = chunks
    .map(c => {
      return {
        name: c.name,
        files: c.files.map(f => path.join(publicPath, f))
      };
    })
    .reduce((acc, c) => {
      acc[c.name] = c.files;
      return acc;
    }, {});

  return [emitted, chunks];
}

export default class AssetMapPlugin {
  /**
   * AssetMapPlugin
   *
   * @param {string} outputFile - Where to write the asset map file
   * @param {string} [relativeTo] - Key assets relative to this path, otherwise defaults to be relative to the directory where the outputFile is written
   */
  constructor(outputFile, relativeTo) {
    this.outputFile = outputFile;
    this.relativeTo = relativeTo;
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      var publicPath = stats.compilation.outputOptions.publicPath;
      var requestShortener = new RequestShortener(this.relativeTo || path.dirname(this.outputFile));

      var [assetsEmitted, assets] = ExtractAssets(stats.compilation.modules, requestShortener, publicPath);
      var [chunksEmitted, chunks] = ExtractChunks(stats.compilation.chunks, publicPath);

      if (assetsEmitted || chunksEmitted) {
        fs.writeFileSync(this.outputFile, JSON.stringify({ assets, chunks }));
      }
    });
  }
}
