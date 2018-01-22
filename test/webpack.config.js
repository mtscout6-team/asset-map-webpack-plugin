/* global __dirname */

import path from 'path';

const baseDir = path.join(__dirname, 'app');

export default {
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
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.less/, use: ['style-loader', 'css-loader', 'less-loader'] },
      { test: /\.jpeg/, use: 'file-loader?name=[name]-[hash].[ext]' }
    ]
  }
};
