const { resolve } = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: [
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
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
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
