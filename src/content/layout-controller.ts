import { MARKERS, QUICK_PLAY_OWNER } from "../shared/constants";
import type { ExtensionSettings } from "../shared/models";
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
    if (settings.showChessTv) {
      document.documentElement.removeAttribute(MARKERS.chessTvVisibility);
    } else {
      document.documentElement.setAttribute(
        MARKERS.chessTvVisibility,
        "hidden"
      );
    }
    if (settings.showLegendLeague) {
      document.documentElement.removeAttribute(
        MARKERS.legendLeagueVisibility
      );
    } else {
      document.documentElement.setAttribute(
        MARKERS.legendLeagueVisibility,
        "hidden"
      );
    }

    this.hide(modules.homepageToolbar, "homepage-toolbar");
    this.hide(modules.mainBanner, "main-banner");
    for (const promoUserInfo of modules.promoUserInfos) {
      this.hide(promoUserInfo, "promo-user-info");
    }
    this.hide(modules.nativeActionColumn, "native-actions");
    this.hide(modules.puzzles, "puzzles");
    this.hide(modules.nextLesson, "next-lesson");
    this.hide(modules.gameReview, "game-review");

    if (settings.dailyGamesPlacement !== "sidebar" && modules.dailyGames) {
      this.restorePosition(modules.dailyGames);
      modules.dailyGames.removeAttribute(MARKERS.module);
    }
    if (settings.dailyGamesPlacement === "hidden") {
      this.hide(modules.dailyGames, "daily-games");
    } else {
      this.show(modules.dailyGames);
    }

    if (!settings.showChessTv && modules.chessTv) {
      this.restorePosition(modules.chessTv);
      modules.chessTv.removeAttribute(MARKERS.module);
      this.hide(modules.chessTv, "chess-tv");
    } else {
      this.show(modules.chessTv);
    }
    if (!settings.showLegendLeague && modules.legendLeague) {
      this.restorePosition(modules.legendLeague);
      modules.legendLeague.removeAttribute(MARKERS.module);
      this.hide(modules.legendLeague, "legend-league");
    } else {
      this.show(modules.legendLeague);
    }

    modules.promo?.setAttribute(MARKERS.layout, "quick-play-in-main");
    if (modules.layoutMode === "responsive") {
      quickPlayHost.setAttribute(MARKERS.layout, "single-column");
    }
    modules.stats?.setAttribute(MARKERS.module, "stats");
    if (settings.showChessTv) {
      modules.chessTv?.setAttribute(MARKERS.module, "chess-tv");
    }
    if (settings.dailyGamesPlacement === "sidebar") {
      modules.dailyGames?.setAttribute(MARKERS.module, "daily-games");
    }
    modules.gameHistory?.setAttribute(MARKERS.module, "game-history");
    if (settings.showLegendLeague) {
      modules.legendLeague?.setAttribute(MARKERS.module, "legend-league");
    }

    if (modules.layoutMode === "responsive") {
      const allResponsiveModules = [
        modules.gameHistory,
        modules.stats,
        modules.chessTv,
        modules.dailyGames,
        modules.legendLeague
      ].filter((element): element is HTMLElement => Boolean(element));

      if (settings.dailyGamesPlacement !== "main") {
        const visibleResponsiveModules = [
          modules.gameHistory,
          modules.stats,
          settings.showChessTv ? modules.chessTv : null,
          settings.dailyGamesPlacement === "sidebar"
            ? modules.dailyGames
            : null,
          settings.showLegendLeague ? modules.legendLeague : null
        ].filter((element): element is HTMLElement => Boolean(element));
        const canSafelyReorder = visibleResponsiveModules.every(
          (element) => element.parentElement === quickPlayHost
        );
        if (canSafelyReorder) {
          for (const element of visibleResponsiveModules) {
            this.rememberPosition(element);
          }
          for (const element of [...visibleResponsiveModules].reverse()) {
            quickPlayHost.prepend(element);
          }
        }
      } else {
        for (const element of allResponsiveModules) {
          this.restorePosition(element);
        }
      }
    }

    const firstNativeDesktopCard =
      modules.layoutMode === "desktop"
        ? (Array.from(quickPlayHost.children).find(
            (element): element is HTMLElement =>
              element instanceof HTMLElement &&
              element.matches(".home-container-component")
          ) ?? null)
        : null;
    const firstMainModule =
      modules.layoutMode === "responsive" &&
      modules.gameHistory?.parentElement === quickPlayHost
        ? modules.gameHistory
        : settings.dailyGamesPlacement === "main" &&
            modules.dailyGames?.parentElement === quickPlayHost
        ? modules.dailyGames
        : modules.gameHistory?.parentElement === quickPlayHost
          ? modules.gameHistory
          : firstNativeDesktopCard;

    ensureQuickPlayPanel(
      document,
      quickPlayHost,
      firstMainModule,
      this.adapter,
      getTimeControls(settings.timeControlIds)
    );

    if (modules.layoutMode === "desktop" && modules.rightColumn) {
      const desiredOrder = [
        modules.stats,
        settings.showChessTv ? modules.chessTv : null,
        settings.dailyGamesPlacement === "sidebar"
          ? modules.dailyGames
          : null,
        settings.showLegendLeague ? modules.legendLeague : null
      ].filter((element): element is HTMLElement => Boolean(element));

      const currentPrefix = Array.from(modules.rightColumn.children).slice(
        0,
        desiredOrder.length
      );
      const alreadyOrdered = desiredOrder.every(
        (element, index) => currentPrefix[index] === element
      );

      if (!alreadyOrdered) {
        for (const element of desiredOrder) {
          this.rememberPosition(element);
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
    document.documentElement.removeAttribute(MARKERS.chessTvVisibility);
    document.documentElement.removeAttribute(MARKERS.legendLeagueVisibility);

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
}
