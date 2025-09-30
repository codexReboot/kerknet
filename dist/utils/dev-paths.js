"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__filename = exports.__dirname = void 0;
var _path = _interopRequireDefault(require("path"));
var _url = require("url");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Only imported in development

const _filename = exports.__filename = (0, _url.fileURLToPath)(import.meta.url);
const _dirname = exports.__dirname = _path.default.dirname(_filename);