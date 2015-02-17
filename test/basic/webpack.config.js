var AssetMapPlugin = require('../../');

module.exports = {
  entry: {
    index: __dirname + '/index.js'
  },

  output: {
    filename: '[name].js',
    path: __dirname + '/assets',
    publicPath: '/assets/'
  },

  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.jpeg/, loader: 'file?name=[name]-[hash].[ext]' }
    ]
  },

  plugins: [
    new AssetMapPlugin('/assets/', __dirname + '/assets/map.json')
  ]
};
