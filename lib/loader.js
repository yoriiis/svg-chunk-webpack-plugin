"use strict";
const PACKAGE_NAME = require('../package.json').name;
module.exports = function spriteLoader(content) {
    const compiler = this._compiler;
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
