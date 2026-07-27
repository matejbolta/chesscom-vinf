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
export type QuickPlayPresetCount = 6 | 8;
export type StatsSummaryId = "games" | "puzzles" | "lessons";
export type StatsDefaultState = "expanded" | "retracted";
export type DailyGamesPlacement = "main" | "sidebar" | "hidden";
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
  dailyGamesPlacement: DailyGamesPlacement;
  showChessTv: boolean;
  showLegendLeague: boolean;
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
  gameHistory: HTMLElement | null;
  rightColumn: HTMLElement | null;
  stats: HTMLElement | null;
  chessTv: HTMLElement | null;
  legendLeague: HTMLElement | null;
}

export type QuickPlayButtonState =
  | "ready"
  | "starting"
  | "failed"
  | "unavailable";
