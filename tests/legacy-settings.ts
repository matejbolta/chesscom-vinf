import { DEFAULT_SETTINGS } from "../src/shared/settings";
import type { ExtensionSettings } from "../src/shared/models";

// Explicit saved pre-2.24 profile: keeps migration/legacy layout coverage
// independent of new-install product defaults.
export const LEGACY_SETTINGS: ExtensionSettings = {
  ...DEFAULT_SETTINGS, oledMode: false, turnDotSize: 12, turnPulseDiameter: 24,
  turnAnimationDuration: 1000, dailyGamesPlacement: "sidebar", recommendedMatchPlacement: "main",
  quickPlayPresetCount: 6, timeControlIds: ["10-0", "10-5", "15-10", "30-0", "3-2", "5-3"],
  homepageSidebarOrder: ["profile", "stats", "chess-tv", "daily-games", "recommended-match", "game-history", "streaks", "legend-league", "daily-puzzle", "friends", "open-game"],
  homepageSidebarVisible: ["stats", "chess-tv", "daily-games", "streaks", "legend-league", "daily-puzzle", "friends", "open-game"]
};
