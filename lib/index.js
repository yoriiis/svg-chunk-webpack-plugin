"use strict";
/**
 * @license MIT
 * @name SvgChunkWebpackPlugin
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
const webpack = require('webpack');
// webpack v4/v5 compatibility:
// https://github.com/webpack/webpack/issues/11425#issuecomment-686607633
const { RawSource } = webpack.sources || require('webpack-sources');
const { util } = require('webpack');
const path = require('path');
const svgstore = require('svgstore');
const Svgo = require('svgo');
const extend = require('extend');
const templatePreview = require('./preview');
const PACKAGE_NAME = require('../package.json').name;
const REGEXP_NAME = /\[name\]/i;
const REGEXP_HASH = /\[hash\]/i;
const REGEXP_CHUNKHASH = /\[chunkhash\]/i;
const REGEXP_CONTENTHASH = /\[contenthash\]/i;
class SvgSprite {
    /**
     * Instanciate the constructor
     * @param {options}
     */
    constructor(options = {}) {
        // This need to find plugin from loader context
        this.PLUGIN_NAME = PACKAGE_NAME;
        /**
         * Optimize SVG with Svgo
         *
         * @param {String} filepath SVG filepath from Webpack compilation
         *
         * @returns {Promise<Svgs>} Svg name and optimized content with Svgo
         */
        this.optimizeSvg = async (moduleDependency) => {
            const source = JSON.parse(moduleDependency.originalSource()._value);
            const svgOptimized = await this.svgOptimizer.optimize(source);
            return {
                name: path.basename(moduleDependency.userRequest, '.svg'),
                content: svgOptimized.data
            };
        };
        const DEFAULTS = {
            filename: '[name].svg',
            svgstoreConfig: {
                cleanDefs: false,
                cleanSymbols: false,
                inline: true,
                svgAttrs: {
                    'aria-hidden': true,
                    style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
                }
            },
            svgoConfig: {
                plugins: [
                    {
                        inlineStyles: {
                            onlyMatchedOnce: false
                        }
                    }
                ]
            },
            generateSpritesManifest: false,
            generateSpritesPreview: false
        };
        this.options = extend(true, DEFAULTS, options);
        this.svgOptimizer = new Svgo(this.options.svgoConfig);
        this.isWebpack4 = false;
        this.spritesManifest = {};
        this.spritesList = [];
        this.hookCallback = this.hookCallback.bind(this);
        this.addAssets = this.addAssets.bind(this);
    }
    /**
     * Apply function is automatically called by the Webpack main compiler
     *
     * @param {Object} compiler The Webpack compiler variable
     */
    apply(compiler) {
        this.isWebpack4 = webpack.version.startsWith('4.');
        const compilerHook = this.isWebpack4 ? 'emit' : 'thisCompilation';
        compiler.hooks[compilerHook].tap('SvgSprite', this.hookCallback);
    }
    /**
     * Hook expose by the Webpack compiler
     *
     * @param {Object} compilation The Webpack compilation variable
     */
    async hookCallback(compilation) {
        this.compilation = compilation;
        if (this.isWebpack4) {
            this.addAssets();
        }
        else {
            // PROCESS_ASSETS_STAGE_ADDITIONAL: Add additional assets to the compilation
            this.compilation.hooks.processAssets.tapPromise({
                name: 'SvgSprite',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
            }, this.addAssets);
        }
    }
    /**
     * Add assets
     * The hook is triggered by webpack
     */
    async addAssets() {
        // Reset value on every new process
        this.spritesManifest = {};
        this.spritesList = [];
        const entryNames = this.getEntryNames();
        await Promise.all(entryNames.map(async (entryName) => await this.processEntry(entryName)));
        if (this.options.generateSpritesManifest) {
            this.createSpritesManifest();
        }
        if (this.options.generateSpritesPreview) {
            this.createSpritesPreview();
        }
    }
    /**
     * Get entrypoint names from the compilation
     *
     * @return {Array} List of entrypoint names
     */
    getEntryNames() {
        return Array.from(this.compilation.entrypoints.keys());
    }
    /**
     * Process for each entry

     * @param {String} entryName Entrypoint name
     *
     * @returns {Promise<void>} Resolve the promise when all actions are done
     */
    async processEntry(entryName) {
        const svgsDependencies = this.getSvgsDependenciesByEntrypoint(entryName);
        const svgsOptimized = await Promise.all(svgsDependencies.map((moduleDependency) => this.optimizeSvg(moduleDependency)));
        const sprite = this.generateSprite(svgsOptimized);
        // TODO: the "smiley-love.svg" disappear inside the sprite
        this.createSpriteAsset({ entryName, sprite });
        // Update sprites manifest
        this.spritesManifest[entryName] = svgsDependencies.map((moduleDependency) => path.relative(this.compilation.options.context, moduleDependency.userRequest));
        this.spritesList.push({
            name: entryName,
            content: sprite,
            svgs: svgsDependencies.map((moduleDependency) => path.basename(moduleDependency.userRequest, '.svg'))
        });
    }
    /**
     * Get SVGs filtered by entrypoints
     *
     * @param {String} entryName Entrypoint name
     *
     * @returns {Array<Object>} Svgs list
     */
    getSvgsDependenciesByEntrypoint(entryName) {
        let listSvgsDependencies = [];
        this.compilation.entrypoints.get(entryName).chunks.forEach((chunk) => {
            this.compilation.chunkGraph.getChunkModules(chunk).forEach((module) => {
                module.dependencies.forEach((dependency) => {
                    const extension = path.extname(dependency.userRequest).substr(1);
                    if (extension === 'svg') {
                        const moduleDependency = this.compilation.moduleGraph.getModule(dependency);
                        listSvgsDependencies.push(moduleDependency);
                    }
                });
            });
        });
        return listSvgsDependencies;
    }
    /**
     * Generate the SVG sprite with Svgstore
     *
     * @param {Array<Svgs>} svgsOptimized SVGs list
     *
     * @returns {String} Sprite string
     */
    generateSprite(svgsOptimized) {
        let sprites = svgstore(this.options.svgstoreConfig);
        svgsOptimized.forEach((svg) => {
            sprites.add(svg.name, svg.content);
        });
        return sprites.toString();
    }
    /**
     * Create sprite asset with Webpack compilation
     * Expose the manifest file into the assets compilation
     * The file is automatically created by the compiler
     *
     * @param {String} entryName Entrypoint name
     * @param {String} sprite Sprite string
     */
    createSpriteAsset({ entryName, sprite }) {
        const output = sprite;
        const filename = this.getFileName({ entryName, output });
        this.compilation.emitAsset(filename, new RawSource(output, false));
    }
    /**
     * Get the filename for the asset compilation
     * Placeholder [name], [hash], [chunkhash], [content] are automatically replaced
     *
     * @param {String} entryName Entrypoint name
     * @param {String} output Sprite content
     *
     * @returns {String} Sprite filename
     */
    getFileName({ entryName, output }) {
        let filename = this.options.filename;
        // Check if the filename option contains the placeholder [name]
        // [name] corresponds to the entrypoint name
        if (REGEXP_NAME.test(filename)) {
            filename = filename.replace('[name]', entryName);
        }
        // Check if the filename option contains the placeholder [hash]
        // [hash] corresponds to the Webpack compilation hash
        if (REGEXP_HASH.test(filename)) {
            filename = filename.replace('[hash]', this.getBuildHash());
        }
        // Check if the filename option contains the placeholder [chunkhash]
        // [chunkhash] corresponds to the hash of the chunk content
        if (REGEXP_CHUNKHASH.test(filename)) {
            filename = filename.replace('[chunkhash]', this.getChunkHash(entryName));
        }
        // Check if the filename option contains the placeholder [contenthash]
        // [contenthash] corresponds to the sprite content hash
        if (REGEXP_CONTENTHASH.test(filename)) {
            filename = filename.replace('[contenthash]', this.getContentHash(output));
        }
        return filename;
    }
    /**
     * Get the compilation hash
     *
     * @returns {String} Compilation hash
     */
    getBuildHash() {
        return this.compilation.hash;
    }
    /**
     * Get the chunk hash according to the entrypoint content
     *
     * @returns {String} Chunk hash
     */
    getChunkHash(entryName) {
        const chunks = this.compilation.entrypoints.get(entryName).chunks;
        // TODO warning DEP_WEBPACK_DEPRECATION_ARRAY_TO_SET_LENGTH
        // DeprecationWarning: Compilation.chunks was changed from Array to Set (using Array property 'length' is deprecated)
        return chunks.length ? chunks[0].hash : '';
    }
    /**
     * Get the contenthash according to the sprite content
     *
     * @returns {String} Sprite content hash
     */
    getContentHash(output) {
        const { hashFunction, hashDigest } = this.compilation.outputOptions;
        return util.createHash(hashFunction).update(output).digest(hashDigest);
    }
    /**
     * Create sprite manifest with Webpack compilation
     * Expose the manifest file into the assets compilation
     * The file is automatically created by the compiler
     */
    createSpritesManifest() {
        const output = JSON.stringify(this.spritesManifest, null, 2);
        this.compilation.emitAsset('sprites-manifest.json', new RawSource(output, false));
    }
    /**
     * Create sprites preview
     */
    createSpritesPreview() {
        this.compilation.emitAsset('sprites-preview.html', new RawSource(this.getPreviewTemplate(), false));
    }
    /**
     * Get preview template
     *
     * @returns {String} Template for the preview
     */
    getPreviewTemplate() {
        return templatePreview(this.getSpritesList());
    }
    /**
     * Get sprites list
     * The list is used to create the preview
     *
     * @returns {Array<Sprites>} Sprites list
     */
    getSpritesList() {
        return this.spritesList;
    }
}
// @ts-ignore
SvgSprite.loader = require.resolve('./loader');
module.exports = SvgSprite;
