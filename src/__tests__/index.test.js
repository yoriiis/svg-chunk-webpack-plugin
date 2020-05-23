'use strict';

import SVGSprite from '../index';

import { mockGetEntryNames } from '../__mocks__/mocks';

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

const svgs = [
	{ filename: 'gradient', source: JSON.stringify(svgsFixture.gradient) },
	{ filename: 'heart', source: JSON.stringify(svgsFixture.heart) },
	{ filename: 'smiley', source: JSON.stringify(svgsFixture.smiley) }
];

const options = {
	cleanDefs: false,
	cleanSymbols: false,
	inline: true,
	svgAttrs: {
		'aria-hidden': true,
		style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
	}
};

const getInstance = () => new SVGSprite(options);

const entrypointsMap = new Map();
entrypointsMap.set('app-a', {
	chunks: [
		{
			getModules: () => [
				{
					buildInfo: { fileDependencies: ['./example/src/js/app-a.js'] },
					originalSource: () => ({
						_value: JSON.stringify(svgsFixture.gradient)
					})
				},
				{
					buildInfo: { fileDependencies: ['./example/src/svgs/gradient.svg'] },
					originalSource: () => ({
						_value: JSON.stringify(svgsFixture.gradient)
					})
				},
				{
					buildInfo: { fileDependencies: ['./example/src/svgs/heart.svg'] },
					originalSource: () => ({
						_value: JSON.stringify(svgsFixture.heart)
					})
				},
				{
					buildInfo: { fileDependencies: ['./example/src/js/app-c.js'] },
					originalSource: () => ({
						_value: JSON.stringify(svgsFixture.gradient)
					})
				},
				{
					buildInfo: { fileDependencies: ['./example/src/svgs/smiley.svg'] },
					originalSource: () => ({
						_value: JSON.stringify(svgsFixture.smiley)
					})
				}
			]
		}
	]
});
entrypointsMap.set('app-b', {
	chunks: [
		{
			getModules: () => [
				{ buildInfo: { fileDependencies: ['./example/src/svgs/tram.svg'] } },
				{ buildInfo: { fileDependencies: ['./example/src/svgs/video.svg'] } }
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
			output: {
				path: '/dist/',
				publicPath: '/dist'
			}
		}
	};

	svgSprite = getInstance();
});

describe('SvgSprite constructor', () => {
	it('Should initialize the constructor with custom options', () => {
		expect(svgSprite.options).toMatchObject({
			cleanDefs: false,
			cleanSymbols: false,
			inline: true,
			svgAttrs: {
				'aria-hidden': true,
				style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
			}
		});
	});

	it('Should initialize the constructor with default options', () => {
		const instance = new SVGSprite();
		expect(instance.options).toMatchObject({
			cleanDefs: false,
			cleanSymbols: false,
			inline: true,
			svgAttrs: {
				'aria-hidden': true,
				style: 'position: absolute; width: 0; height: 0; overflow: hidden;'
			}
		});
	});
});

describe('SvgSprite apply', () => {
	it('Should call the apply function', () => {
		const compilerWebpack = {
			hooks: {
				emit: {
					tap: () => {}
				}
			}
		};
		compilerWebpack.hooks.emit.tap = jest.fn();

		svgSprite.apply(compilerWebpack);

		expect(compilerWebpack.hooks.emit.tap).toHaveBeenCalled();
	});
});

describe('SvgSprite hookCallback', () => {
	it('Should call the hookCallback function', () => {
		mockGetEntryNames(svgSprite, entryNames);
		svgSprite.processEntry = jest.fn();

		svgSprite.hookCallback(compilationWebpack);

		expect(svgSprite.getEntryNames).toHaveBeenCalled();

		expect(svgSprite.processEntry).toHaveBeenCalledTimes(2);
		expect(svgSprite.processEntry).toHaveBeenCalledWith('app-a');
		expect(svgSprite.processEntry).toHaveBeenCalledWith('app-b');
	});
});

describe('SvgSprite getEntryNames', () => {
	it('Should call the getEntryNames function', () => {
		svgSprite.compilation = compilationWebpack;

		expect(svgSprite.getEntryNames()).toEqual(['app-a', 'app-b']);
	});
});

describe('SvgSprite processEntry', () => {
	it('Should call the processEntry function', () => {
		svgSprite.getSvgsByEntrypoints = jest
			.fn()
			.mockImplementation(() => [{ filename: 'gradient', source: svgsFixture.gradient }]);
		svgSprite.generateSprite = jest.fn().mockImplementation(() => spritesFixture['app-a']);
		svgSprite.createAsset = jest.fn();

		svgSprite.processEntry('app-a');

		const entry = 'app-a';
		expect(svgSprite.getSvgsByEntrypoints).toHaveBeenCalledWith(entry);
		expect(svgSprite.generateSprite).toHaveBeenCalledWith({
			svgs: [{ filename: 'gradient', source: svgsFixture.gradient }]
		});
		expect(svgSprite.createAsset).toHaveBeenCalledWith({
			entryName: entry,
			sprite: spritesFixture['app-a']
		});
	});
});

describe('SvgSprite getSvgsByEntrypoints', () => {
	it('Should call the getSvgsByEntrypoints function', () => {
		svgSprite.compilation = compilationWebpack;

		const result = svgSprite.getSvgsByEntrypoints('app-a');

		expect(result).toEqual(svgs);
	});
});

describe('SvgSprite createSprites', () => {
	it('Should call the createSprites function', () => {
		const result = svgSprite.generateSprite({ svgs });

		expect(result).toBe(spritesFixture['app-a']);
	});
});

describe('SvgSprite createAsset', () => {
	it('Should call the createAsset function', () => {
		svgSprite.compilation = compilationWebpack;
		const output = spritesFixture['app-a'];

		svgSprite.createAsset({ entryName: 'app-a', sprite: output });

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
