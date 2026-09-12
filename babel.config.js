module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
      },
    ],
    // Inline environment variables
    'transform-inline-environment-variables',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
