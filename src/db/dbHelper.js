import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// mysql2 pool (for queries)
export const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT || 3306,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// Sequelize instance (for session store)
export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	dialect: "mysql",
});

(async () => {
	try {
		await sequelize.authenticate();
		console.log("✅ Sequelize connected for session storage");
	} catch (err) {
		console.error("❌ Sequelize connection error:", err);
	}
})();

export default pool;
