import express from "express";
import pool from "../db/dbHelper.js";
import bcrypt from "bcryptjs"; // switched to bcryptjs
import rateLimit from "express-rate-limit";

const router = express.Router();

// -------------------- Rate limiter --------------------
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // max 5 attempts per IP per window
	message: "Te veel mislukte pogings. Probeer weer later.",
	standardHeaders: true,
	legacyHeaders: false,
});

// -------------------- GET login page --------------------
router.get("/login", (req, res) => {
	res.render("login", { error: null, user: req.session.user || null });
});

// -------------------- POST login --------------------
router.post("/login", loginLimiter, async (req, res) => {
	const { username, password } = req.body;

	// -------------------- Backend validation --------------------
	if (!username || !password) {
		return res.render("login", {
			error: "Vul asseblief beide velde in.",
			user: null,
		});
	}

	try {
		// Fetch user from DB
		const [rows] = await pool.query("SELECT id, username, role, password_hash, active FROM users WHERE username = ? AND active = 1", [username]);
		const user = rows[0];

		// Dummy hash to prevent timing attacks
		const dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8ZpQ6bZ4f3W1b6tU8LwRjT5C9JH2lW"; // bcryptjs valid hash

		// Compare password against stored hash (or dummy hash if no user found)
		const match = await bcrypt.compare(password, user ? user.password_hash : dummyHash);

		if (!user || !match || !user.password_hash) {
			return res.render("login", {
				error: "Ongeldige gebruikersnaam of wagwoord.",
				user: null,
			});
		}

		// -------------------- Save session --------------------
		req.session.user = {
			id: user.id,
			username: user.username,
			role: user.role,
		};

		res.redirect("/liturgie");
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).send("Server fout.");
	}
});

// -------------------- Logout --------------------
router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) console.error("Logout error:", err);
		res.redirect("/login");
	});
});

export default router;
