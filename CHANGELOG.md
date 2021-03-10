# CHANGELOG

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
