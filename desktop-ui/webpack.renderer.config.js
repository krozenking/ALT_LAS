const { resolve } = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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

  // Optimization
  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: !isDevelopment,
            drop_debugger: !isDevelopment,
          },
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
        // Common chunks
        common: {
          name: 'common',
          minChunks: 2,
          priority: -10,
        },
      },
    },
    runtimeChunk: 'single',
  },

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
    new ForkTsCheckerWebpackPlugin({
      async: isDevelopment,
    }),

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
      cache: true,
    }),

    // Optimize for production
    ...(!isDevelopment ? [
      // Module concatenation for better tree shaking
      new webpack.optimize.ModuleConcatenationPlugin(),

      // Compress assets
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // Only compress files larger than 10KB
        minRatio: 0.8, // Only compress files that compress well
      }),

      // Analyze bundle size (disabled by default, enable with ANALYZE=true)
      ...(process.env.ANALYZE ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: '../bundle-report.html',
          openAnalyzer: false,
        }),
      ] : []),
    ] : []),

    // Enable hot module replacement in development
    ...(isDevelopment ? [
      new webpack.HotModuleReplacementPlugin(),
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
    // Optimize module resolution
    modules: [
      resolve(__dirname, 'src'),
      'node_modules',
    ],
    // Avoid using symlinks (which can lead to multiple copies of modules)
    symlinks: false,
    // Cache module resolution for better performance
    cacheWithContext: false,
  },

  // Performance hints
  performance: {
    // Show warnings for large bundles
    hints: !isDevelopment ? 'warning' : false,
    // Maximum entry point size (1MB)
    maxEntrypointSize: 1024 * 1024,
    // Maximum asset size (1MB)
    maxAssetSize: 1024 * 1024,
  },

  // Cache
  cache: {
    // Use filesystem cache
    type: 'filesystem',
    buildDependencies: {
      // Invalidate cache when webpack config changes
      config: [__filename],
    },
  },
};
