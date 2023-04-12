/**
 * @license MIT
 * @name SvgChunkWebpackPlugin
 * @version 2.0.1
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2021 Joris DANIEL
 **/

import { type Compiler, type Compilation, type NormalModule, type Chunk, type Module, type sources } from 'webpack';
import { Svgs, SpriteManifest, Sprite } from './interfaces';
import path = require('path');
const webpack = require('webpack');

const svgstore = require('svgstore');
const extend = require('extend');
const templatePreview = require('./preview');

const PACKAGE_NAME = require('../package.json').name;
const REGEXP_NAME = /\[name\]/i;
const REGEXP_HASH = /\[hash\]/i;
const REGEXP_CHUNKHASH = /\[chunkhash\]/i;
const REGEXP_CONTENTHASH = /\[contenthash\]/i;

const compareIds = (a: any, b: any) => {
	if (typeof a !== typeof b) {
		return typeof a < typeof b ? -1 : 1;
	}

	if (a < b) return -1;
	if (a > b) return 1;

	return 0;
};

class SvgChunkWebpackPlugin {
	options: {
		filename: string;
		svgstoreConfig: any;
		generateSpritesManifest: boolean;
		generateSpritesPreview: boolean;
	};

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
			generateSpritesManifest: false,
			generateSpritesPreview: false
		};

		this.options = extend(true, DEFAULTS, options);

		this.hookCallback = this.hookCallback.bind(this);
	}

	/**
	 * Apply function is automatically called by the Webpack main compiler
	 * @param {Object} compiler The Webpack compiler variable
	 */
	apply(compiler: Compiler): void {
		compiler.hooks.thisCompilation.tap('SvgChunkWebpackPlugin', this.hookCallback);
	}

	/**
	 * Hook expose by the Webpack compiler
	 * @param {Object} compilation The Webpack compilation variable
	 */
	async hookCallback(compilation: Compilation): Promise<void> {
		// PROCESS_ASSETS_STAGE_ADDITIONAL: Add additional assets to the compilation
		compilation.hooks.processAssets.tapPromise(
			{
				name: 'SvgChunkWebpackPlugin',
				stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
			},
			this.addAssets.bind(this, compilation)
		);
	}

	/**
	 * Add assets
	 * The hook is triggered by webpack
	 */
	async addAssets(compilation: Compilation): Promise<void> {
		// For better compatibility with future webpack versions
		const RawSource = compilation.compiler.webpack.sources.RawSource;

		const cache = compilation.getCache('SvgChunkWebpackPlugin');
		const entryNames = compilation.entrypoints.keys();
		const sprites: Array<Sprite> = [];
		const spritesManifest: SpriteManifest = {};

		await Promise.all(
			Array.from(entryNames).map(async (entryName: string) => {
				const svgsDependencies = this.getSvgsDependenciesByEntrypoint({
					entryName,
					compilation
				});

				// For empty chunks
				if (svgsDependencies.length === 0) {
					return;
				}

				const eTag = svgsDependencies
					.map((item) => cache.getLazyHashedEtag(item.originalSource() as sources.Source))
					.reduce((result, item) => cache.mergeEtags(result, item));
				const cacheItem = cache.getItemCache(entryName, eTag);

				let output = await cacheItem.getPromise<{
					source: sources.RawSource;
					sprite: string;
					filename: string;
					svgPaths: Array<string>;
					svgNames: Array<string>;
				}>();

				if (!output) {
					const svgsData = this.getSvgsData({ compilation, svgsDependencies });
					const sprite = this.generateSprite(svgsData.svgs);
					const source = new RawSource(sprite, false);

					output = {
						source,
						sprite,
						filename: this.getFilename({ compilation, entryName, sprite }),
						svgPaths: svgsData.svgPaths,
						svgNames: svgsData.svgNames
					};

					await cacheItem.storePromise(output);
				}

				compilation.emitAsset(output.filename, output.source);

				sprites.push({
					entryName,
					source: output.source,
					sprite: output.sprite,
					svgs: output.svgNames
				});
				spritesManifest[entryName] = output.svgPaths;
			})
		);

		if (
			sprites.length === 0 &&
			(this.options.generateSpritesManifest || this.options.generateSpritesPreview)
		) {
			return;
		}

		// Need to sort (**always**), to have deterministic build
		const eTag = sprites
			.sort((a, b) => {
				if (a.entryName < b.entryName) {
					return -1;
				}

				if (a.entryName > b.entryName) {
					return 1;
				}

				return 0;
			})
			.map((item) => cache.getLazyHashedEtag(item.source))
			.reduce((result, item) => cache.mergeEtags(result, item));

		if (this.options.generateSpritesManifest) {
			const cacheItem = cache.getItemCache('sprites-manifest.json', eTag);
			let output = await cacheItem.getPromise<sources.RawSource>();

			if (!output) {
				output = new RawSource(JSON.stringify(spritesManifest, null, 2), false);
				await cacheItem.storePromise(output);
			}

			compilation.emitAsset('sprites-manifest.json', output);
		}

		if (this.options.generateSpritesPreview) {
			const cacheItem = cache.getItemCache('sprites-preview.html', eTag);
			let output = await cacheItem.getPromise<sources.RawSource>();

			if (!output) {
				output = new RawSource(templatePreview(sprites), false);
				await cacheItem.storePromise(output);
			}

			compilation.emitAsset('sprites-preview.html', output);
		}
	}

	/**
	 * Get SVG data
	 * @param {String} entryName Entrypoint name
	 * @returns {SvgsData} SVG data (paths, names and content)
	 */
	getSvgsData({
		compilation,
		svgsDependencies
	}: {
		compilation: Compilation;
		svgsDependencies: Array<NormalModule>;
	}) {
		const svgPaths: string[] = [];
		const svgNames: string[] = [];
		const svgs: Svgs[] = [];

		svgsDependencies.forEach((normalModule: NormalModule) => {
			const { userRequest } = normalModule;
			const source = normalModule.originalSource();

			if (source) {
				svgPaths.push(path.relative(compilation.options.context || '', userRequest));
				svgNames.push(path.basename(userRequest, '.svg'));
				svgs.push({
					name: path.basename(userRequest, '.svg'),
					content: JSON.parse(source.source().toString())
				});
			}
		});

		return {
			svgPaths,
			svgNames,
			svgs
		};
	}

	/**
	 * Get SVGs filtered by entrypoints
	 * @param {String} entryName Entrypoint name
	 * @returns {Array<Object>} Svgs list
	 */
	getSvgsDependenciesByEntrypoint({
		compilation,
		entryName
	}: {
		compilation: Compilation;
		entryName: string;
	}): Array<NormalModule> {
		const listSvgsDependencies: Array<NormalModule> = [];

		// When you use module federation you can don't have entries
		const entries = compilation.entrypoints;

		if (!entries || entries.size === 0) {
			return [];
		}

		const entry = entries.get(entryName);

		if (!entry) {
			return [];
		}

		entry.chunks.forEach((chunk: Chunk) => {
			for (const module of compilation.chunkGraph.getOrderedChunkModulesIterable(
				chunk,
				(a: Module, b: Module) => {
					return compareIds(
						a.readableIdentifier(compilation.requestShortener),
						b.readableIdentifier(compilation.requestShortener)
					);
				}
			)) {
				if (module.buildInfo && module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN) {
					listSvgsDependencies.push(module as NormalModule);

					// Mark module as not side effect free after processing in graph
					module.buildMeta.sideEffectFree = false;
				}
			}
		});

		return listSvgsDependencies;
	}

	/**
	 * Generate the SVG sprite with Svgstore
	 * @param {Array<Svgs>} svgs SVGs list
	 * @returns {String} Sprite string
	 */
	generateSprite(svgs: Array<Svgs>): string {
		const sprites = svgstore(this.options.svgstoreConfig);
		svgs.forEach((svg: Svgs) => {
			sprites.add(svg.name, svg.content);
		});
		return sprites.toString();
	}

	/**
	 * Get the filename for the asset compilation
	 * Placeholder [name], [hash], [chunkhash], [content] are automatically replaced
	 * @param {String} entryName Entrypoint name
	 * @param {String} sprite Sprite content
	 * @returns {String} Sprite filename
	 */
	getFilename({
		compilation,
		entryName,
		sprite
	}: {
		compilation: any;
		entryName: string;
		sprite: string;
	}): string {
		let filename = this.options.filename;

		// Check if the filename option contains the placeholder [name]
		// [name] corresponds to the entrypoint name
		if (REGEXP_NAME.test(filename)) {
			filename = filename.replace('[name]', entryName);
		}

		// Check if the filename option contains the placeholder [hash]
		// [hash] corresponds to the Webpack compilation hash
		if (REGEXP_HASH.test(filename)) {
			filename = filename.replace('[hash]', compilation.hash);
		}

		// Check if the filename option contains the placeholder [chunkhash]
		// [chunkhash] corresponds to the hash of the chunk content
		if (REGEXP_CHUNKHASH.test(filename)) {
			const hash = compilation.entrypoints.get(entryName).chunks?.[0].hash || '';
			filename = filename.replace('[chunkhash]', hash);
		}

		// Check if the filename option contains the placeholder [contenthash]
		// [contenthash] corresponds to the sprite content hash
		if (REGEXP_CONTENTHASH.test(filename)) {
			const { util } = compilation.compiler.webpack;
			const { hashFunction, hashDigest, hashDigestLength } = compilation.outputOptions;
			const hash = util
				.createHash(hashFunction)
				.update(sprite)
				.digest(hashDigest)
				.substring(0, hashDigestLength);
			filename = filename.replace('[contenthash]', hash);
		}

		return filename;
	}
}

// @ts-ignore
SvgChunkWebpackPlugin.loader = require.resolve('./loader');

export = SvgChunkWebpackPlugin;
