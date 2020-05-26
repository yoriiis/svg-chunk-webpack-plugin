'use strict';

import SVGSprite from '../index';

import {
	mockGetEntryNames,
	mockGetSvgsByEntrypoint,
	mockOptimizeSvg,
	mockGenerateSprite
} from '../__mocks__/mocks';
import templatePreview from '../preview';

import path from 'path';
import fse from 'fs-extra';
import Svgo from 'svgo';
const minify = require('html-minifier').minify;

jest.mock('../preview');
jest.mock('html-minifier');

let svgSprite;
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
	'app-a':
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
	name: 'app-a',
	content: spritesFixture['app-a'],
	svgs: ['gradient', 'video', 'smiley-love']
};

const options = {
	generateSpritesManifest: true,
	generateSpritesPreview: true
};

const getInstance = () => new SVGSprite(options);

const entrypointsMap = new Map();
entrypointsMap.set('app-a', {
	chunks: [
		{
			getModules: () => [
				{
					buildInfo: { fileDependencies: ['example/src/js/app-a.js'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/svgs/gradient.svg'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/svgs/video.svg'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/js/app-c.js'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/svgs/smiley-love.svg'] }
				}
			]
		}
	]
});
entrypointsMap.set('app-b', {
	chunks: [
		{
			getModules: () => [
				{ buildInfo: { fileDependencies: ['example/src/svgs/smiley-surprised.svg'] } },
				{ buildInfo: { fileDependencies: ['example/src/svgs/popcorn.svg'] } }
			]
		}
	]
});

beforeEach(() => {
	entryNames = ['app-a', 'app-b'];
	compilationWebpack = {
		assets: {},
		entrypoints: entrypointsMap,
		options: {
			mode: 'development',
			context: '/svg-sprite/',
			output: {
				path: '/dist',
				publicPath: '/dist'
			}
		}
	};

	svgSprite = getInstance();
});

describe('SvgSprite constructor', () => {
	it('Should initialize the constructor with custom options', () => {
		expect(svgSprite.options).toMatchObject({
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
			generateSpritesPreview: true
		});
		expect(svgSprite.svgOptimizer).toBeInstanceOf(Svgo);
		expect(svgSprite.spritesManifest).toEqual({});
		expect(svgSprite.spritesList).toEqual([]);
	});

	it('Should initialize the constructor with default options', () => {
		const instance = new SVGSprite();
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

describe('SvgSprite apply', () => {
	it('Should call the apply function', () => {
		const compilerWebpack = {
			hooks: {
				emit: {
					tapPromise: () => {}
				}
			}
		};
		compilerWebpack.hooks.emit.tapPromise = jest.fn();

		svgSprite.apply(compilerWebpack);

		expect(compilerWebpack.hooks.emit.tapPromise).toHaveBeenCalled();
	});
});

describe('SvgSprite hookCallback', () => {
	it('Should call the hookCallback function', async () => {
		mockGetEntryNames(svgSprite, entryNames);
		svgSprite.processEntry = jest.fn();
		svgSprite.createSpritesManifest = jest.fn();
		svgSprite.createSpritesPreview = jest.fn();

		await svgSprite.hookCallback(compilationWebpack);

		expect(svgSprite.compilation).toEqual(compilationWebpack);
		expect(svgSprite.getEntryNames).toHaveBeenCalled();
		expect(svgSprite.processEntry).toHaveBeenCalledTimes(2);
		expect(svgSprite.processEntry).toHaveBeenCalledWith('app-a');
		expect(svgSprite.processEntry).toHaveBeenCalledWith('app-b');
		expect(svgSprite.createSpritesManifest).toHaveBeenCalled();
		expect(svgSprite.createSpritesPreview).toHaveBeenCalled();
	});

	it('Should call the hookCallback function without manifest and preview', async () => {
		mockGetEntryNames(svgSprite, entryNames);
		svgSprite.processEntry = jest.fn();
		svgSprite.createSpritesManifest = jest.fn();
		svgSprite.createSpritesPreview = jest.fn();

		svgSprite.options.generateSpritesManifest = false;
		svgSprite.options.generateSpritesPreview = false;
		await svgSprite.hookCallback(compilationWebpack);

		expect(svgSprite.createSpritesManifest).not.toHaveBeenCalled();
		expect(svgSprite.createSpritesPreview).not.toHaveBeenCalled();
	});
});

describe('SvgSprite getEntryNames', () => {
	it('Should call the getEntryNames function', () => {
		svgSprite.compilation = compilationWebpack;

		expect(svgSprite.getEntryNames()).toEqual(['app-a', 'app-b']);
	});
});

describe('SvgSprite processEntry', () => {
	it('Should call the processEntry function', async () => {
		mockGetSvgsByEntrypoint(svgSprite);
		mockOptimizeSvg(svgSprite, svgsFixture);
		mockGenerateSprite(svgSprite, spritesFixture['app-a']);
		svgSprite.createSpriteAsset = jest.fn();
		path.relative = jest
			.fn()
			.mockImplementation((context, filepath) => `${context}${filepath}`);

		svgSprite.compilation = compilationWebpack;
		await svgSprite.processEntry('app-a');

		const entry = 'app-a';
		expect(svgSprite.getSvgsByEntrypoint).toHaveBeenCalledWith(entry);
		expect(svgSprite.optimizeSvg).toHaveBeenCalledTimes(3);
		expect(svgSprite.optimizeSvg).toHaveBeenCalledWith('example/src/svgs/gradient.svg');
		expect(svgSprite.optimizeSvg).toHaveBeenCalledWith('example/src/svgs/video.svg');
		expect(svgSprite.optimizeSvg).toHaveBeenCalledWith('example/src/svgs/smiley-love.svg');
		expect(svgSprite.generateSprite).toHaveBeenCalledWith(svgsSprite);
		expect(svgSprite.createSpriteAsset).toHaveBeenCalledWith({
			entryName: entry,
			sprite: spritesFixture['app-a']
		});
		expect(svgSprite.spritesManifest).toEqual({
			'app-a': svgsFilepath.map(
				filepath => `${svgSprite.compilation.options.context}${filepath}`
			)
		});
		expect(svgSprite.spritesList).toEqual([
			{
				name: entry,
				content: spritesFixture['app-a'],
				svgs: ['gradient', 'video', 'smiley-love']
			}
		]);
	});
});

describe('SvgSprite optimizeSvg', () => {
	it('Should call the optimizeSvg function', async () => {
		fse.readFile = jest.fn().mockImplementation(() => svgsFixture.gradient);
		svgSprite.svgOptimizer.optimize = jest
			.fn()
			.mockImplementation(() => ({ data: svgsFixture.gradient }));

		const result = await svgSprite.optimizeSvg(svgsFilepath[0]);

		expect(fse.readFile).toHaveBeenCalledWith(svgsFilepath[0], 'utf8');
		expect(svgSprite.svgOptimizer.optimize).toHaveBeenCalledWith(svgsFixture.gradient);
		expect(result).toEqual({
			name: 'gradient',
			content: svgsFixture.gradient
		});
	});
});

describe('SvgSprite getSvgsByEntrypoint', () => {
	it('Should call the getSvgsByEntrypoint function', () => {
		svgSprite.compilation = compilationWebpack;

		const result = svgSprite.getSvgsByEntrypoint('app-a');

		expect(result).toEqual(svgsFilepath);
	});
});

describe('SvgSprite generateSprite', () => {
	it('Should call the generateSprite function', () => {
		const result = svgSprite.generateSprite(svgsSprite);

		expect(result).toBe(spritesFixture['app-a']);
	});
});

describe('SvgSprite createSpriteAsset', () => {
	it('Should call the createSpriteAsset function', () => {
		svgSprite.compilation = compilationWebpack;
		const output = spritesFixture['app-a'];

		svgSprite.createSpriteAsset({ entryName: 'app-a', sprite: output });

		expect(svgSprite.compilation.assets).toEqual({
			'app-a.svg': {
				source: expect.any(Function),
				size: expect.any(Function)
			}
		});
		expect(svgSprite.compilation.assets['app-a.svg'].source()).toBe(output);
		expect(svgSprite.compilation.assets['app-a.svg'].size()).toBe(output.length);
	});
});

describe('SvgSprite createSpritesManifest', () => {
	it('Should call the createSpritesManifest function', () => {
		svgSprite.compilation = compilationWebpack;

		svgSprite.spritesManifest = {
			'app-a': [
				'example/src/svgs/gradient.svg',
				'example/src/svgs/video.svg',
				'example/src/svgs/smiley-love.svg'
			]
		};
		const output = JSON.stringify(svgSprite.spritesManifest, null, 2);
		svgSprite.createSpritesManifest();

		expect(svgSprite.compilation.assets).toEqual({
			'sprites-manifest.json': {
				source: expect.any(Function),
				size: expect.any(Function)
			}
		});
		expect(svgSprite.compilation.assets['sprites-manifest.json'].source()).toBe(output);
		expect(svgSprite.compilation.assets['sprites-manifest.json'].size()).toBe(output.length);
	});
});

describe('SvgSprite createSpritesPreview', () => {
	it('Should call the createSpritesPreview function', () => {
		fse.outputFileSync = jest.fn();
		svgSprite.getPreviewTemplate = jest.fn().mockImplementation(() => 'template');

		svgSprite.compilation = compilationWebpack;
		svgSprite.createSpritesPreview();

		expect(svgSprite.getPreviewTemplate).toHaveBeenCalled();
		expect(fse.outputFileSync).toHaveBeenCalledWith(
			`${compilationWebpack.options.output.path}/sprites-preview.html`,
			'template'
		);
	});
});

describe('SvgSprite getPreviewTemplate', () => {
	it('Should call the getPreviewTemplate function', () => {
		svgSprite.getSpritesList = jest.fn().mockImplementation(() => spritesList);

		svgSprite.getPreviewTemplate();

		expect(minify).toHaveBeenCalled();
		expect(svgSprite.getSpritesList).toHaveBeenCalled();
		expect(templatePreview).toHaveBeenCalledWith(spritesList);
	});
});

describe('SvgSprite getSpritesList', () => {
	it('Should call the getSpritesList function', () => {
		svgSprite.spritesList = spritesList;
		const result = svgSprite.getSpritesList();

		expect(result).toEqual(spritesList);
	});
});
