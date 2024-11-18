import path from 'path';
import extend from 'extend';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate.js';
import svgstore from 'svgstore';
import webpack from 'webpack';
import type { Chunk, Compilation, Compiler, Module, NormalModule, sources } from 'webpack';
import templatePreview from './preview.js';
import unTypedSchemaOptions from './schemas/plugin-options.json' with { type: 'json' };
import {
	EntryCache,
	PluginOptions,
	Sprite,
	SpriteManifest,
	Svgs,
	SvgsData,
	SvgstoreConfig
} from './types.js';
import { PACKAGE_NAME, esmResolve } from './utils.js';

const schemaOptions = unTypedSchemaOptions as Schema;

/**
 * @param {string|number} a First id
 * @param {string|number} b Second id
 * @returns {-1|0|1} Compare result
 */
const compareIds = (a: string | number, b: string | number) => {
	if (typeof a !== typeof b) {
		return typeof a < typeof b ? -1 : 1;
	}

	if (a < b) {
		return -1;
	}
	if (a > b) {
		return 1;
	}

	return 0;
};

class SvgChunkWebpackPlugin {
	options: {
		filename: string;
		svgstoreConfig: SvgstoreConfig;
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
		const DEFAULTS: PluginOptions = {
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

		validate(schemaOptions, this.options, {
			name: 'SvgChunkWebpackPlugin',
			baseDataPath: 'options'
		});

		this.hookCallback = this.hookCallback.bind(this);
	}

	/**
	 * Apply function is automatically called by the Webpack main compiler
	 * @param {Compiler} compiler The Webpack compiler variable
	 */
	apply(compiler: Compiler): void {
		compiler.hooks.thisCompilation.tap('SvgChunkWebpackPlugin', this.hookCallback);
	}

	/**
	 * Hook expose by the Webpack compiler
	 * @async
	 * @param {Compilation} compilation The Webpack compilation variable
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
	 * @async
	 * @param {Compilation} compilation Webpack compilation
	 * @returns {Promise<void>}
	 */
	async addAssets(compilation: Compilation): Promise<void> {
		// For better compatibility with future webpack versions
		const RawSource = compilation.compiler.webpack.sources.RawSource;

		const cache = compilation.getCache('SvgChunkWebpackPlugin');
		const entryNames = compilation.entrypoints.keys();
		const sprites: Sprite[] = [];
		const spritesManifest: SpriteManifest = {};

		await Promise.all(
			Array.from(entryNames).map(async (entryName: string) => {
				const svgsDependencies = this.getSvgsDependenciesByEntrypoint({
					compilation,
					entryName
				});

				// For empty chunks
				if (!svgsDependencies.length) {
					return;
				}

				const eTag = svgsDependencies
					.map((item) => cache.getLazyHashedEtag(item.originalSource() as sources.Source))
					.reduce((result, item) => cache.mergeEtags(result, item));

				const cacheItem = cache.getItemCache(entryName, eTag);

				let output: EntryCache = await cacheItem.getPromise();
				if (!output) {
					const svgsData = this.getSvgsData({
						compilation,
						svgsDependencies
					});
					const sprite = this.generateSprite(svgsData.svgs);
					const source = new RawSource(sprite, false);

					output = {
						source,
						sprite,
						filename: this.getFilename({
							compilation,
							entryName,
							sprite
						}),
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

		if (!sprites.length) {
			return;
		}

		// Need to sort (**always**), to have deterministic build
		const eTag = sprites
			.sort((a, b) => a.entryName.localeCompare(b.entryName))
			.map((item) => cache.getLazyHashedEtag(item.source))
			.reduce((result, item) => cache.mergeEtags(result, item));

		if (this.options.generateSpritesManifest) {
			await this.createSpritesManifest({
				compilation,
				cache,
				eTag,
				spritesManifest
			});
		}

		if (this.options.generateSpritesPreview) {
			await this.createSpritesPreview({
				compilation,
				cache,
				eTag,
				sprites
			});
		}
	}

	/**
	 * Get SVGs filtered by entrypoints
	 * @param {Object} options
	 * @param {Compilation} options.compilation Webpack compilation
	 * @param {String} options.entryName Entrypoint name
	 * @returns {NormalModule[]} Svgs list
	 */
	getSvgsDependenciesByEntrypoint({
		compilation,
		entryName
	}: {
		compilation: Compilation;
		entryName: string;
	}): NormalModule[] {
		const listSvgsDependencies: NormalModule[] = [];

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
			const modules = compilation.chunkGraph.getOrderedChunkModulesIterable(
				chunk,
				(a: Module, b: Module) =>
					compareIds(
						a.readableIdentifier(compilation.requestShortener),
						b.readableIdentifier(compilation.requestShortener)
					)
			);
			for (const module of modules) {
				if (module.buildInfo && module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN) {
					listSvgsDependencies.push(module as NormalModule);

					// Mark module as not side effect free after processing in graph
					if (module.buildMeta) {
						module.buildMeta.sideEffectFree = false;
					}
				}
			}
		});

		return listSvgsDependencies;
	}

	/**
	 * Get SVG data
	 * @param {Compilation} options
	 * @param {Compilation} options.compilation Webpack compilation
	 * @param {String} options.entryName Entrypoint name
	 * @returns {SvgsData} SVG data (paths, names and content)
	 */
	getSvgsData({
		compilation,
		svgsDependencies
	}: {
		compilation: Compilation;
		svgsDependencies: NormalModule[];
	}): SvgsData {
		const svgPaths: SvgsData['svgPaths'] = [];
		const svgNames: SvgsData['svgNames'] = [];
		const svgs: SvgsData['svgs'] = [];

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
	 * Generate the SVG sprite with Svgstore
	 * @param {Svgs[]} svgs SVGs list
	 * @returns {String} Sprite string
	 */
	generateSprite(svgs: Svgs[]): string {
		const sprites = svgstore(this.options.svgstoreConfig);
		svgs.forEach((svg: Svgs) => {
			sprites.add(svg.name, svg.content);
		});
		return sprites.toString();
	}

	/**
	 * Get the filename for the asset compilation
	 * Placeholder [name], [hash], [chunkhash], [content] are automatically replaced
	 * @param {Object} options
	 * @param {Compilation} options.compilation Webpack compilation
	 * @param {String} options.entryName Entrypoint name
	 * @param {String} options.sprite Sprite content
	 * @returns {String} Sprite filename
	 */
	getFilename({
		compilation,
		entryName,
		sprite
	}: {
		compilation: Compilation;
		entryName: string;
		sprite: string;
	}): string {
		let filename = this.options.filename;

		// Check if the filename option contains the placeholder [name]
		// [name] corresponds to the entrypoint name
		if (/\[name\]/i.test(filename)) {
			filename = filename.replace('[name]', entryName);
		}

		// Check if the filename option contains the placeholder [fullhash]
		// [fullhash] corresponds to the Webpack compilation hash
		if (/\[fullhash\]/i.test(filename)) {
			const { hashDigestLength } = compilation.outputOptions;
			const hash = compilation.fullHash ? compilation.fullHash.substring(0, hashDigestLength) : '';
			filename = filename.replace('[fullhash]', hash);
		}

		// Check if the filename option contains the placeholder [contenthash]
		// [contenthash] corresponds to the sprite content hash
		if (/\[contenthash\]/i.test(filename)) {
			const { util } = compilation.compiler.webpack;
			const { hashFunction, hashDigest, hashDigestLength } = compilation.outputOptions;
			let hash = '';
			if (hashFunction) {
				hash = util
					.createHash(hashFunction)
					.update(sprite)
					.digest(hashDigest)
					// @ts-ignore
					.substring(0, hashDigestLength);
			}
			filename = filename.replace('[contenthash]', hash);
		}

		return filename;
	}

	/**
	 * Create sprite manifest with Webpack compilation
	 * Expose the manifest file into the assets compilation
	 * The file is automatically created by the compiler
	 * @async
	 * @param {Object} options
	 * @param {Compilation} options.compilation Webpack compilation
	 * @param {any} options.cache Webpack cache
	 * @param {any} options.eTag Webpack eTag
	 * @param {SpriteManifest} options.spritesManifest ETag
	 * @returns {String} Sprite filename
	 */
	async createSpritesManifest({
		compilation,
		cache,
		eTag,
		spritesManifest
	}: {
		compilation: Compilation;
		cache: any;
		eTag: any;
		spritesManifest: SpriteManifest;
	}): Promise<void> {
		const RawSource = compilation.compiler.webpack.sources.RawSource;

		const cacheItem = cache.getItemCache('sprites-manifest.json', eTag);
		let output: sources.RawSource = await cacheItem.getPromise();

		if (!output) {
			output = new RawSource(JSON.stringify(spritesManifest, null, 2), false);
			await cacheItem.storePromise(output);
		}

		compilation.emitAsset('sprites-manifest.json', output);
	}

	/**
	 * Create sprites preview
	 * @async
	 * @param {Object} options
	 * @param {Compilation} options.compilation Webpack compilation
	 * @param {any} options.cache Webpack cache
	 * @param {any} options.eTag Webpack eTag
	 * @param {Sprite[]} options.sprites Sprites
	 * @returns {String} Sprite filename
	 */
	async createSpritesPreview({
		compilation,
		cache,
		eTag,
		sprites
	}: {
		compilation: Compilation;
		cache: any;
		eTag: any;
		sprites: Sprite[];
	}): Promise<void> {
		const RawSource = compilation.compiler.webpack.sources.RawSource;

		const cacheItem = cache.getItemCache('sprites-preview.html', eTag);
		let output: sources.RawSource = await cacheItem.getPromise();

		if (!output) {
			output = new RawSource(templatePreview(sprites), false);
			await cacheItem.storePromise(output);
		}

		compilation.emitAsset('sprites-preview.html', output);
	}
}

// @ts-ignore
SvgChunkWebpackPlugin.loader = esmResolve('./loader.js');

export default SvgChunkWebpackPlugin;
