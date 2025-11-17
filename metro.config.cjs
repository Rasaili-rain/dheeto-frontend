const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = withNativeWind(getDefaultConfig(__dirname), {
  input: "./global.css",
  configPath: "./tailwind.config.cjs",
});

config.resolver = config.resolver || {};
config.resolver.unstable_enablePackageExports = true;
config.transformer.minifierPath = "metro-minify-terser";

module.exports = config;