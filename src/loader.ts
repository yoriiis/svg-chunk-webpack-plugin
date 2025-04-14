import { validate } from 'schema-utils';
import type { Schema } from 'schema-utils/declarations/validate.js';
import { loadConfig, optimize } from 'svgo';
import unTypedSchemaOptions from './schemas/loader-options.json' with { type: 'json' };
import type { LoaderOptions, LoaderThis } from './types.js';
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

	// Check if the plugin is also imported
	const plugin = compiler.options.plugins.find(
		(plugin: any) => plugin.PLUGIN_NAME && plugin.PLUGIN_NAME === PACKAGE_NAME
	);
	if (typeof plugin === 'undefined') {
		return callback(new Error(`${PACKAGE_NAME} requires the corresponding plugin`));
	}

	// Check if content is a SVG file
	if (!content.includes('<svg')) {
		return callback(new Error(`${PACKAGE_NAME} exception. ${content}`));
	}

	// Declare all SVG files as side effect
	// https://github.com/webpack/webpack/issues/12202#issuecomment-745537821
	this._module.factoryMeta = this._module.factoryMeta || {};
	this._module.factoryMeta.sideEffectFree = false;

	// Flag all SVG files to find them more easily on the plugin side
	this._module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN = true;

	try {

		let { configFile, config} = options;
		if( configFile !== undefined) {
			if (typeof configFile === 'string') {
				try {
					config = await loadConfig(configFile, this.context);
				} catch (_error) {
					this.emitError(new Error(`Cannot find module ${configFile}`));
				}
			} else if (configFile) {
				config = await loadConfig(null, this.context);
			}
		} else {
			if( config !== undefined) {
				if (typeof config === 'function') {
					config = config(this.resourcePath);
				}
			} else {
				config = {};
			}
		}

		const result = await optimize(content, { ...config });
		return callback(null, JSON.stringify(result.data));
	} catch (error) {
		return callback(error);
	}
}
