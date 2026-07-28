import { MARKERS } from "../shared/constants";
import type {
  ExtensionSettings,
  StatsDefaultState,
  StatsRatingId,
  StatsSummaryId
} from "../shared/models";
import {
  STATS_RATING_CATALOG,
  STATS_SUMMARY_CATALOG
} from "../shared/stats";

type RememberPosition = (element: HTMLElement) => void;

function normalizedText(value: string | null): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function hasExactTextNode(element: HTMLElement, expected: string): boolean {
  const walker = element.ownerDocument.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT
  );
  let node = walker.nextNode();
  while (node) {
    if (normalizedText(node.textContent) === expected) {
      return true;
    }
    node = walker.nextNode();
  }
  return false;
}

function findSummaryRows(
  stats: HTMLElement
): {
  parent: HTMLElement | null;
  hideableContainer: HTMLElement | null;
  known: Map<StatsSummaryId, HTMLElement>;
  unknown: HTMLElement[];
} {
  const legacyContainer = stats.querySelector<HTMLElement>(
    ":scope > ul.sidebar-ratings-general"
  );
  const known = new Map<StatsSummaryId, HTMLElement>();
  const unknown: HTMLElement[] = [];
  const rows = legacyContainer
    ? Array.from(legacyContainer.children).filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement &&
          element.matches("li.sidebar-ratings-item")
      )
    : Array.from(stats.children).filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement &&
          element.matches(".cc-aside-item-component")
      );
  const parent = legacyContainer ?? (rows.length > 0 ? stats : null);
  for (const row of rows) {
    const match = STATS_SUMMARY_CATALOG.find((item) =>
      hasExactTextNode(row, item.label)
    );
    if (match && !known.has(match.id)) {
      known.set(match.id, row);
    } else {
      unknown.push(row);
    }
  }
  return {
    parent,
    hideableContainer: legacyContainer,
    known,
    unknown
  };
}

function ratingIdFromPath(row: HTMLElement): StatsRatingId | null {
  const pathMap: Readonly<Record<string, StatsRatingId>> = {
    rapid: "rapid",
    bullet: "bullet",
    blitz: "blitz",
    daily: "daily",
    puzzles: "puzzles",
    chess960: "live-960",
    live960: "live-960",
    "live-960": "live-960"
  };

  for (const anchor of row.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    try {
      const path = new URL(anchor.href).pathname.split("/").filter(Boolean);
      const statsIndex = path.lastIndexOf("stats");
      if (statsIndex >= 0 && path[statsIndex + 1]) {
        const id = pathMap[path[statsIndex + 1].toLowerCase()];
        if (id) {
          return id;
        }
      }
    } catch {
      // Ignore malformed native links and keep looking for a recognized row.
    }
  }
  return null;
}

function findRatingRows(
  stats: HTMLElement
): {
  known: Map<StatsRatingId, HTMLElement>;
  insights: HTMLElement | null;
  unknown: HTMLElement[];
} {
  const known = new Map<StatsRatingId, HTMLElement>();
  const unknown: HTMLElement[] = [];
  let insights: HTMLElement | null = null;
  const rows = Array.from(stats.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      element.matches(
        ".stat-section-stats-section, .stat-item-stats-section"
      )
  );

  for (const row of rows) {
    const insightsLink = row.querySelector<HTMLAnchorElement>(
      'a[href^="/insights/"], a[href^="https://www.chess.com/insights/"], a[href^="https://chess.com/insights/"]'
    );
    const label = normalizedText(
      row.querySelector<HTMLElement>(
        ".stat-section-section-link-name, .cc-aside-item-label"
      )?.textContent ?? null
    );
    if ((insightsLink || label === "Insights") && !insights) {
      insights = row;
      continue;
    }

    const pathId = ratingIdFromPath(row);
    const match =
      STATS_RATING_CATALOG.find((item) => item.label === label) ??
      STATS_RATING_CATALOG.find((item) => item.id === pathId);
    if (match && !known.has(match.id)) {
      known.set(match.id, row);
    } else if (label) {
      unknown.push(row);
    }
  }
  return { known, insights, unknown };
}

function setVisible(
  element: HTMLElement,
  visible: boolean,
  hiddenReason: string
): void {
  if (visible) {
    element.removeAttribute(MARKERS.hidden);
  } else {
    element.setAttribute(MARKERS.hidden, hiddenReason);
  }
}

function hasExactOrder(
  current: readonly HTMLElement[],
  desired: readonly HTMLElement[]
): boolean {
  return (
    current.length === desired.length &&
    desired.every((element, index) => current[index] === element)
  );
}

function findRatingToggle(row: HTMLElement): HTMLElement | null {
  const legacyButton = row.querySelector<HTMLButtonElement>(
    ":scope > button.stat-section-button"
  );
  if (legacyButton) {
    return legacyButton;
  }

  return (
    Array.from(
      row.querySelectorAll<HTMLElement>(
        ":scope > a.cc-aside-item-component, :scope > button.cc-aside-item-component"
      )
    ).find((control) =>
      control.querySelector(
        '.cc-aside-item-chevron svg[data-glyph^="arrow-chevron-"], svg[data-glyph^="arrow-chevron-"]'
      )
    ) ?? null
  );
}

function applyDefaultRatingState(
  row: HTMLElement,
  state: StatsDefaultState
): void {
  if (
    row.hasAttribute(MARKERS.hidden) ||
    row.hasAttribute(MARKERS.statsInitialState)
  ) {
    return;
  }

  const control = findRatingToggle(row);
  if (
    !control ||
    (control instanceof HTMLButtonElement && control.disabled) ||
    control.getAttribute("aria-disabled") === "true"
  ) {
    return;
  }

  const collapsedChevron = control.querySelector(
    'svg[data-glyph="arrow-chevron-bottom"]'
  );
  const expandedChevron = control.querySelector(
    'svg[data-glyph="arrow-chevron-top"]'
  );
  const hasExpandedContent = Array.from(row.children).some(
    (element) => element !== control
  );

  const isExpanded = Boolean(expandedChevron || hasExpandedContent);
  if (!collapsedChevron && !isExpanded) {
    return;
  }

  row.setAttribute(MARKERS.statsInitialState, state);
  if (
    (state === "expanded" && collapsedChevron) ||
    (state === "retracted" && isExpanded)
  ) {
    control.click();
  }
}

export function applyStatsPreferences(
  stats: HTMLElement | null,
  settings: ExtensionSettings,
  rememberPosition: RememberPosition
): void {
  if (!stats) {
    return;
  }

  const summary = findSummaryRows(stats);
  const visibleSummary = new Set(settings.statsSummaryVisible);
  if (summary.parent) {
    const orderedSummary = settings.statsSummaryOrder
      .map((id) => summary.known.get(id))
      .filter((row): row is HTMLElement => Boolean(row));
    const desiredSummaryOrder = [...orderedSummary, ...summary.unknown];
    const managedSummary = new Set(desiredSummaryOrder);
    const currentSummaryOrder = Array.from(summary.parent.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && managedSummary.has(element)
    );
    if (!hasExactOrder(currentSummaryOrder, desiredSummaryOrder)) {
      const insertionPoint = summary.hideableContainer
        ? null
        : Array.from(summary.parent.children).find(
            (element): element is HTMLElement =>
              element instanceof HTMLElement &&
              (element.matches(".stats-divider") ||
                element.matches(
                  ".stat-section-stats-section, .stat-item-stats-section"
                ))
          ) ?? null;
      for (const row of desiredSummaryOrder) {
        rememberPosition(row);
        if (insertionPoint?.parentElement === summary.parent) {
          summary.parent.insertBefore(row, insertionPoint);
        } else {
          summary.parent.append(row);
        }
      }
    }
    for (const [id, row] of summary.known) {
      setVisible(row, visibleSummary.has(id), `stats-summary-${id}`);
    }
    if (summary.hideableContainer) {
      setVisible(
        summary.hideableContainer,
        orderedSummary.some((row) => !row.hasAttribute(MARKERS.hidden)) ||
          summary.unknown.length > 0,
        "stats-summary"
      );
    }
  }

  const ratings = findRatingRows(stats);
  const visibleRatings = new Set(settings.statsRatingVisible);
  const orderedRatings = settings.statsRatingOrder
    .map((id) => ratings.known.get(id))
    .filter((row): row is HTMLElement => Boolean(row));
  const finalOrder = [
    ...orderedRatings,
    ...ratings.unknown,
    ...(ratings.insights ? [ratings.insights] : [])
  ];
  const managedRatings = new Set(finalOrder);
  const currentRatingOrder = Array.from(stats.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      managedRatings.has(element)
  );
  if (!hasExactOrder(currentRatingOrder, finalOrder)) {
    const currentChildren = Array.from(stats.children);
    const lastManagedIndex = currentChildren.reduce(
      (lastIndex, element, index) =>
        element instanceof HTMLElement && managedRatings.has(element)
          ? index
          : lastIndex,
      -1
    );
    const insertionPoint =
      currentChildren
        .slice(lastManagedIndex + 1)
        .find(
          (element): element is HTMLElement =>
            element instanceof HTMLElement &&
            !element.matches(".stats-divider")
        ) ?? null;
    for (const row of finalOrder) {
      rememberPosition(row);
      if (insertionPoint?.parentElement === stats) {
        stats.insertBefore(row, insertionPoint);
      } else {
        stats.append(row);
      }
    }
  }
  for (const [id, row] of ratings.known) {
    setVisible(row, visibleRatings.has(id), `stats-rating-${id}`);
  }
  if (ratings.insights) {
    ratings.insights.removeAttribute(MARKERS.hidden);
  }
  const usesModernStats =
    summary.parent === stats ||
    Array.from(ratings.known.values()).some((row) =>
      row.matches(".stat-item-stats-section")
    );
  if (usesModernStats) {
    const visibleSummaryRows = [
      ...summary.known.values(),
      ...summary.unknown
    ].some((row) => !row.hasAttribute(MARKERS.hidden));
    const visibleRatingRows = [
      ...ratings.known.values(),
      ...ratings.unknown,
      ...(ratings.insights ? [ratings.insights] : [])
    ].some((row) => !row.hasAttribute(MARKERS.hidden));
    const dividers = Array.from(stats.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.matches(".stats-divider")
    );
    dividers.forEach((divider, index) => {
      setVisible(
        divider,
        index === 0 && visibleSummaryRows && visibleRatingRows,
        index === 0 ? "stats-summary-divider" : "stats-rating-divider"
      );
    });
  }
  for (const [id, row] of ratings.known) {
    applyDefaultRatingState(row, settings.statsRatingStates[id]);
  }
}
