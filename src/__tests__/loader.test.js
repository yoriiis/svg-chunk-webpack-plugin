'use strict';

import loader from '../loader';
import svgoConfig from '../../example/svgo.config';
import { optimize, loadConfig } from 'svgo';
const PACKAGE_NAME = require('../../package.json').name;

jest.mock('svgo', () => {
	const originalModule = jest.requireActual('svgo');
	return {
		...originalModule,
		optimize: jest.fn(),
		loadConfig: jest.fn()
	};
});

let _this;
let callback;

beforeEach(() => {
	callback = jest.fn();
	_this = {
		_compiler: {
			options: {
				plugins: [
					{
						PLUGIN_NAME: 'svg-chunk-webpack-plugin'
					}
				]
			}
		},
		_module: {
			buildInfo: {},
			factoryMeta: {}
		},
		async: jest.fn().mockReturnValue(callback),
		getOptions: jest.fn(),
		context: './'
	};
});

describe('Loader', () => {
	beforeEach(() => {
		optimize.mockReturnValue({ data: 'svg minified' });
	});

	afterEach(() => {
		expect(_this._module.factoryMeta.sideEffectFree).toBe(false);
		expect(_this._module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN).toBe(true);
		expect(_this.getOptions).toHaveBeenCalled();
	});

	it('Should call the loader function with the config file as string', async () => {
		_this.getOptions.mockReturnValue({ configFile: 'svgo.config.js' });
		loadConfig.mockReturnValue(svgoConfig);
		callback.mockReturnValue('svg stringify');

		const result = await loader.call(_this, '<svg></svg>');

		expect(loadConfig).toHaveBeenCalledWith('svgo.config.js', './');
		expect(optimize).toHaveBeenCalledWith('<svg></svg>', svgoConfig);
		expect(callback).toHaveBeenCalledWith(null, JSON.stringify('svg minified'));
		expect(result).toStrictEqual('svg stringify');
	});

	it('Should call the loader function without the config file to load', async () => {
		await loader.call(_this, '<svg></svg>');

		expect(loadConfig).toHaveBeenCalledWith(null, './');
	});

	it('Should call the loader function without factoryMeta object data', async () => {
		delete _this._module.factoryMeta;
		await loader.call(_this, '<svg></svg>');
	});
});

describe('Loader with errors', () => {
	it('Should call the loader function with a wrong SVG', async () => {
		await loader.call(_this, 'wrong svg');

		expect.assertions(1);
		expect(callback).toHaveBeenCalledWith(new Error(`${PACKAGE_NAME} exception. wrong svg`));
	});

	it('Should call the loader function without the plugin imported', async () => {
		_this._compiler.options.plugins = [];

		await loader.call(_this, '<svg></svg>');

		expect(callback).toHaveBeenCalledWith(
			new Error(`${PACKAGE_NAME} requires the corresponding plugin`)
		);
	});
});
