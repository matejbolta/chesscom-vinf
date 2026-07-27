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
  container: HTMLElement | null;
  known: Map<StatsSummaryId, HTMLElement>;
  unknown: HTMLElement[];
} {
  const container = stats.querySelector<HTMLElement>(
    ":scope > ul.sidebar-ratings-general"
  );
  const known = new Map<StatsSummaryId, HTMLElement>();
  const unknown: HTMLElement[] = [];
  if (!container) {
    return { container, known, unknown };
  }

  const rows = Array.from(container.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      element.matches("li.sidebar-ratings-item")
  );
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
  return { container, known, unknown };
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
      element.matches(".stat-section-stats-section")
  );

  for (const row of rows) {
    const insightsLink = row.querySelector<HTMLAnchorElement>(
      'a[href^="/insights/"], a[href^="https://www.chess.com/insights/"], a[href^="https://chess.com/insights/"]'
    );
    const label = normalizedText(
      row.querySelector<HTMLElement>(
        ".stat-section-section-link-name"
      )?.textContent ?? null
    );
    if ((insightsLink || label === "Insights") && !insights) {
      insights = row;
      continue;
    }

    const match = STATS_RATING_CATALOG.find(
      (item) => item.label === label
    );
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

function applyDefaultRatingState(
  id: StatsRatingId,
  row: HTMLElement,
  state: StatsDefaultState
): void {
  if (
    row.hasAttribute(MARKERS.hidden) ||
    row.hasAttribute(MARKERS.statsInitialState)
  ) {
    return;
  }

  const button = row.querySelector<HTMLButtonElement>(
    ":scope > button.stat-section-button"
  );
  if (!button || button.disabled) {
    return;
  }

  const collapsedChevron = button.querySelector(
    'svg[data-glyph="arrow-chevron-bottom"]'
  );
  const expandedChevron = button.querySelector(
    'svg[data-glyph="arrow-chevron-top"]'
  );
  const hasExpandedContent = Array.from(row.children).some(
    (element) => element !== button
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
    button.click();
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
  if (summary.container) {
    const orderedSummary = settings.statsSummaryOrder
      .map((id) => summary.known.get(id))
      .filter((row): row is HTMLElement => Boolean(row));
    const desiredSummaryOrder = [...orderedSummary, ...summary.unknown];
    const currentSummaryOrder = Array.from(summary.container.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element.matches("li.sidebar-ratings-item")
    );
    if (!hasExactOrder(currentSummaryOrder, desiredSummaryOrder)) {
      for (const row of desiredSummaryOrder) {
        rememberPosition(row);
        summary.container.append(row);
      }
    }
    for (const [id, row] of summary.known) {
      setVisible(row, visibleSummary.has(id), `stats-summary-${id}`);
    }
    setVisible(
      summary.container,
      orderedSummary.some((row) => !row.hasAttribute(MARKERS.hidden)) ||
        summary.unknown.length > 0,
      "stats-summary"
    );
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
    for (const row of finalOrder) {
      rememberPosition(row);
      stats.append(row);
    }
  }
  for (const [id, row] of ratings.known) {
    setVisible(row, visibleRatings.has(id), `stats-rating-${id}`);
  }
  if (ratings.insights) {
    ratings.insights.removeAttribute(MARKERS.hidden);
  }
  for (const [id, row] of ratings.known) {
    applyDefaultRatingState(id, row, settings.statsRatingStates[id]);
  }
}
