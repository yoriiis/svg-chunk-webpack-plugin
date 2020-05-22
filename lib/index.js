"use strict";
/**
 * @license MIT
 * @name SvgSprite
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
var path = require("path");
var svgstore = require('svgstore');
var SvgSprite = /** @class */ (function () {
    /**
     * Instanciate the constructor
     * @param {options}
     */
    function SvgSprite(options) {
        if (options === void 0) { options = {}; }
        // Merge default options with user options
        this.options = Object.assign({ outputPath: null }, options);
    }
    /**
     * Apply function is automatically called by the Webpack main compiler
     *
     * @param {Object} compiler The Webpack compiler variable
     */
    SvgSprite.prototype.apply = function (compiler) {
        compiler.hooks.emit.tap('SvgSprite', this.hookCallback.bind(this));
    };
    /**
     * Hook expose by the Webpack compiler
     *
     * @param {Object} compilation The Webpack compilation variable
     */
    SvgSprite.prototype.hookCallback = function (compilation) {
        var _this = this;
        this.compilation = compilation;
        this.outputPath = this.getOutputPath();
        this.entryNames = this.getEntryNames();
        this.entryNames.map(function (entryName) { return _this.processEntry(entryName); });
    };
    /**
     * Process for each entry

     * @param {String} entryName Entrypoint name
     */
    SvgSprite.prototype.processEntry = function (entryName) {
        var svgs = this.getSvgsByEntrypoints(entryName);
        this.createSprites({ entryName: entryName, svgs: svgs });
    };
    SvgSprite.prototype.getSvgsByEntrypoints = function (entryName) {
        var listSvgs = [];
        this.compilation.entrypoints.get(entryName).chunks.forEach(function (chunk) {
            chunk.getModules().forEach(function (module) {
                module.buildInfo &&
                    module.buildInfo.fileDependencies &&
                    module.buildInfo.fileDependencies.forEach(function (filepath) {
                        var extension = path.extname(filepath).substr(1);
                        if (extension === 'svg') {
                            listSvgs.push({
                                filename: path.basename(filepath, '.svg'),
                                source: module._source._value
                            });
                        }
                    });
            });
        });
        return listSvgs;
    };
    SvgSprite.prototype.createSprites = function (_a) {
        var entryName = _a.entryName, svgs = _a.svgs;
        var sprites = svgstore({
            cleanDefs: false,
            cleanSymbols: false,
            inline: true,
            svgAttrs: {
                'aria-hidden': true,
                style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
            }
        });
        svgs.forEach(function (svg) {
            sprites.add(svg.filename, JSON.parse(svg.source));
        });
        var output = sprites.toString();
        this.compilation.assets[entryName + ".svg"] = {
            source: function () { return output; },
            size: function () { return output.length; }
        };
    };
    /**
     * Get entrypoint names from the compilation
     *
     * @return {Array} List of entrypoint names
     */
    SvgSprite.prototype.getEntryNames = function () {
        return Array.from(this.compilation.entrypoints.keys());
    };
    /**
     * Check if the outputPath is valid, a string and absolute
     *
     * @returns {Boolean} outputPath is valid
     */
    SvgSprite.prototype.isValidOutputPath = function () {
        return !!(this.options.outputPath && path.isAbsolute(this.options.outputPath));
    };
    /**
     * Get the output path from Webpack configuation
     * or from constructor options
     *
     * @return {String} The output path
     */
    SvgSprite.prototype.getOutputPath = function () {
        if (this.isValidOutputPath()) {
            return this.options.outputPath;
        }
        else {
            return this.compilation.options.output.path || '';
        }
    };
    return SvgSprite;
}());
// @ts-ignore
SvgSprite.loader = require.resolve('./loader');
module.exports = SvgSprite;
