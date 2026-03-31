const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for expo-router on web
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? process.env.RN_SRC_EXT.split(',').concat(config.resolver.sourceExts || [])
  : config.resolver.sourceExts;

module.exports = config;
