/**
 * @license MIT
 * @name SvgSprite
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
import { Compiler } from 'webpack';
interface Svgs {
    name: string;
    content: string;
}
interface SpriteManifest {
    [key: string]: Array<string>;
}
interface Sprites {
    [key: string]: string;
}
declare class SvgSprite {
    options: {
        svgstoreConfig: Object;
        svgoConfig: Object;
        generateSpritesManifest: Boolean;
        generateSpritesPreview: Boolean;
    };
    svgOptimizer: any;
    spritesManifest: SpriteManifest;
    sprites: Sprites;
    compilation: any;
    entryNames: Array<string>;
    get NAMESPACE(): string;
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
    hookCallback(compilation: object): Promise<void>;
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
    processEntry: (entryName: string) => Promise<void>;
    optimizeSvgs: (filepath: string) => Promise<Svgs>;
    /**
     * Get SVGs filtered by entrypoints
     *
     * @param {String} entryName Entrypoint name
     *
     * @returns {Array<Object>} Svgs list
     */
    getSvgsByEntrypoint(entryName: string): Array<string>;
    /**
     * Create SVG sprite with svgstore
     *
     * @param {Array<Object>} Svgs list
     */
    generateSprite(svgsOptimized: Array<Svgs>): string;
    /**
     * Create asset with Webpack compilation
     *
     * @param {String} entryName Entrypoint name
     * @param {String} sprite Sprite string
     */
    createAsset({ entryName, sprite }: {
        entryName: string;
        sprite: string;
    }): void;
    createSpritesManifest(): void;
    createSpritesPreview(): void;
}
export = SvgSprite;
