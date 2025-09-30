const fs = require("fs");
const pdfParse = require("pdf-parse");

// -------------------- Get PDF filename --------------------
const pdfFile = process.argv[2];
if (!pdfFile) {
	console.error("❌ Please provide a PDF filename as an argument.");
	console.error("   Example: node extractPsalmsFromPDF.cjs psalmsPDF.pdf");
	process.exit(1);
}

// -------------------- Read PDF --------------------
let pdfBuffer;
try {
	pdfBuffer = fs.readFileSync(pdfFile);
} catch (err) {
	console.error(`❌ Could not read file "${pdfFile}". Make sure the file exists.`);
	process.exit(1);
}

// -------------------- Parse PDF --------------------
pdfParse(pdfBuffer)
	.then((data) => {
		const rawText = data.text.replace(/\r\n/g, "\n").trim(); // normalize line endings

		// -------------------- Split into Psalm blocks --------------------
		const psalmBlocks = rawText.split(/(?=Psalm\s+\d+)/i);
		const psalms = {};

		psalmBlocks.forEach((block) => {
			if (!block.trim()) return;

			// Extract Psalm number
			const headerMatch = block.match(/^Psalm\s+(\d+)/i);
			if (!headerMatch) return;
			const psalmNum = headerMatch[1];

			// Remove header from body
			const body = block.replace(/^Psalm\s+\d+\s*/i, "").trim();

			// Split verses (assumes verses start with "1.", "2.", etc.)
			const versesRaw = body.split(/\n(?=\d+\.\s)/);
			const verseMap = {};

			versesRaw.forEach((v) => {
				const verseMatch = v.match(/^(\d+)\.\s*/);
				if (!verseMatch) return;
				const verseNum = verseMatch[1];
				const verseText = v.replace(/^\d+\.\s*/, "").trim();

				// Split verse into lines by newline, keep non-empty lines
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

		// -------------------- Write to JSON --------------------
		fs.writeFileSync("psalmsJSON.json", JSON.stringify(psalms, null, 2), "utf8");
		console.log(`✅ psalmsJSON.json created! ${Object.keys(psalms).length} psalms extracted.`);
	})
	.catch((err) => {
		console.error("❌ Error parsing PDF:", err);
	});
