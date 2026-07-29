import {
  MARKERS,
  QUICK_PLAY_OWNER,
  SIDEBAR_CARD_OWNER
} from "../shared/constants";
import type {
  ExtensionSettings,
  HomepageSidebarCardId
} from "../shared/models";
import { DEFAULT_SETTINGS } from "../shared/settings";
import { getTimeControls } from "../shared/time-controls";
import { isChessComHomepage } from "./homepage-detector";
import type { NativeLaunchAdapter } from "./launch-adapter";
import { locateHomepageModules } from "./module-locator";
import { destroyQuickPlayPanel, ensureQuickPlayPanel } from "./quick-play-renderer";
import { applyStatsPreferences } from "./stats-controller";

interface OriginalPosition {
  parent: HTMLElement;
  nextSibling: ChildNode | null;
}

export class LayoutController {
  private readonly originalPositions = new Map<HTMLElement, OriginalPosition>();

  constructor(private readonly adapter: NativeLaunchAdapter) {}

  reconcile(
    document: Document,
    location: Location,
    settings: ExtensionSettings = DEFAULT_SETTINGS
  ): boolean {
    if (!settings.enabled || !isChessComHomepage(document, location)) {
      this.cleanup(document);
      return false;
    }

    const modules = locateHomepageModules(document);
    const quickPlayHost = modules.leftColumn ?? modules.promo;
    if (!quickPlayHost) {
      return false;
    }

    if (settings.dailyGamesPlacement !== "main") {
      document.documentElement.setAttribute(
        MARKERS.dailyPlacement,
        settings.dailyGamesPlacement
      );
    } else {
      document.documentElement.removeAttribute(MARKERS.dailyPlacement);
    }
    if (settings.recommendedMatchPlacement !== "main") {
      document.documentElement.setAttribute(
        MARKERS.recommendedPlacement,
        settings.recommendedMatchPlacement
      );
    } else {
      document.documentElement.removeAttribute(MARKERS.recommendedPlacement);
    }
    if (settings.gameHistoryPlacement !== "main") {
      document.documentElement.setAttribute(
        MARKERS.gameHistoryPlacement,
        settings.gameHistoryPlacement
      );
    } else {
      document.documentElement.removeAttribute(MARKERS.gameHistoryPlacement);
    }
    if (settings.showNativePlayPanel) {
      document.documentElement.setAttribute(MARKERS.nativePlayPanel, "visible");
    } else {
      document.documentElement.removeAttribute(MARKERS.nativePlayPanel);
    }
    const hiddenSidebarCards = settings.homepageSidebarOrder.filter(
      (id) =>
        id !== "recommended-match" &&
        id !== "game-history" &&
        !settings.homepageSidebarVisible.includes(id)
    );
    if (hiddenSidebarCards.length > 0) {
      document.documentElement.setAttribute(
        MARKERS.sidebarHidden,
        hiddenSidebarCards.join(" ")
      );
    } else {
      document.documentElement.removeAttribute(MARKERS.sidebarHidden);
    }

    this.hide(modules.homepageToolbar, "homepage-toolbar");
    this.hide(modules.mainBanner, "main-banner");
    for (const promoUserInfo of modules.promoUserInfos) {
      this.hide(promoUserInfo, "promo-user-info");
    }
    if (settings.showNativePlayPanel) {
      this.show(modules.nativeActionColumn);
    } else {
      this.hide(modules.nativeActionColumn, "native-actions");
    }
    this.hide(modules.puzzles, "puzzles");
    this.hide(modules.nextLesson, "next-lesson");
    this.hide(modules.gameReview, "game-review");

    if (
      settings.dailyGamesPlacement !== "sidebar" &&
      modules.dailyGames &&
      modules.dailyGames.parentElement !== quickPlayHost
    ) {
      this.restorePosition(modules.dailyGames);
      modules.dailyGames.removeAttribute(MARKERS.module);
    }
    if (settings.dailyGamesPlacement === "hidden") {
      this.hide(modules.dailyGames, "daily-games");
    } else {
      this.show(modules.dailyGames);
    }
    if (
      settings.recommendedMatchPlacement !== "sidebar" &&
      modules.recommendedMatch &&
      modules.recommendedMatch.parentElement !== quickPlayHost
    ) {
      this.restorePosition(modules.recommendedMatch);
      modules.recommendedMatch.removeAttribute(MARKERS.module);
    }
    if (settings.recommendedMatchPlacement === "hidden") {
      this.hide(modules.recommendedMatch, "recommended-match");
    } else {
      this.show(modules.recommendedMatch);
    }
    if (
      settings.gameHistoryPlacement !== "sidebar" &&
      modules.gameHistory &&
      modules.gameHistory.parentElement !== quickPlayHost
    ) {
      this.restorePosition(modules.gameHistory);
    }
    if (settings.gameHistoryPlacement === "hidden") {
      this.hide(modules.gameHistory, "game-history");
    } else {
      this.show(modules.gameHistory);
    }

    modules.promo?.setAttribute(MARKERS.layout, "quick-play-in-main");
    if (modules.layoutMode === "responsive") {
      quickPlayHost.setAttribute(MARKERS.layout, "single-column");
    }
    if (modules.layoutMode === "desktop") {
      quickPlayHost.setAttribute(MARKERS.layout, "desktop-main");
      modules.rightColumn?.setAttribute(MARKERS.layout, "desktop-sidebar");
    }
    modules.gameHistory?.setAttribute(MARKERS.module, "game-history");
    if (settings.recommendedMatchPlacement === "main") {
      modules.recommendedMatch?.setAttribute(
        MARKERS.module,
        "recommended-match"
      );
    }

    const sidebarCards: Partial<
      Record<HomepageSidebarCardId, HTMLElement | null>
    > = {
      stats: modules.stats,
      "daily-puzzle": modules.dailyPuzzle,
      streaks: modules.streaks,
      "legend-league": modules.legendLeague,
      friends: modules.friends,
      "chess-tv": modules.chessTv,
      "daily-games":
        settings.dailyGamesPlacement === "sidebar"
          ? modules.dailyGames
          : null,
      "recommended-match":
        settings.recommendedMatchPlacement === "sidebar"
          ? modules.recommendedMatch
          : null,
      "game-history":
        settings.gameHistoryPlacement === "sidebar"
          ? modules.gameHistory
          : null
    };

    if (modules.layoutMode === "desktop" && modules.rightColumn) {
      for (const id of ["streaks", "legend-league"] as const) {
        sidebarCards[id] = this.ensureBadgeCardHost(
          document,
          modules.rightColumn,
          id,
          sidebarCards[id] ?? null,
          modules.badgesContainer
        );
      }

      if (modules.badgesContainer) {
        const hasUnmanagedBadgeContent = Array.from(
          modules.badgesContainer.children
        ).some((child) => !child.matches(".badges-divider"));
        if (hasUnmanagedBadgeContent) {
          this.show(modules.badgesContainer);
        } else {
          this.hide(modules.badgesContainer, "badge-source");
        }
      }
    }

    const visibleSidebarCards = new Set(settings.homepageSidebarVisible);
    for (const id of settings.homepageSidebarOrder) {
      const card = sidebarCards[id];
      if (!card) {
        continue;
      }
      card.setAttribute(MARKERS.module, id);
      if (
        id === "daily-games" ||
        id === "recommended-match" ||
        id === "game-history" ||
        visibleSidebarCards.has(id)
      ) {
        this.show(card);
      } else {
        this.hide(card, id);
      }
    }

    const mainCards: Partial<
      Record<HomepageSidebarCardId, HTMLElement | null>
    > = {
      "daily-games":
        settings.dailyGamesPlacement === "main" ? modules.dailyGames : null,
      "recommended-match":
        settings.recommendedMatchPlacement === "main"
          ? modules.recommendedMatch
          : null,
      "game-history":
        settings.gameHistoryPlacement === "main"
          ? modules.gameHistory
          : null
    };
    const desiredMainOrder = [
      ...new Set(
        settings.homepageSidebarOrder
          .map((id) => mainCards[id] ?? null)
          .filter((element): element is HTMLElement => Boolean(element))
      )
    ];

    if (modules.layoutMode === "responsive") {
      const allResponsiveModules = [
        modules.recommendedMatch,
        modules.dailyGames,
        modules.gameHistory,
        ...settings.homepageSidebarOrder.map((id) => sidebarCards[id] ?? null)
      ].filter((element): element is HTMLElement => Boolean(element));

      const visibleResponsiveModules = [
        ...desiredMainOrder,
        ...settings.homepageSidebarOrder.map((id) => {
          if (
            id !== "daily-games" &&
            id !== "recommended-match" &&
            id !== "game-history" &&
            !visibleSidebarCards.has(id)
          ) {
            return null;
          }
          return sidebarCards[id] ?? null;
        })
      ].filter((element): element is HTMLElement => Boolean(element));
      const uniqueResponsiveModules = [...new Set(visibleResponsiveModules)];
      const canSafelyReorder = uniqueResponsiveModules.every(
        (element) => element.parentElement === quickPlayHost
      );
      const currentManagedPrefix = Array.from(quickPlayHost.children)
        .filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement &&
            element.getAttribute(MARKERS.owned) !== QUICK_PLAY_OWNER &&
            !element.hasAttribute(MARKERS.hidden)
        )
        .slice(0, uniqueResponsiveModules.length);
      const alreadyOrdered =
        canSafelyReorder &&
        uniqueResponsiveModules.every(
          (element, index) => currentManagedPrefix[index] === element
        );
      if (canSafelyReorder && !alreadyOrdered) {
        for (const element of uniqueResponsiveModules) {
          this.rememberPosition(element);
        }
        for (const element of [...uniqueResponsiveModules].reverse()) {
          quickPlayHost.prepend(element);
        }
      } else if (!canSafelyReorder) {
        for (const element of allResponsiveModules) {
          this.restorePosition(element);
        }
      }
    }

    if (modules.layoutMode === "desktop" && desiredMainOrder.length > 0) {
      const canSafelyReorder = desiredMainOrder.every(
        (element) => element.parentElement === quickPlayHost
      );
      const currentManagedPrefix = Array.from(quickPlayHost.children)
        .filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement &&
            element.getAttribute(MARKERS.owned) !== QUICK_PLAY_OWNER &&
            !element.hasAttribute(MARKERS.hidden)
        )
        .slice(0, desiredMainOrder.length);
      const alreadyOrdered =
        canSafelyReorder &&
        desiredMainOrder.every(
          (element, index) => currentManagedPrefix[index] === element
        );

      if (canSafelyReorder && !alreadyOrdered) {
        for (const element of desiredMainOrder) {
          this.rememberPosition(element);
        }
        for (const element of [...desiredMainOrder].reverse()) {
          quickPlayHost.prepend(element);
        }
      }
    }

    const firstNativeDesktopCard =
      modules.layoutMode === "desktop"
        ? (Array.from(quickPlayHost.children).find(
            (element): element is HTMLElement =>
              element instanceof HTMLElement &&
              !element.hasAttribute(MARKERS.hidden) &&
              (element !== modules.dailyGames ||
                settings.dailyGamesPlacement === "main") &&
              (element !== modules.recommendedMatch ||
                settings.recommendedMatchPlacement === "main") &&
              (element !== modules.gameHistory ||
                settings.gameHistoryPlacement === "main") &&
              element.matches(".home-container-component, .main-section")
          ) ??
          (modules.gameHistory?.parentElement === quickPlayHost
            ? modules.gameHistory
            : null))
        : null;
    const firstMainModule =
      desiredMainOrder.find(
        (element) => element.parentElement === quickPlayHost
      ) ?? firstNativeDesktopCard;

    const timeControls = getTimeControls(settings.timeControlIds);
    if (timeControls.length === 0) {
      for (const panel of document.querySelectorAll<HTMLElement>(
        `[${MARKERS.owned}="${QUICK_PLAY_OWNER}"]`
      )) {
        destroyQuickPlayPanel(panel);
      }
    } else {
      ensureQuickPlayPanel(
        document,
        quickPlayHost,
        firstMainModule,
        this.adapter,
        timeControls
      );
    }

    if (modules.layoutMode === "desktop" && modules.rightColumn) {
      const desiredOrder = [
        ...new Set(
          settings.homepageSidebarOrder
            .map((id) => sidebarCards[id] ?? null)
            .filter((element): element is HTMLElement => Boolean(element))
        )
      ];

      const currentPrefix = Array.from(modules.rightColumn.children).slice(
        0,
        desiredOrder.length
      );
      const alreadyOrdered = desiredOrder.every(
        (element, index) => currentPrefix[index] === element
      );

      if (!alreadyOrdered) {
        for (const element of desiredOrder) {
          if (
            element.getAttribute(MARKERS.owned) !== SIDEBAR_CARD_OWNER
          ) {
            this.rememberPosition(element);
          }
        }
        for (const element of [...desiredOrder].reverse()) {
          modules.rightColumn.prepend(element);
        }
      }
    }

    applyStatsPreferences(
      modules.stats,
      settings,
      (element) => this.rememberPosition(element)
    );

    return true;
  }

  cleanup(document: Document): void {
    document.documentElement.removeAttribute(MARKERS.dailyPlacement);
    document.documentElement.removeAttribute(MARKERS.recommendedPlacement);
    document.documentElement.removeAttribute(MARKERS.gameHistoryPlacement);
    document.documentElement.removeAttribute(MARKERS.nativePlayPanel);
    document.documentElement.removeAttribute(MARKERS.sidebarHidden);

    for (const panel of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.owned}="${QUICK_PLAY_OWNER}"]`
    )) {
      destroyQuickPlayPanel(panel);
    }

    for (const element of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.hidden}]`
    )) {
      element.removeAttribute(MARKERS.hidden);
    }
    for (const element of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.layout}]`
    )) {
      element.removeAttribute(MARKERS.layout);
    }
    for (const element of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.module}]`
    )) {
      element.removeAttribute(MARKERS.module);
    }
    for (const element of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.statsInitialState}]`
    )) {
      element.removeAttribute(MARKERS.statsInitialState);
    }
    for (const [element, position] of this.originalPositions) {
      if (!element.isConnected || !position.parent.isConnected) {
        continue;
      }
      const validSibling =
        position.nextSibling?.parentNode === position.parent
          ? position.nextSibling
          : null;
      position.parent.insertBefore(element, validSibling);
    }
    for (const host of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.owned}="${SIDEBAR_CARD_OWNER}"]`
    )) {
      host.remove();
    }
    this.originalPositions.clear();
  }

  private hide(element: HTMLElement | null, reason: string): void {
    element?.setAttribute(MARKERS.hidden, reason);
  }

  private show(element: HTMLElement | null): void {
    element?.removeAttribute(MARKERS.hidden);
  }

  private rememberPosition(element: HTMLElement): void {
    if (!this.originalPositions.has(element) && element.parentElement) {
      this.originalPositions.set(element, {
        parent: element.parentElement,
        nextSibling: element.nextSibling
      });
    }
  }

  private restorePosition(element: HTMLElement): void {
    const position = this.originalPositions.get(element);
    if (!position || !position.parent.isConnected) {
      return;
    }

    const validSibling =
      position.nextSibling?.parentNode === position.parent
        ? position.nextSibling
        : null;
    position.parent.insertBefore(element, validSibling);
    this.originalPositions.delete(element);
  }

  private ensureBadgeCardHost(
    document: Document,
    rightColumn: HTMLElement,
    id: "streaks" | "legend-league",
    element: HTMLElement | null,
    badgesContainer: HTMLElement | null
  ): HTMLElement | null {
    if (!element) {
      return null;
    }
    if (
      element.parentElement === rightColumn ||
      element.getAttribute(MARKERS.owned) === SIDEBAR_CARD_OWNER
    ) {
      return element;
    }
    if (!badgesContainer?.contains(element)) {
      return element;
    }

    const existingHost = rightColumn.querySelector<HTMLElement>(
      `:scope > [${MARKERS.owned}="${SIDEBAR_CARD_OWNER}"][${MARKERS.sidebarCard}="${id}"]`
    );
    if (existingHost) {
      if (!existingHost.contains(element)) {
        this.rememberPosition(element);
        existingHost.append(element);
      }
      return existingHost;
    }

    const host = document.createElement("div");
    host.className = "badges-component sidebar-section";
    host.setAttribute(MARKERS.owned, SIDEBAR_CARD_OWNER);
    host.setAttribute(MARKERS.sidebarCard, id);
    this.rememberPosition(element);
    host.append(element);
    rightColumn.insertBefore(host, badgesContainer);
    return host;
  }
}
