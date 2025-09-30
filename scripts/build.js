// scripts/build.js
import fs from "fs";
import path from "path";

// Copy and trim package.json
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));

const trimmed = {
	name: packageJson.name,
	version: packageJson.version,
	main: "index.js", // adjust if your entry point is different
	dependencies: packageJson.dependencies || {}, // only include runtime deps
	scripts: {
		start: "node index.js",
	},
};

fs.writeFileSync(path.join("dist", "package.json"), JSON.stringify(trimmed, null, 2));
