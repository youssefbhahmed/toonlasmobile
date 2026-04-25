module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // Polyfill `import.meta` for Hermes (required by Zustand 5+)
          unstable_transformImportMeta: true,
        },
      ],
      'nativewind/babel',
    ],
    // react-native-worklets/plugin must be the LAST plugin (required by Reanimated 4)
    plugins: ['react-native-worklets/plugin'],
  };
};
