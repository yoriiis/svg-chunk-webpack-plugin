/**
 * @license MIT
 * @name SvgSprite
 * @version 5.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @description: SvgSprite create HTML files to serve your webpack bundles. It is very convenient with multiple entrypoints and it works without configuration.
 * {@link https://github.com/yoriiis/chunks-webpack-plugins}
 * @copyright 2020 Joris DANIEL
 **/

var fs = require('fs-extra');
const Svgo = require('svgo');
const path = require('path');
const svgstore = require('svgstore');

exports.loader = content => {
	// debugger
	// return 'module.exports = ' + JSON.stringify(content)
	return JSON.stringify(content);
};

module.exports = class SvgSprite {
	/**
	 * Instanciate the constructor
	 * @param {options}
	 */
	constructor (options = {}) {
		// Merge default options with user options
		this.options = Object.assign({}, options);
		this.manifest = {};
		this.svgo = new Svgo();
	}

	/**
	 * Apply function is automatically called by the Webpack main compiler
	 *
	 * @param {Object} compiler The Webpack compiler variable
	 */
	apply (compiler) {
		compiler.hooks.emit.tap('SvgSprite', this.hookCallback.bind(this));
	}

	/**
	 * Hook expose by the Webpack compiler
	 *
	 * @param {Object} compilation The Webpack compilation variable
	 */
	hookCallback (compilation) {
		this.compilation = compilation;
		this.entryNames = this.getEntryNames();
		this.entryNames.map(entryName => this.processEntry(entryName));
	}

	/**
	 * Process for each entry

	 * @param {String} entryName Entrypoint name
	 */
	processEntry (entryName) {
		const svgs = this.getSvgsByEntrypoints(entryName);
		this.createSprites({ entryName, svgs });
		console.log(entryName, svgs);
	}

	createSprites ({ entryName, svgs }) {
		let sprites = '';
		svgs.forEach(svg => {
			sprites += svgstore().add(svg.filename, JSON.parse(svg.source));
		});
		fs.outputFileSync(`./sprites/${entryName}.svg`, sprites);
	}

	getSvgsByEntrypoints (entryName) {
		const listSvgs = [];

		this.compilation.entrypoints.get(entryName).chunks.forEach(chunk => {
			chunk.getModules().forEach(module => {
				module.buildInfo &&
					module.buildInfo.fileDependencies &&
					module.buildInfo.fileDependencies.forEach(filepath => {
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

	/**
	 * Get entrypoint names from the compilation
	 *
	 * @return {Array} List of entrypoint names
	 */
	getEntryNames () {
		return Array.from(this.compilation.entrypoints.keys());
	}
};
