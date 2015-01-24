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
        return {
          name: m.readableIdentifier(requestShortener),
          assets: Object.keys(m.assets || {}),
          module: m
        };
      }).filter(function(m){
        return m.assets.length > 0;
      }).reduce(function(acc, m) {
        emitted = emitted || m.assets[0].emitted;
        acc[m.name] = path.join(this.publicPath, m.assets[0]);
        return acc;
      }.bind(this), {});

    if (emitted) {
      fs.writeFileSync(this.outputFile, JSON.stringify(assets));
    }
  }.bind(this));
};

module.exports = AssetMapPlugin;
