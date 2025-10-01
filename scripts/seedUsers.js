// scripts/seedUsers.js
import pool from "../src/db/dbHelper.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

(async () => {
	try {
		const users = [
			{ username: "admin", password: "password", role: "admin" },
			{ username: "general", password: "generalPassword", role: "general" },
			{ username: "user2", password: "password", role: "admin" },
			{ username: "user3", password: "password", role: "admin" },
		];

		for (const u of users) {
			// hash the password
			const hash = await bcrypt.hash(u.password, 12);

			// insert into users table using password_hash column
			await pool.query("INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)", [u.username, hash, u.role]);
		}

		console.log("✅ Users seeded with hashed passwords");
		process.exit(0);
	} catch (err) {
		console.error("❌ Error seeding users:", err);
		process.exit(1);
	}
})();
