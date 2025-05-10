module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // لو أنت عامل alias مثلا
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          // هنا أي alias تاني
        }
      }],
      // أي plugins تانية عندك
    ],
  };
};
