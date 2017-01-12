import path from 'path';
import url from 'url';
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
        acc[m.name] = url.resolve(publicPath, m.asset);
      return acc;
    }, {});

  return [emitted, assets];
}

function ExtractChunks(self, chunks, publicPath) {
  var mappedChunks = chunks
    .map(c => {
      return {
        name: c.name,
        files: c.files
          .filter(f => path.extname(f) !== '.map')
          .map(f => url.resolve(publicPath, f))
      };
    })
    .reduce((acc, c) => {
      acc[c.name] = c.files;
      return acc;
    }, {});

  const emitted = JSON.stringify(self.previousChunks) !== JSON.stringify(mappedChunks);
  self.previousChunks = mappedChunks;

  return [emitted, mappedChunks];
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
    this.previousChunks = {};
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, done) => {
      var publicPath = compilation.outputOptions.publicPath;
      var requestShortener = new RequestShortener(this.relativeTo || path.dirname(this.outputFile));

      var [assetsEmitted, assets] = ExtractAssets(compilation.modules, requestShortener, publicPath);
      var [chunksEmitted, chunks] = ExtractChunks(this, compilation.chunks, publicPath);

      if (assetsEmitted || chunksEmitted) {
        var out = JSON.stringify({ assets, chunks }, null, 2);
        var assetName = this.outputFile.split(compilation.outputOptions.path).pop();
        compilation.assets[assetName] = {
          source: () => {
            return out;
          },
          size: () => {
            return Buffer.byteLength(out, 'utf8');
          }
        };
      }
      done();
    });
  }
}
