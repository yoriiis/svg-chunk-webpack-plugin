/**
 * @license MIT
 * @name SvgSprite
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
import { Compiler } from 'webpack';
interface Svgs {
    filename: string;
    source: string;
}
declare class SvgSprite {
    options: {
        cleanDefs: Boolean;
        cleanSymbols: Boolean;
        inline: Boolean;
        svgAttrs: Object;
    };
    compilation: any;
    entryNames: Array<string>;
    /**
     * Instanciate the constructor
     * @param {options}
     */
    constructor(options?: {});
    /**
     * Apply function is automatically called by the Webpack main compiler
     *
     * @param {Object} compiler The Webpack compiler variable
     */
    apply(compiler: Compiler): void;
    /**
     * Hook expose by the Webpack compiler
     *
     * @param {Object} compilation The Webpack compilation variable
     */
    hookCallback(compilation: object): void;
    /**
     * Get entrypoint names from the compilation
     *
     * @return {Array} List of entrypoint names
     */
    getEntryNames(): Array<string>;
    /**
     * Process for each entry

     * @param {String} entryName Entrypoint name
     */
    processEntry(entryName: string): void;
    /**
     * Get SVGs filtered by entrypoints
     *
     * @param {String} entryName Entrypoint name
     *
     * @returns {Array<Object>} Svgs list
     */
    getSvgsByEntrypoints(entryName: string): Array<Svgs>;
    /**
     * Create SVG sprite with svgstore
     *
     * @param {Array<Object>} Svgs list
     */
    generateSprite({ svgs }: {
        svgs: Array<Svgs>;
    }): String;
    /**
     * Create asset with Webpack compilation
     *
     * @param {String} entryName Entrypoint name
     * @param {String} sprite Sprite string
     */
    createAsset({ entryName, sprite }: {
        entryName: String;
        sprite: String;
    }): void;
}
export = SvgSprite;
