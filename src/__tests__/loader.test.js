'use strict';

import loader from '../loader';
const PACKAGE_NAME = require('../../package.json').name;

let _this;
const svgGradient =
	'<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><rect fill="url(#a)" width="100%" height="100%"/></svg>';

beforeEach(() => {
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
		}
	};
});

describe('Loader', () => {
	it('Should call the loader function with a valid SVG', () => {
		const result = loader.call(_this, svgGradient);

		expect(_this._module.factoryMeta.sideEffectFree).toBe(false);
		expect(_this._module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN).toBe(true);
		expect(result).toBe(JSON.stringify(svgGradient));
	});

	it('Should call the loader function without factoryMeta object data', () => {
		delete _this._module.factoryMeta;
		const result = loader.call(_this, svgGradient);

		expect(result).toBe(JSON.stringify(svgGradient));
	});

	it('Should call the loader function with a wrong SVG', () => {
		expect(() => {
			loader.call(_this, 'wrong svg');
		}).toThrow(new Error(`${PACKAGE_NAME} exception. wrong svg`));
	});

	it('Should call the loader function without the plugin imported', () => {
		_this._compiler.options.plugins[0] = 'another-plugin';
		expect(() => {
			loader.call(_this, svgGradient);
		}).toThrow(new Error(`${PACKAGE_NAME} requires the corresponding plugin`));
	});
});
