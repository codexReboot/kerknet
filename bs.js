import browserSync from "browser-sync";
import bsConfig from "./bs.config.js";

const bs = browserSync.create();
bs.init(bsConfig);