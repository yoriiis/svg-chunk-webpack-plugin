/**
 * @license MIT
 * @name SvgSprite
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/

import { Compiler } from 'webpack';
import fse = require('fs-extra');
import path = require('path');
const svgstore = require('svgstore');
const Svgo = require('svgo');
const minify = require('html-minifier').minify;
const templatePreview = require('./template-preview');

interface Svgs {
	name: string;
	content: string;
}

// Describe the shape of the Manifest object
interface SpriteManifest {
	[key: string]: Array<string>;
}

interface Sprites {
	name: string;
	content: string;
	svgs: Array<string>;
}

class SvgSprite {
	options: {
		svgstoreConfig: Object;
		svgoConfig: Object;
		generateSpritesManifest: Boolean;
		generateSpritesPreview: Boolean;
	};
	svgOptimizer: any;
	spritesManifest: SpriteManifest;
	sprites: Array<Sprites>;
	compilation: any;
	entryNames!: Array<string>;

	// This need to find plugin from loader context
	get NAMESPACE() {
		return fse.realpathSync(__dirname);
	}

	/**
	 * Instanciate the constructor
	 * @param {options}
	 */
	constructor(options = {}) {
		// Merge default options with user options
		this.options = Object.assign(
			{
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
			},
			options
		);
		this.svgOptimizer = new Svgo(this.options.svgoConfig);
		this.spritesManifest = {};
		this.sprites = [];
	}

	/**
	 * Apply function is automatically called by the Webpack main compiler
	 *
	 * @param {Object} compiler The Webpack compiler variable
	 */
	apply(compiler: Compiler): void {
		compiler.hooks.emit.tapPromise('SvgSprite', this.hookCallback.bind(this));
	}

	/**
	 * Hook expose by the Webpack compiler
	 *
	 * @param {Object} compilation The Webpack compilation variable
	 */
	hookCallback(compilation: object): Promise<void> {
		return new Promise(async resolve => {
			this.compilation = compilation;
			const isDev = this.compilation.options.mode === 'development';
			debugger;
			this.entryNames = this.getEntryNames();
			await Promise.all(
				this.entryNames.map(async entryName => await this.processEntry(entryName))
			);

			if (this.options.generateSpritesManifest && isDev) {
				this.createSpritesManifest();
			}

			if (this.options.generateSpritesPreview && isDev) {
				this.createSpritesPreview();
			}

			resolve();
		});
	}

	/**
	 * Get entrypoint names from the compilation
	 *
	 * @return {Array} List of entrypoint names
	 */
	getEntryNames(): Array<string> {
		return Array.from(this.compilation.entrypoints.keys());
	}

	/**
	 * Process for each entry

	 * @param {String} entryName Entrypoint name
	 */
	processEntry = async (entryName: string): Promise<void> => {
		return new Promise(async resolve => {
			const svgs = this.getSvgsByEntrypoint(entryName);
			const svgsOptimized = await Promise.all(
				svgs.map(filepath => this.optimizeSvgs(filepath))
			);
			const sprite = this.generateSprite(svgsOptimized);
			this.createAsset({ entryName, sprite });

			// Update sprites manifest
			this.spritesManifest[entryName] = svgs.map(filepath =>
				path.relative(this.compilation.options.context, filepath)
			);

			this.sprites.push({
				name: entryName,
				content: sprite,
				svgs: svgs.map(filepath => path.basename(filepath, '.svg'))
			});

			resolve();
		});
	};

	optimizeSvgs = async (filepath: string): Promise<Svgs> => {
		const svgContent = await fse.readFile(filepath, 'utf8');
		const svgOptimized = await this.svgOptimizer.optimize(svgContent);

		return {
			name: path.basename(filepath, '.svg'),
			content: svgOptimized.data
		};
	};

	/**
	 * Get SVGs filtered by entrypoints
	 *
	 * @param {String} entryName Entrypoint name
	 *
	 * @returns {Array<Object>} Svgs list
	 */
	getSvgsByEntrypoint(entryName: string): Array<string> {
		let listSvgs: Array<string> = [];

		this.compilation.entrypoints.get(entryName).chunks.forEach((chunk: any) => {
			chunk.getModules().forEach((module: any) => {
				module.buildInfo &&
					module.buildInfo.fileDependencies &&
					module.buildInfo.fileDependencies.forEach((filepath: string) => {
						const extension = path.extname(filepath).substr(1);
						if (extension === 'svg') {
							listSvgs.push(filepath);
						}
					});
			});
		});

		return listSvgs;
	}

	/**
	 * Create SVG sprite with svgstore
	 *
	 * @param {Array<Object>} Svgs list
	 */
	generateSprite(svgsOptimized: Array<Svgs>): string {
		let sprites = svgstore(this.options.svgstoreConfig);
		svgsOptimized.forEach((svg: Svgs) => {
			sprites.add(svg.name, svg.content);
		});

		return sprites.toString();
	}

	/**
	 * Create asset with Webpack compilation
	 *
	 * @param {String} entryName Entrypoint name
	 * @param {String} sprite Sprite string
	 */
	createAsset({ entryName, sprite }: { entryName: string; sprite: string }): void {
		const output = sprite;
		this.compilation.assets[`${entryName}.svg`] = {
			source: () => output,
			size: () => output.length
		};
	}

	createSpritesManifest() {
		const output = JSON.stringify(this.spritesManifest, null, 2);
		// Expose the manifest file into the assets compilation
		// The file is automatically created by the compiler
		this.compilation.assets['sprites-manifest.json'] = {
			source: () => output,
			size: () => output.length
		};
	}

	createSpritesPreview() {
		fse.outputFileSync(
			`${this.compilation.options.output.path}/sprites-preview.html`,
			minify(templatePreview(this.sprites), {
				collapseWhitespace: true,
				collapseInlineTagWhitespace: true,
				minifyCSS: true
			})
		);
	}
}

// @ts-ignore
SvgSprite.loader = require.resolve('./loader');

export = SvgSprite;
