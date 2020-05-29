const PACKAGE_NAME = require('../package.json').name;

/**
 * Loader for SVG files
 * Content are not edited, just stringified
 * The plugin create sprites
 */
export = function spriteLoader(this: any, content: string): string {
	const compiler = this._compiler;

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

	return JSON.stringify(content);
};
