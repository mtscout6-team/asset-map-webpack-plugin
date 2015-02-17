var fs = require('fs');
var path = require('path');
var RequestShortener = require('webpack/lib/RequestShortener');

/**
 * AssetMapPlugin
 * @class
 *
 * @param {string} publicPath - Public path used in url request
 * @param {string} outputFile - Where to write the asset map file
 * @param {string} [relativeTo=outputFile] - Key assets relative to this path, otherwise defaults to be relative to where the outputFile is written
 */
function AssetMapPlugin(publicPath, outputFile, relativeTo) {
  this.publicPath = publicPath;
  this.outputFile = outputFile;
  this.relativeTo = relativeTo;
};

AssetMapPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function AssetMapFileGenerator(stats) {
    var requestShortener = new RequestShortener(this.relativeTo || path.dirname(this.outputFile));
    var emitted = false;
    var assets = stats.compilation.modules
      .map(function(m) {
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
      }).filter(function(m){
        return m !== undefined;
      }).reduce(function(acc, m) {
        acc[m.name] = path.join(this.publicPath, m.asset);
        return acc;
      }.bind(this), {});

    if (emitted) {
      fs.writeFileSync(this.outputFile, JSON.stringify(assets));
    }
  }.bind(this));
};

module.exports = AssetMapPlugin;
