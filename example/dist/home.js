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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names

module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),
/* 1 */
/*!*********************************!*\
  !*** ./example/src/js/app-a.js ***!
  \*********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_app_a_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/app-a.css */ 2);
/* harmony import */ var _css_app_a_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_app_a_css__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _svgs_hand_hello_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../svgs/hand-hello.svg */ 3);
/* harmony import */ var _svgs_hand_hello_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_svgs_hand_hello_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _svgs_smiley_sad_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../svgs/smiley-sad.svg */ 4);
/* harmony import */ var _svgs_smiley_sad_svg__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_svgs_smiley_sad_svg__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _app_c__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app-c */ 5);





/***/ }),
/* 2 */
/*!***********************************!*\
  !*** ./example/src/css/app-a.css ***!
  \***********************************/
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ 0);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".button {\n\tdisplay: block;\n\twidth: auto;\n\theight: auto;\n\tbackground: none;\n\tcolor: #000;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),
/* 3 */
/*!*****************************************!*\
  !*** ./example/src/svgs/hand-hello.svg ***!
  \*****************************************/
/***/ (function(module, exports) {

"<svg version=\"1.1\" id=\"Calque_1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0\" y=\"0\" viewBox=\"0 0 50 50\" xml:space=\"preserve\"><style>.st2{fill:#ff004b}</style><g transform=\"translate(0 -1)\"><g id=\"Group\" transform=\"matrix(1 0 0 -1 0 50.951)\"><g id=\"Shape\"><path class=\"st0\" d=\"M6.7 37.3c1.3.9 3.3.7 4.4-.2l-1.3 2c-1.1 1.5-.7 3.2.8 4.3 1.5 1.1 3.7.7 4.7-.8l12.2-17.4h.1l-11 16.3c-1.1 1.6-.9 3.5.7 4.6 1.6 1.1 3.7.7 4.8-.8l14.4-20.4c1.1-1.6.6-3.7-1-4.8-.3-.2-.6-.3-.8-.4V7H20.8v4.3c-.2.2-1.3 1.1-1.5 1.3L5.9 32.5c-1.1 1.6-.7 3.7.8 4.8\" fill=\"#e0ab6f\"/><path class=\"st1\" d=\"M3.7 26s-1.6 2.3.7 3.9 3.9-.7 3.9-.7l7.3-10.6c.2.4.5.8.8 1.2L6.3 34.5s-1.6 2.3.7 3.9 3.9-.7 3.9-.7l9.5-13.9c.4.3.7.6 1.1.9l-11 16.1s-1.6 2.3.7 3.9 3.9-.7 3.9-.7l11-16.1c.4.2.8.5 1.2.7L17 43.5s-1.6 2.3.7 3.9 3.9-.7 3.9-.7l10.9-15.9.9-1.3.8-1.1c-6.9-4.7-7.5-13.6-3.6-19.3.8-1.1 1.9-.4 1.9-.4-4.7 6.9-3.3 14.6 3.6 19.3l-2 10.1s-.8 2.7 1.9 3.4c2.7.8 3.4-1.9 3.4-1.9l2.3-6.9c.9-2.8 1.9-5.5 3.2-8.1 3.7-7.3 1.5-16.4-5.5-21.2C31.8-1.8 21.5.1 16.3 7.7c-.3.4-.5.8-.7 1.2h-.1L3.7 26z\" fill=\"#ffcf99\"/><path class=\"st2\" d=\"M16.6 5.6c-5.5 0-11.1 5.6-11.1 11.1 0 .8-.6 1.4-1.3 1.4s-1.4-.6-1.4-1.4c0-8.3 5.6-13.9 13.9-13.9.8 0 1.4.7 1.4 1.4s-.7 1.4-1.5 1.4\"/><path class=\"st2\" d=\"M9.7 2.9c-4.2 0-6.9 2.8-6.9 6.9 0 .8-.6 1.4-1.4 1.4S0 10.6 0 9.8C0 4.3 4.2.1 9.7.1c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4m23.6 44.3c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4c5.5 0 11.1-5 11.1-11.1 0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4c-.1 7.7-5.6 13.9-13.9 13.9\"/><path class=\"st2\" d=\"M40.2 50c-.8 0-1.4-.6-1.4-1.3 0-.8.6-1.4 1.4-1.4 4.2 0 6.9-3.1 6.9-6.9 0-.8.7-1.4 1.4-1.4s1.3.6 1.3 1.4c0 5.2-4.1 9.6-9.6 9.6\"/></g></g></g></svg>"

/***/ }),
/* 4 */
/*!*****************************************!*\
  !*** ./example/src/svgs/smiley-sad.svg ***!
  \*****************************************/
/***/ (function(module, exports) {

"<svg version=\"1.1\" id=\"Calque_1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0\" y=\"0\" viewBox=\"0 0 40 40\" xml:space=\"preserve\"><style>.st1{fill:#664500}</style><g id=\"popin-404\" transform=\"translate(-833 -564)\"><g transform=\"translate(833 564)\" id=\"Group-3\"><g transform=\"matrix(1 0 0 -1 0 39.961)\" id=\"Group\"><path id=\"Path\" class=\"st0\" d=\"M39.9 20C39.9 9 31 0 20 0 8.9 0 0 9 0 20s8.9 20 20 20c11 0 19.9-9 19.9-20\" fill=\"#ffcc4d\"/><path id=\"SVGCleanerId_0\" class=\"st1\" d=\"M15.5 21.7c0-2.1-1.2-3.9-2.8-3.9S10 19.5 10 21.7c0 2.1 1.2 3.9 2.8 3.9s2.7-1.8 2.7-3.9\"/><path class=\"st1\" d=\"M5.6 3.9C5.6 1.8 4.3 0 2.8 0S0 1.8 0 3.9C0 6 1.2 7.8 2.8 7.8s2.8-1.7 2.8-3.9\" transform=\"translate(25.634 17.739)\" id=\"SVGCleanerId_0_1_\"/><path id=\"Path_1_\" class=\"st1\" d=\"M26 9s-1.3 4.9-6.1 4.9-6.1-4.8-6.1-4.9c-.1-.2 0-.5.3-.6.2-.1.5-.1.7.1 0 0 1.1 1 5.2 1 4 0 5.1-.9 5.2-1 .1-.1.2-.2.4-.2.1 0 .2 0 .3.1.1.2.2.4.1.6\"/><path id=\"Path_2_\" class=\"st2\" d=\"M11.1 6.7c0-3.1-2.5-5.5-5.5-5.5S0 3.6 0 6.7s4.4 11.1 5.5 11.1 5.6-8 5.6-11.1\" fill=\"#5dadec\"/><path class=\"st1\" d=\"M27.8 0c-6.2 0-8.7 4.8-8.8 5-.3.5-.1 1.2.5 1.5.5.3 1.2.1 1.5-.5.1-.2 2-3.8 6.8-3.8.6 0 1.1-.5 1.1-1.1 0-.6-.5-1.1-1.1-1.1M1.2 0C.6 0 .1.5.1 1.1s.5 1.1 1.1 1.1c5.6 0 6.6 3.5 6.7 3.6.1.6.8 1 1.3.8.6-.2.9-.7.8-1.3C10 5.1 8.6 0 1.2 0\" transform=\"translate(5.458 25.536)\" id=\"Path_3_\"/></g></g></g></svg>"

/***/ }),
/* 5 */
/*!*********************************!*\
  !*** ./example/src/js/app-c.js ***!
  \*********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _svgs_tv_grid_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../svgs/tv-grid.svg */ 6);
/* harmony import */ var _svgs_tv_grid_svg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_svgs_tv_grid_svg__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _svgs_tvicon_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../svgs/tvicon.svg */ 10);
/* harmony import */ var _svgs_tvicon_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_svgs_tvicon_svg__WEBPACK_IMPORTED_MODULE_1__);



/***/ }),
/* 6 */
/*!**************************************!*\
  !*** ./example/src/svgs/tv-grid.svg ***!
  \**************************************/
/***/ (function(module, exports) {

"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 58 48\"><path class=\"st0\" fill=\"#38454f\" d=\"M0 .5h58v38H0z\"/><path class=\"st1\" d=\"M14 16.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#61b872\"/><path class=\"st2\" d=\"M25 16.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#48a0dc\"/><path class=\"st3\" d=\"M36 16.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#ebba16\"/><path class=\"st4\" d=\"M47 16.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#bf4d90\"/><path class=\"st5\" d=\"M14 27.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#dd352e\"/><path class=\"st6\" d=\"M25 27.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#a4e869\"/><path class=\"st7\" d=\"M36 27.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#50508a\"/><path class=\"st8\" d=\"M47 27.5h-3c-.6 0-1-.5-1-1v-2.9c0-.6.5-1 1-1h3c.6 0 1 .5 1 1v2.9c0 .5-.5 1-1 1z\" fill=\"#be7c6d\"/><path class=\"st9\" fill=\"#afb6bb\" d=\"M30 44.5v-6h-2v6H15v3h28v-3z\"/></svg>"

/***/ }),
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
/*!*************************************!*\
  !*** ./example/src/svgs/tvicon.svg ***!
  \*************************************/
/***/ (function(module, exports) {

"<svg version=\"1.1\" id=\"Calque_1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0\" y=\"0\" viewBox=\"0 0 23 18\" xml:space=\"preserve\"><style>.st0{fill:#fff}</style><g id=\"HOME\"><g id=\"home-mobile\" transform=\"translate(-16 -74)\"><g id=\"tvicon\" transform=\"translate(16 74)\"><path id=\"Shape\" class=\"st0\" d=\"M1,14.9c-0.2,0-0.4-0.1-0.6-0.2l0,0c-0.2-0.2-0.2-0.3-0.2-0.6l0,0V1c0-0.2,0.1-0.4,0.2-0.6l0,0 C0.5,0.3,0.7,0.2,1,0.2l0,0H22c0.2,0,0.4,0.1,0.6,0.2l0,0c0.2,0.2,0.2,0.3,0.2,0.6l0,0v13.1c0,0.2-0.1,0.4-0.2,0.6l0,0 c-0.2,0.2-0.4,0.2-0.6,0.2l0,0H1L1,14.9z M1.8,13.3h19.5V1.8H1.8V13.3L1.8,13.3z\"/><path id=\"Path\" class=\"st0\" d=\"M7.5,17.8c-0.4,0-0.8-0.3-0.8-0.8l0,0c0-0.4,0.4-0.8,0.8-0.8l0,0h8c0.4,0,0.8,0.3,0.8,0.8l0,0 c0,0.4-0.4,0.8-0.8,0.8l0,0H7.5L7.5,17.8z\"/></g></g></g></svg>"

/***/ })
/******/ ]);
//# sourceMappingURL=home.js.map