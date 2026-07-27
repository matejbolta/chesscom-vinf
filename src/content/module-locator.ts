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

export function locateHomepageModules(document: Document): HomepageModules {
  const contentRoot =
    document.querySelector<HTMLElement>("main, [role='main']") ??
    document.querySelector<HTMLElement>(".base-container");
  const promo = document.querySelector<HTMLElement>(".promo-component");
  const desktopLeftColumn = document.querySelector<HTMLElement>(
    "#vue-instance.layout-column-one"
  );
  const desktopRightColumn = document.querySelector<HTMLElement>(
    "#vue-sidebar-instance.layout-column-two"
  );
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
  const nativeActionColumn =
    promoActionColumn ?? findModuleAncestor(contentRoot, nativeLaunchTemplate);

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
  const stats = desktopRightColumn
    ? directChildContaining(
        desktopRightColumn,
        findAnchorByPath(desktopRightColumn, (path) =>
          path.startsWith("/stats/overview/")
        )
      )
    : findModuleByPath(contentRoot, (path) => path.startsWith("/stats/overview/"));
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
  const legendBadge =
    rightSearchRoot?.querySelector<HTMLElement>("#league-badge-sidebar") ?? null;
  const legendLeague = desktopRightColumn
    ? directChildContaining(desktopRightColumn, legendBadge)
    : findModuleAncestor(contentRoot, legendBadge) ??
      findModuleByPath(
        contentRoot,
        (path) => path.startsWith("/leagues/"),
        nativeActionColumn
      );

  const responsiveMainHost =
    gameHistory?.parentElement ??
    dailyGames?.parentElement ??
    nativeActionColumn?.parentElement ??
    contentRoot;

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
      findModuleByPath(contentRoot, (path) => path.startsWith("/puzzles")),
    nextLesson:
      findDirectPromoChildByTitle(promo, "Next Lesson") ??
      findModuleByPath(contentRoot, (path) => path.startsWith("/lessons/")),
    gameReview:
      findDirectPromoChildByTitle(promo, "Game Review") ??
      findModuleByPath(contentRoot, (path) => path.startsWith("/analysis/game/")),
    leftColumn: desktopLeftColumn ?? responsiveMainHost,
    dailyGames,
    gameHistory,
    rightColumn: desktopRightColumn,
    stats,
    chessTv,
    legendLeague
  };
}
