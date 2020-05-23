"use strict";
// import { getOptions } from 'loader-utils';
module.exports = function (content) {
    // const options = getOptions(this);
    return JSON.stringify(content);
};
