const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const environment = process.env.ENVIRONMENT;
const isProduction = environment === 'production';

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      ENVIRONMENT: JSON.stringify(environment)
    }
  }),
  new HtmlWebpackPlugin({
    title: 'Scroll!',
    template: '!!ejs-loader!src/index.html',
    favicon: './favicon.ico',
    minify: isProduction && {
      collapseWhitespace: true
    },
    inlineSource: isProduction && '\.(js|css)$'
  }),
  new HtmlWebpackInlineSourcePlugin(),
  new webpack.LoaderOptionsPlugin({
    options: {
      tslint: {
        emitErrors: true,
        failOnHint: true
      }
    }
  })
];

const config = {
  devtool: !isProduction && 'source-map',
  context: path.resolve('./src'),
  entry: {
    app: './main.ts'
  },
  output: {
    path: path.resolve('./docs'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        exclude: [/\/node_modules\//],
        use: ['awesome-typescript-loader', 'source-map-loader']
      },
      !isProduction
        ? {
            test: /\.(js|ts)$/,
            loader: 'istanbul-instrumenter-loader',
            exclude: [/\/node_modules\//],
            query: {
              esModules: true
            }
          }
        : null,
      { test: /\.html$/, loader: 'html-loader' },
      { test: /\.(css|scss)$/, loaders: ['to-string-loader', 'css-loader', 'sass-loader', 'postcss-loader'] }
    ].filter(Boolean)
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: plugins,
  devServer: {
    contentBase: path.join(__dirname, 'docs/'),
    historyApiFallback: true,
    compress: true,
    port: 3000,
    hot: true
  }
};

module.exports = config;
