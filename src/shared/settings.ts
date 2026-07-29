import type {
  ExtensionSettings,
  HomepageSidebarCardId,
  MainColumnCardPlacement,
  MainColumnCardVisiblePlacement,
  StatsDefaultState,
  StatsRatingId,
  StatsRatingStates,
  StatsSummaryId,
  TimeControlId
} from "./models";
import {
  DEFAULT_HOMEPAGE_SIDEBAR_ORDER,
  DEFAULT_HOMEPAGE_SIDEBAR_VISIBLE,
  HOMEPAGE_SIDEBAR_CARD_CATALOG
} from "./homepage-cards";
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
  DEFAULT_TIME_CONTROL_IDS,
  getDefaultTimeControlIds,
  isQuickPlayPresetCount,
  TIME_CONTROL_CATALOG
} from "./time-controls";

export const SETTINGS_STORAGE_KEY = "vinfSettings";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  showNativePlayPanel: false,
  dailyGamesPlacement: "sidebar",
  dailyGamesVisiblePlacement: "sidebar",
  recommendedMatchPlacement: "main",
  recommendedMatchVisiblePlacement: "main",
  gameHistoryPlacement: "main",
  gameHistoryVisiblePlacement: "main",
  homepageSidebarOrder: [...DEFAULT_HOMEPAGE_SIDEBAR_ORDER],
  homepageSidebarVisible: [...DEFAULT_HOMEPAGE_SIDEBAR_VISIBLE],
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
const validHomepageSidebarCardIds = new Set<HomepageSidebarCardId>(
  HOMEPAGE_SIDEBAR_CARD_CATALOG.map((item) => item.id)
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
    homepageSidebarOrder: [...DEFAULT_SETTINGS.homepageSidebarOrder],
    homepageSidebarVisible: [...DEFAULT_SETTINGS.homepageSidebarVisible],
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

function normalizeHomepageSidebarOrder(
  value: unknown
): HomepageSidebarCardId[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_SETTINGS.homepageSidebarOrder];
  }

  const unique = [
    ...new Set(
      value.filter(
        (id): id is HomepageSidebarCardId =>
          typeof id === "string" &&
          validHomepageSidebarCardIds.has(id as HomepageSidebarCardId)
      )
    )
  ];
  if (unique.length === validHomepageSidebarCardIds.size) {
    return unique;
  }

  const previousCardIds = DEFAULT_SETTINGS.homepageSidebarOrder.filter(
    (id) => id !== "game-history"
  );
  if (
    unique.length === previousCardIds.length &&
    !unique.includes("game-history") &&
    previousCardIds.every((id) => unique.includes(id))
  ) {
    const recommendedMatchIndex = unique.indexOf("recommended-match");
    unique.splice(recommendedMatchIndex + 1, 0, "game-history");
    return unique;
  }

  const earlierCardIds = DEFAULT_SETTINGS.homepageSidebarOrder.filter(
    (id) => id !== "recommended-match" && id !== "game-history"
  );
  if (
    unique.length === earlierCardIds.length &&
    !unique.includes("recommended-match") &&
    !unique.includes("game-history") &&
    earlierCardIds.every((id) => unique.includes(id))
  ) {
    const dailyGamesIndex = unique.indexOf("daily-games");
    unique.splice(dailyGamesIndex + 1, 0, "recommended-match");
    unique.splice(dailyGamesIndex + 2, 0, "game-history");
    return unique;
  }

  return [...DEFAULT_SETTINGS.homepageSidebarOrder];
}

function isStatsDefaultState(value: unknown): value is StatsDefaultState {
  return value === "expanded" || value === "retracted";
}

function isMainColumnCardPlacement(
  value: unknown
): value is MainColumnCardPlacement {
  return value === "main" || value === "sidebar" || value === "hidden";
}

function isMainColumnCardVisiblePlacement(
  value: unknown
): value is MainColumnCardVisiblePlacement {
  return value === "main" || value === "sidebar";
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
    showNativePlayPanel?: unknown;
    dailyGamesPlacement?: unknown;
    dailyGamesVisiblePlacement?: unknown;
    recommendedMatchPlacement?: unknown;
    recommendedMatchVisiblePlacement?: unknown;
    gameHistoryPlacement?: unknown;
    gameHistoryVisiblePlacement?: unknown;
    homepageSidebarOrder?: unknown;
    homepageSidebarVisible?: unknown;
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
  const rawIds = Array.isArray(candidate.timeControlIds)
    ? candidate.timeControlIds
    : [];
  const ids = rawIds
    .map((id) => (id === "15-0" ? "20-0" : id))
    .filter(
      (id): id is TimeControlId =>
        typeof id === "string" && validTimeControlIds.has(id as TimeControlId)
    );
  const inferredPresetCount =
    rawIds.length > 0 &&
    rawIds.length === ids.length &&
    isQuickPlayPresetCount(ids.length)
      ? ids.length
      : DEFAULT_SETTINGS.quickPlayPresetCount;
  const quickPlayPresetCount = isQuickPlayPresetCount(
    candidate.quickPlayPresetCount
  )
    ? candidate.quickPlayPresetCount
    : inferredPresetCount;
  const defaultTimeControlIds = getDefaultTimeControlIds(
    quickPlayPresetCount
  );
  const hasCompletePresetSelection =
    rawIds.length === quickPlayPresetCount &&
    ids.length === quickPlayPresetCount;
  const dailyGamesPlacement = isMainColumnCardPlacement(
    candidate.dailyGamesPlacement
  )
    ? candidate.dailyGamesPlacement
    : typeof candidate.moveDailyGamesToSidebar === "boolean"
      ? candidate.moveDailyGamesToSidebar
        ? "sidebar"
        : "main"
      : typeof candidate.reorderGameHistory === "boolean"
        ? candidate.reorderGameHistory
          ? "sidebar"
          : "main"
        : DEFAULT_SETTINGS.dailyGamesPlacement;
  const dailyGamesVisiblePlacement = isMainColumnCardVisiblePlacement(
    candidate.dailyGamesVisiblePlacement
  )
    ? candidate.dailyGamesVisiblePlacement
    : isMainColumnCardVisiblePlacement(dailyGamesPlacement)
      ? dailyGamesPlacement
      : DEFAULT_SETTINGS.dailyGamesVisiblePlacement;
  const recommendedMatchPlacement = isMainColumnCardPlacement(
    candidate.recommendedMatchPlacement
  )
    ? candidate.recommendedMatchPlacement
    : DEFAULT_SETTINGS.recommendedMatchPlacement;
  const recommendedMatchVisiblePlacement =
    isMainColumnCardVisiblePlacement(
      candidate.recommendedMatchVisiblePlacement
    )
      ? candidate.recommendedMatchVisiblePlacement
      : isMainColumnCardVisiblePlacement(recommendedMatchPlacement)
        ? recommendedMatchPlacement
        : DEFAULT_SETTINGS.recommendedMatchVisiblePlacement;
  const gameHistoryPlacement = isMainColumnCardPlacement(
    candidate.gameHistoryPlacement
  )
    ? candidate.gameHistoryPlacement
    : DEFAULT_SETTINGS.gameHistoryPlacement;
  const gameHistoryVisiblePlacement = isMainColumnCardVisiblePlacement(
    candidate.gameHistoryVisiblePlacement
  )
    ? candidate.gameHistoryVisiblePlacement
    : isMainColumnCardVisiblePlacement(gameHistoryPlacement)
      ? gameHistoryPlacement
      : DEFAULT_SETTINGS.gameHistoryVisiblePlacement;
  const hasSidebarVisibility = Array.isArray(
    candidate.homepageSidebarVisible
  );
  const homepageSidebarOrder = normalizeHomepageSidebarOrder(
    candidate.homepageSidebarOrder
  );
  const normalizedHomepageSidebarVisible = normalizeVisible(
    candidate.homepageSidebarVisible,
    validHomepageSidebarCardIds,
    DEFAULT_SETTINGS.homepageSidebarVisible
  ).filter((id) => {
    if (id === "chess-tv" && !hasSidebarVisibility) {
      return candidate.showChessTv !== false;
    }
    if (id === "legend-league" && !hasSidebarVisibility) {
      return candidate.showLegendLeague !== false;
    }
    return (
      id !== "daily-games" &&
      id !== "recommended-match" &&
      id !== "game-history"
    );
  });
  if (dailyGamesPlacement === "sidebar") {
    normalizedHomepageSidebarVisible.push("daily-games");
  }
  if (recommendedMatchPlacement === "sidebar") {
    normalizedHomepageSidebarVisible.push("recommended-match");
  }
  if (gameHistoryPlacement === "sidebar") {
    normalizedHomepageSidebarVisible.push("game-history");
  }
  const homepageSidebarVisibleSet = new Set(
    normalizedHomepageSidebarVisible
  );
  const homepageSidebarVisible = homepageSidebarOrder.filter((id) =>
    homepageSidebarVisibleSet.has(id)
  );

  return {
    enabled:
      typeof candidate.enabled === "boolean"
        ? candidate.enabled
        : DEFAULT_SETTINGS.enabled,
    showNativePlayPanel:
      typeof candidate.showNativePlayPanel === "boolean"
        ? candidate.showNativePlayPanel
        : DEFAULT_SETTINGS.showNativePlayPanel,
    dailyGamesPlacement,
    dailyGamesVisiblePlacement,
    recommendedMatchPlacement,
    recommendedMatchVisiblePlacement,
    gameHistoryPlacement,
    gameHistoryVisiblePlacement,
    homepageSidebarOrder,
    homepageSidebarVisible,
    quickPlayPresetCount,
    timeControlIds:
      hasCompletePresetSelection
        ? ids
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
