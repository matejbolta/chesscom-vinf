import { PokemonController } from "../../src/content/pokemon-controller";
import { ReviewPresentationController } from "../../src/content/review-presentation";
import { installAnnotationFixture } from "../helpers/native-annotations";
import { TouchAnnotationsController } from "../../src/content/touch-annotations";
import { PhoneGameActionsController } from "../../src/content/phone-game-actions";
import { AndroidGameControlsController } from "../../src/content/android-game-controls";
import { PhoneExperienceController } from "../../src/content/phone-experience-controller";
import { ExtremeOledController } from "../../src/content/extreme-oled-controller";
import { GameReviewLayoutController } from "../../src/content/game-review-layout-controller";
import { LayoutController } from "../../src/content/layout-controller";
import { NativeLaunchAdapter } from "../../src/content/launch-adapter";
import type { ExtensionSettings } from "../../src/shared/models";
import { MARKERS } from "../../src/shared/constants";
import { DEFAULT_SETTINGS } from "../../src/shared/settings";
import {
  getDefaultTimeControlIds,
  isQuickPlayPresetCount
} from "../../src/shared/time-controls";

window.addEventListener("error", event => { document.body.dataset.fixtureError = String(event.error?.stack ?? event.message); });

const fixtureLocation = {
  protocol: "https:",
  hostname: "www.chess.com",
  pathname: "/home"
} as Location;

const controller = new LayoutController(
  new NativeLaunchAdapter((url) => {
    document.body.dataset.chesscomVinfLastLaunch = url;
  })
);
const gameReviewController = new GameReviewLayoutController();

const searchParams = new URL(window.location.href).searchParams;

if (searchParams.has("active-game")) {
  const activeGameLink = document.createElement("a");
  activeGameLink.href = "https://www.chess.com/game/live/123456";
  activeGameLink.hidden = true;
  activeGameLink.textContent = "Native active game";
  document.body.append(activeGameLink);
}

if (searchParams.has("oled")) {
  document.documentElement.setAttribute(MARKERS.oled, "true");
}

// Sanitized native notification shell; no account identifiers or game requests.
if (searchParams.has("challenge-toast")) {
  const toast = document.createElement("div");
  toast.className = "toaster-controller-toast-wrapper";
  toast.style.cssText = "position:fixed;top:8px;left:8px;right:8px;z-index:9999;max-width:400px";
  toast.innerHTML = `<div class="toaster-controller-toast-body" style="background:rgb(75,72,71);padding:12px;color:#eee;border:1px solid #555;border-radius:4px"><div class="composable-toast-container"><div class="challenge-toast-content-container">Player · 15 + 10 · Challenge</div><div class="composable-toast-actions"><button class="cc-icon-button-secondary" aria-label="Cancel" style="background:#4b4847;color:#ddd">×</button></div></div></div><button class="toaster-controller-dismiss-button" aria-label="Dismiss" style="position:absolute;right:8px;top:8px;background:#262421;color:#ddd">×</button>`;
  toast.querySelectorAll("button").forEach(button => button.addEventListener("click", () => toast.remove()));
  document.body.append(toast);
}

if (searchParams.has("oled-buttons")) {
  document.documentElement.setAttribute(MARKERS.oledButtons, "true");
}

if (searchParams.has("expanded-sidebar")) {
  document.querySelector("#sidebar-main-menu")?.setAttribute("data-expanded", "");
}

if (searchParams.has("pre-hydration")) {
  const dailyLink = document.querySelector<HTMLAnchorElement>(
    '#vue-instance.layout-column-one .current-games-header-list a[href*="/play/online/daily"]'
  );
  if (dailyLink) {
    const loadingLabel = document.createElement("span");
    loadingLabel.textContent = dailyLink.textContent;
    dailyLink.replaceWith(loadingLabel);
  }
  document
    .querySelector(".game-history-games-component")
    ?.classList.remove("game-history-games-component");
}

const presetCountParameter = searchParams.get("preset-count");
const requestedPresetCount = searchParams.has("eight-preview")
  ? 8
  : presetCountParameter === null
    ? Number.NaN
    : Number(presetCountParameter);

let previewSettings: ExtensionSettings = isQuickPlayPresetCount(
  requestedPresetCount
)
  ? {
      ...DEFAULT_SETTINGS,
      quickPlayPresetCount: requestedPresetCount,
      timeControlIds: [...getDefaultTimeControlIds(requestedPresetCount)]
    }
  : searchParams.has("union-preview")
    ? {
        ...DEFAULT_SETTINGS,
        timeControlIds: [
          "30s-0",
          "20s-1",
          "1-1",
          "5-2",
          "5-5",
          "60-0"
        ] as const
      }
    : DEFAULT_SETTINGS;

if (
  searchParams.has("native-panel") ||
  document.documentElement.dataset.fixtureNativePanel === "true"
) {
  previewSettings = {
    ...previewSettings,
    showNativePlayPanel: true
  };
}

if (searchParams.has("sidebar-preview")) {
  previewSettings = {
    ...previewSettings,
    dailyGamesPlacement: "hidden",
    homepageSidebarOrder: [
      "profile",
      "daily-puzzle",
      "stats",
      "legend-league",
      "friends",
      "chess-tv",
      "streaks",
      "daily-games",
      "recommended-match",
      "game-history"
    ],
    homepageSidebarVisible: [
      "daily-puzzle",
      "stats",
      "legend-league",
      "friends"
    ]
  };
}

if (searchParams.has("recommended-right")) {
  previewSettings = {
    ...previewSettings,
    recommendedMatchPlacement: "sidebar",
    recommendedMatchVisiblePlacement: "sidebar",
    homepageSidebarVisible: [
      ...previewSettings.homepageSidebarVisible,
      "recommended-match"
    ]
  };
}

if (searchParams.has("recommended-hidden")) {
  previewSettings = {
    ...previewSettings,
    recommendedMatchPlacement: "hidden"
  };
}

if (searchParams.has("game-history-right")) {
  previewSettings = {
    ...previewSettings,
    gameHistoryPlacement: "sidebar",
    gameHistoryVisiblePlacement: "sidebar",
    homepageSidebarVisible: [
      ...previewSettings.homepageSidebarVisible,
      "game-history"
    ]
  };
}

if (searchParams.has("game-history-hidden")) {
  previewSettings = {
    ...previewSettings,
    gameHistoryPlacement: "hidden"
  };
}

if (searchParams.has("main-order-preview")) {
  previewSettings = {
    ...previewSettings,
    homepageSidebarOrder: [
      "profile",
      "stats",
      "chess-tv",
      "daily-games",
      "game-history",
      "recommended-match",
      "streaks",
      "legend-league",
      "daily-puzzle",
      "friends"
    ]
  };
}

if (searchParams.has("duplicate-preview")) {
  previewSettings = {
    ...previewSettings,
    quickPlayPresetCount: 6,
    timeControlIds: [
      "10-0",
      "10-0",
      "10-0",
      "10-0",
      "10-0",
      "10-0"
    ]
  };
}

// Model the asymmetric phone evaluation gutter shown in device screenshots.
if (window.location.pathname === "/game-review-mobile" && searchParams.has("eval-gutter")) {
  const style = document.createElement("style");
  style.textContent = "#board-layout-chessboard { margin-left: 32px; margin-right: 0; width: calc(100% - 32px); height: auto; aspect-ratio: 1; }";
  document.head.append(style);
}
if (window.location.pathname === "/game-review-mobile" && searchParams.has("engine")) {
  document.querySelector('.mobile-top-section-container')?.remove();
  document.querySelector('.sidebar-header-header')!.innerHTML = '<button aria-label="Back">←</button><button aria-label="Settings">⚙</button>';

  document.querySelector('.move-by-move-container')?.remove();
  const panel = document.querySelector('.sidebar-view-content')!;
  panel.insertAdjacentHTML('afterbegin', '<section class="analysis-view-component"><nav class="sidebar-tabs-container">Analysis · Games · Explore</nav><div class="engine-lines-with-options-component"><div class="analysis-options-component"><div class="analysis-options-bar"><div class="analysis-options-left"><label><input type="checkbox" checked> Analysis</label> ···</div><div class="analysis-options-right"><div class="analysis-options-depth">depth=16 | Stockfish 19 Lite</div><button class="analysis-options-icon" aria-label="Engine settings">⚙</button></div></div></div><div class="engine-lines-with-options-lines"><p>+5.07 · Nxe7 is best</p><p>+6.23 · 24. Ne4 Nf5 25. Qg6+</p><p>+6.02 · 24. Nf1 e2 25. Qh5+</p><p>+5.97 · 24. Nc4 e2 25. Qh5+</p></div></div></section>');
  document.querySelector('.game-controls-view-component')!.innerHTML = '<div class="game-controls-primary-component">'+['First Move','Previous Move','Next Move','Last Move'].map((name,i)=>`<button aria-label="${name}">${['|‹','‹','›','›|'][i]}</button>`).join('')+'</div><button>Game Review</button>';
}
if (window.location.pathname === "/game-review-mobile" && searchParams.has("overview")) {
  document.querySelector('[aria-label="Back"]')?.remove();
  document.querySelector(".move-by-move-component")?.classList.remove("move-by-move-component");
}
if (window.location.pathname === "/game-review-mobile") {
  gameReviewController.reconcile(
    document,
    {
      protocol: "https:",
      hostname: "www.chess.com",
      pathname: searchParams.has("engine") ? "/analysis/game/live/123456/analysis" : "/analysis/game/live/123456/review"
    },
    true,
    window.innerWidth <= 599
  );
} else {
  controller.reconcile(document, fixtureLocation, {
    ...previewSettings,
    timeControlIds: [...previewSettings.timeControlIds]
  });
}

if (window.location.pathname === "/extreme-oled") {
  const extreme = new ExtremeOledController();
  const settings = { ...DEFAULT_SETTINGS, extremeOled: searchParams.has("extreme"), turnDotSize: searchParams.has("large-dot") ? 24 : searchParams.has("small-dot") ? 4 : DEFAULT_SETTINGS.turnDotSize };
  const apply = () => extreme.reconcile(document,
    { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" }, settings, searchParams.has("desktop"), searchParams.has("desktop"));
  if (searchParams.has("last-move")) {
    const moves = document.createElement("wc-simple-move-list");
    moves.setAttribute("board-id", "board-single");
    moves.innerHTML = '<div class="main-line-row"><div class="node black-move main-line-ply" data-node="0-1"><span class="node-highlight-content"><span data-figurine="N"></span>f6</span></div></div>';
    document.body.append(moves);
  }
  const fixtureBoard = document.querySelector<HTMLElement>("wc-chess-board")!;
  const initialBounds = fixtureBoard.getBoundingClientRect();
  document.body.dataset.nativeBoardBounds = JSON.stringify({x:initialBounds.x,y:initialBounds.y,width:initialBounds.width,height:initialBounds.height});
  // Observe real pointer delivery across the board without contacting a service.
  const squareAt = (event: PointerEvent) => {
    const rect = fixtureBoard.getBoundingClientRect();
    return `${Math.floor((event.clientX - rect.left) / rect.width * 8)},${Math.floor((event.clientY - rect.top) / rect.height * 8)}`;
  };
  fixtureBoard.addEventListener("pointerdown", event => {
    document.body.dataset.fixturePointerDown = squareAt(event);
  });
  fixtureBoard.addEventListener("pointerup", event => {
    document.body.dataset.fixturePointerUp = squareAt(event);
  });
  apply();
  // Only this local fixture simulates time and navigation; never a real game.
  const bottom = document.querySelector('#board-layout-player-bottom [role="timer"]')!;
  if (searchParams.has("low-time")) { bottom.textContent = "0:20"; apply(); }
  // Fixture-only keyboard scenarios: T changes turn, L enters low time,
  // E opens the native-shaped result screen. None performs gameplay.
  document.addEventListener("keydown", event => {
    if (event.key === "t") {
      document.querySelectorAll(".clock-component").forEach(clock => clock.classList.toggle("clock-player-turn"));
    }
    if (event.key === "l") bottom.textContent = "0:59.8";
    if (event.key === "e") {
      document.querySelector("#board-layout-chessboard")!.insertAdjacentHTML("beforeend",
        '<div class="board-modal-container-container"><div class="game-over-modal-shell-container"><h2>Game over</h2><p>Won on time</p><button>Game Review</button><button>New game</button></div></div>');
    }
    apply();
  });
  document.querySelector('.game-buttons-container-component [aria-label="Previous Move"]')?.addEventListener("click", () => {
    document.body.dataset.fixtureMove = "previous";
    const pawn = document.querySelector<HTMLElement>(".wp")!;
    pawn.style.top = "50%";
  });
  document.querySelector('.game-buttons-container-component [aria-label="Next Move"]')?.addEventListener("click", () => {
    document.body.dataset.fixtureMove = "next";
    document.querySelector<HTMLElement>(".wp")!.style.top = "75%";
  });
  window.setInterval(apply, 750);
}

// Native-shaped phone scenarios are local and never invoke Chess.com services.
if (["/phone-game", "/game-review-mobile"].includes(window.location.pathname)) {
  const pokemon = new PokemonController();
  const reviewStyle = new ReviewPresentationController();
  const phone = new PhoneExperienceController();
  const clocks = new ExtremeOledController();
  const annotationBoard = document.querySelector<HTMLElement>("#board-single");
  if (annotationBoard && !searchParams.has("no-annotation-api")) installAnnotationFixture(annotationBoard);
  if (annotationBoard && searchParams.has("hints")) {
    const api = (annotationBoard as HTMLElement & {game?: {markings: import("../../src/content/native-annotations").NativeMarkings}}).game?.markings;
    if (api) api.addOne(api.factory.buildStandardAnalysisHighlight("e4"));
    annotationBoard.insertAdjacentHTML("beforeend", '<div class="hint" style="position:absolute;left:50%;top:62.5%;width:12.5%;height:12.5%;padding:4.2%;box-sizing:border-box;border-radius:50%;background:var(--color-transparent-black-14,rgba(0,0,0,.14));background-clip:content-box;pointer-events:none"></div><div class="capture-hint" style="position:absolute;left:50%;top:12.5%;width:12.5%;height:12.5%;box-sizing:border-box;border:5px solid var(--color-transparent-black-14,rgba(0,0,0,.14));border-radius:50%;pointer-events:none"></div>');
  }
  if (searchParams.has("native-material")) document.querySelectorAll('wc-captured-pieces').forEach((material, i) => {
    const widths = searchParams.has('many-pieces') ? [62,23,23,23,18] : [13,23,16,15,18];
    const glyphs = ['♟','♝','♞','♜','♛'];
    material.innerHTML = '<div>' + widths.map((width,j) =>
      `<span class="captured-pieces-cpiece captured-pieces-${i ? 'b' : 'w'}-${j}" style="display:inline-block;width:${width}px;height:19px;margin-right:3px;background:#8883;vertical-align:middle">${glyphs[j]}</span>`).join('') +
      `<span class="captured-pieces-cpiece captured-pieces-score">${i ? '+1' : '+12'}</span></div>`;
    (material.closest('.player-playerContent') as HTMLElement).style.overflow = 'hidden';
  });
  if (searchParams.has("full-material")) document.querySelectorAll('wc-captured-pieces > div').forEach((row, i) => {
    row.innerHTML = `<span class="captured-pieces-cpiece captured-pieces-${i ? 'w' : 'b'}-8-pawns" style="font-size:18px;color:${i ? '#eee' : '#333'}">♟♟♟♟♟♟♟♟</span><span class="captured-pieces-cpiece">♞♞</span><span class="captured-pieces-cpiece">♜♜</span><span class="captured-pieces-cpiece">♛</span><span class="captured-pieces-score">+3</span>`;
  });
  if (searchParams.has("material-edge")) document.querySelectorAll('wc-captured-pieces > div').forEach(row => {
    const lastWidth = searchParams.has('extra-piece') ? 48 : 24;
    row.innerHTML = `<span class="captured-pieces-cpiece" style="width:60px">♟♟♟♟</span><span class="captured-pieces-cpiece" style="width:28px">♞♞</span><span class="captured-pieces-cpiece" style="width:28px">♝♝</span><span class="captured-pieces-cpiece" style="width:${lastWidth}px">♜${lastWidth > 24 ? '♜' : ''}</span><span class="captured-pieces-score">+2</span>`;
  });
  const annotationEvents: string[] = [];
  for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel", "lostpointercapture"]) {
    document.addEventListener(type, event => {
      if (!(event.target as Element)?.classList?.contains("chesscom-vinf-annotations")) return;
      annotationEvents.push(`${type}:${(event as PointerEvent).pointerId}`);
      document.body.dataset.annotationEvents = annotationEvents.slice(-12).join(",");
    }, true);
  }
  const annotations = new TouchAnnotationsController();
  const actions = new PhoneGameActionsController();
  const androidDock = new AndroidGameControlsController();
  const game = window.location.pathname === "/phone-game";
  const route = { protocol: "https:", hostname: "www.chess.com",
    pathname: game ? "/game/123456" : searchParams.has("engine") ? "/analysis/game/live/123456/analysis" : "/analysis/game/live/123456/review" };
  const settings = { ...DEFAULT_SETTINGS, pokemonMode: searchParams.has("pokemon"), enabled: !searchParams.has("native"),
    extremeOled: searchParams.has("extreme"), turnDotSize: searchParams.has("large-dot") ? 24 : searchParams.has("small-dot") ? 4 : DEFAULT_SETTINGS.turnDotSize };
  const apply = () => {
    phone.reconcile(document, route, settings, window.innerWidth <= 599);
    const phoneActions = window.innerWidth <= 599;
    if (phoneActions) actions.reconcile(document, route, settings, true);
    clocks.reconcile(document, route, settings, game, searchParams.has("desktop") && window.innerWidth > 599);
    reviewStyle.reconcile(document, route, settings, window.innerWidth <= 599);
    pokemon.reconcile(document, route, settings);
    if (!game) gameReviewController.reconcile(document, route, settings.enabled, window.innerWidth <= 599);
    if (!phoneActions) actions.reconcile(document, route, settings, false, true);
    androidDock.reconcile(document, route, settings, !searchParams.has("desktop") || window.innerWidth <= 599);
    annotations.reconcile(document, route, settings, !searchParams.has("desktop") || window.innerWidth <= 599);
  };
  // Sanitized native confirmation shape; never a real game action.
  document.querySelector('.resign-button-component')?.addEventListener('click', () => {
    if (document.querySelector('.cc-confirmation-popover-popover')) return;
    const dialog = document.createElement('div');
    dialog.className = 'cc-confirmation-popover-popover';
    dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-label', 'Fixture resign confirmation');
    dialog.style.cssText = 'position:fixed;top:35%;left:10%;width:80%;padding:16px;background:#262522;z-index:2000';
    dialog.innerHTML = '<p>Resign this fixture game?</p><button>Cancel</button><button>Confirm resign</button>';
    dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      document.body.dataset.confirmationChoice = button.textContent!; dialog.remove();
    }));
    document.body.append(dialog);
  });
  const audio = document.querySelector<HTMLButtonElement>('[aria-label="Toggle Coach Audio"]');
  audio?.addEventListener("click", () => {
    const svg = audio.querySelector("svg")!;
    svg.setAttribute("data-glyph", svg.getAttribute("data-glyph") === "media-audio-speaker-mute"
      ? "media-audio-speaker" : "media-audio-speaker-mute");
    document.body.dataset.audioClicks = String(Number(document.body.dataset.audioClicks ?? 0) + 1);
  });
  const pendingReview = !game && searchParams.has('pending-start');
  const reviewMoves = document.querySelector('.move-by-move-component');
  const primaryReview = document.querySelector('.mobile-gr-footer-primary');
  let startClicks = 0;
  if (pendingReview) {
    reviewMoves?.classList.remove('move-by-move-component');
    primaryReview?.setAttribute('aria-label', 'Start Review');
    if (primaryReview) primaryReview.innerHTML = '<span><svg data-glyph="move-circle-best" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/></svg></span>';
  }
  document.querySelector('.mobile-gr-footer-primary')?.addEventListener('click', () => {
    if (pendingReview && startClicks === 0) {
      startClicks++; document.body.dataset.startClicks = String(startClicks);
      setTimeout(() => {
        reviewMoves?.classList.add('move-by-move-component');
        primaryReview?.setAttribute('aria-label', 'Next');
        primaryReview?.querySelector('svg[data-glyph]')?.setAttribute('data-glyph', 'arrow-triangle-point-right');
        const pawn = document.querySelector<HTMLElement>('#board-analysis-board .wp');
        if (pawn) { pawn.classList.add('fixture-checkpoint'); pawn.style.top = '50%'; }
        apply();
      }, 1200);
    }

    if (!game) gameReviewController.reconcile(document, route, settings.enabled, window.innerWidth <= 599);
  });
  if (searchParams.has("audio-on")) audio?.querySelector("svg")?.setAttribute("data-glyph", "media-audio-speaker");
  document.querySelectorAll('.mobile-gr-footer-footer button, .game-buttons-container-component button').forEach(button => {
    button.addEventListener("click", () => document.body.dataset.lastControl = button.getAttribute("aria-label") ?? "");
  });
  document.querySelector("wc-simple-move-list")?.addEventListener("click", event => {
    const node = (event.target as Element).closest(".node");
    if (!node) return;
    document.querySelectorAll(".node.selected").forEach(e => e.classList.remove("selected"));
    node.classList.add("selected");
    document.body.dataset.selectedMove = node.getAttribute("data-node") ?? "";
  });
  const board = document.querySelector<HTMLElement>("#board-single");
  if (board) {
    const initial = board.getBoundingClientRect();
    document.body.dataset.nativeBoardSize = `${initial.width},${initial.height}`;
    for (const kind of ["pointerdown", "pointerup"] as const) board.addEventListener(kind, event => {
      const rect = board.getBoundingClientRect();
      document.body.dataset[kind] = `${Math.floor((event.clientX - rect.left) / rect.width * 8)},${Math.floor((event.clientY - rect.top) / rect.height * 8)}`;
    });
  }
  document.querySelector('.move-by-move-buttons button:last-child')?.addEventListener('click', () => { document.body.dataset.fixtureNewGame = 'clicked'; });
  document.querySelector('.sidebar-header-header [aria-label="Go to Analysis"]')?.addEventListener('click', () => { document.body.dataset.fixtureAnalysis = 'clicked'; });
  const bestFixture = document.querySelector<HTMLButtonElement>('.mobile-gr-footer-footer [aria-label="Best"]');
  bestFixture?.addEventListener('click', () => {
    bestFixture.hidden = true;
    const hint = document.querySelector('.mobile-gr-footer-footer [aria-label="Explain"]');
    hint?.setAttribute('aria-label', 'Hint');
    primaryReview?.setAttribute('aria-label', 'Next');
    apply();
    document.body.dataset.retryDock = document.querySelector('.mobile-gr-footer-footer')?.hasAttribute('data-chesscom-vinf-review-dock') ? 'stable' : 'lost';
    setTimeout(() => {
      hint?.setAttribute('aria-label', 'Explain');
      primaryReview?.setAttribute('aria-label', 'Resume'); apply();
    }, 850);
  });
  primaryReview?.addEventListener('click', () => {
    if (primaryReview.getAttribute('aria-label') !== 'Resume') return;
    primaryReview.setAttribute('aria-label', 'Next');
    if (bestFixture) bestFixture.hidden = false;
    apply();
  });
  document.addEventListener("keydown", event => {
    if (!game && event.key === "c") document.querySelectorAll('.move-time-time').forEach(clock => clock.classList.toggle('move-time-iconless'));
    if (!game && event.key === "b") document.querySelector('.mobile-gr-footer-footer [aria-label="Best"]')?.remove();
    if (!game && event.key === "h") document.querySelector('.mobile-gr-footer-footer [aria-label="Explain"]')?.remove();
    if (!game && event.key === "x") settings.extremeOled = !settings.extremeOled;
    if (!game && event.key === "p") document.querySelectorAll('.move-feedback-speech-text-component').forEach(node => {
      node.textContent = '';
      setTimeout(() => { node.textContent = 'A longer sentence arrives after native coach processing. Develop your knight and protect the center.'; }, 800);
    });
    if (!game && event.key === "n") document.querySelectorAll('.move-feedback-speech-text-component').forEach(node => node.textContent = 'This move leaves your knight unprotected. Look for a way to develop while keeping it safe.');
    if (game && event.key === "t" && settings.pokemonMode) {
      const top = document.querySelector('#board-layout-player-top .clock-component')!;
      const bottom = document.querySelector('#board-layout-player-bottom .clock-component')!;
      const wasBottom = bottom.classList.contains('clock-player-turn');
      top.classList.toggle('clock-player-turn', wasBottom);
      bottom.classList.toggle('clock-player-turn', !wasBottom);
      const rows = document.querySelector('wc-simple-move-list > div')!;
      const nodes = [...rows.querySelectorAll('[data-node]')];
      const ply = Math.max(...nodes.map(node => Number(node.getAttribute('data-node')!.slice(2)))) + 1;
      const row = document.createElement('div'); row.className = 'main-line-row';
      const node = document.createElement('div');
      node.className = `node main-line-ply ${wasBottom ? 'white' : 'black'}-move`;
      node.setAttribute('data-node', `0-${ply}`); node.textContent = wasBottom ? 'Nf3' : 'Nc6';
      row.append(node); rows.append(row);
    }
    if (event.key === "m") {
      const rows = document.querySelector("wc-simple-move-list > div");
      const row = rows?.lastElementChild?.cloneNode(true) as HTMLElement | undefined;
      if (row && rows) {
        const n = Number(row.dataset.wholeMoveNumber) + 1;
        row.dataset.wholeMoveNumber = String(n);
        row.querySelectorAll(".selected").forEach(node => node.classList.remove("selected"));
        row.firstChild!.textContent = `${n}. `;
        row.querySelector(".white-move")!.setAttribute("data-node", `0-${2*n-2}`);
        row.querySelector(".black-move")!.setAttribute("data-node", `0-${2*n-1}`);
        rows.append(row);
        // Native scroll-to-selection can occur after its render tick.
        setTimeout(() => {
          const scroll = document.querySelector<HTMLElement>("#live-game-tab-scroll-container");
          if (scroll) scroll.scrollTop = scroll.scrollHeight;
        }, 100);
      }
    }
    if (event.key === "e") document.querySelector("#board-layout-sidebar")?.insertAdjacentHTML("beforeend", '<div class="game-result">1-0</div>');
    if (event.key === "d") settings.enabled = !settings.enabled;
    if (event.key === "r") route.pathname = route.pathname.includes("review") ? "/game/123456" : "/analysis/game/live/123456/review";
    if (event.key === "l") {
      const timer = document.querySelector('#board-layout-player-bottom [role="timer"]');
      if (timer) timer.textContent = "0:59";
    }
    if (event.key === "h") document.querySelector('[aria-label="Explain"]')?.toggleAttribute("hidden");
    if (event.key === "b") document.querySelector('[aria-label="Best"]')?.toggleAttribute("hidden");
    if (event.key === "a") audio?.querySelector("svg")?.setAttribute("data-glyph", "media-audio-speaker");
    apply();
  });
  window.addEventListener("resize", apply);
  if (searchParams.has("entry")) window.scrollTo(0, 250);
  if (searchParams.has("late-entry")) setTimeout(() => window.scrollTo(0, 5), 1500);
  apply();
}
