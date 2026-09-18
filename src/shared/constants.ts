export const HOME_PATHS = new Set(["/home", "/home/"]);

export const MARKERS = {
  active: "data-chesscom-vinf-active",
  dailyPlacement: "data-chesscom-vinf-daily-placement",
  hidden: "data-chesscom-vinf-hidden",
  gameHistoryPlacement: "data-chesscom-vinf-game-history-placement",
  layout: "data-chesscom-vinf-layout",
  module: "data-chesscom-vinf-module",
  nativePlayPanel: "data-chesscom-vinf-native-play-panel",
  oled: "data-chesscom-vinf-oled",
  oledButtons: "data-chesscom-vinf-oled-buttons",
  owned: "data-chesscom-vinf-owned",
  recommendedPlacement: "data-chesscom-vinf-recommended-placement",
  reviewGraph: "data-chesscom-vinf-review-graph",
  reviewGraphHost: "data-chesscom-vinf-review-graph-host",
  sidebarCard: "data-chesscom-vinf-sidebar-card",
  sidebarHidden: "data-chesscom-vinf-sidebar-hidden",
  statsInitialState: "data-chesscom-vinf-stats-initial-state"
} as const;

export const QUICK_PLAY_OWNER = "quick-play";
export const GAME_CONTINUATION_OWNER = "game-continuation";
export const SIDEBAR_CARD_OWNER = "sidebar-card";
export const RECONCILE_DELAY_MS = 60;
export const ROUTE_CHECK_INTERVAL_MS = 750;
export const LAUNCH_FAILURE_TIMEOUT_MS = 8_000;
export const PHONE_GAME_REVIEW_MEDIA_QUERY = "(max-width: 599px)";
