const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const SvgLoader = require('./svg-loader')
const SvgPlugin = require('./svg-plugin')

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production'
	const splitChunksProd = {
		chunks: 'all',
		name: false
	}

	return {
		watch: !isProduction,
		entry: {
			home: './src/home/config.js',
			about: './src/about/config.js'
		},
		watchOptions: {
			ignored: /node_modules/
		},
		devtool: !isProduction ? 'source-map' : 'none',
		output: {
			path: path.resolve(__dirname, './web/dist'),
			publicPath: '/dist/',
			filename: '[name].js',
			sourceMapFilename: '[file].map'
		},
		module: {
			rules: [
				{
					test: /\.(js|ts)$/,
					include: path.resolve(__dirname, './src'),
					use: [
						{
							loader: 'babel-loader'
						}
					]
				},
				{
					test: /\.css$/,
					include: [path.resolve(__dirname, './src')],
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader'
						},
						{
							loader: 'postcss-loader',
							options: {
								config: {
									path: path.resolve(__dirname, './')
								}
							}
						}
					]
				},
				{
					test: /\.(jpe?g|png|gif|ico)$/i,
					include: path.resolve(__dirname, './src/'),
					exclude: /(node_modules)/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]'
							}
						}
					]
				},
				{
					test: /\.svg$/,
					use: [
						{
							loader: './svg-loader'
						}
					]
				}
				// {
				// 	test: /\.svg$/,
				// 	loader: 'svg-sprite-loader',
				// 	options: {
				// 		symbolId: 'icon-[name]',
				// 		extract: false
				// 	}
				// }
			]
		},
		resolve: {
			extensions: ['.js', '.css'],
			alias: {
				shared: path.resolve(__dirname, './src/shared')
			}
		},
		plugins: [
			new ProgressBarPlugin(),
			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[name].css'
			}),
			new webpack.optimize.ModuleConcatenationPlugin(),
			new SvgPlugin()
		],
		stats: {
			colors: true,
			hash: false,
			timings: true,
			modules: false,
			entrypoints: false,
			excludeAssets: /.map$/,
			assetsSort: '!size'
		},
		optimization: {
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					cache: true,
					parallel: true,
					sourceMap: false,
					terserOptions: {
						extractComments: 'all',
						compress: {
							drop_console: false
						},
						mangle: true
					}
				}),
				new OptimizeCSSAssetsPlugin({})
			],
			namedModules: true,
			removeAvailableModules: true,
			removeEmptyChunks: true,
			mergeDuplicateChunks: true,
			occurrenceOrder: true,
			providedExports: false,
			splitChunks: isProduction ? splitChunksProd : false
		}
	}
}
