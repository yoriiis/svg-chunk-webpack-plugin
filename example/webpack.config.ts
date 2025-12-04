import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import createConfig from './config.common.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env: any, argv: { mode: string }) => {
	const config = createConfig(env, argv);
	const isProduction = argv.mode === 'production';

	// Webpack-specific: Add HtmlWebpackPlugin (required for injectSpritesInTemplates)
	config.plugins.push(
		new HtmlWebpackPlugin({
			filename: 'home.html',
			template: path.resolve(__dirname, './src/templates/home.html'),
			publicPath: '',
			inject: 'head',
			chunks: ['home']
		})
	);

	// Webpack-specific: Add TerserJS minimizer
	if (isProduction) {
		config.optimization.minimizer = [
			new TerserJSPlugin({
				extractComments: false
			})
		];
		config.optimization.mangleWasmImports = true;
	}

	return config;
};
