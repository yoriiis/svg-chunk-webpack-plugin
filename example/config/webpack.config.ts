import fs from 'node:fs';
import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import createConfig from './config.common.ts';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export default (env: any, argv: { mode: string }) => {
	const config = createConfig(env, argv);
	const isProduction = argv.mode === 'production';

	config.output.path = resolveApp('dist');
	config.output.publicPath = '/dist/';

	config.plugins.push(
		new HtmlWebpackPlugin({
			filename: 'home.html',
			template: resolveApp('src/templates/home.html'),
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
