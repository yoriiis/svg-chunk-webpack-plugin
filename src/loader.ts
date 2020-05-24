const PACKAGE_NAME = require('../package.json').name;

import fse = require('fs-extra');

export = function spriteLoader(this: any, content: string): string {
	const compiler = this._compiler;
	if (!content.includes('<svg')) {
		throw new Error(`${PACKAGE_NAME} exception. ${content}`);
	}

	const plugin = compiler.options.plugins.find(
		(plugin: any) => plugin.NAMESPACE && plugin.NAMESPACE === fse.realpathSync(__dirname)
	);
	if (typeof plugin === 'undefined') {
		throw new Error(`${PACKAGE_NAME} requires the corresponding plugin`);
	}

	return JSON.stringify(content);
};
