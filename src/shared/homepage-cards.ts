import type { HomepageSidebarCardId } from "./models";

export interface HomepageSidebarCard {
  id: HomepageSidebarCardId;
  label: string;
}

export const HOMEPAGE_SIDEBAR_CARD_CATALOG: readonly HomepageSidebarCard[] = [
  { id: "stats", label: "Stats" },
  { id: "chess-tv", label: "ChessTV" },
  { id: "daily-games", label: "Daily Games" },
  { id: "recommended-match", label: "Recommended Match" },
  { id: "game-history", label: "Game History" },
  { id: "streaks", label: "Streaks" },
  { id: "legend-league", label: "Legend League" },
  { id: "daily-puzzle", label: "Daily Puzzle" },
  { id: "friends", label: "Friends" }
] as const;

export const DEFAULT_HOMEPAGE_SIDEBAR_ORDER: HomepageSidebarCardId[] =
  HOMEPAGE_SIDEBAR_CARD_CATALOG.map(({ id }) => id);

export const DEFAULT_HOMEPAGE_SIDEBAR_VISIBLE: HomepageSidebarCardId[] =
  DEFAULT_HOMEPAGE_SIDEBAR_ORDER.filter(
    (id) => id !== "recommended-match" && id !== "game-history"
  );
