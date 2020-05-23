const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const SvgSprite = require('../lib/index.js');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		watch: !isProduction,
		entry: {
			home: `${path.resolve(__dirname, './src/js/app-a.js')}`,
			news: `${path.resolve(__dirname, './src/js/app-b.js')}`
		},
		watchOptions: {
			ignored: /node_modules/
		},
		devtool: 'none',
		output: {
			path: path.resolve(__dirname, './dist'),
			publicPath: '/dist/',
			filename: '[name].js'
		},
		module: {
			rules: [
				{
					test: /\.svg$/,
					use: [
						{
							loader: SvgSprite.loader
						},
						{
							loader: 'svgo-loader',
							options: {
								plugins: [
									{
										inlineStyles: {
											onlyMatchedOnce: false
										}
									}
								]
							}
						}
					]
				}
			]
		},
		plugins: [
			new SvgSprite({
				outputPath: path.resolve(__dirname, 'dist/sprites')
			}),
			new ManifestPlugin({
				writeToFileEmit: true,
				fileName: 'manifest.json'
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
				new OptimizeCSSAssetsPlugin({})
			],
			namedChunks: false,
			namedModules: false,
			removeAvailableModules: true,
			removeEmptyChunks: true,
			mergeDuplicateChunks: true,
			occurrenceOrder: true,
			providedExports: false,
			mangleWasmImports: true,
			splitChunks: false
		}
	};
};
