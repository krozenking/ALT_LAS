const { resolve } = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: resolve(__dirname, 'public/icon'),
    name: 'ALT_LAS',
    executableName: 'alt-las',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://raw.githubusercontent.com/krozenking/ALT_LAS/main/ui-desktop/public/icon.ico',
        setupIcon: resolve(__dirname, 'public/icon.ico'),
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: resolve(__dirname, 'public/icon.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: resolve(__dirname, 'public/icon.png'),
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: resolve(__dirname, './webpack.main.config.js'),
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
      },
    },
  ],
};
