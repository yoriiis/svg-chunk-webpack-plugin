import fs from 'node:fs';
import path from 'node:path';
import SvgChunkWebpackPlugin from 'svg-chunk-webpack-plugin';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export default function createConfig(_env: any, argv: { mode: string }): any {
	const isProduction = argv.mode === 'production';

	return {
		context: appDirectory,
		watch: !isProduction,
		entry: {
			home: `${resolveApp('src/js/home.ts')}`,
			news: `${resolveApp('src/js/news.ts')}`
		},
		watchOptions: {
			ignored: /node_modules/
		},
		// cache: {
		// 	type: 'filesystem'
		// },
		devtool: false,
		output: {
			filename: 'js/[name].js'
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					include: [resolveApp('src'), resolveApp('../')],
					use: [
						{
							loader: 'babel-loader',
							options: {
								extends: resolveApp('config/babel.config.js')
							}
						}
					]
				},
				{
					test: /\.ts$/,
					include: [resolveApp('src'), resolveApp('../')],
					use: [
						{
							loader: 'babel-loader',
							options: {
								extends: resolveApp('config/babel.config.js')
							}
						},
						{
							loader: 'ts-loader'
						}
					]
				},
				{
					test: /\.svg$/,
					use: [
						{
							loader: SvgChunkWebpackPlugin.loader,
							options: {
								configFile: resolveApp('config/svgo.config.js')
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
				},
				injectSpritesInTemplates: true // Requires HtmlWebpackPlugin or HtmlRspackPlugin
			})
		],
		resolve: {
			extensions: ['.js', '.ts', '.css'],
			extensionAlias: {
				'.js': ['.ts', '.js']
			},
			modules: [resolveApp('node_modules')]
		},
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
			chunkIds: 'deterministic',
			removeAvailableModules: true,
			removeEmptyChunks: true,
			mergeDuplicateChunks: true,
			providedExports: false,
			splitChunks: false
		}
	};
}
