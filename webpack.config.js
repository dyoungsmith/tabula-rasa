var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './app/index.js',
  output: {
    path: __dirname,
    filename: './public/bundle.js'
  },
  context: __dirname,
  devtool: 'source-maps',
  devServer: {
    hot: true,
    port: 7000,
    host: '0.0.0.0' // allows hosting from local IP
  },
  contentBase: __dirname + "/public/",
  module: {
    loaders: [
      {
        test: /jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /scss$/,
        loaders: ['style', 'css', 'sass']
      }
    ]
  }
};
