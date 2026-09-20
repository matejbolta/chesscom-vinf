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
