# CHANGELOG

## 8.1.0

### Updates

- Add compatibility with Rspack ([#44](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/44))
- Transform demo in TypeScript ([#49](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/49))

## 8.0.0

### ⚠️ Breaking changes

- Updates Node.js ([#40](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/40))
  - Minimum supported `Node.js` version is `>=22`
  - SVGO version 4 (see [SVGO releases](https://github.com/svg/svgo/releases/tag/v4.0.0) for breaking changes)
  - Updates other packages
- Add support for `html-webpack-plugin` by @ceonizm ([#37](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/37))
- Fix types and use package inside demo ([#43](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/43))
- Add verify script to check dist content ([#45](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/45))

## 7.0.0

### ⚠️ Breaking changes

- Updates Node.js ([#34](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/34))
  - Minimum supported `Node.js` version is `20.18.0`
  - Fix import assertion compatibility with Node.js 22
  - Updates other packages
  - Migrate ESLint/Prettier to Biome

## 6.0.1

### Fixes

- Improve loader errors by @jvoccia ([#28](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/28))

## 6.0.0

### ⚠️ Breaking changes

- Updates SVGO and Node.js ([#23](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/23))
  - Minimum supported `Node.js` version is `18.19.0`
  - SVGO version 3 (see [SVGO releases](https://github.com/svg/svgo/releases) for breaking changes)
  - Updates other packages

## 5.0.0

### ⚠️ Breaking changes

#### **This package is now pure ESM.** Please read [Sindre Sorhus ESM note](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) for more information

- Migrate to ESM with package `exports` ([#17](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/17))

## 4.0.2

### Updates

- Optimize TypeScript ([#16](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/16))

## 4.0.1

### Updates

- Add funding key in `package.json` ([228155c](https://github.com/yoriiis/svg-chunk-webpack-plugin/commit/228155cd1dadd1592fb63b1e7e6085f63798c53b))

## 4.0.0

### ⚠️ Breaking changes

- Minimum supported `Node.js` version is `16.20.0` ([#12](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/12), [#14](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/14))
- Move SVGO optimization from plugin to loader ([#9](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/9)). The `svgoConfig` parameter on the plugin has been deleted and replaced by the official SVGO config file declared in the loader options. See [SVGO configuration](https://github.com/yoriiis/svg-chunk-webpack-plugin#loader).

### New features

- Add schema validation on plugin and loader options ([#11](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/11))

### Fixes

- Fix compatibility with webpack cache ([#8](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/8))

## 3.0.0

### ⚠️ Breaking changes

SVGO configuration has changed since the `v2.x`. Check the [SVGO changelog](https://github.com/svg/svgo/releases) on the releases page.

- Each plugins must have a `name` property
- New plugin `preset-default` and override rules

### Fixes

- Update SVGO to 2.x ([#5](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/5))

### Updates

- Update packages and config ([#6](https://github.com/yoriiis/svg-chunk-webpack-plugin/pull/6))

## 2.0.1

### Updates

- Remove the default `svgo` config to avoid conflicts when merging config (svgo config object array is malformed).
- Remove the default `svgstore` config to allow user to override them (svgAttrs cannot be overriden otherwise).
- Move the configuration of these package into the webpack configuration for example purpose and to keep the TUs up to date.

## 2.0.0

### ⚠ Breaking changes

- Webpack `v4` no longer supported

### Updates

- Add the webpack `v5` compatibility (`>=5.10.3`)
- Use the `processAssets` compilation hook to create sprites, the `sprites-preview.html` and the `sprites-manifest.json` files
- The plugin requires at least Node.js `10.13.0` (LTS). The `engines.node` is updated in the `package.json`
- Update the Node.js version in the Github Action
- `generateSpritesManifest` and `generateSpritesPreview` can be used even in development mode

### Removes

- Remove the `fs-extra` package.

## 1.0.0

### New features

First release of `SvgChunkWebpackPlugin`
