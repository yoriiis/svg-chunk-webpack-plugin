'use strict';

import SVGSprite from '../index';

import {
	mockGetEntryNames,
	mockGetSvgsByEntrypoint,
	mockOptimizeSvg,
	mockGenerateSprite
} from '../__mocks__/mocks';
import path from 'path';
import fse from 'fs-extra';
import templatePreview from '../template-preview';
const minify = require('html-minifier').minify;

jest.mock('../template-preview');
jest.mock('html-minifier');

let svgSprite;
let compilationWebpack;
let entryNames;
const svgsFixture = {
	gradient:
		'<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><rect fill="url(#a)" width="100%" height="100%"/></svg>',
	heart:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 11"><path d="M6.2 2.1C5.6.8 4.4 0 3.3 0 1.2 0 .2 1.7.2 3.4s1 3.5 3 5.3C4.6 10 6 10.9 6.1 10.9h.2c.1 0 .1 0 .2-.1.2-.2 5.9-4 5.9-7.7C12.4 1 10.9 0 9.3 0 8 0 6.8.8 6.2 2.1z" fill="#ff004b"/></svg>',
	smiley:
		'<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="#ffcc4d" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm105.6-151.4c-25.9 8.3-64.4 13.1-105.6 13.1s-79.6-4.8-105.6-13.1c-9.9-3.1-19.4 5.4-17.7 15.3 7.9 47.1 71.3 80 123.3 80s115.3-32.9 123.3-80c1.6-9.8-7.7-18.4-17.7-15.3zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"/></svg>'
};

const spritesFixture = {
	'app-a':
		'<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><symbol id="gradient"><rect fill="url(#a)" width="100%" height="100%"/></symbol><symbol id="heart" viewBox="0 0 13 11"><path d="M6.2 2.1C5.6.8 4.4 0 3.3 0 1.2 0 .2 1.7.2 3.4s1 3.5 3 5.3C4.6 10 6 10.9 6.1 10.9h.2c.1 0 .1 0 .2-.1.2-.2 5.9-4 5.9-7.7C12.4 1 10.9 0 9.3 0 8 0 6.8.8 6.2 2.1z" fill="#ff004b"/></symbol><symbol id="smiley" viewBox="0 0 496 512"><path fill="#ffcc4d" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm105.6-151.4c-25.9 8.3-64.4 13.1-105.6 13.1s-79.6-4.8-105.6-13.1c-9.9-3.1-19.4 5.4-17.7 15.3 7.9 47.1 71.3 80 123.3 80s115.3-32.9 123.3-80c1.6-9.8-7.7-18.4-17.7-15.3zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"/></symbol></svg>'
};

const svgsFilepath = [
	'example/src/svgs/gradient.svg',
	'example/src/svgs/heart.svg',
	'example/src/svgs/smiley.svg'
];
const svgsSprite = [
	{ name: 'gradient', content: svgsFixture.gradient },
	{ name: 'heart', content: svgsFixture.heart },
	{ name: 'smiley', content: svgsFixture.smiley }
];
const spritesList = {
	name: 'app-a',
	content: spritesFixture['app-a'],
	svgs: ['gradient', 'heart', 'smiley']
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
					buildInfo: { fileDependencies: ['example/src/svgs/heart.svg'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/js/app-c.js'] }
				},
				{
					buildInfo: { fileDependencies: ['example/src/svgs/smiley.svg'] }
				}
			]
		}
	]
});
entrypointsMap.set('app-b', {
	chunks: [
		{
			getModules: () => [
				{ buildInfo: { fileDependencies: ['example/src/svgs/tram.svg'] } },
				{ buildInfo: { fileDependencies: ['example/src/svgs/video.svg'] } }
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
		expect(svgSprite.optimizeSvg).toHaveBeenCalledWith('example/src/svgs/heart.svg');
		expect(svgSprite.optimizeSvg).toHaveBeenCalledWith('example/src/svgs/smiley.svg');
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
				svgs: ['gradient', 'heart', 'smiley']
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
				'example/src/svgs/heart.svg',
				'example/src/svgs/smiley.svg'
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
