const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('node:path')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')
const config = require('./config')
console.log(config);
let isProd = process.env.NODE_ENV == 'prod'
console.log(isProd);

const cssLoaders = [
   isProd ? MiniCssExtractPlugin.loader : "vue-style-loader",
   "css-loader",
   {
      loader: "esbuild-loader",
      options: { loader: "css", minify: true }
   }
]

module.exports = {
   mode: isProd ? "production" : "development",
   devtool: isProd ? 'source-map' : 'source-map',
   entry: {
      SmartPanel: './index.js',
   },
   output: {
      // path: path.resolve(`../sp-server/assets` + config.SMART_PANEL_PATH),
      filename: isProd ? "[name]-[hash].js" : "[name].js",
   },
   resolve: {
      extensions: ['.vue', '.js'],
   },
   module: {
      rules: [
         { test: /\.vue/, use: 'vue-loader' },
         { test: /\.s[ac]ss$/i, use: cssLoaders.concat(["sass-loader"]) },
         { test: /\.css$/, use: cssLoaders },
         {
            test: /\.m?js$/, exclude: /node_modules/,
            use: ["source-map-loader", {
               loader: "babel-loader",
               options: {
                  presets: ['@babel/preset-env'],
                  plugins: ["@vue/babel-plugin-jsx"]
               }
            }]
         }
      ]
   },
   plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
         filename: 'index.html',
         template: 'index.html',
         inject: true,
         publicPath: '/',
      }),
      new webpack.DefinePlugin({
         __VUE_OPTIONS_API__: true,
         __VUE_PROD_DEVTOOLS__: false
      }),
      new MiniCssExtractPlugin({
         filename: isProd ? '[name]-[hash].css' : '[name].css'
      }),
      new CleanWebpackPlugin(),
   ],
   devServer: {
      port: 3001,
      hot: false,
      historyApiFallback: true,
      proxy: {
         '/api': {
            target: 'http://localhost:3000',
         },
      },
      // client:{
      //    reconnect: true,
      // },
      // static:{
      //    // directory: path.resolve(`../sp-server/assets` + config.SMART_PANEL_PATH),
      //    publicPath: config.SMART_PANEL_PATH
      // }
   }
}