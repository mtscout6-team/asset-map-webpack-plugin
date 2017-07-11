import path from 'path';
import url from 'url';
import RequestShortener from 'webpack/lib/RequestShortener';

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

  _extractAssets(modules, requestShortener, publicPath) {
    let emitted = false;
    const mappedAssets = modules
      .map(m => {
        const assets = Object.keys(m.assets || {});

        if (assets.length === 0) {
          return undefined;
        }

        const asset = assets[0];
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

    return [emitted, mappedAssets];
  }

  _extractChunks(chunks, publicPath) {
    const mappedChunks = chunks
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

    const emitted = JSON.stringify(this.previousChunks) !== JSON.stringify(mappedChunks);
    this.previousChunks = mappedChunks;

    return [emitted, mappedChunks];
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, done) => {
      const publicPath = compilation.outputOptions.publicPath;
      const requestShortener = new RequestShortener(this.relativeTo || compilation.outputOptions.path);

      const [assetsEmitted, assets] = this._extractAssets(compilation.modules, requestShortener, publicPath);
      const [chunksEmitted, chunks] = this._extractChunks(compilation.chunks, publicPath);

      if (assetsEmitted || chunksEmitted) {
        const out = JSON.stringify({ assets, chunks }, null, 2);
        compilation.assets[this.outputFile] = {
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
