import { build, context } from "esbuild";
import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";

const watch = process.argv.includes("--watch");

async function copyStatic() {
  const { version } = JSON.parse(await readFile("package.json", "utf8"));
  const manifest = JSON.parse(await readFile("public/manifest.json", "utf8"));
  if (manifest.version !== version) throw new Error("Package and manifest versions must match");
  const popupHtml = (await readFile("src/popup/popup.html", "utf8")).replaceAll("{{VINF_VERSION}}", version);
  await mkdir("dist", { recursive: true });
  await cp("public/manifest.json", "dist/manifest.json");
  await mkdir("dist/icons", { recursive: true });
  await Promise.all(
    [16, 32, 48, 128].map((size) =>
      cp(`public/icons/icon-${size}.png`, `dist/icons/icon-${size}.png`)
    )
  );
  await cp("src/content/content.css", "dist/content.css");
  await writeFile("dist/popup.html", popupHtml);
  await writeFile("dist/sidepanel.html", popupHtml);
  await writeFile("dist/popup.css", (await readFile("src/popup/popup.css", "utf8")) + "\n" + (await readFile("src/shared/pokemon-settings.css", "utf8")));
  await cp("assets/pokemon/LICENCE.txt", "dist/POKEMON-LICENCE.txt");
  await cp("assets/pokemon/README.md", "dist/POKEMON-ATTRIBUTION.md");
}

async function run() {
  if (!watch) {
    await rm("dist", { recursive: true, force: true });
  }

  await copyStatic();

  const common = {
    bundle: true,
    format: "iife",
    target: ["chrome120"],
    sourcemap: false,
    minify: !watch,
    legalComments: "none"
  };
  const entries = [
    {
      entryPoints: ["src/content/content-script.ts"],
      outfile: "dist/content-script.js"
    },
    {
      entryPoints: ["src/popup/popup.ts"],
      outfile: "dist/popup.js"
    }
  ];

  if (watch) {
    const buildContexts = await Promise.all(
      entries.map((entry) => context({ ...common, ...entry }))
    );
    await Promise.all(buildContexts.map((buildContext) => buildContext.watch()));
    console.log("Watching ChessComVINF extension files...");
    return;
  }

  await Promise.all(entries.map((entry) => build({ ...common, ...entry })));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
