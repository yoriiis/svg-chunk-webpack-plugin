/**
 * @license MIT
 * @name SvgChunkWebpackPlugin
 * @version 2.0.1
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2021 Joris DANIEL
 **/

import { Compiler } from 'webpack';
const webpack = require('webpack');
import { Svgs, SpriteManifest, Sprites, NormalModule, Chunk } from './interfaces';

// https://github.com/webpack/webpack/issues/11425#issuecomment-686607633
const { RawSource } = webpack.sources;
const { util } = require('webpack');
import path = require('path');
const svgstore = require('svgstore');
const { optimize } = require('svgo');
const extend = require('extend');
const templatePreview = require('./preview');

const PACKAGE_NAME = require('../package.json').name;
const REGEXP_NAME = /\[name\]/i;
const REGEXP_HASH = /\[hash\]/i;
const REGEXP_CHUNKHASH = /\[chunkhash\]/i;
const REGEXP_CONTENTHASH = /\[contenthash\]/i;

class SvgSprite {
	options: {
		filename: string;
		svgstoreConfig: Object;
		svgoConfig: Object;
		generateSpritesManifest: Boolean;
		generateSpritesPreview: Boolean;
	};

	spritesManifest: SpriteManifest;
	spritesList: Array<Sprites>;
	compilation: any;

	// This need to find plugin from loader context
	PLUGIN_NAME = PACKAGE_NAME;

	/**
	 * Instanciate the constructor
	 * @param {options}
	 */
	constructor(options = {}) {
		const DEFAULTS = {
			filename: '[name].svg',
			svgstoreConfig: {
				cleanDefs: false,
				cleanSymbols: false,
				inline: true
			},
			svgoConfig: {},
			generateSpritesManifest: false,
			generateSpritesPreview: false
		};

		this.options = extend(true, DEFAULTS, options);
		this.spritesManifest = {};
		this.spritesList = [];
		this.hookCallback = this.hookCallback.bind(this);
		this.addAssets = this.addAssets.bind(this);
	}

	/**
	 * Apply function is automatically called by the Webpack main compiler
	 * @param {Object} compiler The Webpack compiler variable
	 */
	apply(compiler: Compiler): void {
		compiler.hooks.thisCompilation.tap('SvgSprite', this.hookCallback);
	}

	/**
	 * Hook expose by the Webpack compiler
	 * @param {Object} compilation The Webpack compilation variable
	 */
	async hookCallback(compilation: Object): Promise<void> {
		this.compilation = compilation;

		// PROCESS_ASSETS_STAGE_ADDITIONAL: Add additional assets to the compilation
		this.compilation.hooks.processAssets.tapPromise(
			{
				name: 'SvgChunkWebpackPlugin',
				stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
			},
			this.addAssets
		);
	}

	/**
	 * Add assets
	 * The hook is triggered by webpack
	 */
	async addAssets(): Promise<void> {
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
	 * @return {Array} List of entrypoint names
	 */
	getEntryNames(): Array<string> {
		return Array.from(this.compilation.entrypoints.keys());
	}

	/**
	 * Process for each entry
	 * @param {String} entryName Entrypoint name
	 * @returns {Promise<void>} Resolve the promise when all actions are done
	 */
	async processEntry(entryName: string): Promise<void> {
		const svgsDependencies = this.getSvgsDependenciesByEntrypoint(entryName);
		const svgsOptimized = await Promise.all(
			svgsDependencies.map((moduleDependency: NormalModule) =>
				this.optimizeSvg(moduleDependency)
			)
		);
		const sprite = this.generateSprite(svgsOptimized);

		this.createSpriteAsset({ entryName, sprite });

		// Update sprites manifest
		this.spritesManifest[entryName] = svgsDependencies.map((moduleDependency: NormalModule) =>
			path.relative(this.compilation.options.context, moduleDependency.userRequest)
		);

		this.spritesList.push({
			name: entryName,
			content: sprite,
			svgs: svgsDependencies.map((moduleDependency: NormalModule) =>
				path.basename(moduleDependency.userRequest, '.svg')
			)
		});
	}

	/**
	 * Optimize SVG with Svgo
	 * @param {String} filepath SVG filepath from Webpack compilation
	 * @returns {Promise<Svgs>} Svg name and optimized content with Svgo
	 */
	optimizeSvg = async (moduleDependency: NormalModule): Promise<Svgs> => {
		const source = JSON.parse(moduleDependency.originalSource()._value);
		const svgOptimized = await optimize(source, { ...this.options.svgoConfig });

		return {
			name: path.basename(moduleDependency.userRequest, '.svg'),
			content: svgOptimized.data
		};
	};

	/**
	 * Get SVGs filtered by entrypoints
	 * @param {String} entryName Entrypoint name
	 * @returns {Array<Object>} Svgs list
	 */
	getSvgsDependenciesByEntrypoint(entryName: string): Array<NormalModule> {
		const listSvgsDependencies: Array<NormalModule> = [];

		this.compilation.entrypoints.get(entryName).chunks.forEach((chunk: Chunk) => {
			for (const module of this.compilation.chunkGraph.getChunkModulesIterable(chunk)) {
				if (module.buildInfo && module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN) {
					listSvgsDependencies.push(module);
				}
			}
		});

		return listSvgsDependencies;
	}

	/**
	 * Generate the SVG sprite with Svgstore
	 * @param {Array<Svgs>} svgsOptimized SVGs list
	 * @returns {String} Sprite string
	 */
	generateSprite(svgsOptimized: Array<Svgs>): string {
		const sprites = svgstore(this.options.svgstoreConfig);
		svgsOptimized.forEach((svg: Svgs) => {
			sprites.add(svg.name, svg.content);
		});
		return sprites.toString();
	}

	/**
	 * Create sprite asset with Webpack compilation
	 * Expose the manifest file into the assets compilation
	 * The file is automatically created by the compiler
	 * @param {String} entryName Entrypoint name
	 * @param {String} sprite Sprite string
	 */
	createSpriteAsset({ entryName, sprite }: { entryName: string; sprite: string }): void {
		const output = sprite;
		const filename = this.getFileName({ entryName, output });
		this.compilation.emitAsset(filename, new RawSource(output, false));
	}

	/**
	 * Get the filename for the asset compilation
	 * Placeholder [name], [hash], [chunkhash], [content] are automatically replaced
	 * @param {String} entryName Entrypoint name
	 * @param {String} output Sprite content
	 * @returns {String} Sprite filename
	 */
	getFileName({ entryName, output }: { entryName: string; output: string }): string {
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
	 * @returns {String} Compilation hash
	 */
	getBuildHash(): string {
		return this.compilation.hash;
	}

	/**
	 * Get the chunk hash according to the entrypoint content
	 * @returns {String} Chunk hash
	 */
	getChunkHash(entryName: string): string {
		const chunks = this.compilation.entrypoints.get(entryName).chunks;
		return chunks.length ? chunks[0].hash : '';
	}

	/**
	 * Get the contenthash according to the sprite content
	 * @returns {String} Sprite content hash
	 */
	getContentHash(output: string): string {
		const { hashFunction, hashDigest } = this.compilation.outputOptions;
		return util.createHash(hashFunction).update(output).digest(hashDigest);
	}

	/**
	 * Create sprite manifest with Webpack compilation
	 * Expose the manifest file into the assets compilation
	 * The file is automatically created by the compiler
	 */
	createSpritesManifest(): void {
		const output = JSON.stringify(this.spritesManifest, null, 2);
		this.compilation.emitAsset('sprites-manifest.json', new RawSource(output, false));
	}

	/**
	 * Create sprites preview
	 */
	createSpritesPreview(): void {
		this.compilation.emitAsset(
			'sprites-preview.html',
			new RawSource(templatePreview(this.spritesList), false)
		);
	}
}

// @ts-ignore
SvgSprite.loader = require.resolve('./loader');

export = SvgSprite;
