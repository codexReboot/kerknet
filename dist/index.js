"use strict";

var _express = _interopRequireDefault(require("express"));
var _path = _interopRequireDefault(require("path"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _fs = _interopRequireDefault(require("fs"));
var _psalmsJSON = _interopRequireDefault(require("./data/psalmsJSON.json"));
var _skrifberymingsJSON = _interopRequireDefault(require("./data/skrifberymingsJSON.json"));
var _expressSession = _interopRequireDefault(require("express-session"));
var _connectSessionSequelize = _interopRequireDefault(require("connect-session-sequelize"));
var _dbHelper = require("./db/dbHelper.js");
var _auth = _interopRequireDefault(require("./routes/auth.js"));
var _auth2 = require("./middleware/auth.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Load environment variables
_dotenv.default.config();

// Declare __filename and __dirname for ESM
let _filename;
let _dirname;
async function startServer() {
  if (process.env.NODE_ENV === "development") {
    const devPaths = await Promise.resolve().then(() => _interopRequireWildcard(require("./utils/dev-paths.js")));
    _filename = devPaths.__filename;
    _dirname = devPaths.__dirname;
  } else {
    _dirname = _path.default.resolve(); // project root
  }
  const app = (0, _express.default)();
  const PORT = process.env.PORT || 5000;

  // -------------------- View Engine --------------------
  app.set("view engine", "ejs");
  app.set("views", _path.default.join(_dirname, "views"));
  app.use(_express.default.static(_path.default.join(_dirname, "public")));
  app.use(_express.default.urlencoded({
    extended: true
  }));
  app.use(_express.default.json());

  // -------------------- Session --------------------
  const SequelizeStore = (0, _connectSessionSequelize.default)(_expressSession.default.Store);
  const store = new SequelizeStore({
    db: _dbHelper.sequelize,
    tableName: "Sessions"
  });
  await store.sync(); // ensures the table exists with correct schema

  app.use((0, _expressSession.default)({
    secret: process.env.SESSION_SECRET || "change_this_secret",
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  }));

  // -------------------- Auth Routes --------------------
  app.use(_auth.default);

  // -------------------- Basic Routes --------------------
  app.get("/", (req, res) => res.render("underConstruction", {
    title: "Home",
    message: "Hello, world!"
  }));
  app.get("/liturgie", _auth2.requireAuth, (req, res) => res.render("welcome", {
    title: "Home",
    message: "Hello, world!",
    user: req.session.user // pass the logged-in user
  }));
  app.get("/liturgie/eerste", _auth2.requireAuth, (req, res) => res.render("eerste", {
    title: "Eerste Diens",
    message: "Hello, world!",
    user: req.session.user
  }));

  // -------------------- Helpers --------------------
  const BOOK_NAMES_PATTERN = ["Genesis", "Exodus", "Levitikus", "Numeri", "Deuteronomium", "Josua", "Rigters", "Rut", "1\\s*Samuel", "2\\s*Samuel", "1\\s*Konings", "2\\s*Konings", "1\\s*Kronieke", "2\\s*Kronieke", "Esra", "Nehemia", "Ester", "Job", "Psalms", "Spreuke", "Prediker", "Hooglied", "Jesaja", "Jeremia", "Klaagliedere", "Esegiel", "Daniel", "Hosea", "Joel", "Amos", "Obadja", "Jona", "Miga", "Nahum", "Habakuk", "Sefanja", "Haggai", "Sagaria", "Maleagi", "Mattheus", "Markus", "Lukas", "Johannes", "Handelinge", "Romeine", "1\\s*Korinthiers", "2\\s*Korinthiers", "Galasiers", "Efesiers", "Filippense", "Kolossense", "1\\s*Thessalonicense", "2\\s*Thessalonicense", "1\\s*Timotheus", "2\\s*Timotheus", "Titus", "Filemon", "Hebreers", "Jakobus", "1\\s*Petrus", "2\\s*Petrus", "1\\s*Johannes", "2\\s*Johannes", "3\\s*Johannes", "Judas", "Openbaring"].join("|");
  const BOOK_NAME_REGEX = new RegExp("\\b(?:" + BOOK_NAMES_PATTERN + ")\\b", "i");
  function superscriptVerseNumbers(text) {
    if (!text) return "";
    let t = String(text).replace(/\u00A0/g, " ").replace(/\r\n|\r/g, "\n");
    t = t.replace(/\b(\d+)\s*:\s*(\d+)\b/g, (m, chap, verse) => `${chap}:<sup>${verse}</sup>`);
    t = t.replace(/\b(\d+)(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, (m, digits) => `<sup>${digits}</sup>`);
    t = t.replace(/\b(\d+)\b/g, (match, digits, offset, fullStr) => {
      const around = fullStr.slice(Math.max(0, offset - 40), offset);
      if (around.includes("<sup") || around.includes("</sup>")) return match;
      if (BOOK_NAME_REGEX.test(around)) return match;
      return `<sup>${digits}</sup>`;
    });
    return t.replace(/\s{2,}/g, " ").trim();
  }
  function splitTextIntoSlides(text, maxChars = 300) {
    if (!text) return [];
    text = String(text).trim().replace(/\s+/g, " ");
    const slides = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + maxChars, text.length);
      let subText = text.slice(start, end);
      const match = subText.match(/([.,;:!?])(?=\s|$)(?!.*[.,;:!?])/);
      if (match) end = start + subText.lastIndexOf(match[1]) + 1;
      let chunk = text.slice(start, end).trim();
      const verseNumberAtEnd = chunk.match(/<sup>\d+<\/sup>$/);
      if (verseNumberAtEnd && end < text.length) {
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
        psalmSlotVerses
      } = req.body;
      skriflesingText = String(skriflesingText || "").trim();
      teksverseText = String(teksverseText || "").trim();
      const formattedSkriflesingText = superscriptVerseNumbers(skriflesingText);
      const formattedTeksverseText = superscriptVerseNumbers(teksverseText);
      const scriptureSlides = splitTextIntoSlides(formattedSkriflesingText, 300);
      const teksverseSlides = splitTextIntoSlides(formattedTeksverseText, 300);
      const preScriptureTransitions = ["Voorsang", "Votum en Seëngroet", "Geloofsbelydenis"];
      const postScriptureTransitions = ["Gebed", "Seëngroet"];
      const creedSlides = [`Ek glo in God die Vader, die Almagtige, die Skepper van die hemel en die aarde;
        en in Jesus Christus, sy eniggebore Seun, ons Here;
        wat ontvang is van die Heilige Gees, gebore uit die maagd Maria;`, `wat gely het onder Pontius Pilatus, gekruisig is, gesterf het en begrawe is;
        wat die lyding van die hel ondergaan het;
        wat op die derde dag opgestaan het uit die dood;`, `opgevaar het na die hemel en sit aan die regterhand van God, die almagtige Vader,
        waarvandaan Hy sal kom om die lewendes en die dooies te oordeel.
        Ek glo in die Heilige Gees.`, `Ek glo aan 'n heilige, algemene, Christelike kerk,
        die gemeenskap van die heiliges;
        die vergewing van sondes;
        die opstanding van die liggaam
        en 'n ewige lewe.`];
      const commandmentSlides = [`<sup>1</sup> TOE het God al hierdie woorde gespreek en gesê:
        <sup>2</sup> Ek is die Here jou God wat jou uit Egipteland, uit die slawehuis, uitgelei het.
        <sup>3</sup> Jy mag geen ander gode voor my aangesig hê nie.`, `<sup>4</sup> Jy mag vir jou geen gesnede beeld of enige gelykenis maak van wat bo in die hemel is, of van wat onder op die aarde is, of van wat in die waters onder die aarde is nie.`, `<sup>5</sup> Jy mag jou voor hulle nie neerbuig en hulle nie dien nie; want Ek, die Here jou God, is 'n jaloerse God wat die misdaad van die vaders besoek aan die kinders, aan die derde en aan die vierde geslag van die wat My haat;`, `<sup>6</sup> en Ek bewys barmhartigheid aan duisende van die wat My liefhet en my gebooie onderhou.
        <sup>7</sup> Jy mag die Naam van die Here jou God nie ydellik gebruik nie, want die Here sal die een wat sy Naam ydellik gebruik, nie ongestraf laat bly nie.
        <sup>8</sup> Gedenk die sabbatdag, dat jy dit heilig.`, `<sup>9</sup> Ses dae moet jy arbei en al jou werk doen;
        <sup>10</sup> maar die sewende dag is die sabbat van die Here jou God; dan mag jy géén werk doen nie — jy of jou seun of jou dogter, of jou dienskneg of jou diensmaagd, of jou vee of jou vreemdeling wat in jou poorte is nie.`, `<sup>11</sup> Want in ses dae het die Here die hemel en die aarde gemaak, die see en alles wat daarin is, en op die sewende dag het Hy gerus. Daarom het die Here die sabbatdag geseën en dit geheilig.
        <sup>12</sup> Eer jou vader en jou moeder, dat jou dae verleng mag word in die land wat die Here jou God aan jou gee.`, `<sup>13</sup> Jy mag nie doodslaan nie.
        <sup>14</sup> Jy mag nie egbreek nie.
        <sup>15</sup> Jy mag nie steel nie.
        <sup>16</sup> Jy mag geen valse getuienis teen jou naaste spreek nie.`, `<sup>17</sup> Jy mag nie jou naaste se huis begeer nie; jy mag nie jou naaste se vrou begeer nie, of sy dienskneg of sy diensmaagd, of sy os of sy esel, of iets wat van jou naaste is nie.`];
      function getSongContent(type, number, verses) {
        const source = type === "Psalm" ? _psalmsJSON.default : _skrifberymingsJSON.default;
        const song = source[number];
        if (!song || !song.verses) return null;
        let selectedVerses = {};
        if (verses) {
          verses.split(",").forEach(v => {
            const vTrim = v.trim();
            if (song.verses[vTrim]) selectedVerses[vTrim] = song.verses[vTrim];
          });
        } else {
          selectedVerses = song.verses;
        }
        return {
          type,
          number,
          title: song.title,
          verses: selectedVerses
        };
      }
      const songs = {
        voorsang: getSongContent(voorsangType, voorsangNumber, voorsangVerses),
        lofPsalmSeengroet: getSongContent(lofPsalmSeengroetType, lofPsalmSeengroetNumber, lofPsalmSeengroetVerses),
        psalmNaWet: getSongContent(psalmNaWetType, psalmNaWetNumber, psalmNaWetVerses),
        psalmVoorWoord: getSongContent(psalmVoorWoordType, psalmVoorWoordNumber, psalmVoorWoordVerses),
        psalmSlot: getSongContent(psalmSlotType, psalmSlotNumber, psalmSlotVerses)
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
        postScriptureTransitions
      });
    } catch (err) {
      console.error("POST /preview-slide error:", err);
      res.status(500).send("Server error occurred. Check logs.");
    }
  });

  // -------------------- Start server --------------------
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}
startServer().catch(err => console.error("Failed to start server:", err));