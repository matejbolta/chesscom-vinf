import { LayoutController } from "../../src/content/layout-controller";
import { NativeLaunchAdapter } from "../../src/content/launch-adapter";
import type { ExtensionSettings } from "../../src/shared/models";
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

const searchParams = new URL(window.location.href).searchParams;

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

if (searchParams.has("native-panel")) {
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

controller.reconcile(document, fixtureLocation, {
  ...previewSettings,
  timeControlIds: [...previewSettings.timeControlIds]
});
