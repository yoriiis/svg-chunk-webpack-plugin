"use strict";
var PACKAGE_NAME = require('../package.json').name;
var fse = require("fs-extra");
module.exports = function spriteLoader(content) {
    var compiler = this._compiler;
    if (!content.includes('<svg')) {
        throw new Error(PACKAGE_NAME + " exception. " + content);
    }
    var plugin = compiler.options.plugins.find(function (plugin) { return plugin.NAMESPACE && plugin.NAMESPACE === fse.realpathSync(__dirname); });
    if (typeof plugin === 'undefined') {
        throw new Error(PACKAGE_NAME + " requires the corresponding plugin");
    }
    return JSON.stringify(content);
};
