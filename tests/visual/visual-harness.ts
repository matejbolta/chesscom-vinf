import { LayoutController } from "../../src/content/layout-controller";
import { NativeLaunchAdapter } from "../../src/content/launch-adapter";
import { DEFAULT_SETTINGS } from "../../src/shared/settings";
import { DEFAULT_EIGHT_TIME_CONTROL_IDS } from "../../src/shared/time-controls";

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

const previewSettings = searchParams.has("eight-preview")
  ? {
      ...DEFAULT_SETTINGS,
      quickPlayPresetCount: 8 as const,
      timeControlIds: [...DEFAULT_EIGHT_TIME_CONTROL_IDS]
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

controller.reconcile(document, fixtureLocation, {
  ...previewSettings,
  timeControlIds: [...previewSettings.timeControlIds]
});
