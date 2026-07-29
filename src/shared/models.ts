export type TimeControlId =
  | "30s-0"
  | "20s-1"
  | "1-0"
  | "1-1"
  | "2-1"
  | "3-0"
  | "3-2"
  | "5-0"
  | "5-2"
  | "5-3"
  | "5-5"
  | "10-0"
  | "10-5"
  | "15-10"
  | "20-0"
  | "30-0"
  | "60-0";

export type TimeClass = "bullet" | "blitz" | "rapid";
export type PresetAvailability = "both" | "desktop" | "mobile";
export type QuickPlayPresetCount = 0 | 1 | 2 | 3 | 4 | 6 | 8;
export type StatsSummaryId = "games" | "puzzles" | "lessons";
export type StatsDefaultState = "expanded" | "retracted";
export type MainColumnCardPlacement = "main" | "sidebar" | "hidden";
export type MainColumnCardVisiblePlacement = Exclude<
  MainColumnCardPlacement,
  "hidden"
>;
export type DailyGamesPlacement = MainColumnCardPlacement;
export type DailyGamesVisiblePlacement = Exclude<
  DailyGamesPlacement,
  "hidden"
>;
export type RecommendedMatchPlacement = MainColumnCardPlacement;
export type RecommendedMatchVisiblePlacement = Exclude<
  RecommendedMatchPlacement,
  "hidden"
>;
export type GameHistoryPlacement = MainColumnCardPlacement;
export type GameHistoryVisiblePlacement = Exclude<
  GameHistoryPlacement,
  "hidden"
>;
export type HomepageSidebarCardId =
  | "stats"
  | "daily-puzzle"
  | "streaks"
  | "legend-league"
  | "friends"
  | "chess-tv"
  | "daily-games"
  | "recommended-match"
  | "game-history";
export type StatsRatingId =
  | "rapid"
  | "bullet"
  | "blitz"
  | "daily"
  | "puzzles"
  | "live-960";
export type StatsRatingStates = Record<StatsRatingId, StatsDefaultState>;

export interface TimeControl {
  id: TimeControlId;
  label: string;
  baseSeconds: number;
  incrementSeconds: number;
  timeClass: TimeClass;
  presetAvailability: PresetAvailability;
}

export interface ExtensionSettings {
  enabled: boolean;
  showNativePlayPanel: boolean;
  dailyGamesPlacement: DailyGamesPlacement;
  dailyGamesVisiblePlacement: DailyGamesVisiblePlacement;
  recommendedMatchPlacement: RecommendedMatchPlacement;
  recommendedMatchVisiblePlacement: RecommendedMatchVisiblePlacement;
  gameHistoryPlacement: GameHistoryPlacement;
  gameHistoryVisiblePlacement: GameHistoryVisiblePlacement;
  homepageSidebarOrder: HomepageSidebarCardId[];
  homepageSidebarVisible: HomepageSidebarCardId[];
  quickPlayPresetCount: QuickPlayPresetCount;
  timeControlIds: TimeControlId[];
  statsSummaryOrder: StatsSummaryId[];
  statsSummaryVisible: StatsSummaryId[];
  statsRatingOrder: StatsRatingId[];
  statsRatingVisible: StatsRatingId[];
  statsRatingStates: StatsRatingStates;
}

export interface LocationLike {
  hostname: string;
  pathname: string;
  protocol: string;
}

export interface HomepageModules {
  layoutMode: "desktop" | "responsive";
  homepageToolbar: HTMLElement | null;
  mainBanner: HTMLElement | null;
  promoUserInfos: HTMLElement[];
  promo: HTMLElement | null;
  nativeActionColumn: HTMLElement | null;
  nativeLaunchTemplate: HTMLAnchorElement | null;
  topLeagueSummary: HTMLElement | null;
  puzzles: HTMLElement | null;
  nextLesson: HTMLElement | null;
  gameReview: HTMLElement | null;
  leftColumn: HTMLElement | null;
  dailyGames: HTMLElement | null;
  recommendedMatch: HTMLElement | null;
  gameHistory: HTMLElement | null;
  rightColumn: HTMLElement | null;
  stats: HTMLElement | null;
  chessTv: HTMLElement | null;
  legendLeague: HTMLElement | null;
  dailyPuzzle: HTMLElement | null;
  friends: HTMLElement | null;
  streaks: HTMLElement | null;
  badgesContainer: HTMLElement | null;
}

export type QuickPlayButtonState =
  | "ready"
  | "starting"
  | "failed"
  | "unavailable";
