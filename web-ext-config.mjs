// Configuration for the `web-ext` CLI (npm run start / lint / build).
// https://extensionworkshop.com/documentation/develop/web-ext-command-reference/
export default {
  sourceDir: "src",
  artifactsDir: "web-ext-artifacts",

  run: {
    // Launch the locally installed Waterfox instead of Firefox.
    firefox: "/Applications/Waterfox.app/Contents/MacOS/waterfox",
    startUrl: ["about:debugging#/runtime/this-firefox"],

    // Uncomment to reuse a persistent dev profile (create it once in
    // about:profiles) instead of a throwaway one on every run:
    // firefoxProfile: "ff-extrakeys-dev",
    // keepProfileChanges: true,
  },

  build: {
    overwriteDest: true,
  },
};
