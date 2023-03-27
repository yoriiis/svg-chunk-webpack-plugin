const { optimize, loadConfig } = require('svgo');
const PACKAGE_NAME = require('../package.json').name;

/**
 * Loader for SVG files
 * Content are not edited, just stringified
 * The plugin create sprites
 */
async function loader(content: string) {
	const { configFile } = this.getOptions();
	let config;
	if (typeof configFile === 'string') {
		config = await loadConfig(configFile, this.context);
	} else if (configFile !== false) {
		config = await loadConfig(null, this.context);
	}

	const result = optimize(content, { path: this.resourcePath, ...config });
	return JSON.stringify(result.data);
}

export = function spriteLoader(this: any, content: string): Promise<string> {
	const compiler = this._compiler;
	const callback = this.async();

	// Declare all SVG files as side effect
	// https://github.com/webpack/webpack/issues/12202#issuecomment-745537821
	this._module.factoryMeta = this._module.factoryMeta || {};
	this._module.factoryMeta.sideEffectFree = false;

	// Flag all SVG files to find them more easily on the plugin side
	this._module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN = true;

	// Check if content is a SVG file
	if (!content.includes('<svg')) {
		throw new Error(`${PACKAGE_NAME} exception. ${content}`);
	}

	// Check if the plugin is also imported
	const plugin = compiler.options.plugins.find(
		(plugin: any) => plugin.PLUGIN_NAME && plugin.PLUGIN_NAME === PACKAGE_NAME
	);
	if (typeof plugin === 'undefined') {
		throw new Error(`${PACKAGE_NAME} requires the corresponding plugin`);
	}

	return loader
		.call(this, content)
		.then((result) => callback(null, result))
		.catch((error) => callback(error));
};
