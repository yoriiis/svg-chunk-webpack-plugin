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
/* harmony import */ var _svgs_heart_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../svgs/heart.svg */ 2);
/* harmony import */ var _svgs_heart_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_svgs_heart_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _app_c__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-c */ 3);






/***/ }),
/* 1 */
/*!***************************************!*\
  !*** ./example/src/svgs/gradient.svg ***!
  \***************************************/
/***/ (function(module, exports) {

"<svg xmlns=\"http://www.w3.org/2000/svg\">\n    <defs>\n        <linearGradient id=\"MyGradient\">\n            <stop offset=\"5%\"  stop-color=\"green\"/>\n            <stop offset=\"95%\" stop-color=\"gold\"/>\n        </linearGradient>\n    </defs>\n    <rect fill=\"url(#MyGradient)\" width=\"100%\" height=\"100%\"/>\n</svg>"

/***/ }),
/* 2 */
/*!************************************!*\
  !*** ./example/src/svgs/heart.svg ***!
  \************************************/
/***/ (function(module, exports) {

"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!-- Generator: Adobe Illustrator 22.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n<svg version=\"1.1\" id=\"Calque_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 13 11\" style=\"enable-background:new 0 0 13 11;\" xml:space=\"preserve\">\n<style type=\"text/css\">\n\t.st0{fill:#FF004B;}\n</style>\n<title>np_heart_2521675_000000</title>\n<desc>Created with Sketch.</desc>\n<g id=\"OLD\">\n\t<g id=\"iPhone-SE-Copy-3\" transform=\"translate(-114.000000, -237.000000)\">\n\t\t<g id=\"Group-4\" transform=\"translate(58.000000, 235.000000)\">\n\t\t\t<g id=\"np_heart_2521675_000000\" transform=\"translate(56.000000, 2.000000)\">\n\t\t\t\t<path id=\"Path\" class=\"st0\" d=\"M6.2,2.1C5.6,0.8,4.4,0,3.3,0C1.2,0,0.2,1.7,0.2,3.4c0,1.7,1,3.5,3,5.3C4.6,10,6,10.9,6.1,10.9\n\t\t\t\t\tc0,0,0.1,0,0.2,0c0.1,0,0.1,0,0.2-0.1c0.2-0.2,5.9-4,5.9-7.7c0-2.1-1.5-3.1-3.1-3.1C8,0,6.8,0.8,6.2,2.1z\"/>\n\t\t\t</g>\n\t\t</g>\n\t</g>\n</g>\n</svg>\n"

/***/ }),
/* 3 */
/*!*********************************!*\
  !*** ./example/src/js/app-c.js ***!
  \*********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _svgs_smiley_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../svgs/smiley.svg */ 4);
/* harmony import */ var _svgs_smiley_svg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_svgs_smiley_svg__WEBPACK_IMPORTED_MODULE_0__);



/***/ }),
/* 4 */
/*!*************************************!*\
  !*** ./example/src/svgs/smiley.svg ***!
  \*************************************/
/***/ (function(module, exports) {

"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 496 512\"><path fill=\"#ffcc4d\" d=\"M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm105.6-151.4c-25.9 8.3-64.4 13.1-105.6 13.1s-79.6-4.8-105.6-13.1c-9.9-3.1-19.4 5.4-17.7 15.3 7.9 47.1 71.3 80 123.3 80s115.3-32.9 123.3-80c1.6-9.8-7.7-18.4-17.7-15.3zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z\"></path></svg>"

/***/ })
/******/ ]);