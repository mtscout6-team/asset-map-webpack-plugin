var AssetMapPlugin = require('../src');
var baseDir = __dirname + '/app';

module.exports = {
  entry: {
    index: baseDir + '/index.js'
  },

  output: {
    filename: '[name]-[hash].js',
    path: baseDir + '/assets',
    publicPath: '/assets/'
  },

  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.jpeg/, loader: 'file?name=[name]-[hash].[ext]' }
    ]
  },

  plugins: [
    new AssetMapPlugin(baseDir + '/assets/map.json')
  ]
};
