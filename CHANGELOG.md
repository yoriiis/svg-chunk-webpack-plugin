# CHANGELOG

## 3.0.0

⚠️ Breaking changes

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
