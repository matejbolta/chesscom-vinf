import { execFile } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const manifest = JSON.parse(await readFile("public/manifest.json", "utf8"));
const archive = `release/chesscom-vinf-${manifest.version}.zip`;

await execFileAsync(process.execPath, ["scripts/build.mjs"]);
await mkdir("release", { recursive: true });
await rm(archive, { force: true });
await execFileAsync("zip", ["-q", "-r", `../${archive}`, "."], { cwd: "dist" });

console.log(`Created ${archive}`);
