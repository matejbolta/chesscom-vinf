import type {
  StatsRatingId,
  StatsRatingStates,
  StatsSummaryId
} from "./models";

export interface StatsPreference<TId extends string> {
  id: TId;
  label: string;
}

export const STATS_SUMMARY_CATALOG: readonly StatsPreference<StatsSummaryId>[] = [
  { id: "games", label: "Games" },
  { id: "puzzles", label: "Puzzles" },
  { id: "lessons", label: "Lessons" }
];

export const STATS_RATING_CATALOG: readonly StatsPreference<StatsRatingId>[] = [
  { id: "rapid", label: "Rapid" },
  { id: "bullet", label: "Bullet" },
  { id: "blitz", label: "Blitz" },
  { id: "daily", label: "Daily" },
  { id: "puzzles", label: "Puzzles" },
  { id: "live-960", label: "Live 960" }
];

export const DEFAULT_STATS_SUMMARY_ORDER: readonly StatsSummaryId[] = [
  "games",
  "puzzles",
  "lessons"
];

export const DEFAULT_STATS_SUMMARY_VISIBLE: readonly StatsSummaryId[] = [
  "games"
];

export const DEFAULT_STATS_RATING_ORDER: readonly StatsRatingId[] = [
  "rapid",
  "blitz",
  "bullet",
  "daily",
  "puzzles",
  "live-960"
];

export const DEFAULT_STATS_RATING_VISIBLE: readonly StatsRatingId[] = [
  "rapid",
  "blitz"
];

export const DEFAULT_STATS_RATING_STATES: StatsRatingStates = {
  rapid: "retracted",
  bullet: "retracted",
  blitz: "retracted",
  daily: "retracted",
  puzzles: "retracted",
  "live-960": "retracted"
};
