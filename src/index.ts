import {
	type Compiler,
	type Compilation,
	type NormalModule,
	type Chunk,
	type Module,
	type sources
} from 'webpack';
import {
	Svgs,
	SpriteManifest,
	Sprite,
	EntryCache,
	SvgsData,
	PluginOptions,
	SvgstoreConfig
} from './interfaces';
import path = require('path');
const webpack = require('webpack');
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate';
import unTypedSchemaOptions from './schemas/plugin-options.json';

const schemaOptions = unTypedSchemaOptions as Schema;
const svgstore = require('svgstore');
const extend = require('extend');
const templatePreview = require('./preview');

const PACKAGE_NAME = require('../package.json').name;

/**
 * @param {string|number} a First id
 * @param {string|number} b Second id
 * @returns {-1|0|1} Compare result
 */
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

		if (!sprites.length) {
			return;
		}

		// Need to sort (**always**), to have deterministic build
		const eTag = sprites
			.sort((a, b) => a.entryName.localeCompare(b.entryName))
			.map((item) => cache.getLazyHashedEtag(item.source))
			.reduce((result, item) => cache.mergeEtags(result, item));

		if (this.options.generateSpritesManifest) {
			await this.createSpritesManifest({ compilation, cache, eTag, spritesManifest });
		}

		if (this.options.generateSpritesPreview) {
			await this.createSpritesPreview({ compilation, cache, eTag, sprites });
		}
	}

	/**
	 * Get SVGs filtered by entrypoints
	 * @param {Compilation} compilation Webpack compilation
	 * @param {String} entryName Entrypoint name
	 * @returns {Array<NormalModule>} Svgs list
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
					module.buildMeta.sideEffectFree = false;
				}
			}
		});

		return listSvgsDependencies;
	}

	/**
	 * Get SVG data
	 * @param {Compilation} compilation Webpack compilation
	 * @param {String} entryName Entrypoint name
	 * @returns {SvgsData} SVG data (paths, names and content)
	 */
	getSvgsData({
		compilation,
		svgsDependencies
	}: {
		compilation: Compilation;
		svgsDependencies: Array<NormalModule>;
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
		let filename = compilation.getPath(this.options.filename, {
			filename: entryName
		});

		// Check if the filename option contains the placeholder [contenthash]
		// [contenthash] corresponds to the sprite content hash
		if (/\[contenthash\]/i.test(filename)) {
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

	/**
	 * Create sprite manifest with Webpack compilation
	 * Expose the manifest file into the assets compilation
	 * The file is automatically created by the compiler
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
		sprites: any;
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
SvgChunkWebpackPlugin.loader = require.resolve('./loader');

export = SvgChunkWebpackPlugin;
