/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*********************************!*\
  !*** ./example/src/js/app-a.js ***!
  \*********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _svgs_gradient_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../svgs/gradient.svg */ 1);
/* harmony import */ var _svgs_gradient_svg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_svgs_gradient_svg__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _svgs_video_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../svgs/video.svg */ 2);
/* harmony import */ var _svgs_video_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_svgs_video_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _app_c__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-c */ 3);






/***/ }),
/* 1 */
/*!***************************************!*\
  !*** ./example/src/svgs/gradient.svg ***!
  \***************************************/
/***/ (function(module, exports) {

"<svg\n\txmlns=\"http://www.w3.org/2000/svg\">\n\t<defs>\n\t\t<linearGradient id=\"MyGradient\">\n\t\t\t<stop offset=\"5%\"  stop-color=\"green\"/>\n\t\t\t<stop offset=\"95%\" stop-color=\"gold\"/>\n\t\t</linearGradient>\n\t</defs>\n\t<rect fill=\"url(#MyGradient)\" width=\"100%\" height=\"100%\"/>\n</svg>"

/***/ }),
/* 2 */
/*!************************************!*\
  !*** ./example/src/svgs/video.svg ***!
  \************************************/
/***/ (function(module, exports) {

"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!-- Generator: Adobe Illustrator 22.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n<svg version=\"1.1\" id=\"Calque_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 16 16\" style=\"enable-background:new 0 0 16 16;\" xml:space=\"preserve\">\n\t<style type=\"text/css\">\n\t\t.st0{fill:#FF004B;}\n\t</style>\n\t<title>icone video</title>\n\t<desc>Created with Sketch.</desc>\n\t<g>\n\t\t<g transform=\"translate(-10.000000, -4776.000000)\">\n\t\t\t<g transform=\"translate(10.000000, 4566.000000)\">\n\t\t\t\t<g transform=\"translate(0.000000, 208.000000)\">\n\t\t\t\t\t<path class=\"st0\" d=\"M8,2c-4.4,0-8,3.6-8,8s3.6,8,8,8s8-3.6,8-8S12.4,2,8,2z M11.3,10.5l-4.5,3c-0.1,0-0.1,0.1-0.2,0.1s-0.2,0-0.3-0.1C6.1,13.4,6,13.2,6,13V7c0-0.2,0.1-0.4,0.2-0.5c0.2-0.1,0.3-0.1,0.5,0l4.5,3c0.2,0.1,0.3,0.3,0.3,0.5S11.4,10.4,11.3,10.5z\"/>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t</g>\n\t</g>\n</svg>\n"

/***/ }),
/* 3 */
/*!*********************************!*\
  !*** ./example/src/js/app-c.js ***!
  \*********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _svgs_smiley_love_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../svgs/smiley-love.svg */ 4);
/* harmony import */ var _svgs_smiley_love_svg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_svgs_smiley_love_svg__WEBPACK_IMPORTED_MODULE_0__);



/***/ }),
/* 4 */
/*!******************************************!*\
  !*** ./example/src/svgs/smiley-love.svg ***!
  \******************************************/
/***/ (function(module, exports) {

"<svg version=\"1.1\" id=\"Calque_1\"\n\txmlns=\"http://www.w3.org/2000/svg\" x=\"0\" y=\"0\" viewBox=\"0 0 48 48\" xml:space=\"preserve\">\n\t<style>.st2{fill:#e64c3c}</style>\n\t<circle id=\"Oval\" class=\"st0\" cx=\"24\" cy=\"24\" r=\"24\" fill=\"#fbd971\"/>\n\t<path id=\"Shape\" class=\"st1\" d=\"M24 41.1c-7.6 0-13.7-6.2-13.7-13.7 0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1 0 6.3 5.1 11.4 11.4 11.4s11.4-5.1 11.4-11.4c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1.2 7.6-5.9 13.7-13.5 13.7z\" fill=\"#d8b11a\"/>\n\t<path id=\"Shape_1_\" class=\"st2\" d=\"M14.3 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.4 0 2.4.8 2.9 1.9z\"/>\n\t<path id=\"Shape_2_\" data-name=\"Calque 1-2-2\" class=\"st2\" d=\"M33.6 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.3 0 2.4.8 2.9 1.9z\"/>\n</svg>"

/***/ })
/******/ ]);