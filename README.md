# SvgChunkWebpackPlugin

![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/yoriiis/svg-chunk-webpack-plugin/build.yml?branch=main&style=for-the-badge) [![Coverage Status](https://img.shields.io/coveralls/github/yoriiis/svg-chunk-webpack-plugin?style=for-the-badge)](https://coveralls.io/github/yoriiis/svg-chunk-webpack-plugin?branch=main) [![Npm downloads](https://img.shields.io/npm/dm/svg-chunk-webpack-plugin?color=fb3e44&label=npm%20downloads&style=for-the-badge)](https://npmjs.com/package/svg-chunk-webpack-plugin)

The `svg-chunk-webpack-plugin` creates optimized SVG sprites, according to Webpack's entrypoints. Each sprite contains only the SVG dependencies listed on its entrypoints to improved code splitting, even on SVG files.

The plugin includes the popular [SVGO](https://github.com/svg/svgo) package to generates clean and optimized SVG sprites.

Code splitting is the key to deliver files without any content that is unused by the pages. It already exists for CSS, Javascript and now for SVG files with this plugin.

## When to use this plugin

On multiple page application, each pages must includes only its necessary dependencies. In other words, it must include only the SVG files imported by its entrypoint and all its dependencies.

With reusable components, SVGs are often duplicated on all the project. Now, you can create a global SVG library and every Javascript files can easily import any SVG from this library. Entrypoint dependencies are automatically updated, thanks to the Webpack compilation.

When you work with SVGs exported by design softwares, like Sketch or Illustrator, their source code is never optimized and often contains comments, CSS classes which can create conflicts between them. The plugin automatically cleans all SVGs before creating the sprite.

## Zero config

The plugin works without configuration with already the optimized settings. For advanced usage, see the section [using configuration](#using-a-configuration).

## Installation

The plugin is available as a package with the name of `svg-chunk-webpack-plugin` on [npm](https://www.npmjs.com/package/svg-chunk-webpack-plugin) and [Github](https://github.com/yoriiis/svg-chunk-webpack-plugin).

```bash
npm install svg-chunk-webpack-plugin --save-dev
```

```bash
yarn add svg-chunk-webpack-plugin --dev
```

> **Warning** `svg-chunk-webpack-plugin@5` is ESM only.
>
> **Note** Minimum supported `Node.js` version is `16.20.0` and Webpack `>=5.10.3`.

## Example

The project includes a minimalist example in the `./example` directory. Run the `npm run build:example` command to execute the Webpack example and see the plugin's implementation in action.

## Basic usage

The plugin will generate one SVG sprite for each entrypoints. Sprites are built in the output path directory with all the other assets. Each sprite filename is composed with its entrypoint name (in the example below, that would be `home.svg`).

First, let's add the loader and the plugin to the Webpack configuration.

> **Warning** The loader and the plugin need to works together.

**webpack.config.js**

```javascript
import SvgChunkWebpackPlugin from 'svg-chunk-webpack-plugin';

export default {
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: SvgChunkWebpackPlugin.loader
          }
        ]
      }
    ]
  },
  plugins: [new SvgChunkWebpackPlugin()]
};
```

> **Note**
>
> For more flexibility and better performance, inline SVG files are better. Fewer HTTP requests, CSS properties to change the style, no flickering during the page load.

Then, include the sprite in the wanted pages (_we use Twig in the following example_).

**home.html.twig**

```twig
{{ include 'home.svg' }}
```

Finally, use the SVG with the `<use>` tag, like the following example. Replace `<svg_name>` by the SVG name (without the extension).

**home.html.twig**

```html
<svg>
  <use href="#<svg_name>"></use>
</svg>
```

---

## Using a configuration

The loader and the plugin accepts configuration to override the default behavior.

### Loader

The loader configuration allow to personalize the SVGO configuration. SVGO optimization is executed during the loader process to optimize build performance.

#### `configFile`

Type:

```ts
type configFile = string | boolean;
```

Default: `path.resolve(opts.root, 'svgo.config.js')`

Tells the loader whether to load the custom [SVGO configuration](https://github.com/svg/svgo#configuration). Custom configuration can be disabled with `configFile: false`.

**webpack.config.js**

```js
export default {
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: SvgChunkWebpackPlugin.loader,
        options: {
          configFile: './path/svgo.config.js'
        }
      }
    ]
  }
};
```

#### SVGO custom configuration

SVGO have a default preset to optimize SVG files. See [how to configure svgo](https://github.com/svg/svgo#configuration) for details.

**svgo.config.js**

```js
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          inlineStyles: {
            onlyMatchedOnce: false
          },
          removeViewBox: false
        }
      }
    },
    {
      name: 'convertStyleToAttrs'
    }
  ]
};
```

### Plugin

The plugin configuration allow to personalize sprite settings.

### `filename`

Type:

```ts
type filename = string;
```

Default: `'[name].svg'`

Tells the plugin whether to personalize the default sprite filename. The placeholder `[name]` is automatically replaced by entrypoints names.

**webpack.config.js**

```javascript
export default {
  plugins: [
    new SvgChunkWebpackPlugin({
      filename: '[name].svg'
    })
  ]
};
```

> **Note** The `filename` parameter is compatible with Webpack caching placeholders, see the section [caching](#caching).

### `svgstoreConfig`

Type:

```ts
type svgstoreConfig = object;
```

Default: `{ cleanDefs: false, cleanSymbols: false, inline: true }`

SVG sprites are built using the `svgstore` package. Update the parameters according to your needs from the options list available on the [svgstore](https://github.com/svgstore/svgstore#options) documentation.

**webpack.config.js**

```javascript
export default {
  plugins: [
    new SvgChunkWebpackPlugin({
      svgstoreConfig: {
        svgAttrs: {
          'aria-hidden': true,
          style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
        }
      }
    })
  ]
};
```

> **Note** To avoid LinearGradient conflicts, avoid the `display: none` property which breaks SVG definitions.

### `generateSpritesManifest`

Type:

```ts
type generateSpritesManifest = boolean;
```

Default: `false`

Tells the plugin whether to generate the `sprites-manifest.json`. The JSON file contains the list of all SVG included by entrypoints.

**webpack.config.js**

```javascript
export default {
  plugins: [
    new SvgChunkWebpackPlugin({
      generateSpritesManifest: true
    })
  ]
};
```

### `generateSpritesPreview`

Type:

```ts
type generateSpritesPreview = boolean;
```

Default: `false`

Tells the plugin whether to generate the `sprites-preview.html`. The HTML preview contains a display list of all SVG included by entrypoints with the SVG overviews and the names. See the [sprites preview](./example/sprites-preview.png) of the example.

**webpack.config.js**

```javascript
export default {
  plugins: [
    new SvgChunkWebpackPlugin({
      generateSpritesPreview: true
    })
  ]
};
```

---

## Caching

With [webpack caching](https://webpack.js.org/guides/caching), several placeholders are available depending on your needs. With SVG inlined in the page, this option is not useful.

> **Note**
>
> The `[contenthash]` placeholder is the best option because it depends on the sprite content. Cache placeholders are expensive in build performance, use it only in production mode.

### `[contenthash]`

The `[contenthash]` placeholder will add a unique hash based on the content of the sprite. When the sprite's content changes, the hash will change as well.

**webpack.config.js**

```javascript
export default {
  plugins: [
    new SvgChunkWebpackPlugin({
      filename: '[name].[contenthash].svg'
    })
  ]
};
```

### `[fullhash]`

The `[fullhash]` placeholder will add a unique hash generated for every build. When the compilation build is updated, the hash will change as well.

**webpack.config.js**

```javascript
export default {
  plugins: [
    new SvgChunkWebpackPlugin({
      filename: '[name].[fullhash].svg'
    })
  ]
};
```

## License

`svg-chunk-webpack-plugin` is licensed under the [MIT License](http://opensource.org/licenses/MIT).

Created with ♥ by [@yoriiis](http://github.com/yoriiis).
