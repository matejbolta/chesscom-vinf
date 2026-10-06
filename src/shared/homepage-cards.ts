import type { HomepageSidebarCardId } from "./models";

export interface HomepageSidebarCard {
  id: HomepageSidebarCardId;
  label: string;
}

export const HOMEPAGE_SIDEBAR_CARD_CATALOG: readonly HomepageSidebarCard[] = [
  { id: "profile", label: "Profile" },
  { id: "stats", label: "Stats" },
  { id: "chess-tv", label: "ChessTV" },
  { id: "daily-games", label: "Daily Games" },
  { id: "recommended-match", label: "Recommended Match" },
  { id: "game-history", label: "Game History" },
  { id: "streaks", label: "Streaks" },
  { id: "legend-league", label: "Legend League" },
  { id: "daily-puzzle", label: "Daily Puzzle" },
  { id: "friends", label: "Friends" },
  { id: "open-game", label: "Open Game Shortcut" }
] as const;

export const DEFAULT_HOMEPAGE_SIDEBAR_ORDER: HomepageSidebarCardId[] = [
  "game-history", "stats", "open-game", "chess-tv", "profile", "recommended-match",
  "daily-games", "streaks", "legend-league", "daily-puzzle", "friends"
];

export const DEFAULT_HOMEPAGE_SIDEBAR_VISIBLE: HomepageSidebarCardId[] = [
  "stats", "open-game", "chess-tv"
];
