import fs from "fs";

// Read input file
const raw = fs.readFileSync("skrifberymingsTXT.txt", "utf8");

// Step 1: Split by Skrifberyming headers (e.g., "Skrifberyming 1")
const psalmBlocks = raw.split(/(?=Skrifberyming\s+\d+)/i);

const psalms = {};

psalmBlocks.forEach((block) => {
	if (!block.trim()) return;

	// Match the Skrifberyming number
	const headerMatch = block.match(/^Skrifberyming\s+(\d+)/i);
	if (!headerMatch) return;
	const psalmNum = headerMatch[1];

	// Remove the "Skrifberyming X" header line
	const body = block.replace(/^Skrifberyming\s+\d+\s*/i, "").trim();

	// Step 2: Split verses (start with "1.", "2.", etc.)
	const verses = body.split(/\n(?=\d+\.\s)/);

	const verseMap = {};

	verses.forEach((v) => {
		const verseMatch = v.match(/^(\d+)\.\s*/);
		if (!verseMatch) return;
		const verseNum = verseMatch[1];

		// Remove the verse number prefix
		const verseText = v.replace(/^\d+\.\s*/, "").trim();

		// Step 3: Split into lines (one line per array item)
		const lines = verseText
			.split(/\n/)
			.map((line) => line.trim())
			.filter(Boolean);

		verseMap[verseNum] = { text: lines };
	});

	psalms[psalmNum] = {
		title: `Skrifberyming ${psalmNum}`,
		verses: verseMap,
	};
});

// Step 4: Save as JSON
fs.writeFileSync("skrifberymingsJSON.json", JSON.stringify(psalms, null, 2), "utf8");

console.log("✅ skrifberymingsJSON.json created!");
