// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Increase the max workers and reduce the RAM usage per worker
config.maxWorkers = 2;
config.transformer.minifierConfig = {
  compress: false,
  mangle: false
};

module.exports = config;