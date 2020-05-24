"use strict";
/**
 * @license MIT
 * @name SvgSprite
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fse = require("fs-extra");
var path = require("path");
var svgstore = require('svgstore');
var Svgo = require('svgo');
var minify = require('html-minifier').minify;
var templatePreview = require('./template-preview');
var SvgSprite = /** @class */ (function () {
    /**
     * Instanciate the constructor
     * @param {options}
     */
    function SvgSprite(options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        /**
         * Process for each entry
    
         * @param {String} entryName Entrypoint name
         */
        this.processEntry = function (entryName) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var svgs, svgsOptimized, sprite;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    svgs = this.getSvgsByEntrypoint(entryName);
                                    return [4 /*yield*/, Promise.all(svgs.map(function (filepath) { return _this.optimizeSvgs(filepath); }))];
                                case 1:
                                    svgsOptimized = _a.sent();
                                    sprite = this.generateSprite(svgsOptimized);
                                    this.createAsset({ entryName: entryName, sprite: sprite });
                                    // Update sprites manifest
                                    this.spritesManifest[entryName] = svgs.map(function (filepath) {
                                        return path.relative(_this.compilation.options.context, filepath);
                                    });
                                    this.sprites.push({
                                        name: entryName,
                                        content: sprite,
                                        svgs: svgs.map(function (filepath) { return path.basename(filepath, '.svg'); })
                                    });
                                    resolve();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        }); };
        this.optimizeSvgs = function (filepath) { return __awaiter(_this, void 0, void 0, function () {
            var svgContent, svgOptimized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fse.readFile(filepath, 'utf8')];
                    case 1:
                        svgContent = _a.sent();
                        return [4 /*yield*/, this.svgOptimizer.optimize(svgContent)];
                    case 2:
                        svgOptimized = _a.sent();
                        return [2 /*return*/, {
                                name: path.basename(filepath, '.svg'),
                                content: svgOptimized.data
                            }];
                }
            });
        }); };
        // Merge default options with user options
        this.options = Object.assign({
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
            generateSpritesPreview: true
        }, options);
        this.svgOptimizer = new Svgo(this.options.svgoConfig);
        this.spritesManifest = {};
        this.sprites = [];
    }
    Object.defineProperty(SvgSprite.prototype, "NAMESPACE", {
        // This need to find plugin from loader context
        get: function () {
            return fse.realpathSync(__dirname);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Apply function is automatically called by the Webpack main compiler
     *
     * @param {Object} compiler The Webpack compiler variable
     */
    SvgSprite.prototype.apply = function (compiler) {
        compiler.hooks.emit.tapPromise('SvgSprite', this.hookCallback.bind(this));
    };
    /**
     * Hook expose by the Webpack compiler
     *
     * @param {Object} compilation The Webpack compilation variable
     */
    SvgSprite.prototype.hookCallback = function (compilation) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var isDev;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.compilation = compilation;
                        isDev = this.compilation.options.mode === 'development';
                        debugger;
                        this.entryNames = this.getEntryNames();
                        return [4 /*yield*/, Promise.all(this.entryNames.map(function (entryName) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.processEntry(entryName)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 1:
                        _a.sent();
                        if (this.options.generateSpritesManifest && isDev) {
                            this.createSpritesManifest();
                        }
                        if (this.options.generateSpritesPreview && isDev) {
                            this.createSpritesPreview();
                        }
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
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
     * Get SVGs filtered by entrypoints
     *
     * @param {String} entryName Entrypoint name
     *
     * @returns {Array<Object>} Svgs list
     */
    SvgSprite.prototype.getSvgsByEntrypoint = function (entryName) {
        var listSvgs = [];
        this.compilation.entrypoints.get(entryName).chunks.forEach(function (chunk) {
            chunk.getModules().forEach(function (module) {
                module.buildInfo &&
                    module.buildInfo.fileDependencies &&
                    module.buildInfo.fileDependencies.forEach(function (filepath) {
                        var extension = path.extname(filepath).substr(1);
                        if (extension === 'svg') {
                            listSvgs.push(filepath);
                        }
                    });
            });
        });
        return listSvgs;
    };
    /**
     * Create SVG sprite with svgstore
     *
     * @param {Array<Object>} Svgs list
     */
    SvgSprite.prototype.generateSprite = function (svgsOptimized) {
        var sprites = svgstore(this.options.svgstoreConfig);
        svgsOptimized.forEach(function (svg) {
            sprites.add(svg.name, svg.content);
        });
        return sprites.toString();
    };
    /**
     * Create asset with Webpack compilation
     *
     * @param {String} entryName Entrypoint name
     * @param {String} sprite Sprite string
     */
    SvgSprite.prototype.createAsset = function (_a) {
        var entryName = _a.entryName, sprite = _a.sprite;
        var output = sprite;
        this.compilation.assets[entryName + ".svg"] = {
            source: function () { return output; },
            size: function () { return output.length; }
        };
    };
    SvgSprite.prototype.createSpritesManifest = function () {
        var output = JSON.stringify(this.spritesManifest, null, 2);
        // Expose the manifest file into the assets compilation
        // The file is automatically created by the compiler
        this.compilation.assets['sprites-manifest.json'] = {
            source: function () { return output; },
            size: function () { return output.length; }
        };
    };
    SvgSprite.prototype.createSpritesPreview = function () {
        fse.outputFileSync(this.compilation.options.output.path + "/sprites-preview.html", minify(templatePreview(this.sprites), {
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            minifyCSS: true
        }));
    };
    return SvgSprite;
}());
// @ts-ignore
SvgSprite.loader = require.resolve('./loader');
module.exports = SvgSprite;
