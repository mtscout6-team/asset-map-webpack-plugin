var fs = require('fs');
var path = require('path');
var RequestShortener = require('webpack/lib/RequestShortener');

function AssetMapPlugin(publicPath, outputFile) {
  this.publicPath = publicPath;
  this.outputFile = outputFile;
};

AssetMapPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function AssetMapFileGenerator(stats) {
    var requestShortener = new RequestShortener(path.dirname(this.outputFile));
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
