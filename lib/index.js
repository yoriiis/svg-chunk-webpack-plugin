"use strict";
/**
 * @license MIT
 * @name SvgChunkWebpackPlugin
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
const { util } = require('webpack');
const fse = require('fs-extra');
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
         * Process for each entry
    
         * @param {String} entryName Entrypoint name
         *
         * @returns {Promise<void>} Resolve the promise when all actions are done
         */
        this.processEntry = async (entryName) => {
            return new Promise(async (resolve) => {
                const svgs = this.getSvgsByEntrypoint(entryName);
                const svgsOptimized = await Promise.all(svgs.map(filepath => this.optimizeSvg(filepath)));
                const sprite = this.generateSprite(svgsOptimized);
                this.createSpriteAsset({ entryName, sprite });
                // Update sprites manifest
                this.spritesManifest[entryName] = svgs.map(filepath => path.relative(this.compilation.options.context, filepath));
                this.spritesList.push({
                    name: entryName,
                    content: sprite,
                    svgs: svgs.map(filepath => path.basename(filepath, '.svg'))
                });
                resolve();
            });
        };
        /**
         * Optimize SVG with Svgo
         *
         * @param {String} filepath SVG filepath from Webpack compilation
         *
         * @returns {Promise<Svgs>} Svg name and optimized content with Svgo
         */
        this.optimizeSvg = async (filepath) => {
            const svgContent = await fse.readFile(filepath, 'utf8');
            const svgOptimized = await this.svgOptimizer.optimize(svgContent);
            return {
                name: path.basename(filepath, '.svg'),
                content: svgOptimized.data
            };
        };
        const DEFAULTS = {
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
            generateSpritesPreview: false,
            filename: 'sprites/[name].svg'
        };
        this.options = extend(true, DEFAULTS, options);
        this.svgOptimizer = new Svgo(this.options.svgoConfig);
        this.spritesManifest = {};
        this.spritesList = [];
    }
    /**
     * Apply function is automatically called by the Webpack main compiler
     *
     * @param {Object} compiler The Webpack compiler variable
     */
    apply(compiler) {
        compiler.hooks.emit.tapPromise('SvgSprite', this.hookCallback.bind(this));
    }
    /**
     * Hook expose by the Webpack compiler
     *
     * @param {Object} compilation The Webpack compilation variable
     *
     * @returns {Promise<void>} Resolve the promise when all actions are done
     */
    hookCallback(compilation) {
        return new Promise(async (resolve) => {
            // Reset value on every new process
            this.spritesManifest = {};
            this.spritesList = [];
            this.compilation = compilation;
            const isDev = this.compilation.options.mode === 'development';
            const entryNames = this.getEntryNames();
            await Promise.all(entryNames.map(async (entryName) => await this.processEntry(entryName)));
            if (this.options.generateSpritesManifest && isDev) {
                this.createSpritesManifest();
            }
            if (this.options.generateSpritesPreview && isDev) {
                this.createSpritesPreview();
            }
            resolve();
        });
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
     * Get SVGs filtered by entrypoints
     *
     * @param {String} entryName Entrypoint name
     *
     * @returns {Array<Object>} Svgs list
     */
    getSvgsByEntrypoint(entryName) {
        let listSvgs = [];
        this.compilation.entrypoints.get(entryName).chunks.forEach((chunk) => {
            chunk.getModules().forEach((module) => {
                module.buildInfo &&
                    module.buildInfo.fileDependencies &&
                    module.buildInfo.fileDependencies.forEach((filepath) => {
                        const extension = path.extname(filepath).substr(1);
                        if (extension === 'svg') {
                            listSvgs.push(filepath);
                        }
                    });
            });
        });
        return listSvgs;
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
        this.compilation.assets[filename] = {
            source: () => output,
            size: () => output.length
        };
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
        // [chunkhash] corresponds to the chunk hash
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
     * Get the chunk hash according to the entrypoint
     *
     * @returns {String} Chunk hash
     */
    getChunkHash(entryName) {
        const chunks = this.compilation.entrypoints.get(entryName).chunks;
        return chunks.length ? chunks[0].hash : '';
    }
    /**
     * Get the contenthash according to the sprite content
     *
     * @returns {String} Sprite content hash
     */
    getContentHash(output) {
        const { hashFunction, hashDigest } = this.compilation.outputOptions;
        return util
            .createHash(hashFunction)
            .update(output)
            .digest(hashDigest);
    }
    /**
     * Create sprite manifest with Webpack compilation
     * Expose the manifest file into the assets compilation
     * The file is automatically created by the compiler
     */
    createSpritesManifest() {
        const output = JSON.stringify(this.spritesManifest, null, 2);
        this.compilation.assets['sprites-manifest.json'] = {
            source: () => output,
            size: () => output.length
        };
    }
    /**
     * Create sprites preview
     */
    createSpritesPreview() {
        fse.outputFileSync(`${this.compilation.options.output.path}/sprites-preview.html`, this.getPreviewTemplate());
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
