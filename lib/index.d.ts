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
        outputPath: null | string;
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
     * Process for each entry

     * @param {String} entryName Entrypoint name
     */
    processEntry(entryName: string): void;
    getSvgsByEntrypoints(entryName: string): Array<Svgs>;
    createSprites({ entryName, svgs }: {
        entryName: String;
        svgs: Array<Svgs>;
    }): void;
    /**
     * Get entrypoint names from the compilation
     *
     * @return {Array} List of entrypoint names
     */
    getEntryNames(): Array<string>;
}
export = SvgSprite;
