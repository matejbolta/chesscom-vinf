import { build } from "esbuild";
import { mkdir, readFile, rm } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const pageCss = await readFile("src/content/content.css", "utf8");
const settingsCss = await readFile("src/userscript/userscript.css", "utf8");
const outputDirectory = "dist-android";

const metadata = `// ==UserScript==
// @name         ChessComVINF for Android
// @namespace    https://www.chess.com/vinf
// @version      ${packageJson.version}
// @description  A focused Chess.com homepage with configurable one-tap time controls.
// @match        https://www.chess.com/home*
// @run-at       document-start
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// ==/UserScript==`;

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await build({
  entryPoints: ["src/userscript/userscript.ts"],
  outfile: `${outputDirectory}/chesscom-vinf.user.js`,
  bundle: true,
  format: "iife",
  target: ["firefox121"],
  minify: true,
  sourcemap: false,
  legalComments: "none",
  banner: { js: metadata },
  define: {
    __VINF_USERSCRIPT_CSS__: JSON.stringify(`${pageCss}\n${settingsCss}`)
  }
});

console.log(`Created ${outputDirectory}/chesscom-vinf.user.js`);
