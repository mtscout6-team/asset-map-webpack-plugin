import fs from 'fs';
import path from 'path';
import RequestShortener from 'webpack/lib/RequestShortener';

export default class AssetMapPlugin {
  /**
   * AssetMapPlugin
   *
   * @param {string} publicPath - Public path used in url request
   * @param {string} outputFile - Where to write the asset map file
   * @param {string} [relativeTo=outputFile] - Key assets relative to this path, otherwise defaults to be relative to where the outputFile is written
   */
  constructor(publicPath, outputFile, relativeTo) {
    this.publicPath = publicPath;
    this.outputFile = outputFile;
    this.relativeTo = relativeTo;
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      var requestShortener = new RequestShortener(this.relativeTo || path.dirname(this.outputFile));
      var emitted = false;
      var assets = stats.compilation.modules
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
          acc[m.name] = path.join(this.publicPath, m.asset);
          return acc;
        }, {});

      if (emitted) {
        fs.writeFileSync(this.outputFile, JSON.stringify(assets));
      }
    });
  }
}
