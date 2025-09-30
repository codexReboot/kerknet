import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import psalmsData from "./data/psalmsJSON.json" with { type: "json" };
import berymingsData from "./data/skrifberymingsJSON.json" with { type: "json" };

// Load environment variables from .env file
dotenv.config();

// Declare __filename and __dirname for use later
let __filename;
let __dirname;

async function startServer() {
	if (process.env.NODE_ENV === "development") {
		const devPaths = await import("./utils/dev-paths.js");
		__filename = devPaths.__filename;
		__dirname = devPaths.__dirname;
	} else {
		__dirname = path.resolve(); // project root
	}

	const app = express();
	const PORT = process.env.PORT || 5000;

	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "views"));
	app.use(express.static(path.join(__dirname, "public")));
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// -------------------- Basic Routes --------------------
	app.get("/", (req, res) => res.render("underConstruction", { title: "Home", message: "Hello, world!" }));
	app.get("/develop", (req, res) => res.render("welcome", { title: "Home", message: "Hello, world!" }));
	app.get("/develop/eerste", (req, res) => res.render("eerste", { title: "Eerste Diens", message: "Hello, world!" }));

	// -------------------- Helpers --------------------
	const BOOK_NAMES_PATTERN = [
		"Genesis",
		"Exodus",
		"Levitikus",
		"Numeri",
		"Deuteronomium",
		"Josua",
		"Rigters",
		"Rut",
		"1\\s*Samuel",
		"2\\s*Samuel",
		"1\\s*Konings",
		"2\\s*Konings",
		"1\\s*Kronieke",
		"2\\s*Kronieke",
		"Esra",
		"Nehemia",
		"Ester",
		"Job",
		"Psalms",
		"Spreuke",
		"Prediker",
		"Hooglied",
		"Jesaja",
		"Jeremia",
		"Klaagliedere",
		"Esegiel",
		"Daniel",
		"Hosea",
		"Joel",
		"Amos",
		"Obadja",
		"Jona",
		"Miga",
		"Nahum",
		"Habakuk",
		"Sefanja",
		"Haggai",
		"Sagaria",
		"Maleagi",
		"Mattheus",
		"Markus",
		"Lukas",
		"Johannes",
		"Handelinge",
		"Romeine",
		"1\\s*Korinthiers",
		"2\\s*Korinthiers",
		"Galasiers",
		"Efesiers",
		"Filippense",
		"Kolossense",
		"1\\s*Thessalonicense",
		"2\\s*Thessalonicense",
		"1\\s*Timotheus",
		"2\\s*Timotheus",
		"Titus",
		"Filemon",
		"Hebreers",
		"Jakobus",
		"1\\s*Petrus",
		"2\\s*Petrus",
		"1\\s*Johannes",
		"2\\s*Johannes",
		"3\\s*Johannes",
		"Judas",
		"Openbaring",
	].join("|");
	const BOOK_NAME_REGEX = new RegExp("\\b(?:" + BOOK_NAMES_PATTERN + ")\\b", "i");

	// -------------------- Scripture Slide Helpers --------------------
	function superscriptVerseNumbers(text) {
		if (!text) return "";
		let t = String(text)
			.replace(/\u00A0/g, " ")
			.replace(/\r\n|\r/g, "\n");

		// 1. Chapter:Verse → 1:<sup>2</sup>
		t = t.replace(/\b(\d+)\s*:\s*(\d+)\b/g, (m, chap, verse) => `${chap}:<sup>${verse}</sup>`);

		// 2. Verse numbers immediately after a word/letter (no space before, no space after)
		t = t.replace(/\b(\d+)(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, (m, digits) => `<sup>${digits}</sup>`);

		// 3. Other standalone numbers → superscript, unless already inside <sup> or after a book name
		t = t.replace(/\b(\d+)\b/g, (match, digits, offset, fullStr) => {
			const around = fullStr.slice(Math.max(0, offset - 40), offset);
			if (around.includes("<sup") || around.includes("</sup>")) return match;
			if (BOOK_NAME_REGEX.test(around)) return match;
			return `<sup>${digits}</sup>`;
		});

		return t.replace(/\s{2,}/g, " ").trim();
	}

	// -------------------- New Slide Split Function --------------------
	function splitTextIntoSlides(text, maxChars = 300) {
		if (!text) return [];
		text = String(text).trim().replace(/\s+/g, " "); // normalize spaces

		const slides = [];
		let start = 0;

		while (start < text.length) {
			let end = Math.min(start + maxChars, text.length);
			let subText = text.slice(start, end);

			// Look backwards for a natural punctuation break
			const match = subText.match(/([.,;:!?])(?=\s|$)(?!.*[.,;:!?])/);
			if (match) {
				end = start + subText.lastIndexOf(match[1]) + 1; // include punctuation
			}

			let chunk = text.slice(start, end).trim();

			// Avoid ending the slide with a verse number (<sup>number</sup>)
			const verseNumberAtEnd = chunk.match(/<sup>\d+<\/sup>$/);
			if (verseNumberAtEnd && end < text.length) {
				// move the verse number to the next slide
				const lastVerseIndex = chunk.lastIndexOf(verseNumberAtEnd[0]);
				chunk = chunk.slice(0, lastVerseIndex).trim();
				end = start + lastVerseIndex;
			}

			slides.push(chunk);
			start = end;
		}

		return slides;
	}

	// -------------------- POST /preview-slide --------------------
	app.post("/preview-slide", (req, res) => {
		try {
			let {
				datum,
				diensVolgorde,
				prediker,
				skrifgedeelte,
				teksverse,
				skriflesingText,
				teksverseText,
				tema,
				kollektesErediens,
				kollektesDeure,
				voorsangType,
				voorsangNumber,
				voorsangVerses,
				lofPsalmSeengroetType,
				lofPsalmSeengroetNumber,
				lofPsalmSeengroetVerses,
				psalmNaWetType,
				psalmNaWetNumber,
				psalmNaWetVerses,
				psalmVoorWoordType,
				psalmVoorWoordNumber,
				psalmVoorWoordVerses,
				psalmSlotType,
				psalmSlotNumber,
				psalmSlotVerses,
			} = req.body;

			skriflesingText = String(skriflesingText || "").trim();
			teksverseText = String(teksverseText || "").trim();

			const formattedSkriflesingText = superscriptVerseNumbers(skriflesingText);
			const formattedTeksverseText = superscriptVerseNumbers(teksverseText);

			const scriptureSlides = splitTextIntoSlides(formattedSkriflesingText, 300);
			const teksverseSlides = splitTextIntoSlides(formattedTeksverseText, 300);

			const preScriptureTransitions = ["Voorsang", "Votum en Seëngroet", "Geloofsbelydenis"];
			const postScriptureTransitions = ["Gebed", "Seëngroet"];

			// Apostolic Creed slides
			const creedSlides = [
				`Ek glo in God die Vader, die Almagtige, die Skepper van die hemel en die aarde;
         en in Jesus Christus, sy eniggebore Seun, ons Here;
         wat ontvang is van die Heilige Gees, gebore uit die maagd Maria;`,
				`wat gely het onder Pontius Pilatus, gekruisig is, gesterf het en begrawe is;
         wat die lyding van die hel ondergaan het;
         wat op die derde dag opgestaan het uit die dood;`,
				`opgevaar het na die hemel en sit aan die regterhand van God, die almagtige Vader,
         waarvandaan Hy sal kom om die lewendes en die dooies te oordeel.
         Ek glo in die Heilige Gees.`,
				`Ek glo aan 'n heilige, algemene, Christelike kerk,
         die gemeenskap van die heiliges;
         die vergewing van sondes;
         die opstanding van die liggaam
         en 'n ewige lewe.`,
			];

			// Ten Commandments slides
			const commandmentSlides = [
				`<sup>1</sup> TOE het God al hierdie woorde gespreek en gesê:
         <sup>2</sup> Ek is die Here jou God wat jou uit Egipteland, uit die slawehuis, uitgelei het.
         <sup>3</sup> Jy mag geen ander gode voor my aangesig hê nie.`,
				`<sup>4</sup> Jy mag vir jou geen gesnede beeld of enige gelykenis maak van wat bo in die hemel is, of van wat onder op die aarde is, of van wat in die waters onder die aarde is nie.`,
				`<sup>5</sup> Jy mag jou voor hulle nie neerbuig en hulle nie dien nie; want Ek, die Here jou God, is 'n jaloerse God wat die misdaad van die vaders besoek aan die kinders, aan die derde en aan die vierde geslag van die wat My haat;`,
				`<sup>6</sup> en Ek bewys barmhartigheid aan duisende van die wat My liefhet en my gebooie onderhou.
         <sup>7</sup> Jy mag die Naam van die Here jou God nie ydellik gebruik nie, want die Here sal die een wat sy Naam ydellik gebruik, nie ongestraf laat bly nie.
         <sup>8</sup> Gedenk die sabbatdag, dat jy dit heilig.`,
				`<sup>9</sup> Ses dae moet jy arbei en al jou werk doen;
				<sup>10</sup> maar die sewende dag is die sabbat van die Here jou God; dan mag jy géén werk doen nie — jy of jou seun of jou dogter, of jou dienskneg of jou diensmaagd, of jou vee of jou vreemdeling wat in jou poorte is nie.`,
				`<sup>11</sup> Want in ses dae het die Here die hemel en die aarde gemaak, die see en alles wat daarin is, en op die sewende dag het Hy gerus. Daarom het die Here die sabbatdag geseën en dit geheilig.
         <sup>12</sup> Eer jou vader en jou moeder, dat jou dae verleng mag word in die land wat die Here jou God aan jou gee.`,
				`<sup>13</sup> Jy mag nie doodslaan nie.
         <sup>14</sup> Jy mag nie egbreek nie.
         <sup>15</sup> Jy mag nie steel nie.
         <sup>16</sup> Jy mag geen valse getuienis teen jou naaste spreek nie.`,
				`<sup>17</sup> Jy mag nie jou naaste se huis begeer nie; jy mag nie jou naaste se vrou begeer nie, of sy dienskneg of sy diensmaagd, of sy os of sy esel, of iets wat van jou naaste is nie.`,
			];

			// -------------------- Psalms/Skrifberymings --------------------
			function getSongContent(type, number, verses) {
				const source = type === "Psalm" ? psalmsData : berymingsData;
				const song = source[number];
				if (!song || !song.verses) return null;

				let selectedVerses = {};
				if (verses) {
					verses.split(",").forEach((v) => {
						const vTrim = v.trim();
						if (song.verses[vTrim]) selectedVerses[vTrim] = song.verses[vTrim];
					});
				} else {
					selectedVerses = song.verses;
				}

				return { type, number, title: song.title, verses: selectedVerses };
			}

			const songs = {
				voorsang: getSongContent(voorsangType, voorsangNumber, voorsangVerses),
				lofPsalmSeengroet: getSongContent(lofPsalmSeengroetType, lofPsalmSeengroetNumber, lofPsalmSeengroetVerses),
				psalmNaWet: getSongContent(psalmNaWetType, psalmNaWetNumber, psalmNaWetVerses),
				psalmVoorWoord: getSongContent(psalmVoorWoordType, psalmVoorWoordNumber, psalmVoorWoordVerses),
				psalmSlot: getSongContent(psalmSlotType, psalmSlotNumber, psalmSlotVerses),
			};

			res.render("slides", {
				datum,
				diensVolgorde,
				prediker,
				skrifgedeelte,
				teksverse,
				scriptureSlides,
				teksverseSlides,
				creedSlides,
				commandmentSlides,
				songs,
				tema,
				kollektesErediens,
				kollektesDeure,
				preScriptureTransitions,
				postScriptureTransitions,
			});
		} catch (err) {
			console.error("POST /preview-slide error:", err);
			res.status(500).send("Server error occurred. Check logs.");
		}
	});

	// -------------------- Start server --------------------
	app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

startServer().catch((err) => console.error("Failed to start server:", err));
