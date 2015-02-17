var AssetMapPlugin = require('../');
var baseDir = __dirname + '/app';

module.exports = {
  entry: {
    index: baseDir + '/index.js'
  },

  output: {
    filename: '[name].js',
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
    new AssetMapPlugin('/assets/', baseDir + '/assets/map.json')
  ]
};
