import bcrypt from "bcryptjs";

const passwords = ["kerknetEgipte", "kerknetJerusalem", "kerknetBethlehem", "kerknetKanaan"];

(async () => {
	for (let i = 0; i < passwords.length; i++) {
		const hash = await bcrypt.hash(passwords[i], 12);
		console.log(`Password: ${passwords[i]} => Hash: ${hash}`);
	}
})();
