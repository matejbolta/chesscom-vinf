export const HOME_PATHS = new Set(["/home", "/home/"]);

export const MARKERS = {
  active: "data-chesscom-vinf-active",
  chessTvVisibility: "data-chesscom-vinf-chess-tv",
  dailyPlacement: "data-chesscom-vinf-daily-placement",
  hidden: "data-chesscom-vinf-hidden",
  layout: "data-chesscom-vinf-layout",
  legendLeagueVisibility: "data-chesscom-vinf-legend-league",
  module: "data-chesscom-vinf-module",
  owned: "data-chesscom-vinf-owned",
  statsInitialState: "data-chesscom-vinf-stats-initial-state"
} as const;

export const QUICK_PLAY_OWNER = "quick-play";
export const RECONCILE_DELAY_MS = 60;
export const ROUTE_CHECK_INTERVAL_MS = 750;
export const LAUNCH_FAILURE_TIMEOUT_MS = 8_000;
