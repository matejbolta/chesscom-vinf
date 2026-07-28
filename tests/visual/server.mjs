import { build } from "esbuild";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rawDirectory = new URL(
  "../../fixtures/raw/page-complete-all-cards-2026-07-28/",
  import.meta.url
);
const rawHtmlUrl = new URL("Home - Chess.com.html", rawDirectory);
const assetRoot = new URL("Home - Chess.com_files/", rawDirectory);
const assetRootPath = fileURLToPath(assetRoot);
const iconRootPath = fileURLToPath(new URL("../../dist/icons/", import.meta.url));

const harness = await build({
  bundle: true,
  entryPoints: [new URL("./visual-harness.ts", import.meta.url).pathname],
  format: "iife",
  target: ["chrome120"],
  write: false
});

const harnessCode = harness.outputFiles[0].text;
const contentCss = await readFile(new URL("../../dist/content.css", import.meta.url), "utf8");
const popupHtml = await readFile(new URL("../../dist/popup.html", import.meta.url), "utf8");
const popupCss = await readFile(new URL("../../dist/popup.css", import.meta.url), "utf8");
const popupJs = await readFile(new URL("../../dist/popup.js", import.meta.url), "utf8");
const rawHtml = await readFile(rawHtmlUrl, "utf8");
const responsiveFixtureHtml = await readFile(
  new URL("../fixtures/homepage-responsive.html", import.meta.url),
  "utf8"
);

const safeHtml = rawHtml
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
  .replace(
    "</head>",
    '<link rel="stylesheet" href="/chesscom-vinf-content.css"></head>'
  )
  .replace(
    "</body>",
    '<script src="/chesscom-vinf-visual-harness.js"></script></body>'
  );
const onlineTvHtml = safeHtml
  .replace(
    '<a class="cc-header-name" href="https://www.chess.com/tv">Live on ChessTV</a>',
    '<strong class="cc-header-name">aftpawn</strong>'
  )
  .replace(
    '<div class="tv-player-component"></div>',
    '<div class="tv-player-component" style="align-items:center;background:#151513;color:#aaa;display:flex;height:20rem;justify-content:center">ChessTV preview</div>'
  );
const responsiveHtml = responsiveFixtureHtml
  .replace(
    "</head>",
    '<link rel="stylesheet" href="/chesscom-vinf-content.css"></head>'
  )
  .replace(
    "</body>",
    '<script src="/chesscom-vinf-visual-harness.js"></script></body>'
  );

const mimeTypes = {
  ".css": "text/css",
  ".gif": "image/gif",
  ".html": "text/html",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);

  if (pathname === "/" || pathname === "/home") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(safeHtml);
    return;
  }
  if (pathname === "/home-narrow-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0"><iframe title="VINF narrow homepage preview" src="/home" style="border:0;height:720px;width:900px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/home-online-tv") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(onlineTvHtml);
    return;
  }
  if (pathname === "/home-responsive") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(responsiveHtml);
    return;
  }
  if (pathname === "/popup-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0;padding:20px"><iframe title="VINF popup preview" src="/popup" style="border:0;height:600px;width:420px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/popup" || pathname === "/popup.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(popupHtml);
    return;
  }
  if (pathname === "/popup.css") {
    response.writeHead(200, { "content-type": "text/css; charset=utf-8" });
    response.end(popupCss);
    return;
  }
  if (pathname === "/popup.js") {
    response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
    response.end(popupJs);
    return;
  }
  if (pathname.startsWith("/icons/")) {
    const iconName = normalize(pathname.slice("/icons/".length));
    const iconPath = join(iconRootPath, iconName);
    if (!iconPath.startsWith(iconRootPath)) {
      response.writeHead(403).end();
      return;
    }
    try {
      await stat(iconPath);
      response.writeHead(200, { "content-type": "image/png" });
      createReadStream(iconPath).pipe(response);
      return;
    } catch {
      response.writeHead(404).end();
      return;
    }
  }
  if (pathname === "/chesscom-vinf-content.css") {
    response.writeHead(200, { "content-type": "text/css; charset=utf-8" });
    response.end(contentCss);
    return;
  }
  if (pathname === "/chesscom-vinf-visual-harness.js") {
    response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
    response.end(harnessCode);
    return;
  }

  const assetPrefix = "/Home - Chess.com_files/";
  if (pathname.startsWith(assetPrefix)) {
    const relativePath = normalize(pathname.slice(assetPrefix.length));
    const assetPath = join(assetRootPath, relativePath);
    if (!assetPath.startsWith(assetRootPath)) {
      response.writeHead(403).end();
      return;
    }

    try {
      await stat(assetPath);
      response.writeHead(200, {
        "content-type": mimeTypes[extname(assetPath)] ?? "application/octet-stream"
      });
      createReadStream(assetPath).pipe(response);
      return;
    } catch {
      response.writeHead(404).end();
      return;
    }
  }

  response.writeHead(404).end();
});

server.listen(4173, "127.0.0.1", () => {
  console.log("ChessComVINF visual fixture: http://127.0.0.1:4173/home");
});
