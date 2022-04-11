import SvgChunkWebpackPlugin from '../index';

import {
	mockGetEntryNames,
	mockGetSvgsDependenciesByEntrypoint,
	mockOptimizeSvg,
	mockGenerateSprite,
	mockGetBuildHash,
	mockGetChunkHash,
	mockGetContentHash
} from '../__mocks__/mocks';
import templatePreview from '../preview';

import path from 'path';
import { loadConfig, optimize } from 'svgo';

jest.mock('../preview');
jest.mock('svgo', () => {
	const originalModule = jest.requireActual('svgo');
	return {
		...originalModule,
		loadConfig: jest.fn().mockReturnValue({
			multipass: true
		}),
		optimize: jest.fn().mockReturnValue({ data: svgsFixture.gradient })
	};
});

const webpack = require('webpack');
const { util } = require('webpack');
const { RawSource } = webpack.sources;

// Mock Webpack util to works with chaining function
jest.mock('webpack', () => {
	const mockCreateHash = jest.fn();
	const mockUpdate = jest.fn();
	const mockDigest = jest.fn();

	const utils = {
		createHash: mockCreateHash,
		update: mockUpdate,
		digest: mockDigest
	};
	return {
		Compilation: {
			PROCESS_ASSETS_STAGE_ADDITIONAL: ''
		},
		util: {
			createHash: mockCreateHash.mockImplementation(() => utils),
			update: mockUpdate.mockImplementation(() => utils),
			digest: mockDigest.mockImplementation(() => 'a5934d97b38c748213317d7e5ffd31b6')
		},
		sources: {
			RawSource: jest.fn()
		}
	};
});

// Save reference to path.relative because the function is mock inside tests
// The original function is return after each tests
const originalPathRelative = path.relative;

let svgChunkWebpackPlugin;
let compilationWebpack;
let entryNames;
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

const svgsDependencies = [
	{
		buildInfo: {
			SVG_CHUNK_WEBPACK_PLUGIN: true
		},
		userRequest: '/svg-chunk-webpack-plugin/example/src/svgs/gradient.svg',
		originalSource: () => ({
			_value: JSON.stringify(svgsFixture.gradient)
		})
	},
	{
		buildInfo: {
			SVG_CHUNK_WEBPACK_PLUGIN: true
		},
		userRequest: '/svg-chunk-webpack-plugin/example/src/svgs/video.svg',
		originalSource: () => ({
			_value: JSON.stringify(svgsFixture.video)
		})
	},
	{
		buildInfo: {
			SVG_CHUNK_WEBPACK_PLUGIN: true
		},
		userRequest: '/svg-chunk-webpack-plugin/example/src/svgs/smiley-love.svg',
		originalSource: () => ({
			_value: JSON.stringify(svgsFixture['smiley-love'])
		})
	}
];
const svgsSprite = [
	{ name: 'gradient', content: svgsFixture.gradient },
	{ name: 'video', content: svgsFixture.video },
	{ name: 'smiley-love', content: svgsFixture['smiley-love'] }
];
const options = {
	generateSpritesManifest: true,
	generateSpritesPreview: true,
	svgstoreConfig: {
		svgAttrs: {
			'aria-hidden': true,
			style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
		}
	},
	svgoConfigFile: '/svg-chunk-webpack-plugin/example/svgo.config.js'
};

const getInstance = () => new SvgChunkWebpackPlugin(options);

const entrypointsMap = new Map();
entrypointsMap.set('home', {
	chunks: [
		{
			hash: 'beb18939e5093045258b8d24a34dd844'
		}
	]
});
entrypointsMap.set('news', {
	chunks: [
		{
			hash: 'beb18939e5093045258b8d24a34dd843'
		}
	]
});

beforeEach(() => {
	entryNames = ['home', 'news'];
	compilationWebpack = {
		assets: {},
		hash: '4cc05208d925b7b31259',
		entrypoints: entrypointsMap,
		options: {
			mode: 'development',
			context: '/svg-chunk-webpack-plugin/example',
			output: {
				path: '/svg-chunk-webpack-plugin/example/dist',
				publicPath: '/dist'
			}
		},
		outputOptions: {
			hashFunction: 'md4',
			hashDigest: 'hex'
		},
		emitAsset: jest.fn(),
		hooks: {
			processAssets: {
				tapPromise: jest.fn()
			}
		},
		chunkGraph: {
			getChunkModulesIterable: () => svgsDependencies
		}
	};

	svgChunkWebpackPlugin = getInstance();
});

afterEach(() => {
	path.relative = originalPathRelative;
	jest.clearAllMocks();
});

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
			svgoConfigFile: '/svg-chunk-webpack-plugin/example/svgo.config.js',
			generateSpritesManifest: true,
			generateSpritesPreview: true
		});
		expect(svgChunkWebpackPlugin.spritesManifest).toEqual({});
		expect(svgChunkWebpackPlugin.spritesList).toEqual([]);
		expect(svgChunkWebpackPlugin.PLUGIN_NAME).toBe('svg-chunk-webpack-plugin');
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
			svgoConfigFile: null,
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
					tap: () => {}
				}
			}
		};
		compilerWebpack.hooks.thisCompilation.tap = jest.fn();

		svgChunkWebpackPlugin.apply(compilerWebpack);

		expect(compilerWebpack.hooks.thisCompilation.tap).toHaveBeenCalled();
	});
});

describe('SvgChunkWebpackPlugin hookCallback', () => {
	it('Should call the hookCallback function', async () => {
		await svgChunkWebpackPlugin.hookCallback(compilationWebpack);

		expect(loadConfig).toHaveBeenCalledWith('/svg-chunk-webpack-plugin/example/svgo.config.js');
		expect(svgChunkWebpackPlugin.svgoConfig).toStrictEqual({
			multipass: true
		});
		expect(
			svgChunkWebpackPlugin.compilation.hooks.processAssets.tapPromise
		).toHaveBeenCalledWith(
			{
				name: 'SvgChunkWebpackPlugin',
				stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
			},
			svgChunkWebpackPlugin.addAssets
		);
	});

	it('Should call the hookCallback function without svgo config file', () => {
		const instance = new SvgChunkWebpackPlugin();

		instance.hookCallback(compilationWebpack);

		expect(loadConfig).not.toHaveBeenCalled();
		expect(instance.svgoConfig).toStrictEqual({});
		expect(instance.compilation.hooks.processAssets.tapPromise).toHaveBeenCalledWith(
			{
				name: 'SvgChunkWebpackPlugin',
				stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
			},
			instance.addAssets
		);
	});
});

describe('SvgChunkWebpackPlugin addAssets', () => {
	it('Should call the addAssets function', async () => {
		mockGetEntryNames(svgChunkWebpackPlugin, entryNames);
		svgChunkWebpackPlugin.processEntry = jest.fn();
		svgChunkWebpackPlugin.createSpritesManifest = jest.fn();
		svgChunkWebpackPlugin.createSpritesPreview = jest.fn();

		await svgChunkWebpackPlugin.addAssets();

		expect(svgChunkWebpackPlugin.spritesManifest).toStrictEqual({});
		expect(svgChunkWebpackPlugin.spritesList).toStrictEqual([]);
		expect(svgChunkWebpackPlugin.getEntryNames).toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.processEntry).toHaveBeenCalledTimes(2);
		expect(svgChunkWebpackPlugin.processEntry).toHaveBeenCalledWith('home');
		expect(svgChunkWebpackPlugin.processEntry).toHaveBeenCalledWith('news');
		expect(svgChunkWebpackPlugin.createSpritesManifest).toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.createSpritesPreview).toHaveBeenCalled();
	});

	it('Should call the addAssets function without manifest and preview', async () => {
		mockGetEntryNames(svgChunkWebpackPlugin, entryNames);
		svgChunkWebpackPlugin.processEntry = jest.fn();
		svgChunkWebpackPlugin.createSpritesManifest = jest.fn();
		svgChunkWebpackPlugin.createSpritesPreview = jest.fn();

		svgChunkWebpackPlugin.options.generateSpritesManifest = false;
		svgChunkWebpackPlugin.options.generateSpritesPreview = false;
		await svgChunkWebpackPlugin.addAssets();

		expect(svgChunkWebpackPlugin.createSpritesManifest).not.toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.createSpritesPreview).not.toHaveBeenCalled();
	});
});

describe('SvgChunkWebpackPlugin getEntryNames', () => {
	it('Should call the getEntryNames function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;

		expect(svgChunkWebpackPlugin.getEntryNames()).toEqual(['home', 'news']);
	});
});

describe('SvgChunkWebpackPlugin processEntry', () => {
	it('Should call the processEntry function', async () => {
		mockGetSvgsDependenciesByEntrypoint(svgChunkWebpackPlugin, svgsDependencies);
		mockOptimizeSvg(svgChunkWebpackPlugin, svgsFixture);
		mockGenerateSprite(svgChunkWebpackPlugin, spritesFixture.home);
		svgChunkWebpackPlugin.createSpriteAsset = jest.fn();

		// Mock core node module to avoid absolute path conflict in the test environment
		// The original function is return after the test
		path.relative = jest.fn().mockImplementation((from, to) => to.split(from)[1].substr(1));

		svgChunkWebpackPlugin.compilation = compilationWebpack;
		await svgChunkWebpackPlugin.processEntry('home');

		const entry = 'home';
		expect(svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint).toHaveBeenCalledWith(entry);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledTimes(3);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledWith(svgsDependencies[0]);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledWith(svgsDependencies[1]);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledWith(svgsDependencies[2]);
		expect(svgChunkWebpackPlugin.generateSprite).toHaveBeenCalledWith(svgsSprite);
		expect(svgChunkWebpackPlugin.createSpriteAsset).toHaveBeenCalledWith({
			entryName: entry,
			sprite: spritesFixture.home
		});
		expect(svgChunkWebpackPlugin.spritesManifest).toEqual({
			home: svgsDependencies.map((moduleDependency) =>
				path.relative(
					svgChunkWebpackPlugin.compilation.options.context,
					moduleDependency.userRequest
				)
			)
		});
		expect(svgChunkWebpackPlugin.spritesList).toEqual([
			{
				name: entry,
				content: spritesFixture.home,
				svgs: ['gradient', 'video', 'smiley-love']
			}
		]);
	});
});

describe('SvgChunkWebpackPlugin optimizeSvg', () => {
	it('Should call the optimizeSvg function', async () => {
		const result = await svgChunkWebpackPlugin.optimizeSvg(svgsDependencies[0]);

		expect(optimize).toHaveBeenCalledWith(svgsFixture.gradient, {});
		expect(result).toEqual({
			name: 'gradient',
			content: svgsFixture.gradient
		});
	});
});

describe('SvgChunkWebpackPlugin getSvgsDependenciesByEntrypoint', () => {
	it('Should call the getSvgsDependenciesByEntrypoint function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const homeChunks = svgChunkWebpackPlugin.compilation.entrypoints.get('home');
		svgChunkWebpackPlugin.compilation.entrypoints.get = jest.fn().mockReturnValue(homeChunks);
		svgChunkWebpackPlugin.compilation.chunkGraph.getChunkModulesIterable = jest
			.fn()
			.mockReturnValue(svgsDependencies);

		const result = svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint('home');

		expect(svgChunkWebpackPlugin.compilation.entrypoints.get).toHaveBeenCalledWith('home');
		expect(
			svgChunkWebpackPlugin.compilation.chunkGraph.getChunkModulesIterable
		).toHaveBeenCalledWith(homeChunks.chunks[0]);
		expect(result).toEqual(svgsDependencies);
	});

	it('Should call the getSvgsDependenciesByEntrypoint function with no flag on the last item', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		svgChunkWebpackPlugin.compilation.chunkGraph.getChunkModulesIterable = jest
			.fn()
			.mockReturnValue([
				{
					buildInfo: {}
				}
			]);

		const result = svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint('home');

		expect(result).toEqual([]);
	});
});

describe('SvgChunkWebpackPlugin generateSprite', () => {
	it('Should call the generateSprite function', () => {
		const result = svgChunkWebpackPlugin.generateSprite(svgsSprite);

		expect(result).toBe(spritesFixture.home);
	});
});

describe('SvgChunkWebpackPlugin createSpriteAsset', () => {
	it('Should call the createSpriteAsset function', () => {
		svgChunkWebpackPlugin.getFileName = jest.fn().mockImplementation(() => 'home.svg');

		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const output = spritesFixture.home;

		svgChunkWebpackPlugin.createSpriteAsset({ entryName: 'home', sprite: output });

		expect(svgChunkWebpackPlugin.getFileName).toHaveBeenCalledWith({
			entryName: 'home',
			output
		});
		expect(RawSource).toHaveBeenCalledWith(output, false);
		expect(svgChunkWebpackPlugin.compilation.emitAsset).toHaveBeenCalledWith(
			'home.svg',
			new RawSource(output, false)
		);
	});
});

describe('SvgChunkWebpackPlugin getFileName', () => {
	it('Should call the getFileName function with default options', () => {
		mockGetBuildHash(svgChunkWebpackPlugin);
		mockGetChunkHash(svgChunkWebpackPlugin);
		mockGetContentHash(svgChunkWebpackPlugin);

		const result = svgChunkWebpackPlugin.getFileName({
			entryName: 'home',
			output: spritesFixture.home
		});

		expect(svgChunkWebpackPlugin.getBuildHash).not.toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.getChunkHash).not.toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.getContentHash).not.toHaveBeenCalled();
		expect(result).toBe('home.svg');
	});

	it('Should call the getFileName function with custom name', () => {
		mockGetBuildHash(svgChunkWebpackPlugin);
		mockGetChunkHash(svgChunkWebpackPlugin);
		mockGetContentHash(svgChunkWebpackPlugin);

		svgChunkWebpackPlugin.options.filename = 'sprite/custom-name.svg';
		const result = svgChunkWebpackPlugin.getFileName({
			entryName: 'home',
			output: spritesFixture.home
		});

		expect(result).toBe('sprite/custom-name.svg');
	});

	it('Should call the getFileName function with [hash]', () => {
		mockGetBuildHash(svgChunkWebpackPlugin);
		mockGetChunkHash(svgChunkWebpackPlugin);
		mockGetContentHash(svgChunkWebpackPlugin);

		svgChunkWebpackPlugin.options.filename = '[name].[hash].svg';
		const result = svgChunkWebpackPlugin.getFileName({
			entryName: 'home',
			output: spritesFixture.home
		});

		expect(result).toBe('home.4cc05208d925b7b31259.svg');
	});

	it('Should call the getFileName function with [chunkhash]', () => {
		mockGetBuildHash(svgChunkWebpackPlugin);
		mockGetChunkHash(svgChunkWebpackPlugin);
		mockGetContentHash(svgChunkWebpackPlugin);

		svgChunkWebpackPlugin.options.filename = '[name].[chunkhash].svg';
		const result = svgChunkWebpackPlugin.getFileName({
			entryName: 'home',
			output: spritesFixture.home
		});

		expect(result).toBe('home.beb18939e5093045258b8d24a34dd844.svg');
	});

	it('Should call the getFileName function with [contenthash]', () => {
		mockGetBuildHash(svgChunkWebpackPlugin);
		mockGetChunkHash(svgChunkWebpackPlugin);
		mockGetContentHash(svgChunkWebpackPlugin);

		svgChunkWebpackPlugin.options.filename = '[name].[contenthash].svg';
		const result = svgChunkWebpackPlugin.getFileName({
			entryName: 'home',
			output: spritesFixture.home
		});

		expect(result).toBe('home.a5934d97b38c748213317d7e5ffd31b6.svg');
	});
});

describe('SvgChunkWebpackPlugin getBuildHash', () => {
	it('Should call the getBuildHash function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const result = svgChunkWebpackPlugin.getBuildHash();

		expect(result).toBe('4cc05208d925b7b31259');
	});
});

describe('SvgChunkWebpackPlugin getChunkHash', () => {
	it('Should call the getChunkHash function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const result = svgChunkWebpackPlugin.getChunkHash('home');

		expect(result).toBe('beb18939e5093045258b8d24a34dd844');
	});

	it('Should call the getChunkHash function without chunks[0]', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		svgChunkWebpackPlugin.compilation.entrypoints.get('home').chunks = [];
		const result = svgChunkWebpackPlugin.getChunkHash('home');

		expect(result).toBe('');
	});
});

describe('SvgChunkWebpackPlugin getContentHash', () => {
	it('Should call the getContentHash function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const result = svgChunkWebpackPlugin.getContentHash(spritesFixture.home);

		expect(util.createHash).toHaveBeenCalledWith('md4');
		expect(util.update).toHaveBeenCalledWith(spritesFixture.home);
		expect(util.digest).toHaveBeenCalledWith('hex');
		expect(result).toBe('a5934d97b38c748213317d7e5ffd31b6');
	});
});

describe('SvgChunkWebpackPlugin createSpritesManifest', () => {
	it('Should call the createSpritesManifest function', () => {
		jest.spyOn(JSON, 'stringify');
		svgChunkWebpackPlugin.compilation = compilationWebpack;

		svgChunkWebpackPlugin.spritesManifest = {
			home: [
				'example/src/svgs/gradient.svg',
				'example/src/svgs/video.svg',
				'example/src/svgs/smiley-love.svg'
			]
		};
		const output = JSON.stringify(svgChunkWebpackPlugin.spritesManifest, null, 2);
		svgChunkWebpackPlugin.createSpritesManifest();

		expect(JSON.stringify).toHaveBeenCalledWith(svgChunkWebpackPlugin.spritesManifest, null, 2);
		expect(RawSource).toHaveBeenCalledWith(output, false);
		expect(svgChunkWebpackPlugin.compilation.emitAsset).toHaveBeenCalledWith(
			'sprites-manifest.json',
			new RawSource(output, false)
		);
	});
});

describe('SvgChunkWebpackPlugin createSpritesPreview', () => {
	it('Should call the createSpritesPreview function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;

		svgChunkWebpackPlugin.createSpritesPreview();

		expect(templatePreview).toHaveBeenCalledWith(svgChunkWebpackPlugin.spritesList);
		expect(RawSource).toHaveBeenCalledWith(
			templatePreview(svgChunkWebpackPlugin.spritesList),
			false
		);
		expect(svgChunkWebpackPlugin.compilation.emitAsset).toHaveBeenCalledWith(
			'sprites-preview.html',
			new RawSource(templatePreview(svgChunkWebpackPlugin.spritesList), false)
		);
	});
});
