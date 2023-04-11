/**
 * @license MIT
 * @name SvgChunkWebpackPlugin
 * @version 2.0.1
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2021 Joris DANIEL
 **/

import { Compiler } from 'webpack';
import { Svgs, SpriteManifest, Sprites, Sprite, NormalModule, Chunk } from './interfaces';
import path = require('path');
const webpack = require('webpack');

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
		svgstoreConfig: any;
		svgoConfig: any;
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
			svgoConfig: {},
			generateSpritesManifest: false,
			generateSpritesPreview: false
		};

		this.options = extend(true, DEFAULTS, options);

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
	async hookCallback(compilation: any): Promise<void> {
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
	async addAssets(compilation: any): Promise<void> {
		// For better compatibility with future webpack versions
		const RawSource = compilation.compiler.webpack.sources.RawSource;
		const sprites: Array<Sprite> = [];
		const spritesManifest: SpriteManifest = {};
		const spritesList: Array<Sprites> = [];

		const cache = compilation.getCache('SvgChunkWebpackPlugin');
		const entryNames: Array<string> = compilation.entrypoints.keys();

		await Promise.all(
			Array.from(entryNames).map(async (entryName: string) => {
				let svgsDependencies: Array<NormalModule> = [];

				compilation.entrypoints.get(entryName).chunks.forEach((chunk: Chunk) => {
					for (const module of compilation.chunkGraph.getChunkModulesIterable(chunk)) {
						if (module.buildInfo && module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN) {
							svgsDependencies.push(module);
						}
					}
				});

				// Need to sort (**always**), to have deterministic build
				svgsDependencies = svgsDependencies.sort((a: NormalModule, b: NormalModule) => {
					if (a.name < b.name) {
						return -1;
					}

					if (a.name > b.name) {
						return 1;
					}

					return 0;
				});

				const eTag = svgsDependencies
					.map((item) => cache.getLazyHashedEtag(item._source))
					.reduce((result, item) => cache.mergeEtags(result, item));
				const cacheItem = cache.getItemCache(entryName, eTag);

				let output = await cacheItem.getPromise();

				if (!output) {
					const svgsOptimized = await Promise.all(
						svgsDependencies.map((moduleDependency) =>
							this.optimizeSvg(compilation, moduleDependency)
						)
					);

					const sprite = this.generateSprite(svgsOptimized);
					const source = new RawSource(sprite, false);
					const manifestItem = svgsDependencies.map((moduleDependency) =>
						path.relative(compilation.options.context, moduleDependency.userRequest)
					);
					const spriteItem = {
						name: entryName,
						content: source,
						svgs: svgsDependencies.map((moduleDependency) =>
							path.basename(moduleDependency.userRequest, '.svg')
						)
					};

					output = {
						entryName,
						source,
						filename: this.getFilename({ compilation, entryName, sprite }),
						manifestItem,
						spriteItem
					};

					await cacheItem.storePromise(output);
				}

				compilation.emitAsset(output.filename, output.source);

				sprites.push({ entryName, source: output.source });
				spritesManifest[output.entryName] = output.manifestItem;
				spritesList.push(output.spriteItem);
				spritesList.push({
					name: entryName,
					content: output.spriteItem,
					svgs: svgsDependencies.map((moduleDependency: NormalModule) =>
						path.basename(moduleDependency.userRequest, '.svg')
					)
				});
			})
		);

		if (this.options.generateSpritesManifest || this.options.generateSpritesPreview) {
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

				let output = await cacheItem.getPromise();

				if (!output) {
					output = new RawSource(JSON.stringify(spritesManifest, null, 2), false);

					await cacheItem.storePromise(output);
				}

				compilation.emitAsset('sprites-manifest.json', output);
			}

			if (this.options.generateSpritesPreview) {
				const cacheItem = cache.getItemCache('sprites-preview.html', eTag);

				let output = await cacheItem.getPromise();

				if (!output) {
					output = new RawSource(templatePreview(spritesList), false);

					await cacheItem.storePromise(output);
				}

				compilation.emitAsset('sprites-preview.html', output);
			}
		}
	}

	/**
	 * Optimize SVG with Svgo
	 * @param {String} filepath SVG filepath from Webpack compilation
	 * @returns {Promise<Svgs>} Svg name and optimized content with Svgo
	 */
	optimizeSvg = async (compilation: any, moduleDependency: NormalModule): Promise<Svgs> => {
		const source = JSON.parse(
			compilation.codeGenerationResults
				.get(moduleDependency)
				.sources.get('javascript')
				.source()
		);
		const svgOptimized = await optimize(source, { ...this.options.svgoConfig });

		return {
			name: path.basename(moduleDependency.userRequest, '.svg'),
			content: svgOptimized.data
		};
	};

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
			const { hashFunction, hashDigest } = compilation.outputOptions;
			const hash = util.createHash(hashFunction).update(sprite).digest(hashDigest);
			filename = filename.replace('[contenthash]', hash);
		}

		return filename;
	}
}

// @ts-ignore
SvgSprite.loader = require.resolve('./loader');

export = SvgSprite;
