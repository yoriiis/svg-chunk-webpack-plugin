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

	config.output.path = path.resolve(__dirname, './dist');
	config.output.publicPath = '/dist/';

	config.plugins.push(
		new HtmlWebpackPlugin({
			filename: 'home.html',
			template: path.resolve(__dirname, './src/templates/home.html'),
			publicPath: '',
			inject: 'head',
			chunks: ['home']
		})
	);

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
