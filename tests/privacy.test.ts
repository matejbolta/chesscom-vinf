import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PUBLIC_SCAN_EXCLUSIONS = new Set([
  ".git",
  "dist",
  "dist-android",
  "fixtures/raw",
  "node_modules",
  "release"
]);

const PUBLIC_TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".yaml",
  ".yml"
]);

function collectPublicTextFiles(directory: string, relative = ""): string[] {
  return readdirSync(directory).flatMap((name) => {
    const nextRelative = relative ? `${relative}/${name}` : name;

    if (PUBLIC_SCAN_EXCLUSIONS.has(nextRelative)) {
      return [];
    }

    const path = resolve(directory, name);
    if (statSync(path).isDirectory()) {
      return collectPublicTextFiles(path, nextRelative);
    }

    return PUBLIC_TEXT_EXTENSIONS.has(extname(name)) ? [path] : [];
  });
}

describe("privacy boundaries", () => {
  it("keeps the committed fixture sanitized", () => {
    const fixture = ["homepage.html", "homepage-responsive.html"]
      .map((name) =>
        readFileSync(resolve(process.cwd(), "tests/fixtures", name), "utf8")
      )
      .join("\n");

    expect(fixture).not.toMatch(/csrf|jwt|token|cookie|authorization|api[_-]?key/i);
    expect(fixture).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
  });

  it("uses a narrow manifest with only local-settings permission", () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), "public/manifest.json"), "utf8")
    );

    expect(manifest.permissions).toEqual(["storage"]);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.content_scripts[0].matches).toEqual([
      "https://www.chess.com/home*"
    ]);
    expect(manifest.content_scripts[0].run_at).toBe("document_start");
    expect(manifest.action.default_popup).toBe("popup.html");
  });

  it("keeps the Android userscript local and narrowly granted", () => {
    const builder = readFileSync(
      resolve(process.cwd(), "scripts/build-android.mjs"),
      "utf8"
    );

    expect(builder).toContain("@match        https://www.chess.com/home*");
    expect(builder).toContain("@run-at       document-start");
    expect(builder.match(/@grant/g)).toHaveLength(4);
    expect(builder).not.toMatch(/@require|@connect|GM_xmlhttpRequest|GM\.xmlHttpRequest/);
    expect(builder).not.toMatch(/@downloadURL|@updateURL/);
  });

  it("keeps public text free of local identity, network, and secret material", () => {
    const publicText = collectPublicTextFiles(process.cwd())
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(publicText).not.toMatch(/\/Users\/[^/\s]+/);
    expect(publicText).not.toMatch(/[A-Z]:\\Users\\[^\\\s]+/i);
    expect(publicText).not.toMatch(/\b192\.168\.\d{1,3}\.\d{1,3}\b/);
    expect(publicText).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
    expect(publicText).not.toMatch(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/);
    expect(publicText).not.toMatch(/\bghp_[a-z0-9]{20,}\b/i);
    expect(publicText).not.toMatch(/\bgithub_pat_[a-z0-9_]{20,}\b/i);
  });

  it("keeps complete signed-in page captures outside the public repository", () => {
    const gitignore = readFileSync(resolve(process.cwd(), ".gitignore"), "utf8");

    expect(gitignore).toContain("fixtures/raw/**");
    expect(gitignore).toContain("!fixtures/raw/README.md");
  });
});
