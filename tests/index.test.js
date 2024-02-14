import path from 'path';
import SvgChunkWebpackPlugin from '@src/index';
import templatePreview from '@src/preview';
import { validate } from 'schema-utils';
import schemaOptions from '@src/schemas/plugin-options.json';

jest.mock('@src/preview');
jest.mock('schema-utils');
jest.mock('@src/utils', () => ({
	PACKAGE_NAME: 'svg-chunk-webpack-plugin',
	esmResolve: jest.fn()
}));
jest.mock('webpack', () => {
	return {
		Compilation: {
			PROCESS_ASSETS_STAGE_ADDITIONAL: ''
		},
		util: {
			createHash: jest.fn()
		},
		sources: {
			RawSource: jest.fn()
		}
	};
});

let svgChunkWebpackPlugin;
let compilationWebpack;
let normalModule;
const svgsFixture = {
	gradient:
		'<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><rect fill="url(#a)" width="100%" height="100%"/></svg>',
	video: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.3 8.5l-4.5 3c-.1 0-.1.1-.2.1s-.2 0-.3-.1c-.2-.1-.3-.3-.3-.5V5c0-.2.1-.4.2-.5.2-.1.3-.1.5 0l4.5 3c.2.1.3.3.3.5s-.1.4-.2.5z" fill="#ff004b"/></svg>',
	'smiley-love':
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle class="st0" cx="24" cy="24" r="24" fill="#fbd971"/><path class="st1" d="M24 41.1c-7.6 0-13.7-6.2-13.7-13.7 0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1 0 6.3 5.1 11.4 11.4 11.4s11.4-5.1 11.4-11.4c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1.2 7.6-5.9 13.7-13.5 13.7z" fill="#d8b11a"/><path d="M14.3 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.4 0 2.4.8 2.9 1.9z" fill="#e64c3c"/><path data-name="Calque 1-2-2" d="M33.6 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.3 0 2.4.8 2.9 1.9z" fill="#e64c3c"/></svg>'
};

const spritesFixture = {
	home: '<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><symbol id="gradient"><rect fill="url(#a)" width="100%" height="100%"/></symbol><symbol id="video" viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.3 8.5l-4.5 3c-.1 0-.1.1-.2.1s-.2 0-.3-.1c-.2-.1-.3-.3-.3-.5V5c0-.2.1-.4.2-.5.2-.1.3-.1.5 0l4.5 3c.2.1.3.3.3.5s-.1.4-.2.5z" fill="#ff004b"/></symbol><symbol id="smiley-love" viewBox="0 0 48 48"><circle class="st0" cx="24" cy="24" r="24" fill="#fbd971"/><path class="st1" d="M24 41.1c-7.6 0-13.7-6.2-13.7-13.7 0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1 0 6.3 5.1 11.4 11.4 11.4s11.4-5.1 11.4-11.4c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1.2 7.6-5.9 13.7-13.5 13.7z" fill="#d8b11a"/><path d="M14.3 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.4 0 2.4.8 2.9 1.9z" fill="#e64c3c"/><path data-name="Calque 1-2-2" d="M33.6 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.3 0 2.4.8 2.9 1.9z" fill="#e64c3c"/></symbol></svg>'
};

const options = {
	generateSpritesManifest: true,
	generateSpritesPreview: true,
	svgstoreConfig: {
		svgAttrs: {
			'aria-hidden': true,
			style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
		}
	}
};

const getInstance = () => new SvgChunkWebpackPlugin(options);

beforeEach(() => {
	normalModule = {
		originalSource: jest.fn(),
		userRequest: ''
	};
	compilationWebpack = {
		assets: {},
		hash: '',
		entrypoints: {
			get: jest.fn(),
			keys: jest.fn()
		},
		options: {
			mode: 'development',
			output: {
				path: '/svg-chunk-webpack-plugin/example/dist',
				publicPath: '/dist'
			}
		},
		emitAsset: jest.fn(),
		hooks: {
			processAssets: {
				tapPromise: jest.fn()
			}
		},
		chunkGraph: {
			getOrderedChunkModulesIterable: jest.fn()
		},
		getCache: jest.fn(),
		getPath: jest.fn(),
		compiler: {
			webpack: {
				sources: {
					RawSource: jest.fn()
				},
				util: {
					createHash: jest.fn()
				}
			}
		}
	};

	svgChunkWebpackPlugin = getInstance();
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('SvgChunkWebpackPlugin', () => {
	describe('SvgChunkWebpackPlugin constructor', () => {
		it('Should initialize the constructor with custom options', () => {
			expect(svgChunkWebpackPlugin.options).toStrictEqual({
				filename: '[name].svg',
				svgstoreConfig: {
					cleanDefs: false,
					cleanSymbols: false,
					inline: true,
					svgAttrs: {
						'aria-hidden': true,
						style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
					}
				},
				generateSpritesManifest: true,
				generateSpritesPreview: true
			});
			expect(svgChunkWebpackPlugin.PLUGIN_NAME).toBe('svg-chunk-webpack-plugin');
			expect(validate).toHaveBeenCalledWith(schemaOptions, svgChunkWebpackPlugin.options, {
				name: 'SvgChunkWebpackPlugin',
				baseDataPath: 'options'
			});
		});

		it('Should initialize the constructor with default options', () => {
			const instance = new SvgChunkWebpackPlugin();
			expect(instance.options).toStrictEqual({
				filename: '[name].svg',
				svgstoreConfig: {
					cleanDefs: false,
					cleanSymbols: false,
					inline: true
				},
				generateSpritesManifest: false,
				generateSpritesPreview: false
			});
		});
	});

	describe('SvgChunkWebpackPlugin apply', () => {
		it('Should call the apply function', () => {
			const compilerWebpack = {
				hooks: {
					thisCompilation: {
						tap: () => {
							/* Empty */
						}
					}
				}
			};
			compilerWebpack.hooks.thisCompilation.tap = jest.fn();

			svgChunkWebpackPlugin.apply(compilerWebpack);

			expect(compilerWebpack.hooks.thisCompilation.tap).toHaveBeenCalled();
		});
	});

	describe('SvgChunkWebpackPlugin hookCallback', () => {
		it('Should call the hookCallback function', () => {
			svgChunkWebpackPlugin.addAssets.bind = jest.fn();

			svgChunkWebpackPlugin.hookCallback(compilationWebpack);

			expect(compilationWebpack.hooks.processAssets.tapPromise).toHaveBeenCalledWith(
				{
					name: 'SvgChunkWebpackPlugin',
					stage: ''
				},
				svgChunkWebpackPlugin.addAssets.bind(svgChunkWebpackPlugin, compilationWebpack)
			);
		});
	});

	describe('SvgChunkWebpackPlugin addAssets', () => {
		it('Should call the addAssets function with no dependencies', async () => {
			svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint = jest.fn().mockReturnValue([]);
			svgChunkWebpackPlugin.getSvgsData = jest.fn();
			svgChunkWebpackPlugin.generateSprite = jest.fn();
			svgChunkWebpackPlugin.getFilename = jest.fn();
			svgChunkWebpackPlugin.createSpritesManifest = jest.fn();
			svgChunkWebpackPlugin.createSpritesPreview = jest.fn();

			compilationWebpack.entrypoints.keys.mockReturnValue(['home']);
			compilationWebpack.getCache.mockReturnValue({
				getLazyHashedEtag: jest.fn(),
				mergeEtags: jest.fn(),
				getItemCache: jest.fn()
			});

			await svgChunkWebpackPlugin.addAssets(compilationWebpack);

			expect(svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint).toHaveBeenCalledWith({
				compilation: compilationWebpack,
				entryName: 'home'
			});
			expect(compilationWebpack.getCache().getLazyHashedEtag).not.toHaveBeenCalled();
			expect(compilationWebpack.getCache().mergeEtags).not.toHaveBeenCalled();
			expect(compilationWebpack.getCache().getItemCache).not.toHaveBeenCalled();
			expect(svgChunkWebpackPlugin.createSpritesManifest).not.toHaveBeenCalled();
		});

		it('Should call the addAssets function with dependencies and without cache', async () => {
			const normalModule1 = {
				originalSource: jest.fn().mockReturnValue(svgsFixture.gradient),
				userRequest: ''
			};
			const normalModule2 = {
				originalSource: jest.fn().mockReturnValue(svgsFixture.video),
				userRequest: ''
			};
			const normalModule3 = {
				originalSource: jest.fn().mockReturnValue(svgsFixture['smiley-love']),
				userRequest: ''
			};

			svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint = jest
				.fn()
				.mockReturnValue([normalModule1, normalModule2, normalModule3]);
			svgChunkWebpackPlugin.getSvgsData = jest.fn().mockReturnValue({
				svgPaths: ['./svgs/gradient.svg', './svgs/video.svg', './svgs/smiley-love.svg'],
				svgNames: ['gradient.svg', 'video.svg', 'smiley-love.svg'],
				svgs: [
					{
						name: 'gradient.svg',
						content: svgsFixture.gradient
					},
					{
						name: 'video.svg',
						content: svgsFixture.video
					},
					{
						name: 'smiley-love.svg',
						content: svgsFixture['smiley-love']
					}
				]
			});
			svgChunkWebpackPlugin.generateSprite = jest.fn().mockReturnValue(spritesFixture);
			compilationWebpack.compiler.webpack.sources.RawSource.mockReturnValue({
				source: spritesFixture
			});
			svgChunkWebpackPlugin.getFilename = jest.fn().mockReturnValue('home.svg');
			svgChunkWebpackPlugin.createSpritesManifest = jest.fn();
			svgChunkWebpackPlugin.createSpritesPreview = jest.fn();

			compilationWebpack.entrypoints.keys.mockReturnValue(['home']);
			compilationWebpack.getCache.mockReturnValue({
				getLazyHashedEtag: jest
					.fn()
					.mockReturnValueOnce(svgsFixture.gradient)
					.mockReturnValueOnce(svgsFixture.video)
					.mockReturnValueOnce(svgsFixture['smiley-love']),
				mergeEtags: jest.fn().mockReturnValue('123456789123'),
				getItemCache: jest.fn().mockReturnValue({
					getPromise: jest.fn(),
					storePromise: jest.fn()
				})
			});

			await svgChunkWebpackPlugin.addAssets(compilationWebpack);

			expect(svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint).toHaveBeenCalledWith({
				compilation: compilationWebpack,
				entryName: 'home'
			});
			expect(compilationWebpack.getCache().getLazyHashedEtag).toHaveBeenNthCalledWith(
				1,
				svgsFixture.gradient
			);
			expect(compilationWebpack.getCache().getLazyHashedEtag).toHaveBeenNthCalledWith(
				2,
				svgsFixture.video
			);
			expect(compilationWebpack.getCache().getLazyHashedEtag).toHaveBeenNthCalledWith(
				3,
				svgsFixture['smiley-love']
			);
			expect(compilationWebpack.getCache().mergeEtags).toHaveBeenCalledTimes(2);
			expect(compilationWebpack.getCache().getItemCache).toHaveBeenCalledWith(
				'home',
				'123456789123'
			);
			expect(compilationWebpack.getCache().getItemCache().getPromise).toHaveBeenCalledTimes(
				1
			);
			expect(svgChunkWebpackPlugin.getSvgsData).toHaveBeenCalledWith({
				compilation: compilationWebpack,
				svgsDependencies: [normalModule1, normalModule2, normalModule3]
			});
			expect(svgChunkWebpackPlugin.generateSprite).toHaveBeenCalledWith([
				{
					name: 'gradient.svg',
					content: svgsFixture.gradient
				},
				{
					name: 'video.svg',
					content: svgsFixture.video
				},
				{
					name: 'smiley-love.svg',
					content: svgsFixture['smiley-love']
				}
			]);
			expect(svgChunkWebpackPlugin.getFilename).toHaveBeenCalledWith({
				compilation: compilationWebpack,
				entryName: 'home',
				sprite: spritesFixture
			});
			expect(compilationWebpack.getCache().getItemCache().storePromise).toHaveBeenCalledWith({
				filename: 'home.svg',
				source: {
					source: spritesFixture
				},
				sprite: spritesFixture,
				svgNames: ['gradient.svg', 'video.svg', 'smiley-love.svg'],
				svgPaths: ['./svgs/gradient.svg', './svgs/video.svg', './svgs/smiley-love.svg']
			});
			expect(compilationWebpack.emitAsset).toHaveBeenCalledWith('home.svg', {
				source: spritesFixture
			});
			expect(compilationWebpack.getCache().getLazyHashedEtag).toHaveBeenNthCalledWith(4, {
				source: spritesFixture
			});
		});
	});

	describe('SvgChunkWebpackPlugin getSvgsDependenciesByEntrypoint', () => {
		it('Should call the getSvgsDependenciesByEntrypoint function', () => {
			compilationWebpack.entrypoints.get.mockReturnValue({
				chunks: [
					{
						hash: 'beb18939e5093045258b8d24a34dd844'
					}
				]
			});
			compilationWebpack.chunkGraph.getOrderedChunkModulesIterable.mockReturnValue([
				{
					buildMeta: {
						sideEffectFree: null
					},
					buildInfo: {
						hash: '1234',
						SVG_CHUNK_WEBPACK_PLUGIN: true
					}
				},
				{
					buildMeta: {
						sideEffectFree: null
					},
					buildInfo: {
						hash: '4567'
					}
				}
			]);

			const result = svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint({
				compilation: compilationWebpack,
				entryName: 'home'
			});

			expect(result).toStrictEqual([
				{
					buildMeta: {
						sideEffectFree: false
					},
					buildInfo: {
						hash: '1234',
						SVG_CHUNK_WEBPACK_PLUGIN: true
					}
				}
			]);
		});

		it('Should call the getSvgsDependenciesByEntrypoint function without buildMeta', () => {
			compilationWebpack.entrypoints.get.mockReturnValue({
				chunks: [
					{
						hash: 'beb18939e5093045258b8d24a34dd844'
					}
				]
			});
			compilationWebpack.chunkGraph.getOrderedChunkModulesIterable.mockReturnValue([
				{
					buildInfo: {
						hash: '1234',
						SVG_CHUNK_WEBPACK_PLUGIN: true
					}
				},
				{
					buildInfo: {
						hash: '4567'
					}
				}
			]);

			const result = svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint({
				compilation: compilationWebpack,
				entryName: 'home'
			});

			expect(result).toStrictEqual([
				{
					buildInfo: {
						hash: '1234',
						SVG_CHUNK_WEBPACK_PLUGIN: true
					}
				}
			]);
		});

		it('Should call the getSvgsDependenciesByEntrypoint function with entries null', () => {
			compilationWebpack.entrypoints = null;

			const result = svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint({
				compilation: compilationWebpack,
				entryName: 'home'
			});

			expect(result).toStrictEqual([]);
		});

		it('Should call the getSvgsDependenciesByEntrypoint function with entries size 0', () => {
			compilationWebpack.entrypoints.size = 0;

			const result = svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint({
				compilation: compilationWebpack,
				entryName: 'home'
			});

			expect(compilationWebpack.entrypoints.get).not.toHaveBeenCalled();
			expect(result).toStrictEqual([]);
		});

		it('Should call the getSvgsDependenciesByEntrypoint function with entries empty', () => {
			const result = svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint({
				compilation: compilationWebpack,
				entryName: 'home'
			});

			expect(result).toStrictEqual([]);
			expect(compilationWebpack.entrypoints.get).toHaveBeenCalledWith('home');
		});
	});

	describe('SvgChunkWebpackPlugin getSvgsData', () => {
		it('Should call the getSvgsData function with context', () => {
			normalModule.originalSource.mockReturnValue({
				source: jest.fn().mockReturnValue(JSON.stringify(svgsFixture.gradient))
			});
			normalModule.userRequest = '/svg-chunk-webpack-plugin/example/src/svgs/gradient.svg';
			compilationWebpack.options.context = '/svg-chunk-webpack-plugin/example';

			const response = svgChunkWebpackPlugin.getSvgsData({
				compilation: compilationWebpack,
				svgsDependencies: [normalModule]
			});

			expect(response).toStrictEqual({
				svgNames: ['gradient'],
				svgPaths: ['src/svgs/gradient.svg'],
				svgs: [
					{
						content: svgsFixture.gradient,
						name: 'gradient'
					}
				]
			});
		});

		it('Should call the getSvgsData function without context', () => {
			jest.spyOn(path, 'relative').mockImplementation((_from, to) =>
				to.replace('/svg-chunk-webpack-plugin/example/', '')
			);

			normalModule.originalSource.mockReturnValue({
				source: jest.fn().mockReturnValue(JSON.stringify(svgsFixture.gradient))
			});
			normalModule.userRequest = '/svg-chunk-webpack-plugin/example/src/svgs/gradient.svg';
			compilationWebpack.options.context = '';

			const response = svgChunkWebpackPlugin.getSvgsData({
				compilation: compilationWebpack,
				svgsDependencies: [normalModule]
			});

			expect(response).toStrictEqual({
				svgNames: ['gradient'],
				svgPaths: ['src/svgs/gradient.svg'],
				svgs: [
					{
						content: svgsFixture.gradient,
						name: 'gradient'
					}
				]
			});
		});
	});

	describe('SvgChunkWebpackPlugin generateSprite', () => {
		it('Should call the generateSprite function', () => {
			const result = svgChunkWebpackPlugin.generateSprite([
				{ name: 'gradient', content: svgsFixture.gradient },
				{ name: 'video', content: svgsFixture.video },
				{ name: 'smiley-love', content: svgsFixture['smiley-love'] }
			]);

			expect(result).toBe(spritesFixture.home);
		});
	});

	describe('SvgChunkWebpackPlugin getFilename', () => {
		it('Should call the getFilename function with default name', () => {
			svgChunkWebpackPlugin.options.filename = 'sprites/[name].svg';

			const result = svgChunkWebpackPlugin.getFilename({
				compilation: compilationWebpack,
				entryName: 'home',
				output: spritesFixture.home
			});

			expect(compilationWebpack.compiler.webpack.util.createHash).not.toHaveBeenCalled();
			expect(result).toBe('sprites/home.svg');
		});

		it('Should call the getFilename function with default name with slashes', () => {
			svgChunkWebpackPlugin.options.filename = 'sprites/[name].svg';

			const result = svgChunkWebpackPlugin.getFilename({
				compilation: compilationWebpack,
				entryName: 'home/components/footer',
				output: spritesFixture.home
			});

			expect(compilationWebpack.compiler.webpack.util.createHash).not.toHaveBeenCalled();
			expect(result).toBe('sprites/home/components/footer.svg');
		});

		it('Should call the getFilename function with [fullhash]', () => {
			svgChunkWebpackPlugin.options.filename = 'sprites/[name].[fullhash].svg';
			compilationWebpack.outputOptions = {
				hashDigestLength: 20
			};
			compilationWebpack.fullHash = '117b8f68975f36a8c463a1b2c3d4e5f6';

			const result = svgChunkWebpackPlugin.getFilename({
				compilation: compilationWebpack,
				entryName: 'home',
				sprite: spritesFixture.home
			});

			expect(result).toStrictEqual('sprites/home.117b8f68975f36a8c463.svg');
		});

		it('Should call the getFilename function with [fullhash] undefined', () => {
			svgChunkWebpackPlugin.options.filename = 'sprites/[name].[fullhash].svg';
			compilationWebpack.outputOptions = {
				hashDigestLength: 20
			};
			compilationWebpack.fullHash = undefined;

			const result = svgChunkWebpackPlugin.getFilename({
				compilation: compilationWebpack,
				entryName: 'home',
				sprite: spritesFixture.home
			});

			expect(result).toStrictEqual('sprites/home..svg');
		});

		it('Should call the getFilename function with [contenthash]', () => {
			svgChunkWebpackPlugin.options.filename = 'sprites/[name].[contenthash].svg';
			compilationWebpack.outputOptions = {
				hashFunction: 'md4',
				hashDigest: 'hex',
				hashDigestLength: 20
			};
			compilationWebpack.compiler.webpack.util.createHash.mockReturnValue({
				update: jest.fn().mockReturnValue({
					digest: jest.fn().mockReturnValue({
						substring: jest.fn().mockReturnValue('a1b2c3d4e5f6')
					})
				})
			});

			const result = svgChunkWebpackPlugin.getFilename({
				compilation: compilationWebpack,
				entryName: 'home',
				sprite: spritesFixture.home
			});

			expect(compilationWebpack.compiler.webpack.util.createHash).toHaveBeenCalledWith('md4');
			expect(
				compilationWebpack.compiler.webpack.util.createHash().update
			).toHaveBeenCalledWith(spritesFixture.home);
			expect(
				compilationWebpack.compiler.webpack.util.createHash().update().digest
			).toHaveBeenCalledWith('hex');
			expect(
				compilationWebpack.compiler.webpack.util.createHash().update().digest().substring
			).toHaveBeenCalledWith(0, 20);
			expect(result).toStrictEqual('sprites/home.a1b2c3d4e5f6.svg');
		});

		it('Should call the getFilename function with [contenthash] and hashFUnction undefined', () => {
			svgChunkWebpackPlugin.options.filename = 'sprites/[name].[contenthash].svg';
			compilationWebpack.outputOptions = {
				hashFunction: undefined
			};

			const result = svgChunkWebpackPlugin.getFilename({
				compilation: compilationWebpack,
				entryName: 'home',
				sprite: spritesFixture.home
			});

			expect(compilationWebpack.compiler.webpack.util.createHash).not.toHaveBeenCalled();
			expect(result).toStrictEqual('sprites/home..svg');
		});
	});

	describe('SvgChunkWebpackPlugin createSpritesManifest', () => {
		let cache;
		const spritesManifest = {
			home: ['src/svgs/gradient.svg', 'src/svgs/smiley-love.svg', 'src/svgs/video.svg']
		};

		beforeEach(() => {
			cache = {
				getLazyHashedEtag: jest.fn(),
				mergeEtags: jest.fn(),
				getItemCache: jest.fn().mockReturnValue({
					getPromise: jest.fn(),
					storePromise: jest.fn()
				})
			};
		});

		afterEach(() => {
			expect(cache.getItemCache).toHaveBeenCalledWith(
				'sprites-manifest.json',
				'a1b2c3d4e5f6'
			);
			expect(cache.getItemCache().getPromise).toHaveBeenCalled();
		});

		it('Should call the createSpritesManifest function without cache', async () => {
			compilationWebpack.compiler.webpack.sources.RawSource.mockReturnValue({
				source: spritesManifest
			});

			await svgChunkWebpackPlugin.createSpritesManifest({
				compilation: compilationWebpack,
				cache,
				eTag: 'a1b2c3d4e5f6',
				spritesManifest
			});

			expect(compilationWebpack.compiler.webpack.sources.RawSource).toHaveBeenCalledWith(
				JSON.stringify(spritesManifest, null, 2),
				false
			);
			expect(cache.getItemCache().storePromise).toHaveBeenCalledWith({
				source: spritesManifest
			});
			expect(compilationWebpack.emitAsset).toHaveBeenCalledWith('sprites-manifest.json', {
				source: spritesManifest
			});
		});

		it('Should call the createSpritesManifest function with cache', async () => {
			cache.getItemCache().getPromise.mockReturnValue({
				source: spritesManifest
			});

			await svgChunkWebpackPlugin.createSpritesManifest({
				compilation: compilationWebpack,
				cache,
				eTag: 'a1b2c3d4e5f6',
				spritesManifest
			});

			expect(compilationWebpack.compiler.webpack.sources.RawSource).not.toHaveBeenCalled();
			expect(cache.getItemCache().storePromise).not.toHaveBeenCalled();
			expect(compilationWebpack.emitAsset).toHaveBeenCalledWith('sprites-manifest.json', {
				source: spritesManifest
			});
		});
	});

	describe('SvgChunkWebpackPlugin createSpritesPreview', () => {
		let cache;

		beforeEach(() => {
			cache = {
				getLazyHashedEtag: jest.fn(),
				mergeEtags: jest.fn(),
				getItemCache: jest.fn().mockReturnValue({
					getPromise: jest.fn(),
					storePromise: jest.fn()
				})
			};
		});

		afterEach(() => {
			expect(cache.getItemCache).toHaveBeenCalledWith('sprites-preview.html', 'a1b2c3d4e5f6');
			expect(cache.getItemCache().getPromise).toHaveBeenCalled();
		});

		it('Should call the createSpritesPreview function without cache', async () => {
			compilationWebpack.compiler.webpack.sources.RawSource.mockReturnValue({
				source: spritesFixture
			});
			templatePreview.mockReturnValue('<html>preview</html>');
			const sprites = [
				{
					entryName: 'home',
					svgs: ['gradient', 'popcorn'],
					sprite: spritesFixture
				}
			];

			await svgChunkWebpackPlugin.createSpritesPreview({
				compilation: compilationWebpack,
				cache,
				eTag: 'a1b2c3d4e5f6',
				sprites
			});

			expect(templatePreview).toHaveBeenCalledWith(sprites);
			expect(compilationWebpack.compiler.webpack.sources.RawSource).toHaveBeenCalledWith(
				'<html>preview</html>',
				false
			);
			expect(cache.getItemCache().storePromise).toHaveBeenCalledWith({
				source: spritesFixture
			});
			expect(compilationWebpack.emitAsset).toHaveBeenCalledWith('sprites-preview.html', {
				source: spritesFixture
			});
		});

		it('Should call the createSpritesPreview function with cache', async () => {
			cache.getItemCache().getPromise.mockReturnValue({
				source: ''
			});

			await svgChunkWebpackPlugin.createSpritesPreview({
				compilation: compilationWebpack,
				cache,
				eTag: 'a1b2c3d4e5f6',
				sprites: ''
			});

			expect(templatePreview).not.toHaveBeenCalled();
			expect(compilationWebpack.compiler.webpack.sources.RawSource).not.toHaveBeenCalled();
			expect(cache.getItemCache().storePromise).not.toHaveBeenCalled();
			expect(compilationWebpack.emitAsset).toHaveBeenCalledWith('sprites-preview.html', {
				source: ''
			});
		});
	});
});
