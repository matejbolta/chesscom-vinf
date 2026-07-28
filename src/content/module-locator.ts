import { MARKERS } from "../shared/constants";
import type { HomepageModules } from "../shared/models";

function normalizedText(element: Element | null): string {
  return element?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function directChildContaining(
  parent: HTMLElement | null,
  descendant: Element | null
): HTMLElement | null {
  if (!parent || !descendant || !parent.contains(descendant)) {
    return null;
  }

  let candidate: Element | null = descendant;
  while (candidate?.parentElement && candidate.parentElement !== parent) {
    candidate = candidate.parentElement;
  }

  return candidate instanceof HTMLElement && candidate.parentElement === parent
    ? candidate
    : null;
}

function findDirectPromoChildByTitle(
  promo: HTMLElement | null,
  title: string
): HTMLElement | null {
  if (!promo) {
    return null;
  }

  return (
    (Array.from(promo.children).find((child) => {
      const heading = child.querySelector(":scope .promo-title");
      return normalizedText(heading) === title;
    }) as HTMLElement | undefined) ?? null
  );
}

function hrefHasPath(element: Element, predicate: (path: string) => boolean): boolean {
  if (!(element instanceof HTMLAnchorElement)) {
    return false;
  }

  try {
    return predicate(new URL(element.href).pathname);
  } catch {
    return false;
  }
}

function isStatsCardPath(path: string): boolean {
  return (
    path.startsWith("/stats/overview/") ||
    /^\/stats\/[^/]+\/?$/.test(path)
  );
}

function findAnchorByPath(
  root: ParentNode,
  predicate: (path: string) => boolean,
  excludedRoot: Element | null = null
): HTMLAnchorElement | null {
  return (
    Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]")).find(
      (anchor) =>
        !anchor.closest("nav, header, [role='navigation']") &&
        !excludedRoot?.contains(anchor) &&
        hrefHasPath(anchor, predicate)
    ) ?? null
  );
}

function findModuleAncestor(
  root: HTMLElement | null,
  descendant: Element | null
): HTMLElement | null {
  if (!root || !descendant || !root.contains(descendant)) {
    return null;
  }

  let candidate: HTMLElement | null =
    descendant instanceof HTMLElement ? descendant : descendant.parentElement;
  while (candidate && candidate !== root) {
    if (
      candidate.matches(
        "section, article, [data-fixture-module], .cc-section, .home-container-component"
      ) ||
      candidate.parentElement === root
    ) {
      return candidate;
    }
    candidate = candidate.parentElement;
  }
  return null;
}

function findModuleByPath(
  root: HTMLElement | null,
  predicate: (path: string) => boolean,
  excludedRoot: Element | null = null
): HTMLElement | null {
  if (!root) {
    return null;
  }
  return findModuleAncestor(
    root,
    findAnchorByPath(root, predicate, excludedRoot)
  );
}

function findModuleByHeading(
  root: HTMLElement | null,
  title: string
): HTMLElement | null {
  if (!root) {
    return null;
  }

  const heading = Array.from(
    root.querySelectorAll<HTMLElement>(
      "h1, h2, h3, h4, [role='heading'], .cc-header-name, .promo-title"
    )
  ).find(
    (candidate) =>
      !candidate.closest("nav, header, [role='navigation']") &&
      normalizedText(candidate) === title
  );
  return findModuleAncestor(root, heading ?? null);
}

function findSidebarCardElement(
  rightColumn: HTMLElement | null,
  landmark: Element | null,
  nestedCardSelector?: string
): HTMLElement | null {
  if (!landmark) {
    return null;
  }
  if (!rightColumn) {
    return landmark instanceof HTMLElement
      ? findModuleAncestor(
          landmark.closest<HTMLElement>("main, [role='main']"),
          landmark
        ) ?? landmark
      : landmark.parentElement;
  }

  const directCard = directChildContaining(rightColumn, landmark);
  if (
    directCard?.hasAttribute(MARKERS.sidebarCard) ||
    !directCard?.matches(".badges-component") ||
    !nestedCardSelector
  ) {
    return directCard;
  }

  return landmark.closest<HTMLElement>(nestedCardSelector);
}

export function locateHomepageModules(document: Document): HomepageModules {
  const contentRoot =
    document.querySelector<HTMLElement>("main, [role='main']") ??
    document.querySelector<HTMLElement>(".base-container");
  const promo = document.querySelector<HTMLElement>(".promo-component");
  const legacyLeftColumn = document.querySelector<HTMLElement>(
    "#vue-instance.layout-column-one"
  );
  const legacyRightColumn = document.querySelector<HTMLElement>(
    "#vue-sidebar-instance.layout-column-two"
  );
  const modernLeftShell = document.querySelector<HTMLElement>(
    "#home-main.layout-column-one"
  );
  const modernRightShell = document.querySelector<HTMLElement>(
    "#home-sidebar.layout-column-two"
  );
  const modernLeftColumn =
    modernLeftShell?.querySelector<HTMLElement>(":scope > .main-component") ??
    modernLeftShell;
  const modernRightColumn =
    modernRightShell?.querySelector<HTMLElement>(
      ":scope > .sidebar-component"
    ) ?? modernRightShell;
  const desktopLeftColumn =
    legacyLeftColumn ??
    (modernLeftShell && modernRightShell ? modernLeftColumn : null);
  const desktopRightColumn =
    legacyRightColumn ??
    (modernLeftShell && modernRightShell ? modernRightColumn : null);
  const layoutMode =
    desktopLeftColumn && desktopRightColumn ? "desktop" : "responsive";

  const quickLinks =
    promo?.querySelector<HTMLElement>(".play-quick-links-component") ?? null;
  const promoActionColumn = directChildContaining(promo, quickLinks);
  const fallbackLaunchTemplate = contentRoot?.querySelector<HTMLAnchorElement>(
    'a[href*="action=createLiveChallenge"]'
  ) ?? null;
  const nativeLaunchTemplate =
    promoActionColumn?.querySelector<HTMLAnchorElement>(
      'a[href*="action=createLiveChallenge"]'
    ) ?? fallbackLaunchTemplate;
  const modernHomeHeader = document.querySelector<HTMLElement>("#home-header");
  const nativeActionColumn =
    promoActionColumn ??
    (modernHomeHeader &&
    nativeLaunchTemplate &&
    modernHomeHeader.contains(nativeLaunchTemplate)
      ? modernHomeHeader
      : findModuleAncestor(contentRoot, nativeLaunchTemplate));

  const topLeagueLink = nativeActionColumn
    ? findAnchorByPath(nativeActionColumn, (path) => path.startsWith("/leagues/"))
    : null;
  const topLeagueSummary = directChildContaining(nativeActionColumn, topLeagueLink);

  const movedDailyGames = document.querySelector<HTMLElement>(
    `[${MARKERS.module}="daily-games"]`
  );
  const dailyGamesHeader =
    desktopLeftColumn?.querySelector<HTMLElement>(
      ".current-games-header-list, .home-current-games-loading-view-toggle-container"
    ) ?? null;
  const dailyGames =
    movedDailyGames ??
    (desktopLeftColumn
      ? directChildContaining(
          desktopLeftColumn,
          findAnchorByPath(
            desktopLeftColumn,
            (path) => path === "/play/online/daily"
          )
        ) ?? directChildContaining(desktopLeftColumn, dailyGamesHeader)
      : findModuleByPath(contentRoot, (path) => path === "/play/online/daily"));

  const historyComponent = desktopLeftColumn?.querySelector<HTMLElement>(
    ".game-history-games-component"
  ) ?? contentRoot?.querySelector<HTMLElement>(".game-history-games-component") ?? null;
  const gameHistory = desktopLeftColumn
    ? directChildContaining(desktopLeftColumn, historyComponent)
    : findModuleAncestor(contentRoot, historyComponent) ??
      findModuleByHeading(contentRoot, "Game History") ??
      findModuleByPath(contentRoot, (path) => path.startsWith("/games/archive"));

  const rightSearchRoot = desktopRightColumn ?? contentRoot;
  const statsLandmark = rightSearchRoot
    ? findAnchorByPath(rightSearchRoot, isStatsCardPath) ??
      rightSearchRoot.querySelector<HTMLElement>(
        ".stat-item-stats-section, .stat-section-stats-section"
      )
    : null;
  const stats = desktopRightColumn
    ? directChildContaining(desktopRightColumn, statsLandmark)
    : findModuleAncestor(contentRoot, statsLandmark) ??
      findModuleByPath(contentRoot, isStatsCardPath);
  const chessTvPlayer =
    rightSearchRoot?.querySelector<HTMLElement>(
      ".tv-player-component, .tv-player-iframe, .tv-player-sidebar-close-button"
    ) ?? null;
  const chessTvLink = rightSearchRoot
    ? findAnchorByPath(rightSearchRoot, (path) => path === "/tv")
    : null;
  const chessTv = desktopRightColumn
    ? directChildContaining(desktopRightColumn, chessTvPlayer ?? chessTvLink)
    : findModuleAncestor(contentRoot, chessTvPlayer ?? chessTvLink);
  const badgesContainer =
    Array.from(
      rightSearchRoot?.querySelectorAll<HTMLElement>(".badges-component") ?? []
    ).find((element) => !element.hasAttribute(MARKERS.sidebarCard)) ?? null;
  const streakLandmark =
    rightSearchRoot?.querySelector<HTMLElement>(
      ".streak-badge-sidebar-wrapper, .streak-badge-sidebar-component"
    ) ?? null;
  const streaks = findSidebarCardElement(
    desktopRightColumn,
    streakLandmark,
    ".streak-badge-sidebar-wrapper"
  );
  const legendBadge =
    rightSearchRoot?.querySelector<HTMLElement>("#league-badge-sidebar") ?? null;
  const legendLink = rightSearchRoot
    ? findAnchorByPath(
        rightSearchRoot,
        (path) => path.startsWith("/leagues/"),
        nativeActionColumn
      )
    : null;
  const legendLeague =
    findSidebarCardElement(
      desktopRightColumn,
      legendBadge ?? legendLink,
      ".badge-component, #league-badge-sidebar"
    ) ??
    findModuleAncestor(contentRoot, legendBadge) ??
    findModuleByPath(
      contentRoot,
      (path) => path.startsWith("/leagues/"),
      nativeActionColumn
    );
  const dailyPuzzleLandmark =
    rightSearchRoot?.querySelector<HTMLElement>(
      ".daily-puzzle-wrap, .daily-puzzle-content, .daily-puzzle-preview"
    ) ?? null;
  const dailyPuzzle = desktopRightColumn
    ? directChildContaining(desktopRightColumn, dailyPuzzleLandmark)
    : findModuleAncestor(contentRoot, dailyPuzzleLandmark);
  const friendsLandmark =
    rightSearchRoot?.querySelector<HTMLElement>(".friends-content") ??
    (rightSearchRoot
      ? findAnchorByPath(rightSearchRoot, (path) => path === "/friends")
      : null);
  const friends = desktopRightColumn
    ? directChildContaining(desktopRightColumn, friendsLandmark)
    : findModuleAncestor(contentRoot, friendsLandmark);

  const responsiveMainHost =
    gameHistory?.parentElement ??
    dailyGames?.parentElement ??
    nativeActionColumn?.parentElement ??
    contentRoot;
  const gameReview =
    findDirectPromoChildByTitle(promo, "Game Review") ??
    findModuleByHeading(contentRoot, "Game Review") ??
    findModuleByPath(
      contentRoot,
      (path) => path.startsWith("/analysis/game/"),
      gameHistory
    );

  return {
    layoutMode,
    homepageToolbar: document.querySelector<HTMLElement>("#homepage-toolbar"),
    mainBanner: document.querySelector<HTMLElement>("#main-banner"),
    promoUserInfos: Array.from(
      document.querySelectorAll<HTMLElement>(".promo-toolbar-user-info")
    ),
    promo,
    nativeActionColumn,
    nativeLaunchTemplate,
    topLeagueSummary,
    puzzles:
      findDirectPromoChildByTitle(promo, "Puzzles") ??
      findModuleByPath(
        contentRoot,
        (path) => path.startsWith("/puzzles"),
        nativeActionColumn
      ),
    nextLesson:
      findDirectPromoChildByTitle(promo, "Next Lesson") ??
      findModuleByPath(
        contentRoot,
        (path) => path.startsWith("/lessons/"),
        nativeActionColumn
      ),
    gameReview,
    leftColumn: desktopLeftColumn ?? responsiveMainHost,
    dailyGames,
    gameHistory,
    rightColumn: desktopRightColumn,
    stats,
    chessTv,
    legendLeague,
    dailyPuzzle,
    friends,
    streaks,
    badgesContainer
  };
}
