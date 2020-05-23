/**
 * @license MIT
 * @name SvgSprite
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/

import { Compiler } from 'webpack';
import path = require('path');
const svgstore = require('svgstore');

interface Svgs {
	filename: string;
	source: string;
}

class SvgSprite {
	options: {
		cleanDefs: Boolean;
		cleanSymbols: Boolean;
		inline: Boolean;
		svgAttrs: Object;
	};
	compilation: any;
	entryNames!: Array<string>;

	/**
	 * Instanciate the constructor
	 * @param {options}
	 */
	constructor(options = {}) {
		// Merge default options with user options
		this.options = Object.assign(
			{
				cleanDefs: false,
				cleanSymbols: false,
				inline: true,
				svgAttrs: {
					'aria-hidden': true,
					style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
				}
			},
			options
		);
	}

	/**
	 * Apply function is automatically called by the Webpack main compiler
	 *
	 * @param {Object} compiler The Webpack compiler variable
	 */
	apply(compiler: Compiler): void {
		compiler.hooks.emit.tap('SvgSprite', this.hookCallback.bind(this));
	}

	/**
	 * Hook expose by the Webpack compiler
	 *
	 * @param {Object} compilation The Webpack compilation variable
	 */
	hookCallback(compilation: object): void {
		this.compilation = compilation;
		this.entryNames = this.getEntryNames();
		this.entryNames.map(entryName => this.processEntry(entryName));
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
	processEntry(entryName: string): void {
		const svgs = this.getSvgsByEntrypoints(entryName);
		this.createSprites({ entryName, svgs });
	}

	/**
	 * Get SVGs filtered by entrypoints
	 *
	 * @param {String} entryName Entrypoint name
	 *
	 * @returns {Array<Object>} Svgs list
	 */
	getSvgsByEntrypoints(entryName: string): Array<Svgs> {
		let listSvgs: Array<Svgs> = [];

		this.compilation.entrypoints.get(entryName).chunks.forEach((chunk: any) => {
			chunk.getModules().forEach((module: any) => {
				module.buildInfo &&
					module.buildInfo.fileDependencies &&
					module.buildInfo.fileDependencies.forEach((filepath: string) => {
						const extension = path.extname(filepath).substr(1);
						if (extension === 'svg') {
							listSvgs.push({
								filename: path.basename(filepath, '.svg'),
								source: module.originalSource()._value
							});
						}
					});
			});
		});

		return listSvgs;
	}

	/**
	 * Create SVG sprite with svgstore
	 *
	 * @param {String} entryName Entrypoint name
	 * @param {Array<Object>} Svgs list
	 */
	createSprites({ entryName, svgs }: { entryName: String; svgs: Array<Svgs> }): void {
		let sprites = svgstore({
			cleanDefs: this.options.cleanDefs,
			cleanSymbols: this.options.cleanSymbols,
			inline: this.options.inline,
			svgAttrs: this.options.svgAttrs
		});
		svgs.forEach(svg => {
			sprites.add(svg.filename, JSON.parse(svg.source));
		});

		const output = sprites.toString();
		this.compilation.assets[`${entryName}.svg`] = {
			source: () => output,
			size: () => output.length
		};
	}
}

// @ts-ignore
SvgSprite.loader = require.resolve('./loader');

export = SvgSprite;
