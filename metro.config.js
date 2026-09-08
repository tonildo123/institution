const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const srcDir = path.resolve(__dirname, 'src');

const config = {
  projectRoot: __dirname,
  watchFolders: [srcDir],
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === '@') {
            return srcDir;
          }
          return path.join(__dirname, `node_modules/${name}`);
        },
      }
    ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
