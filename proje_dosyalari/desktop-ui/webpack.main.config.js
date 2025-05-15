const { resolve } = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('./package.json');

// Environment variables
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',

  // Target electron-main
  target: 'electron-main',

  // Development mode based on environment
  mode: isDevelopment ? 'development' : 'production',

  // Source maps for development
  devtool: isDevelopment ? 'source-map' : false,

  // Module rules
  module: {
    rules: [
      // TypeScript files
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      // Asset files
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
      // JSON files
      {
        test: /\.json$/,
        type: 'json',
      },
    ],
  },

  // Plugins
  plugins: [
    // TypeScript type checking
    new ForkTsCheckerWebpackPlugin(),

    // Define environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.API_GATEWAY_URL': JSON.stringify(process.env.API_GATEWAY_URL || 'http://localhost:3000/api'),
      'process.env.APP_VERSION': JSON.stringify(packageJson.version),
    }),

    // Optimize for production
    ...(!isDevelopment ? [
      new webpack.optimize.ModuleConcatenationPlugin(),
    ] : []),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@core': resolve(__dirname, 'src/renderer/components/core'),
      '@composition': resolve(__dirname, 'src/renderer/components/composition'),
      '@feature': resolve(__dirname, 'src/renderer/components/feature'),
      '@layouts': resolve(__dirname, 'src/renderer/components/layouts'),
      '@hooks': resolve(__dirname, 'src/renderer/hooks'),
      '@utils': resolve(__dirname, 'src/renderer/utils'),
      '@store': resolve(__dirname, 'src/renderer/store'),
      '@styles': resolve(__dirname, 'src/renderer/styles'),
      '@assets': resolve(__dirname, 'src/renderer/assets'),
    },
  },
};
