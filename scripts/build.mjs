import { build, context } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

const watch = process.argv.includes("--watch");

async function copyStatic() {
  await mkdir("dist", { recursive: true });
  await cp("public/manifest.json", "dist/manifest.json");
  await mkdir("dist/icons", { recursive: true });
  await Promise.all(
    [16, 32, 48, 128].map((size) =>
      cp(`public/icons/icon-${size}.png`, `dist/icons/icon-${size}.png`)
    )
  );
  await cp("src/content/content.css", "dist/content.css");
  await cp("src/popup/popup.html", "dist/popup.html");
  await cp("src/popup/popup.html", "dist/sidepanel.html");
  await cp("src/popup/popup.css", "dist/popup.css");
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
