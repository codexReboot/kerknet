import express from "express";
import pool from "../db/dbHelper.js";
import bcrypt from "bcrypt";

const router = express.Router();

// GET login page
router.get("/login", (req, res) => res.render("login", { error: null }));

// POST login
router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	// Validate input
	if (!username || !password) {
		return res.render("login", { error: "Vul asseblief beide velde in." });
	}

	try {
		// Fetch user from DB
		const [rows] = await pool.query("SELECT * FROM users WHERE username = ? AND active = 1", [username]);

		const user = rows[0];

		// If no user found
		if (!user) {
			return res.render("login", { error: "Ongeldige gebruikersnaam of wagwoord." });
		}

		// Ensure password_hash exists
		if (!user.password_hash) {
			console.error("User found but password_hash is missing/null:", user);
			return res.render("login", { error: "Wagwoord ontbreek in databasis." });
		}

		// Compare password input with hashed password from DB
		const match = await bcrypt.compare(password, user.password_hash);

		if (!match) {
			return res.render("login", { error: "Ongeldige gebruikersnaam of wagwoord." });
		}

		// Save user session
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

// Logout
router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) console.error(err);
		res.redirect("/login");
	});
});

export default router;
