const { resolve } = require('path');
const packageJson = require('./package.json');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: resolve(__dirname, 'public/icon'),
    name: 'ALT_LAS',
    executableName: 'alt-las',
    appVersion: packageJson.version,
    appCopyright: `Copyright © ${new Date().getFullYear()} ALT_LAS Team`,
    // Optimize for production
    ignore: [
      /^\/\.vscode/,
      /^\/\.github/,
      /^\/\.storybook/,
      /^\/node_modules\/\@types/,
      /^\/src\/.*\.test\.(ts|tsx)$/,
      /^\/src\/.*\.stories\.(ts|tsx)$/,
    ],
    // Set environment variables
    extraResource: [
      resolve(__dirname, 'resources')
    ],
    // Enable OS-specific optimizations
    osxSign: {
      identity: process.env.APPLE_DEVELOPER_IDENTITY,
      hardenedRuntime: true,
      entitlements: resolve(__dirname, 'entitlements.plist'),
      'entitlements-inherit': resolve(__dirname, 'entitlements.plist'),
    },
    win32metadata: {
      CompanyName: 'ALT_LAS Team',
      FileDescription: packageJson.description,
      OriginalFilename: 'alt-las.exe',
      ProductName: 'ALT_LAS',
      InternalName: 'alt-las',
    },
  },
  rebuildConfig: {
    // Native module rebuild configuration
    forceRebuild: false,
    onlyModules: [],
  },
  makers: [
    // Windows installer
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // Update icon URL to point to the new repository path
        iconUrl: 'https://raw.githubusercontent.com/krozenking/ALT_LAS/main/desktop-ui/public/icon.ico',
        setupIcon: resolve(__dirname, 'public/icon.ico'),
        // Add additional configuration
        loadingGif: resolve(__dirname, 'public/installer-loading.gif'),
        setupExe: 'ALT_LAS-Setup.exe',
        noMsi: false, // Generate MSI installer as well
        // Add shortcuts
        shortcutLocations: ['StartMenu', 'Desktop'],
        // Add registry settings
        registryKeys: [
          // Add any registry keys needed for the application
        ],
      },
    },
    // macOS installer
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        // macOS specific options
        options: {
          icon: resolve(__dirname, 'public/icon.icns'),
        },
      },
    },
    // macOS DMG installer
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: resolve(__dirname, 'public/icon.icns'),
        background: resolve(__dirname, 'public/dmg-background.png'),
        format: 'ULFO',
      },
    },
    // Debian installer
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: resolve(__dirname, 'public/icon.png'),
          // Add additional metadata
          productName: 'ALT_LAS',
          maintainer: 'ALT_LAS Team',
          homepage: 'https://github.com/krozenking/ALT_LAS',
          categories: ['Utility', 'Science'],
        },
      },
    },
    // RPM installer
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: resolve(__dirname, 'public/icon.png'),
          // Add additional metadata
          productName: 'ALT_LAS',
          vendor: 'ALT_LAS Team',
          homepage: 'https://github.com/krozenking/ALT_LAS',
          categories: ['Utility', 'Science'],
        },
      },
    },
  ],
  plugins: [
    // Auto unpack native modules
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Webpack configuration
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        // Main process webpack configuration
        mainConfig: resolve(__dirname, './webpack.main.config.js'),
        // Renderer process webpack configuration
        renderer: {
          config: resolve(__dirname, './webpack.renderer.config.js'),
          entryPoints: [
            {
              html: resolve(__dirname, './src/renderer/index.html'),
              js: resolve(__dirname, './src/renderer/index.tsx'),
              name: 'main_window',
              preload: {
                js: resolve(__dirname, './src/preload/index.ts'),
              },
            },
          ],
        },
        // Development server configuration
        devServer: {
          liveReload: true,
          hot: true,
          port: 3001,
        },
        // Optimization for production
        devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
      },
    },
    // Add notarization plugin for macOS
    process.platform === 'darwin' && process.env.APPLE_ID && {
      name: '@electron-forge/plugin-notarize',
      config: {
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        teamId: process.env.APPLE_TEAM_ID,
      },
    },
    // Add publisher plugin for automatic updates
    {
      name: '@electron-forge/plugin-publish',
      config: {
        repository: {
          owner: 'krozenking',
          name: 'ALT_LAS',
        },
        prerelease: true,
        draft: true,
      },
    },
  ].filter(Boolean), // Filter out undefined plugins

  // Add hooks for custom build steps
  hooks: {
    // Hook to run before packaging
    generateAssets: async () => {
      console.log('Generating assets...');
      // Add any custom asset generation here
    },
    // Hook to run after packaging
    postPackage: async () => {
      console.log('Package created successfully!');
      // Add any post-packaging steps here
    },
  },
};
