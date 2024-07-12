const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');


module.exports = {
  // Entry point of your application
  entry: './src/index.js',
  mode: 'development',

  // Output configuration for the bundled file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },

  // Development tools
  devtool: 'inline-source-map', // This helps with debugging by mapping the compiled code back to the original source code.
  devServer: {
    hot: true, // Enable hot module replacement
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
  },

  // Loaders and rules for processing different types of files
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // RegEx for .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use babel-loader for these files
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Use the env and react presets
          },
        },
      },
      {
        test: /\.css$/, // RegEx for .css files
        use: ['style-loader', 'css-loader'], // Use these loaders for CSS files
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // RegEx for image files
        type: 'asset/resource',
      },
    ],
  },

  // Plugins for additional functionality
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Template file to use
      'process.env.REACT_APP_ADMIN_PASSWORD': JSON.stringify(process.env.REACT_APP_ADMIN_PASSWORD),
    }),
    new CopyWebpackPlugin({
        patterns: [
            {
                from: 'public',  // copy all files from the public folder
                to: '',  // to the root of the dist folder
                globOptions: {
                    ignore: ['**/index.html'],
                },
            },
        ],
    }),
  ],

  // Resolve extensions for import without specifying the file extension
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
