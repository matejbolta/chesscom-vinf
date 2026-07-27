import type {
  DailyGamesPlacement,
  ExtensionSettings,
  QuickPlayPresetCount,
  StatsDefaultState,
  StatsRatingId,
  StatsRatingStates,
  StatsSummaryId,
  TimeControlId
} from "./models";
import {
  DEFAULT_STATS_RATING_ORDER,
  DEFAULT_STATS_RATING_STATES,
  DEFAULT_STATS_RATING_VISIBLE,
  DEFAULT_STATS_SUMMARY_ORDER,
  DEFAULT_STATS_SUMMARY_VISIBLE,
  STATS_RATING_CATALOG,
  STATS_SUMMARY_CATALOG
} from "./stats";
import {
  DEFAULT_EIGHT_TIME_CONTROL_IDS,
  DEFAULT_TIME_CONTROL_IDS,
  TIME_CONTROL_CATALOG
} from "./time-controls";

export const SETTINGS_STORAGE_KEY = "vinfSettings";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  dailyGamesPlacement: "sidebar",
  showChessTv: true,
  showLegendLeague: true,
  quickPlayPresetCount: 6,
  timeControlIds: [...DEFAULT_TIME_CONTROL_IDS],
  statsSummaryOrder: [...DEFAULT_STATS_SUMMARY_ORDER],
  statsSummaryVisible: [...DEFAULT_STATS_SUMMARY_VISIBLE],
  statsRatingOrder: [...DEFAULT_STATS_RATING_ORDER],
  statsRatingVisible: [...DEFAULT_STATS_RATING_VISIBLE],
  statsRatingStates: { ...DEFAULT_STATS_RATING_STATES }
};

const validTimeControlIds = new Set<TimeControlId>(
  TIME_CONTROL_CATALOG.map((control) => control.id)
);
const validStatsSummaryIds = new Set<StatsSummaryId>(
  STATS_SUMMARY_CATALOG.map((item) => item.id)
);
const validStatsRatingIds = new Set<StatsRatingId>(
  STATS_RATING_CATALOG.map((item) => item.id)
);

function cloneDefaultSettings(): ExtensionSettings {
  return {
    ...DEFAULT_SETTINGS,
    timeControlIds: [...DEFAULT_SETTINGS.timeControlIds],
    statsSummaryOrder: [...DEFAULT_SETTINGS.statsSummaryOrder],
    statsSummaryVisible: [...DEFAULT_SETTINGS.statsSummaryVisible],
    statsRatingOrder: [...DEFAULT_SETTINGS.statsRatingOrder],
    statsRatingVisible: [...DEFAULT_SETTINGS.statsRatingVisible],
    statsRatingStates: { ...DEFAULT_SETTINGS.statsRatingStates }
  };
}

function normalizeCompleteOrder<TId extends string>(
  value: unknown,
  validIds: ReadonlySet<TId>,
  fallback: readonly TId[]
): TId[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  const unique = [
    ...new Set(
      value.filter(
        (id): id is TId => typeof id === "string" && validIds.has(id as TId)
      )
    )
  ];
  return unique.length === validIds.size ? unique : [...fallback];
}

function normalizeVisible<TId extends string>(
  value: unknown,
  validIds: ReadonlySet<TId>,
  fallback: readonly TId[]
): TId[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return [
    ...new Set(
      value.filter(
        (id): id is TId => typeof id === "string" && validIds.has(id as TId)
      )
    )
  ];
}

function isStatsDefaultState(value: unknown): value is StatsDefaultState {
  return value === "expanded" || value === "retracted";
}

function isDailyGamesPlacement(value: unknown): value is DailyGamesPlacement {
  return value === "main" || value === "sidebar" || value === "hidden";
}

function isQuickPlayPresetCount(
  value: unknown
): value is QuickPlayPresetCount {
  return value === 6 || value === 8;
}

function normalizeStatsRatingStates(
  value: unknown,
  legacyState: unknown
): StatsRatingStates {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<Record<StatsRatingId, unknown>>)
      : {};
  const legacyFallback = isStatsDefaultState(legacyState)
    ? legacyState
    : null;

  return Object.fromEntries(
    STATS_RATING_CATALOG.map(({ id }) => [
      id,
      isStatsDefaultState(candidate[id])
        ? candidate[id]
        : (legacyFallback ?? DEFAULT_SETTINGS.statsRatingStates[id])
    ])
  ) as StatsRatingStates;
}

export function normalizeSettings(value: unknown): ExtensionSettings {
  if (!value || typeof value !== "object") {
    return cloneDefaultSettings();
  }

  const candidate = value as {
    enabled?: unknown;
    dailyGamesPlacement?: unknown;
    showChessTv?: unknown;
    showLegendLeague?: unknown;
    quickPlayPresetCount?: unknown;
    moveDailyGamesToSidebar?: unknown;
    reorderGameHistory?: unknown;
    timeControlIds?: unknown;
    statsSummaryOrder?: unknown;
    statsSummaryVisible?: unknown;
    statsRatingOrder?: unknown;
    statsRatingVisible?: unknown;
    statsRatingStates?: unknown;
    statsDefaultState?: unknown;
  };
  const ids = Array.isArray(candidate.timeControlIds)
    ? candidate.timeControlIds
      .map((id) => (id === "15-0" ? "20-0" : id))
      .filter(
        (id): id is TimeControlId =>
          typeof id === "string" && validTimeControlIds.has(id as TimeControlId)
      )
    : [];
  const uniqueIds = [...new Set(ids)];
  const quickPlayPresetCount = isQuickPlayPresetCount(
    candidate.quickPlayPresetCount
  )
    ? candidate.quickPlayPresetCount
    : uniqueIds.length === 8
      ? 8
      : DEFAULT_SETTINGS.quickPlayPresetCount;
  const defaultTimeControlIds =
    quickPlayPresetCount === 8
      ? DEFAULT_EIGHT_TIME_CONTROL_IDS
      : DEFAULT_TIME_CONTROL_IDS;

  return {
    enabled:
      typeof candidate.enabled === "boolean"
        ? candidate.enabled
        : DEFAULT_SETTINGS.enabled,
    dailyGamesPlacement: isDailyGamesPlacement(candidate.dailyGamesPlacement)
      ? candidate.dailyGamesPlacement
      : typeof candidate.moveDailyGamesToSidebar === "boolean"
        ? candidate.moveDailyGamesToSidebar
          ? "sidebar"
          : "main"
        : typeof candidate.reorderGameHistory === "boolean"
          ? candidate.reorderGameHistory
            ? "sidebar"
            : "main"
          : DEFAULT_SETTINGS.dailyGamesPlacement,
    showChessTv:
      typeof candidate.showChessTv === "boolean"
        ? candidate.showChessTv
        : DEFAULT_SETTINGS.showChessTv,
    showLegendLeague:
      typeof candidate.showLegendLeague === "boolean"
        ? candidate.showLegendLeague
        : DEFAULT_SETTINGS.showLegendLeague,
    quickPlayPresetCount,
    timeControlIds:
      uniqueIds.length === quickPlayPresetCount
        ? uniqueIds
        : [...defaultTimeControlIds],
    statsSummaryOrder: normalizeCompleteOrder(
      candidate.statsSummaryOrder,
      validStatsSummaryIds,
      DEFAULT_SETTINGS.statsSummaryOrder
    ),
    statsSummaryVisible: normalizeVisible(
      candidate.statsSummaryVisible,
      validStatsSummaryIds,
      DEFAULT_SETTINGS.statsSummaryVisible
    ),
    statsRatingOrder: normalizeCompleteOrder(
      candidate.statsRatingOrder,
      validStatsRatingIds,
      DEFAULT_SETTINGS.statsRatingOrder
    ),
    statsRatingVisible: normalizeVisible(
      candidate.statsRatingVisible,
      validStatsRatingIds,
      DEFAULT_SETTINGS.statsRatingVisible
    ),
    statsRatingStates: normalizeStatsRatingStates(
      candidate.statsRatingStates,
      candidate.statsDefaultState
    )
  };
}

export async function loadSettings(): Promise<ExtensionSettings> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return normalizeSettings(DEFAULT_SETTINGS);
  }

  const result = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  return normalizeSettings(result[SETTINGS_STORAGE_KEY]);
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return;
  }

  await chrome.storage.local.set({
    [SETTINGS_STORAGE_KEY]: normalizeSettings(settings)
  });
}
