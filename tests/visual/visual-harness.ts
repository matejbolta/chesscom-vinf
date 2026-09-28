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
      pathname: "/analysis/game/live/123456/review"
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
  const settings = { ...DEFAULT_SETTINGS, extremeOled: searchParams.has("extreme") };
  const apply = () => extreme.reconcile(document,
    { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" }, settings);
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
  const phone = new PhoneExperienceController();
  const clocks = new ExtremeOledController();
  const annotationBoard = document.querySelector<HTMLElement>("#board-single");
  if (annotationBoard && !searchParams.has("no-annotation-api")) installAnnotationFixture(annotationBoard);
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
    pathname: game ? "/game/123456" : "/analysis/game/live/123456/review" };
  const settings = { ...DEFAULT_SETTINGS, enabled: !searchParams.has("native"),
    extremeOled: searchParams.has("extreme") };
  const apply = () => {
    phone.reconcile(document, route, settings, window.innerWidth <= 599);
    actions.reconcile(document, route, settings, window.innerWidth <= 599 && !searchParams.has("desktop"));
    clocks.reconcile(document, route, settings, game && (window.innerWidth <= 599 || searchParams.has("desktop")));
    androidDock.reconcile(document, route, settings, !searchParams.has("desktop"));
    annotations.reconcile(document, route, settings, !searchParams.has("desktop"));
  };
  const audio = document.querySelector<HTMLButtonElement>('[aria-label="Toggle Coach Audio"]');
  audio?.addEventListener("click", () => {
    const svg = audio.querySelector("svg")!;
    svg.setAttribute("data-glyph", svg.getAttribute("data-glyph") === "media-audio-speaker-mute"
      ? "media-audio-speaker" : "media-audio-speaker-mute");
    document.body.dataset.audioClicks = String(Number(document.body.dataset.audioClicks ?? 0) + 1);
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
  document.addEventListener("keydown", event => {
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
  apply();
}
