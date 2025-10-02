"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sequelize = exports.pool = exports.default = void 0;
var _promise = _interopRequireDefault(require("mysql2/promise"));
var _sequelize = require("sequelize");
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_dotenv.default.config();

// mysql2 pool (for queries)
const pool = exports.pool = _promise.default.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Sequelize instance (for session store)
const sequelize = exports.sequelize = new _sequelize.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql"
});
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Sequelize connected for session storage");
  } catch (err) {
    console.error("❌ Sequelize connection error:", err);
  }
})();
var _default = exports.default = pool;