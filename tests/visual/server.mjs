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
const narrowStatsRawDirectory = new URL(
  "../../fixtures/raw/homepage-narrow-stats-2026-09-10/",
  import.meta.url
);
const narrowStatsRawHtmlUrl = new URL("Home - Chess.com.html", narrowStatsRawDirectory);
const narrowStatsAssetRootPath = fileURLToPath(
  new URL("Home - Chess.com_files/", narrowStatsRawDirectory)
);
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
const sidePanelHtml = await readFile(
  new URL("../../dist/sidepanel.html", import.meta.url),
  "utf8"
);
const sidePanelPreviewHtml = sidePanelHtml.replace(
  '<script src="popup.js"></script>',
  `<script>
    globalThis.chrome ??= {};
    chrome.storage = {
      local: {
        get: async () => ({}),
        set: async () => {}
      }
    };
    chrome.windows = {
      getCurrent: async () => ({ id: 1 })
    };
    chrome.sidePanel = {
      close: async () => {}
    };
  </script>
  <script src="popup.js"></script>`
);
const popupCss = await readFile(new URL("../../dist/popup.css", import.meta.url), "utf8");
const popupJs = await readFile(new URL("../../dist/popup.js", import.meta.url), "utf8");
const showcaseCss = await readFile(
  new URL("../../store-listing/source/showcase.css", import.meta.url),
  "utf8"
);
const showcaseSourceHtml = await readFile(
  new URL("../../store-listing/source/showcase.html", import.meta.url),
  "utf8"
);
const showcaseHtml = showcaseSourceHtml
  .replace('href="showcase.css"', 'href="/showcase.css"')
  .replaceAll("../../public/icons/icon-128.png", "/icons/icon-128.png");
const rawHtml = await readFile(rawHtmlUrl, "utf8");
const narrowStatsRawHtml = await readFile(narrowStatsRawHtmlUrl, "utf8");
const responsiveFixtureHtml = await readFile(
  new URL("../fixtures/homepage-responsive.html", import.meta.url),
  "utf8"
);
const modernFixtureHtml = await readFile(
  new URL("../fixtures/homepage-modern.html", import.meta.url),
  "utf8"
);
const gameReviewFixtureHtml = await readFile(
  new URL("../fixtures/game-review-narrow.html", import.meta.url),
  "utf8"
);
const liveGameControlsFixtureHtml = await readFile(
  new URL("../fixtures/live-game-controls-mobile.html", import.meta.url),
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
const narrowStatsHtml = narrowStatsRawHtml
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
  .replaceAll("./Home - Chess.com_files/", "/home-mobile-stats-assets/")
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
const modernHtml = modernFixtureHtml
  .replace(
    "</head>",
    `<style>
      html { font-size: 62.5%; }
      body {
        background: #302e2b;
        color: #f1f1f1;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
      }
      #navigation-sidebar { display: none; }
      .home-layout {
        display: grid;
        gap: 2.4rem;
        grid-template-columns: minmax(0, 72.8rem) minmax(26rem, 30rem);
        margin: 2.4rem auto;
        max-width: 105.2rem;
      }
      .layout-hero { grid-column: 1 / -1; }
      .cc-section {
        background: #262522;
        border-radius: .5rem;
        margin-bottom: 1.6rem;
        padding: 1.6rem;
      }
      .cc-aside-header-component {
        align-items: center;
        display: flex;
        font-size: 1.8rem;
        font-weight: 700;
        justify-content: space-between;
        margin-bottom: 1.2rem;
      }
      .play-online-wrapper {
        display: grid;
        gap: 1.2rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .challenge-tile-component {
        background: #3a3834;
        border-radius: .4rem;
        min-height: 12rem;
        padding: 1.2rem;
      }
      a { color: inherit; }
    </style>
    <link rel="stylesheet" href="/chesscom-vinf-content.css"></head>`
  )
  .replace(
    "</body>",
    '<script src="/chesscom-vinf-visual-harness.js"></script></body>'
  );
const gameReviewHtml = gameReviewFixtureHtml
  .replace(
    "</head>",
    '<link rel="stylesheet" href="/chesscom-vinf-content.css"></head>'
  )
  .replace(
    "</body>",
    '<script src="/chesscom-vinf-visual-harness.js"></script></body>'
  );
const liveGameControlsHtml = liveGameControlsFixtureHtml
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

  if (pathname === "/phone-game-preview") {
    const params = new URL(request.url, "http://localhost").searchParams;
    const width = params.has("desktop-fit") ? 1743 : params.has("tablet") ? 800 : params.has("narrow") ? 320 : 390;
    const height = params.has("desktop-fit") ? 1075 : 844;
    const query = ["extreme", "no-annotation-api", "entry", "oled", "hints", "rating-intro", "challenge-toast", "desktop-fit"].filter(key => params.has(key)).map(key => `${key}=1`).join("&");
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html><body style="margin:0;background:#171614"><iframe title="VINF annotation contract fixture" src="/phone-game?${query}" style="border:0;width:${width}px;height:${height}px"></iframe></body></html>`);
    return;
  }

  if (pathname === "/phone-game" || pathname === "/extreme-oled") {
    const html = await readFile(new URL(pathname === "/phone-game" ? "../fixtures/phone-game.html" : "../fixtures/extreme-oled.html", import.meta.url), "utf8");
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    const nativeSizing = new URL(request.url, "http://localhost").searchParams.has("desktop-fit")
      ? await readFile(new URL("../fixtures/native-wide-sizing.css", import.meta.url), "utf8") : "";
    response.end(html.replace("<body>", '<body class="with-players">').replace("</head>", `<style>${nativeSizing}</style></head>`).replace("</head>", '<link rel="stylesheet" href="/chesscom-vinf-content.css"></head>').replace("</body>", '<script src="/chesscom-vinf-visual-harness.js"></script></body>'));
    return;
  }

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
  if (pathname === "/home-phone-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0;padding:20px"><iframe title="VINF phone homepage preview" src="/home?oled=1&oled-buttons=1&active-game=1&expanded-sidebar=1" style="border:0;height:844px;width:390px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/home-phone-buttons-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0;padding:20px"><iframe title="VINF phone OLED buttons preview" src="/home?oled=1&oled-buttons=1&active-game=1" style="border:0;height:844px;width:390px"></iframe></body></html>'
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
  if (pathname === "/home-mobile-stats") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(narrowStatsHtml);
    return;
  }
  if (pathname === "/home-modern") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(modernHtml);
    return;
  }
  if (pathname === "/game-review-mobile") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(gameReviewHtml);
    return;
  }
  if (pathname === "/game-review-phone-preview") {
    const params = new URL(request.url, "http://localhost").searchParams;
    const width = params.has("tablet") ? 800 : 390;
    const query = ["extreme", "native", "overview", "oled"].filter(key => params.has(key)).map(key => `${key}=1`).join("&");
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html><body style="background:#171614;margin:0"><iframe title="VINF phone Game Review preview" src="/game-review-mobile?${query}" style="border:0;height:844px;width:${width}px"></iframe></body></html>`);
    return;
  }
  if (pathname === "/live-game-controls-mobile") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(liveGameControlsHtml);
    return;
  }
  if (pathname === "/live-game-controls-phone-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0;padding:20px"><iframe title="VINF phone live-game controls preview" src="/live-game-controls-mobile?oled=1" style="border:0;height:844px;width:390px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/popup-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0;padding:20px"><iframe title="VINF popup preview" src="/popup" style="border:0;height:600px;width:390px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/popup-narrow-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0;padding:20px"><iframe title="VINF narrow popup preview" src="/popup" style="border:0;height:900px;width:320px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/sidepanel-preview") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><body style="background:#171614;margin:0;padding:20px"><iframe title="VINF side panel preview" src="/sidepanel.html" style="border:0;height:780px;width:360px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/popup" || pathname === "/popup.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    const captureParams = new URL(request.url, "http://localhost").searchParams;
    let captureHtml = captureParams.has("store-capture") ? popupHtml.replace("</head>", "<style>.version{display:none!important}</style></head>") : popupHtml;
    if (captureParams.has("store-capture") && captureParams.get("section") === "presets") {
      captureHtml = captureHtml.replace("</body>", '<script>window.addEventListener("load",()=>window.scrollTo(0,document.getElementById("quick-play-heading").getBoundingClientRect().top+window.scrollY-20));</script></body>');
    }
    response.end(captureHtml);
    return;
  }
  if (pathname === "/sidepanel.html") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(sidePanelPreviewHtml);
    return;
  }
  if (pathname === "/gallery" || pathname === "/gallery.css") {
    const file = pathname === "/gallery" ? "gallery.html" : "gallery.css";
    response.writeHead(200, { "content-type": file.endsWith("css") ? "text/css" : "text/html; charset=utf-8" });
    response.end(await readFile(new URL(`../../store-listing/source/${file}`, import.meta.url), "utf8"));
    return;
  }
  if (pathname === "/gallery-capture") {
    const view = new URL(request.url, "http://localhost").searchParams.get("view") || "settings";
    const safeView = ["presets", "settings", "play", "review", "small", "marquee"].includes(view) ? view : "settings";
    const [w,h] = safeView === "small" ? [440,280] : safeView === "marquee" ? [1400,560] : [1280,800];
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`<html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden"><iframe title="Store ${safeView}" src="/gallery?view=${safeView}" style="border:0;width:${w}px;height:${h}px;display:block"></iframe></body></html>`);
    return;
  }
  if (pathname === "/store-showcase") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(showcaseHtml);
    return;
  }
  if (pathname === "/store-home-capture") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end('<html><body style="margin:0"><iframe title="Default homepage" src="/store-showcase?view=home6" style="border:0;width:1280px;height:800px;display:block"></iframe></body></html>');
    return;
  }
  if (pathname === "/store-settings-capture") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      '<!doctype html><html><head><style>html{scrollbar-width:none}::-webkit-scrollbar{display:none}</style></head><body style="margin:0"><iframe title="VINF store settings capture" src="/store-showcase?view=settings" style="border:0;display:block;height:800px;pointer-events:none;width:1280px"></iframe></body></html>'
    );
    return;
  }
  if (pathname === "/showcase.css") {
    response.writeHead(200, { "content-type": "text/css; charset=utf-8" });
    response.end(showcaseCss);
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

  const narrowStatsAssetPrefix = "/home-mobile-stats-assets/";
  if (pathname.startsWith(narrowStatsAssetPrefix)) {
    const relativePath = normalize(pathname.slice(narrowStatsAssetPrefix.length));
    const assetPath = join(narrowStatsAssetRootPath, relativePath);
    if (!assetPath.startsWith(narrowStatsAssetRootPath)) {
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
