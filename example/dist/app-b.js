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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/*!*********************************!*\
  !*** ./example/src/js/app-b.js ***!
  \*********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _svgs_tram_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../svgs/tram.svg */ 6);
/* harmony import */ var _svgs_tram_svg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_svgs_tram_svg__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _svgs_video_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../svgs/video.svg */ 7);
/* harmony import */ var _svgs_video_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_svgs_video_svg__WEBPACK_IMPORTED_MODULE_1__);




/***/ }),
/* 6 */
/*!***********************************!*\
  !*** ./example/src/svgs/tram.svg ***!
  \***********************************/
/***/ (function(module, exports) {

"<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M288 64c17.7 0 32-14.3 32-32S305.7 0 288 0s-32 14.3-32 32 14.3 32 32 32zm223.5-12.1c-2.3-8.6-11-13.6-19.6-11.3l-480 128c-8.5 2.3-13.6 11-11.3 19.6C2.5 195.3 8.9 200 16 200c1.4 0 2.8-.2 4.1-.5L240 140.8V224H64c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H272v-91.7l228.1-60.8c8.6-2.3 13.6-11.1 11.4-19.6zM176 384H80v-96h96v96zm160-96h96v96h-96v-96zm-32 0v96h-96v-96h96zM192 96c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z\"></path></svg>"

/***/ }),
/* 7 */
/*!************************************!*\
  !*** ./example/src/svgs/video.svg ***!
  \************************************/
/***/ (function(module, exports) {

"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!-- Generator: Adobe Illustrator 22.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n<svg version=\"1.1\" id=\"Calque_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 16 16\" style=\"enable-background:new 0 0 16 16;\" xml:space=\"preserve\">\n\t<style type=\"text/css\">\n\t\t.st0{fill:#FF004B;}\n\t</style>\n\t<title>icone video</title>\n\t<desc>Created with Sketch.</desc>\n\t<g>\n\t\t<g transform=\"translate(-10.000000, -4776.000000)\">\n\t\t\t<g transform=\"translate(10.000000, 4566.000000)\">\n\t\t\t\t<g transform=\"translate(0.000000, 208.000000)\">\n\t\t\t\t\t<path class=\"st0\" d=\"M8,2c-4.4,0-8,3.6-8,8s3.6,8,8,8s8-3.6,8-8S12.4,2,8,2z M11.3,10.5l-4.5,3c-0.1,0-0.1,0.1-0.2,0.1s-0.2,0-0.3-0.1C6.1,13.4,6,13.2,6,13V7c0-0.2,0.1-0.4,0.2-0.5c0.2-0.1,0.3-0.1,0.5,0l4.5,3c0.2,0.1,0.3,0.3,0.3,0.5S11.4,10.4,11.3,10.5z\"/>\n\t\t\t\t</g>\n\t\t\t</g>\n\t\t</g>\n\t</g>\n</svg>\n"

/***/ })
/******/ ]);