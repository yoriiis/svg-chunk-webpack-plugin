/**
 * @license MIT
 * @name SvgSprite
 * @version 1.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @copyright 2020 Joris DANIEL
 **/

import { Compiler } from 'webpack';
import path = require('path');
import fse = require('fs-extra');
const svgstore = require('svgstore');

interface Svgs {
	filename: string;
	source: string;
}

class SvgSprite {
	options: {
		outputPath: null | string;
	};
	outputPath!: null | string;
	compilation: any;
	entryNames!: Array<string>;

	/**
	 * Instanciate the constructor
	 * @param {options}
	 */
	constructor(options = {}) {
		// Merge default options with user options
		this.options = Object.assign({ outputPath: null }, options);
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
		this.outputPath = this.getOutputPath();
		this.entryNames = this.getEntryNames();
		this.entryNames.map(entryName => this.processEntry(entryName));
	}

	/**
	 * Process for each entry

	 * @param {String} entryName Entrypoint name
	 */
	processEntry(entryName: string): void {
		const svgs = this.getSvgsByEntrypoints(entryName);
		this.createSprites({ entryName, svgs });
	}

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
								source: module._source._value
							});
						}
					});
			});
		});

		return listSvgs;
	}

	createSprites({ entryName, svgs }: { entryName: String; svgs: Array<Svgs> }): void {
		let sprites = '';
		svgs.forEach(svg => {
			sprites += svgstore().add(svg.filename, JSON.parse(svg.source));
		});
		fse.outputFileSync(`${this.outputPath}/${entryName}.svg`, sprites);
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
	 * Check if the outputPath is valid, a string and absolute
	 *
	 * @returns {Boolean} outputPath is valid
	 */
	isValidOutputPath(): boolean {
		return !!(this.options.outputPath && path.isAbsolute(this.options.outputPath));
	}

	/**
	 * Get the output path from Webpack configuation
	 * or from constructor options
	 *
	 * @return {String} The output path
	 */
	getOutputPath(): string | null {
		if (this.isValidOutputPath()) {
			return this.options.outputPath;
		} else {
			return this.compilation.options.output.path || '';
		}
	}
}

// @ts-ignore
SvgSprite.loader = require.resolve('./loader');

export = SvgSprite;
