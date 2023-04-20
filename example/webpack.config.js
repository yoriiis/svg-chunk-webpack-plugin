const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SvgChunkWebpackPlugin = require('../lib/index.js');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		context: __dirname,
		watch: !isProduction,
		entry: {
			home: `${path.resolve(__dirname, './src/js/home.js')}`,
			news: `${path.resolve(__dirname, './src/js/news.js')}`
		},
		watchOptions: {
			ignored: /node_modules/
		},
		cache: {
			type: 'filesystem'
		},
		devtool: false,
		output: {
			path: path.resolve(__dirname, './dist'),
			publicPath: '/dist/',
			filename: 'js/[name].js'
		},
		module: {
			rules: [
				{
					test: /\.svg$/,
					use: [
						{
							loader: SvgChunkWebpackPlugin.loader,
							options: {
								configFile: path.resolve(__dirname, './svgo.config.js')
							}
						}
					]
				}
			]
		},
		plugins: [
			new SvgChunkWebpackPlugin({
				filename: 'sprites/[name].svg',
				generateSpritesManifest: true,
				generateSpritesPreview: true,
				svgstoreConfig: {
					svgAttrs: {
						'aria-hidden': true,
						style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
					}
				}
			})
		],
		stats: {
			builtAt: false,
			assets: true,
			colors: true,
			hash: false,
			timings: false,
			chunks: false,
			chunkModules: false,
			modules: false,
			children: false,
			entrypoints: false,
			excludeAssets: /.map$/,
			assetsSort: '!size'
		},
		optimization: {
			minimizer: [
				new TerserJSPlugin({
					extractComments: false
				}),
				new CssMinimizerPlugin()
			],
			chunkIds: 'deterministic', // or 'named'
			removeAvailableModules: true,
			removeEmptyChunks: true,
			mergeDuplicateChunks: true,
			providedExports: false,
			mangleWasmImports: true,
			splitChunks: false
		}
	};
};
