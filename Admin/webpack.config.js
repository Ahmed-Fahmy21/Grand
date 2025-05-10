// webpack.config.js
const { withExpoRouter } = require('expo-router/webpack');

module.exports = function (env, argv) {
  // this sets up expo-router handling for web
  const config = withExpoRouter(env, argv);
  return config;
};
