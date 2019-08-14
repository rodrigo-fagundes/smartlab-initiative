const path = require('path')
const webpack = require('webpack')
const vueConfig = require('./vue-loader.config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const isProd = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')
const resolve = (file) => path.resolve(__dirname, file)

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  devtool: isProd
    ? false
    : '#cheap-module-source-map',
  output: {
    path: resolve('../public'),
    publicPath: '/public/',
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['*', '.js', '.json', '.vue'],
    alias: {
      'assets': resolve('../assets'),
      'components': resolve('../components'),
      'examples': resolve('../pages/examples'),
      'layouts': resolve('../layouts'),
      'mixins': resolve('../mixins'),
      'pages': resolve('../pages'),
      'public': resolve('../public'),
      'router': resolve('../router'),
      'static': resolve('../static'),
      'store': resolve('../store'),
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  module: {
    noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.styl$/,
        loader: ['vue-style-loader', 'css-loader', 'stylus-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.yaml$/,
        loader: 'yaml-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false
  },
  plugins: isProd
    ? [
//        new webpack.optimize.UglifyJsPlugin({
//          compress: { warnings: false }
//        }),
//        new UglifyJsPlugin({
//          uglifyOptions: {
//            compress: { warnings: false }
//          },
//        }),
        // new webpack.DefinePlugin({
        //   'process.env': {
        //   'NODE_ENV': JSON.stringify("production")
        //   }
        // }),

        new ExtractTextPlugin({
          filename: 'common.[chunkhash].css'
        }),
      ]
    : [
        // new UglifyJsPlugin({
        //   uglifyOptions: {
        //     compress: { warnings: false }
        //   },
        // }),
        new FriendlyErrorsPlugin()
      ]
}