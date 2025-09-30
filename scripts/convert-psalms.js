import fs from "fs";

// Read the input file (your raw psalm text)
const raw = fs.readFileSync("psalmsTXT.txt", "utf8");

// Step 1: Split by Psalm headers (e.g., "Psalm 1")
const psalmBlocks = raw.split(/(?=Psalm\s+\d+)/);

const psalms = {};

psalmBlocks.forEach((block) => {
	if (!block.trim()) return;

	// Match the Psalm number
	const headerMatch = block.match(/^Psalm\s+(\d+)/);
	if (!headerMatch) return;
	const psalmNum = headerMatch[1];

	// Remove the "Psalm X" header line
	const body = block.replace(/^Psalm\s+\d+\s*/i, "").trim();

	// Step 2: Split verses (they start with "1.", "2.", etc.)
	const verses = body.split(/\n(?=\d+\.\s)/);

	const verseMap = {};

	verses.forEach((v) => {
		const verseMatch = v.match(/^(\d+)\.\s*/);
		if (!verseMatch) return;
		const verseNum = verseMatch[1];

		// Remove "1." or "2." etc.
		const verseText = v.replace(/^\d+\.\s*/, "").trim();

		// Step 3: Split verse into lines (each newline = one line)
		const lines = verseText
			.split(/\n/)
			.map((line) => line.trim())
			.filter(Boolean);

		verseMap[verseNum] = { text: lines };
	});

	psalms[psalmNum] = {
		title: `Psalm ${psalmNum}`,
		verses: verseMap,
	};
});

// Step 4: Save as JSON
fs.writeFileSync("psalmsJSON.json", JSON.stringify(psalms, null, 2), "utf8");

console.log("✅ psalmsJSON.json created!");
