# SvgSprite

The SvgSpritePlugin create optimized sprites of SVG according to Webpack entrypoints. Each sprites contains only SVG dependencies list on their entrypoint to improve code splitting, even on SVG files.

The plugin includes the popular [SVGO](https://github.com/svg/svgo) package with the optimized settings to generate clean and optimized SVG sprites.

Code splitting is the key to deliver assets without unused content. It's already exist for CSS, Javascript and now for SVG with this plugin.

## Why use this plugin?

With multiple pages application, each pages must embed only necessary dependencies, including only the SVG files imported on the entrypoint.

With reusable components, SVG are often duplicated all over the project. Now, you can create a global SVG library and every Javascript can import SVG on this library and entrypoint dependencies are uptodate.

With the `sprite-manifest.json` file, you known exactly what SVG are embed in entrypoints.

With sprite preview, the plugin create for you an HTML file with all embed SVGs grouped by entrypoints.

## Zero config

The `svg-sprite` works without configuration with optimal settings. For advanced usage, see the section [using configuration](#using-configuration).

## Installation

The plugin is available as the `svg-sprite` package name on [npm](https://www.npmjs.com/package/svg-sprite) and [Github](https://github.com/yoriiis/svg-sprite).

```bash
npm i --save-dev svg-sprite
```

```bash
yarn add --dev svg-sprite
```

## Environment

`SvgSprite` was built for Node.js `>=8.11.2` and Webpack `>=4.x`.

## Example

The project includes a minimalist example in the `./example` directory. Run the `npm run build:example` command to execute the Webpack example and see SvgSprite implementation in action.

## Using a configuration

You can pass configuration options to `SvgSprite`. Allowed values are as follows:

### `svgoConfig`

`Object`

Tells the plugin whether to personalize the default settings for [svgo](https://github.com/svg/svgo). Update the config as you want with plugins available on the svgo ocumentation, according to your needs.

> The `onlyMatchedOnce` property allows to replace all occurences of CSS classes in HTML attributes, not only the first.

```javascript
new SvgSprite({
  svgoConfig: {
    plugins: [
      {
        inlineStyles: {
          onlyMatchedOnce: false
        }
      }
    ]
  }
});
```

### `svgstoreConfig`

`Object`

Tells the plugin whether to personalize the default settings for [svgstore](https://github.com/svgstore/svgstore).

> Sprites contains already minimal inline style to hide the sprite on the page with full support with all SVG features. To avoid LinearGradient conflict, avoid the `display: none` property which break SVG defs.

```javascript
new SvgSprite({
  svgstoreConfig: {
    cleanDefs: false,
    cleanSymbols: false,
    inline: true,
    svgAttrs: {
      "aria-hidden": true,
      style: "position: absolute; width: 0; height: 0; overflow: hidden;"
    }
  }
});
```

### `generateSpritesManifest`

`Boolean = false`

Tells the plugin whether to generate the `sprites-manifest.json`. The JSON file contains the list of all SVG embed by entrypoints.

> The file is only generate when the Webpack mode is set to `development`.

```javascript
new SvgSprite({
  generateSpritesManifest: false
});
```

### `generateSpritesPreview`

`Boolean = false`

Tells the plugin whether to generate the `sprites-preview.html`. The HTML preview contains the list of all SVG embed by entrypoints with an the SVG overview and the name.

> The file is only generate when the Webpack mode is set to `development`.

```javascript
new SvgSprite({
  generateSpritesManifest: false
});
```

## Licence

SvgSprite is licensed under the [MIT License](http://opensource.org/licenses/MIT).

Created with ♥ by [@yoriiis](http://github.com/yoriiis).
