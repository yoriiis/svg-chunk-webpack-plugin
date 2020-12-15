'use strict';

import SvgChunkWebpackPlugin from '../index';

import {
	mockGetEntryNames,
	mockGetSvgsByEntrypoint,
	mockOptimizeSvg,
	mockGenerateSprite,
	mockGetBuildHash,
	mockGetChunkHash,
	mockGetContentHash
} from '../__mocks__/mocks';
import templatePreview from '../preview';

import path from 'path';
import Svgo from 'svgo';

jest.mock('../preview');

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
		util: {
			createHash: mockCreateHash.mockImplementation(() => utils),
			update: mockUpdate.mockImplementation(() => utils),
			digest: mockDigest.mockImplementation(() => 'a5934d97b38c748213317d7e5ffd31b6')
		}
	};
});

const { util } = require('webpack');

// Save reference to path.relative because the function is mock inside tests
// The original function is return after each tests
const originalPathRelative = path.relative;

let svgChunkWebpackPlugin;
let compilationWebpack;
let entryNames;
const svgsFixture = {
	gradient:
		'<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><rect fill="url(#a)" width="100%" height="100%"/></svg>',
	video:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.3 8.5l-4.5 3c-.1 0-.1.1-.2.1s-.2 0-.3-.1c-.2-.1-.3-.3-.3-.5V5c0-.2.1-.4.2-.5.2-.1.3-.1.5 0l4.5 3c.2.1.3.3.3.5s-.1.4-.2.5z" fill="#ff004b"/></svg>',
	'smiley-love':
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle class="st0" cx="24" cy="24" r="24" fill="#fbd971"/><path class="st1" d="M24 41.1c-7.6 0-13.7-6.2-13.7-13.7 0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1 0 6.3 5.1 11.4 11.4 11.4s11.4-5.1 11.4-11.4c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1.2 7.6-5.9 13.7-13.5 13.7z" fill="#d8b11a"/><path d="M14.3 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.4 0 2.4.8 2.9 1.9z" fill="#e64c3c"/><path data-name="Calque 1-2-2" d="M33.6 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.3 0 2.4.8 2.9 1.9z" fill="#e64c3c"/></svg>'
};

const spritesFixture = {
	home:
		'<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><symbol id="gradient"><rect fill="url(#a)" width="100%" height="100%"/></symbol><symbol id="video" viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.3 8.5l-4.5 3c-.1 0-.1.1-.2.1s-.2 0-.3-.1c-.2-.1-.3-.3-.3-.5V5c0-.2.1-.4.2-.5.2-.1.3-.1.5 0l4.5 3c.2.1.3.3.3.5s-.1.4-.2.5z" fill="#ff004b"/></symbol><symbol id="smiley-love" viewBox="0 0 48 48"><circle class="st0" cx="24" cy="24" r="24" fill="#fbd971"/><path class="st1" d="M24 41.1c-7.6 0-13.7-6.2-13.7-13.7 0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1 0 6.3 5.1 11.4 11.4 11.4s11.4-5.1 11.4-11.4c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1.2 7.6-5.9 13.7-13.5 13.7z" fill="#d8b11a"/><path d="M14.3 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.4 0 2.4.8 2.9 1.9z" fill="#e64c3c"/><path data-name="Calque 1-2-2" d="M33.6 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.3 0 2.4.8 2.9 1.9z" fill="#e64c3c"/></symbol></svg>'
};

const svgsFilepath = [
	'example/src/svgs/gradient.svg',
	'example/src/svgs/video.svg',
	'example/src/svgs/smiley-love.svg'
];
const svgsSprite = [
	{ name: 'gradient', content: svgsFixture.gradient },
	{ name: 'video', content: svgsFixture.video },
	{ name: 'smiley-love', content: svgsFixture['smiley-love'] }
];
const spritesList = {
	name: 'home',
	content: spritesFixture.home,
	svgs: ['gradient', 'video', 'smiley-love']
};

const options = {
	generateSpritesManifest: true,
	generateSpritesPreview: true
};

const getInstance = () => new SvgChunkWebpackPlugin(options);

const entrypointsMap = new Map();
entrypointsMap.set('home', {
	chunks: [
		{
			hash: 'beb18939e5093045258b8d24a34dd844',
			getModules: () => [
				{
					buildInfo: { fileDependencies: ['example/src/js/home.js'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/svgs/gradient.svg'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/svgs/video.svg'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/js/component.js'] }
				},
				{
					buildInfo: {
						fileDependencies: ['example/src/svgs/smiley-love.svg']
					}
				}
			]
		}
	]
});
entrypointsMap.set('news', {
	chunks: [
		{
			hash: 'beb18939e5093045258b8d24a34dd843',
			getModules: () => [
				{
					buildInfo: {
						fileDependencies: ['example/src/svgs/smiley-surprised.svg']
					}
				},
				{ buildInfo: { fileDependencies: ['example/src/svgs/popcorn.svg'] } }
			]
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
			context: '/svg-chunk-webpack-plugin/',
			output: {
				path: '/dist',
				publicPath: '/dist'
			}
		},
		outputOptions: {
			hashFunction: 'md4',
			hashDigest: 'hex'
		}
	};

	svgChunkWebpackPlugin = getInstance();
});

afterEach(() => {
	path.relative = originalPathRelative;
});

describe('SvgChunkWebpackPlugin constructor', () => {
	it.skip('Should initialize the constructor with custom options', () => {
		expect(svgChunkWebpackPlugin.options).toMatchObject({
			svgstoreConfig: {
				cleanDefs: false,
				cleanSymbols: false,
				inline: true,
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
					}
				]
			},
			generateSpritesManifest: true,
			generateSpritesPreview: true,
			filename: '[name].svg'
		});
		expect(svgChunkWebpackPlugin.svgOptimizer).toBeInstanceOf(Svgo);
		expect(svgChunkWebpackPlugin.spritesManifest).toEqual({});
		expect(svgChunkWebpackPlugin.spritesList).toEqual([]);
		expect(svgChunkWebpackPlugin.PLUGIN_NAME).toBe('svg-chunk-webpack-plugin');
	});

	it.skip('Should initialize the constructor with default options', () => {
		const instance = new SvgChunkWebpackPlugin();
		expect(instance.options).toMatchObject({
			svgstoreConfig: {
				cleanDefs: false,
				cleanSymbols: false,
				inline: true,
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
					}
				]
			},
			generateSpritesManifest: false,
			generateSpritesPreview: false
		});
	});
});

describe('SvgChunkWebpackPlugin apply', () => {
	it.skip('Should call the apply function', () => {
		const compilerWebpack = {
			hooks: {
				emit: {
					tapPromise: () => {}
				}
			}
		};
		compilerWebpack.hooks.emit.tapPromise = jest.fn();

		svgChunkWebpackPlugin.apply(compilerWebpack);

		expect(compilerWebpack.hooks.emit.tapPromise).toHaveBeenCalled();
	});
});

describe('SvgChunkWebpackPlugin hookCallback', () => {
	it.skip('Should call the hookCallback function', async () => {
		mockGetEntryNames(svgChunkWebpackPlugin, entryNames);
		svgChunkWebpackPlugin.processEntry = jest.fn();
		svgChunkWebpackPlugin.createSpritesManifest = jest.fn();
		svgChunkWebpackPlugin.createSpritesPreview = jest.fn();

		await svgChunkWebpackPlugin.hookCallback(compilationWebpack);

		expect(svgChunkWebpackPlugin.compilation).toEqual(compilationWebpack);
		expect(svgChunkWebpackPlugin.getEntryNames).toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.processEntry).toHaveBeenCalledTimes(2);
		expect(svgChunkWebpackPlugin.processEntry).toHaveBeenCalledWith('home');
		expect(svgChunkWebpackPlugin.processEntry).toHaveBeenCalledWith('news');
		expect(svgChunkWebpackPlugin.createSpritesManifest).toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.createSpritesPreview).toHaveBeenCalled();
	});

	it.skip('Should call the hookCallback function without manifest and preview', async () => {
		mockGetEntryNames(svgChunkWebpackPlugin, entryNames);
		svgChunkWebpackPlugin.processEntry = jest.fn();
		svgChunkWebpackPlugin.createSpritesManifest = jest.fn();
		svgChunkWebpackPlugin.createSpritesPreview = jest.fn();

		svgChunkWebpackPlugin.options.generateSpritesManifest = false;
		svgChunkWebpackPlugin.options.generateSpritesPreview = false;
		await svgChunkWebpackPlugin.hookCallback(compilationWebpack);

		expect(svgChunkWebpackPlugin.createSpritesManifest).not.toHaveBeenCalled();
		expect(svgChunkWebpackPlugin.createSpritesPreview).not.toHaveBeenCalled();
	});
});

describe('SvgChunkWebpackPlugin getEntryNames', () => {
	it.skip('Should call the getEntryNames function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;

		expect(svgChunkWebpackPlugin.getEntryNames()).toEqual(['home', 'news']);
	});
});

describe('SvgChunkWebpackPlugin processEntry', () => {
	it.skip('Should call the processEntry function', async () => {
		mockGetSvgsByEntrypoint(svgChunkWebpackPlugin, svgsFilepath);
		mockOptimizeSvg(svgChunkWebpackPlugin, svgsFixture);
		mockGenerateSprite(svgChunkWebpackPlugin, spritesFixture.home);
		svgChunkWebpackPlugin.createSpriteAsset = jest.fn();

		// Mock core node module to avoid absolute path conflict in the test environment
		// The original function is return after the test
		path.relative = jest
			.fn()
			.mockImplementation((context, filepath) => `${context}${filepath}`);

		svgChunkWebpackPlugin.compilation = compilationWebpack;
		await svgChunkWebpackPlugin.processEntry('home');

		const entry = 'home';
		expect(svgChunkWebpackPlugin.getSvgsByEntrypoint).toHaveBeenCalledWith(entry);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledTimes(3);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledWith(
			'example/src/svgs/gradient.svg'
		);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledWith(
			'example/src/svgs/video.svg'
		);
		expect(svgChunkWebpackPlugin.optimizeSvg).toHaveBeenCalledWith(
			'example/src/svgs/smiley-love.svg'
		);
		expect(svgChunkWebpackPlugin.generateSprite).toHaveBeenCalledWith(svgsSprite);
		expect(svgChunkWebpackPlugin.createSpriteAsset).toHaveBeenCalledWith({
			entryName: entry,
			sprite: spritesFixture.home
		});
		expect(svgChunkWebpackPlugin.spritesManifest).toEqual({
			home: svgsFilepath.map(
				(filepath) => `${svgChunkWebpackPlugin.compilation.options.context}${filepath}`
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
	it.skip('Should call the optimizeSvg function', async () => {
		// fse.readFile = jest.fn().mockImplementation(() => svgsFixture.gradient);
		// svgChunkWebpackPlugin.svgOptimizer.optimize = jest
		// 	.fn()
		// 	.mockImplementation(() => ({ data: svgsFixture.gradient }));
		// const result = await svgChunkWebpackPlugin.optimizeSvg(svgsFilepath[0]);
		// expect(fse.readFile).toHaveBeenCalledWith(svgsFilepath[0], 'utf8');
		// expect(svgChunkWebpackPlugin.svgOptimizer.optimize).toHaveBeenCalledWith(
		// 	svgsFixture.gradient
		// );
		// expect(result).toEqual({
		// 	name: 'gradient',
		// 	content: svgsFixture.gradient
		// });
	});
});

describe('SvgChunkWebpackPlugin getSvgsByEntrypoint', () => {
	it.skip('Should call the getSvgsByEntrypoint function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;

		const result = svgChunkWebpackPlugin.getSvgsByEntrypoint('home');

		expect(result).toEqual(svgsFilepath);
	});
});

describe('SvgChunkWebpackPlugin generateSprite', () => {
	it.skip('Should call the generateSprite function', () => {
		const result = svgChunkWebpackPlugin.generateSprite(svgsSprite);

		expect(result).toBe(spritesFixture.home);
	});
});

describe('SvgChunkWebpackPlugin createSpriteAsset', () => {
	it.skip('Should call the createSpriteAsset function', () => {
		svgChunkWebpackPlugin.getFileName = jest.fn().mockImplementation(() => 'home.svg');

		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const output = spritesFixture.home;

		svgChunkWebpackPlugin.createSpriteAsset({ entryName: 'home', sprite: output });

		expect(svgChunkWebpackPlugin.compilation.assets).toEqual({
			'home.svg': {
				source: expect.any(Function),
				size: expect.any(Function)
			}
		});
		expect(svgChunkWebpackPlugin.compilation.assets['home.svg'].source()).toBe(output);
		expect(svgChunkWebpackPlugin.compilation.assets['home.svg'].size()).toBe(output.length);
	});
});

describe('SvgChunkWebpackPlugin getFileName', () => {
	it.skip('Should call the getFileName function with default options', () => {
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

	it.skip('Should call the getFileName function with custom name', () => {
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

	it.skip('Should call the getFileName function with [hash]', () => {
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

	it.skip('Should call the getFileName function with [chunkhash]', () => {
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

	it.skip('Should call the getFileName function with [contenthash]', () => {
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
	it.skip('Should call the getBuildHash function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const result = svgChunkWebpackPlugin.getBuildHash();

		expect(result).toBe('4cc05208d925b7b31259');
	});
});

describe('SvgChunkWebpackPlugin getChunkHash', () => {
	it.skip('Should call the getChunkHash function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const result = svgChunkWebpackPlugin.getChunkHash('home');

		expect(result).toBe('beb18939e5093045258b8d24a34dd844');
	});

	it.skip('Should call the getChunkHash function without chunks[0]', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		svgChunkWebpackPlugin.compilation.entrypoints.get('home').chunks = [];
		const result = svgChunkWebpackPlugin.getChunkHash('home');

		expect(result).toBe('');
	});
});

describe('SvgChunkWebpackPlugin getContentHash', () => {
	it.skip('Should call the getContentHash function', () => {
		svgChunkWebpackPlugin.compilation = compilationWebpack;
		const result = svgChunkWebpackPlugin.getContentHash(spritesFixture.home);

		expect(util.createHash).toHaveBeenCalledWith('md4');
		expect(util.update).toHaveBeenCalledWith(spritesFixture.home);
		expect(util.digest).toHaveBeenCalledWith('hex');
		expect(result).toBe('a5934d97b38c748213317d7e5ffd31b6');
	});
});

describe('SvgChunkWebpackPlugin createSpritesManifest', () => {
	it.skip('Should call the createSpritesManifest function', () => {
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

		expect(svgChunkWebpackPlugin.compilation.assets).toEqual({
			'sprites-manifest.json': {
				source: expect.any(Function),
				size: expect.any(Function)
			}
		});
		expect(svgChunkWebpackPlugin.compilation.assets['sprites-manifest.json'].source()).toBe(
			output
		);
		expect(svgChunkWebpackPlugin.compilation.assets['sprites-manifest.json'].size()).toBe(
			output.length
		);
	});
});

describe('SvgChunkWebpackPlugin createSpritesPreview', () => {
	it.skip('Should call the createSpritesPreview function', () => {
		// fse.outputFileSync = jest.fn();
		// svgChunkWebpackPlugin.getPreviewTemplate = jest.fn().mockImplementation(() => 'template');
		// svgChunkWebpackPlugin.compilation = compilationWebpack;
		// svgChunkWebpackPlugin.createSpritesPreview();
		// expect(svgChunkWebpackPlugin.getPreviewTemplate).toHaveBeenCalled();
		// expect(fse.outputFileSync).toHaveBeenCalledWith(
		// 	`${compilationWebpack.options.output.path}/sprites-preview.html`,
		// 	'template'
		// );
	});
});

describe('SvgChunkWebpackPlugin getPreviewTemplate', () => {
	it.skip('Should call the getPreviewTemplate function', () => {
		svgChunkWebpackPlugin.getSpritesList = jest.fn().mockImplementation(() => spritesList);

		svgChunkWebpackPlugin.getPreviewTemplate();

		expect(svgChunkWebpackPlugin.getSpritesList).toHaveBeenCalled();
		expect(templatePreview).toHaveBeenCalledWith(spritesList);
	});
});

describe('SvgChunkWebpackPlugin getSpritesList', () => {
	it.skip('Should call the getSpritesList function', () => {
		svgChunkWebpackPlugin.spritesList = spritesList;
		const result = svgChunkWebpackPlugin.getSpritesList();

		expect(result).toEqual(spritesList);
	});
});
