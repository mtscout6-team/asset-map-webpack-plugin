var path = require('path');
var baseDir = path.join(__dirname, 'app');

module.exports = {
  entry: {
    entry1: path.join(baseDir, 'entry1.js'),
    entry2: path.join(baseDir, 'entry2.js')
  },

  output: {
    filename: '[name]-[hash].js',
    path: path.join(baseDir, 'assets'),
    publicPath: '/assets/'
  },

  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.less/, loader: 'style!css!less' },
      { test: /\.jpeg/, loader: 'file?name=[name]-[hash].[ext]' }
    ]
  }
};
