"use strict";
const PACKAGE_NAME = require('../package.json').name;
module.exports = function spriteLoader(content) {
    const compiler = this._compiler;
    // Declare all SVG files as side effect
    // https://github.com/webpack/webpack/issues/12202#issuecomment-745537821
    this._module.factoryMeta = this._module.factoryMeta || {};
    this._module.factoryMeta.sideEffectFree = false;
    this._module.buildInfo.SVG_CHUNK_WEBPACK_PLUGIN = true;
    // Check if content is a SVG file
    if (!content.includes('<svg')) {
        throw new Error(`${PACKAGE_NAME} exception. ${content}`);
    }
    // Check if the plugin is also imported
    const plugin = compiler.options.plugins.find((plugin) => plugin.PLUGIN_NAME && plugin.PLUGIN_NAME === PACKAGE_NAME);
    if (typeof plugin === 'undefined') {
        throw new Error(`${PACKAGE_NAME} requires the corresponding plugin`);
    }
    return JSON.stringify(content);
};
