const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
		devtool: isProduction ? false : 'nosources-source-map',
		output: {
			path: path.resolve(__dirname, './dist'),
			publicPath: '/dist/',
			filename: `js/[name]${isProduction ? '.[contenthash]' : ''}.js`
		},
		module: {
			rules: [
				// {
				// 	test: /\.css$/,
				// 	use: [MiniCssExtractPlugin.loader, { loader: 'css-loader' }]
				// },
				{
					test: /\.svg$/,
					use: [
						{
							loader: SvgChunkWebpackPlugin.loader
						}
					]
				}
			]
		},
		plugins: [
			new SvgChunkWebpackPlugin({
				filename: `sprites/[name]${isProduction ? '.[contenthash]' : ''}.svg`,
				generateSpritesManifest: true,
				generateSpritesPreview: true,
				svgstoreConfig: {
					svgAttrs: {
						'aria-hidden': true,
						style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
					}
				},
				svgoConfig: {
					plugins: [
						{
							inlineStyles: {
								onlyMatchedOnce: false
							}
						},
						{
							removeViewBox: false
						}
					]
				}
			})
			// new MiniCssExtractPlugin({
			// 	filename: 'css/[name].css',
			// 	chunkFilename: 'css/[name].css'
			// })
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
