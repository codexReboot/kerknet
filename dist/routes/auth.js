"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _dbHelper = _interopRequireDefault(require("../db/dbHelper.js"));
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = _express.default.Router();

// -------------------- Rate limiter --------------------
const loginLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 5,
  // max 5 attempts per IP per window
  message: "Te veel mislukte pogings. Probeer weer later.",
  standardHeaders: true,
  legacyHeaders: false
});

// -------------------- GET login page --------------------
router.get("/login", (req, res) => {
  res.render("login", {
    error: null
  });
});

// -------------------- POST login --------------------
router.post("/login", loginLimiter, async (req, res) => {
  const {
    username,
    password
  } = req.body;

  // -------------------- Backend validation --------------------
  if (!username || !password) {
    return res.render("login", {
      error: "Vul asseblief beide velde in."
    });
  }
  try {
    // Fetch user from DB
    const [rows] = await _dbHelper.default.query("SELECT id, username, role, password_hash, active FROM users WHERE username = ? AND active = 1", [username]);
    const user = rows[0];

    // Dummy hash to prevent timing attacks if user not found
    const dummyHash = "$2b$12$KbQi9JWxu2E7B.p0d1z6K.u9Q0Yo9oBIFQHf9U7v5eP8f/Oe.ZHnG";
    const match = await _bcrypt.default.compare(password, user ? user.password_hash : dummyHash);
    if (!user || !match) {
      // Generic error message
      return res.render("login", {
        error: "Ongeldige gebruikersnaam of wagwoord."
      });
    }
    if (!user.password_hash) {
      console.error("Warning: User found but password_hash is missing:", {
        id: user.id,
        username: user.username
      });
      return res.render("login", {
        error: "Ongeldige gebruikersnaam of wagwoord."
      });
    }

    // -------------------- Save session --------------------
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    res.redirect("/liturgie");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server fout.");
  }
});

// -------------------- Logout --------------------
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("Logout error:", err);
    res.redirect("/login");
  });
});
var _default = exports.default = router;