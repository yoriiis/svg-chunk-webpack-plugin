"use strict";
/**
 * @license MIT
 * @name SvgChunkWebpackPlugin
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
const fse = require('fs-extra');
const path = require('path');
const svgstore = require('svgstore');
const Svgo = require('svgo');
const extend = require('extend');
const templatePreview = require('./preview');
class SvgSprite {
    /**
     * Instanciate the constructor
     * @param {options}
     */
    constructor(options = {}) {
        // This need to find plugin from loader context
        this.PLUGIN_NAME = 'svg-sprite';
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
            generateSpritesPreview: false
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
        this.compilation.assets[`sprite-${entryName}.svg`] = {
            source: () => output,
            size: () => output.length
        };
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
