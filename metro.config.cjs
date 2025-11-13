const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = withNativeWind(getDefaultConfig(__dirname), {
  input: "./global.css",
  configPath: "./tailwind.config.cjs",  // <-- explicitly point
});

config.resolver = config.resolver || {};
config.resolver.unstable_enablePackageExports = true;

module.exports = config;