const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('node:path')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')
const config = require('./config')
console.log(config);
let isProd = process.env.NODE_ENV == 'prod'

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
   entry: {
      SmartPanel: './src/index.js',
   },
   output: {
      path: __dirname + '/out'
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
            test: /\.m?js$/, exclude: /node_modules/, use: {
               loader: "babel-loader",
               options: { 
                  presets: ['@babel/preset-env'],
                  plugins: ["@vue/babel-plugin-jsx"]
               }
            }
         }
      ]
   },
   plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
         filename: 'index.html',
         template: 'index.html',
         inject: true,
         publicPath: `/`,
      }),
      new webpack.DefinePlugin({
         __VUE_OPTIONS_API__: true,
         __VUE_PROD_DEVTOOLS__: false
      }),
      new MiniCssExtractPlugin({
         filename: 'style.css'
      })
   ],
   devServer: {
      port: 3001,
      hot: false,
      historyApiFallback: true,
   }
}