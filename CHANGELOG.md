# CHANGELOG

## 2.0.1

### Updates

- TODO

## 2.0.0

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
