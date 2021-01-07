/**
 * @license MIT
 * @name SvgChunkWebpackPlugin
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/
import { Compiler } from 'webpack';
import { Svgs, SpriteManifest, Sprites } from './interfaces';
interface NormalModule {
    userRequest: string;
    originalSource: Function;
}
declare class SvgSprite {
    options: {
        svgstoreConfig: Object;
        svgoConfig: Object;
        generateSpritesManifest: Boolean;
        generateSpritesPreview: Boolean;
        filename: string;
    };
    svgOptimizer: any;
    spritesManifest: SpriteManifest;
    spritesList: Array<Sprites>;
    compilation: any;
    PLUGIN_NAME: any;
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
     * Add assets
     * The hook is triggered by webpack
     */
    addAssets(): Promise<void>;
    /**
     * Get entrypoint names from the compilation
     *
     * @return {Array} List of entrypoint names
     */
    getEntryNames(): Array<string>;
    /**
     * Process for each entry

     * @param {String} entryName Entrypoint name
     *
     * @returns {Promise<void>} Resolve the promise when all actions are done
     */
    processEntry(entryName: string): Promise<void>;
    /**
     * Optimize SVG with Svgo
     *
     * @param {String} filepath SVG filepath from Webpack compilation
     *
     * @returns {Promise<Svgs>} Svg name and optimized content with Svgo
     */
    optimizeSvg: (moduleDependency: NormalModule) => Promise<Svgs>;
    /**
     * Get SVGs filtered by entrypoints
     *
     * @param {String} entryName Entrypoint name
     *
     * @returns {Array<Object>} Svgs list
     */
    getSvgsDependenciesByEntrypoint(entryName: string): Array<NormalModule>;
    /**
     * Generate the SVG sprite with Svgstore
     *
     * @param {Array<Svgs>} svgsOptimized SVGs list
     *
     * @returns {String} Sprite string
     */
    generateSprite(svgsOptimized: Array<Svgs>): string;
    /**
     * Create sprite asset with Webpack compilation
     * Expose the manifest file into the assets compilation
     * The file is automatically created by the compiler
     *
     * @param {String} entryName Entrypoint name
     * @param {String} sprite Sprite string
     */
    createSpriteAsset({ entryName, sprite }: {
        entryName: string;
        sprite: string;
    }): void;
    /**
     * Get the filename for the asset compilation
     * Placeholder [name], [hash], [chunkhash], [content] are automatically replaced
     *
     * @param {String} entryName Entrypoint name
     * @param {String} output Sprite content
     *
     * @returns {String} Sprite filename
     */
    getFileName({ entryName, output }: {
        entryName: string;
        output: string;
    }): string;
    /**
     * Get the compilation hash
     *
     * @returns {String} Compilation hash
     */
    getBuildHash(): string;
    /**
     * Get the chunk hash according to the entrypoint content
     *
     * @returns {String} Chunk hash
     */
    getChunkHash(entryName: string): string;
    /**
     * Get the contenthash according to the sprite content
     *
     * @returns {String} Sprite content hash
     */
    getContentHash(output: string): string;
    /**
     * Create sprite manifest with Webpack compilation
     * Expose the manifest file into the assets compilation
     * The file is automatically created by the compiler
     */
    createSpritesManifest(): void;
    /**
     * Create sprites preview
     */
    createSpritesPreview(): void;
    /**
     * Get preview template
     *
     * @returns {String} Template for the preview
     */
    getPreviewTemplate(): string;
}
export = SvgSprite;
