import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rspack } from '@rspack/core';
import createConfig from './config.common.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env: any, argv: { mode: string }) => {
	const config = createConfig(env, argv);

	// Rspack-specific: Use separate output directory
	config.output.path = path.resolve(__dirname, './dist-rspack');
	config.output.publicPath = '/dist-rspack/';

	// Rspack-specific: Add HtmlRspackPlugin
	config.plugins.push(
		new rspack.HtmlRspackPlugin({
			filename: 'home.html',
			template: path.resolve(__dirname, './src/templates/home.html'),
			inject: 'head',
			chunks: ['home']
		})
	);

	// Rspack uses its built-in minimizers (SwcJs, LightningCss) automatically in production mode
	return config;
};
