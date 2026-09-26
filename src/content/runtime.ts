import { AndroidGameControlsController, isFirefoxAndroid } from "./android-game-controls";
import { PhoneExperienceController } from "./phone-experience-controller";
import { ExtremeOledController } from "./extreme-oled-controller";
import {
  HOME_PATHS,
  MARKERS,
  PHONE_GAME_REVIEW_MEDIA_QUERY,
  RECONCILE_DELAY_MS,
  ROUTE_CHECK_INTERVAL_MS
} from "../shared/constants";
import type { ExtensionSettings } from "../shared/models";
import { normalizeSettings } from "../shared/settings";
import {
  GameReviewLayoutController,
  isChessComLiveGameReview
} from "./game-review-layout-controller";
import {
  findActiveLiveGameHref,
  findCurrentUserUuid,
  findGameContinuationLink,
  type GamePresenceFetch,
  isChessComGame
} from "./game-continuation";
import { LayoutController } from "./layout-controller";
import { NativeLaunchAdapter } from "./launch-adapter";

export interface SettingsSource {
  load(): Promise<ExtensionSettings>;
  save?(settings: ExtensionSettings): Promise<void>;
  subscribe(listener: (settings: ExtensionSettings) => void): void;
}

export interface RuntimeDependencies {
  fetch?: GamePresenceFetch;
  navigate?: (href: string) => void;
}

export function startVinfRuntime(
  settingsSource: SettingsSource,
  dependencies: RuntimeDependencies = {}
): void {
  const android = isFirefoxAndroid(window.navigator);
  const desktop = !/Android|iPhone|iPad/i.test(window.navigator.userAgent);
  const androidGameControls = new AndroidGameControlsController();
  const controller = new LayoutController(new NativeLaunchAdapter());
  const extremeOledController = new ExtremeOledController();
  const gameReviewController = new GameReviewLayoutController();
  const phoneExperienceController = new PhoneExperienceController();
  const phoneGameReviewMedia = window.matchMedia?.(
    PHONE_GAME_REVIEW_MEDIA_QUERY
  );

  let observer: MutationObserver | null = null;
  let observedRoot: HTMLElement | null = null;
  let reconcileTimer: number | null = null;
  let lastUrl = window.location.href;
  let lastActiveGameHref: string | null = null;
  let resolvedActiveGameHref: string | null = null;
  let activeGameLookupState: "idle" | "loading" | "complete" = "idle";
  let activeGameLookupGeneration = 0;
  let activeGameRequest: Promise<string | null> | null = null;
  let activeGameAbort: AbortController | null = null;
  let continuationPending = false;
  let settings: ExtensionSettings | null = null;
  let hasAppliedLayout = false;
  const presenceFetch =
    dependencies.fetch ??
    (typeof window.fetch === "function" ? window.fetch.bind(window) : null);

  function isTargetRoute(): boolean {
    return (
      window.location.protocol === "https:" &&
      ["chess.com", "www.chess.com"].includes(
        window.location.hostname.toLowerCase()
      ) &&
      HOME_PATHS.has(window.location.pathname)
    );
  }

  function findObservationRoot(): HTMLElement | null {
    if (isChessComLiveGameReview(window.location)) {
      return document.body ?? document.documentElement;
    }
    return (
      document.querySelector<HTMLElement>(".base-container") ??
      document.querySelector<HTMLElement>("main, [role='main']") ??
      document.body ??
      document.documentElement
    );
  }

  function attachObserver(): void {
    const nextRoot = findObservationRoot();
    if (!nextRoot || nextRoot === observedRoot) {
      return;
    }

    observer?.disconnect();
    observedRoot = nextRoot;
    observer = new MutationObserver(scheduleReconcile);
    observer.observe(nextRoot, { childList: true, subtree: true });
  }

  function syncDocumentSettingsMarkers(): void {
    const currentSettings = settings;
    if (!currentSettings) {
      return;
    }
    const shouldUseOled =
      currentSettings.enabled &&
      currentSettings.oledMode &&
      (isTargetRoute() ||
        isChessComLiveGameReview(window.location) ||
        isChessComGame(window.location));
    if (shouldUseOled) {
      document.documentElement.setAttribute(MARKERS.oled, "true");
    } else {
      document.documentElement.removeAttribute(MARKERS.oled);
    }
    if (
      currentSettings.enabled &&
      currentSettings.oledButtonColors &&
      isTargetRoute()
    ) {
      document.documentElement.setAttribute(MARKERS.oledButtons, "true");
    } else {
      document.documentElement.removeAttribute(MARKERS.oledButtons);
    }
    const shouldPrehideNativeChrome =
      currentSettings.enabled && isTargetRoute();
    if (shouldPrehideNativeChrome) {
      document.documentElement.setAttribute(MARKERS.active, "true");
      if (currentSettings.dailyGamesPlacement === "main") {
        document.documentElement.removeAttribute(MARKERS.dailyPlacement);
      } else {
        document.documentElement.setAttribute(
          MARKERS.dailyPlacement,
          currentSettings.dailyGamesPlacement
        );
      }
      if (currentSettings.recommendedMatchPlacement === "main") {
        document.documentElement.removeAttribute(
          MARKERS.recommendedPlacement
        );
      } else {
        document.documentElement.setAttribute(
          MARKERS.recommendedPlacement,
          currentSettings.recommendedMatchPlacement
        );
      }
      if (currentSettings.gameHistoryPlacement === "main") {
        document.documentElement.removeAttribute(
          MARKERS.gameHistoryPlacement
        );
      } else {
        document.documentElement.setAttribute(
          MARKERS.gameHistoryPlacement,
          currentSettings.gameHistoryPlacement
        );
      }
      if (currentSettings.showNativePlayPanel) {
        document.documentElement.setAttribute(
          MARKERS.nativePlayPanel,
          "visible"
        );
      } else {
        document.documentElement.removeAttribute(MARKERS.nativePlayPanel);
      }
      const hiddenSidebarCards =
        currentSettings.homepageSidebarOrder.filter(
          (id) =>
            id !== "profile" &&
            id !== "recommended-match" &&
            id !== "game-history" &&
            id !== "open-game" &&
            !currentSettings.homepageSidebarVisible.includes(id)
        );
      if (hiddenSidebarCards.length > 0) {
        document.documentElement.setAttribute(
          MARKERS.sidebarHidden,
          hiddenSidebarCards.join(" ")
        );
      } else {
        document.documentElement.removeAttribute(MARKERS.sidebarHidden);
      }
      return;
    }

    document.documentElement.removeAttribute(MARKERS.active);
    document.documentElement.removeAttribute(MARKERS.dailyPlacement);
    document.documentElement.removeAttribute(MARKERS.recommendedPlacement);
    document.documentElement.removeAttribute(MARKERS.gameHistoryPlacement);
    document.documentElement.removeAttribute(MARKERS.nativePlayPanel);
    document.documentElement.removeAttribute(MARKERS.sidebarHidden);
  }

  function reconcile(): void {
    reconcileTimer = null;
    if (!settings) {
      attachObserver();
      return;
    }

    syncDocumentSettingsMarkers();

    const homepageApplied = controller.reconcile(
      document,
      window.location,
      settings,
      resolvedActiveGameHref
    );
    const gameReviewApplied = gameReviewController.reconcile(
      document,
      window.location,
      settings.enabled,
      phoneGameReviewMedia?.matches ?? window.innerWidth <= 599
    );
    phoneExperienceController.reconcile(document, window.location, settings,
      phoneGameReviewMedia?.matches ?? window.innerWidth <= 599);
    extremeOledController.reconcile(document, window.location, settings,
      desktop || (android && (phoneGameReviewMedia?.matches ?? window.innerWidth <= 599)));
    androidGameControls.reconcile(document, window.location, settings, android);
    hasAppliedLayout = homepageApplied || gameReviewApplied;
    // An incomplete target document asks the controller to clean up. Re-arm
    // setting-specific pre-hide markers immediately so late native cards cannot
    // paint before the next successful reconciliation.
    syncDocumentSettingsMarkers();
    if (
      settings.enabled &&
      (isTargetRoute() ||
        (isChessComLiveGameReview(window.location) &&
          (phoneGameReviewMedia?.matches ?? window.innerWidth <= 599)))
    ) {
      attachObserver();
    } else {
      observer?.disconnect();
      observer = null;
      observedRoot = null;
    }

    if (
      settings.enabled &&
      settings.openGamePlacement !== "hidden" &&
      isTargetRoute()
    ) {
      void resolveActiveGame();
    }
  }

  function resolveActiveGame(refresh = false): Promise<string | null> {
    if (activeGameRequest) {
      return activeGameRequest;
    }
    if (
      (!refresh && activeGameLookupState !== "idle") ||
      !presenceFetch ||
      !shouldResolveActiveGame() ||
      !findCurrentUserUuid(document)
    ) {
      return Promise.resolve(null);
    }

    activeGameLookupState = "loading";
    const generation = activeGameLookupGeneration;
    const route = window.location.href;
    const abort = new AbortController();
    activeGameAbort = abort;
    // A stalled service must not trap the intentional Game History fallback.
    const timeout = window.setTimeout(() => abort.abort(), 4_000);
    activeGameRequest = findActiveLiveGameHref(document, presenceFetch, abort.signal)
      .then((href) => {
        if (
          generation !== activeGameLookupGeneration ||
          route !== window.location.href ||
          !shouldResolveActiveGame()
        ) {
          return null;
        }
        activeGameLookupState = "complete";
        if (resolvedActiveGameHref !== href) {
          resolvedActiveGameHref = href;
          hasAppliedLayout = false;
          reconcileImmediately();
        }
        return href;
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (generation === activeGameLookupGeneration) {
          activeGameRequest = null;
          activeGameAbort = null;
        }
      });
    return activeGameRequest;
  }

  function shouldResolveActiveGame(): boolean {
    return Boolean(
      settings?.enabled &&
        settings.openGamePlacement !== "hidden" &&
        document.documentElement.classList.contains("user-logged-in") &&
        isTargetRoute()
    );
  }

  function resetActiveGameLookup(): void {
    activeGameLookupGeneration += 1;
    activeGameAbort?.abort();
    activeGameAbort = null;
    activeGameRequest = null;
    activeGameLookupState = "idle";
    resolvedActiveGameHref = null;
  }

  async function continueGame(event: MouseEvent): Promise<void> {
    if (
      event.defaultPrevented || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
      !(event.target instanceof Element) ||
      !event.target.closest(".chesscom-vinf-game-continuation-action") ||
      !shouldResolveActiveGame()
    ) {
      return;
    }
    event.preventDefault();
    if (continuationPending) {
      return;
    }
    continuationPending = true;
    const generation = activeGameLookupGeneration;
    const route = window.location.href;
    try {
      const activeHref = await resolveActiveGame(true);
      if (
        generation !== activeGameLookupGeneration ||
        route !== window.location.href || !shouldResolveActiveGame()
      ) {
        return;
      }
      const href = activeHref ?? findGameContinuationLink(document)?.href;
      if (href) {
        (dependencies.navigate ?? ((url) => window.location.assign(url)))(href);
      }
    } finally {
      continuationPending = false;
    }
  }

  function scheduleReconcile(): void {
    // A queued observer callback can outlive a torn-down test/page realm.
    if (typeof window === "undefined") {
      return;
    }
    if (reconcileTimer === null) {
      reconcileTimer = window.setTimeout(
        reconcile,
        hasAppliedLayout ? RECONCILE_DELAY_MS : 0
      );
    }
  }

  function reconcileImmediately(): void {
    if (reconcileTimer !== null) {
      window.clearTimeout(reconcileTimer);
      reconcileTimer = null;
    }
    reconcile();
  }

  function checkRoute(): void {
    if (settings) {
      extremeOledController.reconcile(document, window.location, settings,
        desktop || (android && (phoneGameReviewMedia?.matches ?? window.innerWidth <= 599)));
      androidGameControls.reconcile(document, window.location, settings, android);
      phoneExperienceController.reconcile(document, window.location, settings,
        phoneGameReviewMedia?.matches ?? window.innerWidth <= 599);
    }
    const rootWasDetached = Boolean(observedRoot && !observedRoot.isConnected);
    const activeGameHref = isTargetRoute()
      ? (findGameContinuationLink(document)?.href ?? null)
      : null;
    const activeGameChanged = activeGameHref !== lastActiveGameHref;
    const routeChanged = window.location.href !== lastUrl;
    if (routeChanged) {
      resetActiveGameLookup();
    }
    if (
      routeChanged ||
      rootWasDetached ||
      activeGameChanged
    ) {
      lastUrl = window.location.href;
      lastActiveGameHref = activeGameHref;
      hasAppliedLayout = false;
      reconcileImmediately();
    }
  }

  settingsSource.subscribe((nextSettings) => {
    const wasResolving = shouldResolveActiveGame();
    settings = normalizeSettings(nextSettings);
    if (wasResolving !== shouldResolveActiveGame()) {
      resetActiveGameLookup();
    }
    controller.cleanup(document);
    gameReviewController.cleanup(document);
    hasAppliedLayout = false;
    reconcileImmediately();
  });

  let shortcutWrites = Promise.resolve();
  document.addEventListener("keydown", event => {
    if (!desktop || !settings?.enabled ||
        event.defaultPrevented || event.repeat || event.isComposing ||
        event.ctrlKey || event.metaKey || event.altKey || event.shiftKey ||
        !(event.target instanceof Element) ||
        event.target.closest('input, textarea, select, button, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="searchbox"]') ||
        document.querySelector('.chesscom-vinf-settings-dialog[open]') ||
        !(isTargetRoute() || isChessComGame(window.location) || isChessComLiveGameReview(window.location))) return;
    const key = event.key.toLowerCase();
    if (key === "t") {
      if (isChessComGame(window.location) && extremeOledController.toggleTimes()) event.preventDefault();
      return;
    }
    if ((key !== "o" && key !== "e") || !settingsSource.save) return;
    if (key === "e" && !isChessComGame(window.location)) return;
    event.preventDefault();
    shortcutWrites = shortcutWrites.then(async () => {
      if (!settings?.enabled) return;
      const next = normalizeSettings({ ...settings,
        [key === "o" ? "oledMode" : "extremeOled"]: !settings[key === "o" ? "oledMode" : "extremeOled"] });
      await settingsSource.save!(next);
      settings = next;
      reconcileImmediately();
    }).catch(() => { /* Failed storage writes leave the current settings intact. */ });
  });

  window.addEventListener("popstate", reconcileImmediately);
  window.addEventListener("hashchange", reconcileImmediately);
  document.addEventListener("click", (event) => void continueGame(event));
  phoneGameReviewMedia?.addEventListener("change", reconcileImmediately);
  window.setInterval(checkRoute, ROUTE_CHECK_INTERVAL_MS);
  attachObserver();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reconcileImmediately, {
      once: true
    });
  }

  void settingsSource.load().then((loadedSettings) => {
    settings = normalizeSettings(loadedSettings);
    reconcileImmediately();
  });
}
