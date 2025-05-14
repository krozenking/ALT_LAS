const { resolve } = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Environment variables
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  // Entry point for renderer process
  entry: './src/renderer/index.tsx',

  // Target electron-renderer
  target: 'electron-renderer',

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
      // CSS files
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
              importLoaders: 1,
            },
          },
        ],
      },
      // Asset files
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]',
        },
      },
      // Font files
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
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

    // HTML template
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'src/renderer/index.html'),
      filename: 'index.html',
      title: 'ALT_LAS',
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        'theme-color': '#1A202C',
      },
      minify: !isDevelopment,
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
