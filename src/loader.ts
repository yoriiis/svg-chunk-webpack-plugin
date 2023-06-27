import { optimize, loadConfig } from 'svgo';
import { validate } from 'schema-utils';
import unTypedSchemaOptions from './schemas/loader-options.json' assert { type: 'json' };
import { Schema } from 'schema-utils/declarations/validate.js';
import { LoaderThis, LoaderOptions } from './types.js';
import { PACKAGE_NAME } from './utils.js';

const schemaOptions = unTypedSchemaOptions as Schema;

/**
 * Loader for SVG files
 * Content are not edited, just stringified
 * The plugin create sprites
 */
export default async function SvgChunkWebpackLoader(
	this: LoaderThis,
	content: string
): Promise<string> {
	const options: LoaderOptions = this.getOptions() || {};

	validate(schemaOptions, options, {
		name: 'SvgChunkWebpackPlugin Loader',
		baseDataPath: 'options'
	});

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
		callback(new Error(`${PACKAGE_NAME} exception. ${content}`));
	}

	// Check if the plugin is also imported
	const plugin = compiler.options.plugins.find(
		(plugin: any) => plugin.PLUGIN_NAME && plugin.PLUGIN_NAME === PACKAGE_NAME
	);
	if (typeof plugin === 'undefined') {
		callback(new Error(`${PACKAGE_NAME} requires the corresponding plugin`));
	}

	try {
		const { configFile } = options;
		let config;
		if (typeof configFile === 'string') {
			try {
				config = await loadConfig(configFile, this.context);
			} catch (error) {
				this.emitError(new Error(`Cannot find module ${configFile}`));
			}
		} else if (configFile !== false) {
			config = await loadConfig(null, this.context);
		}

		const result = await optimize(content, { ...config });
		return callback(null, JSON.stringify(result.data));
	} catch (error) {
		return callback(error);
	}
}
