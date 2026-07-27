import {
  HOME_PATHS,
  MARKERS,
  RECONCILE_DELAY_MS,
  ROUTE_CHECK_INTERVAL_MS
} from "../shared/constants";
import type { ExtensionSettings } from "../shared/models";
import { normalizeSettings } from "../shared/settings";
import { LayoutController } from "./layout-controller";
import { NativeLaunchAdapter } from "./launch-adapter";

export interface SettingsSource {
  load(): Promise<ExtensionSettings>;
  subscribe(listener: (settings: ExtensionSettings) => void): void;
}

export function startVinfRuntime(settingsSource: SettingsSource): void {
  const controller = new LayoutController(new NativeLaunchAdapter());

  let observer: MutationObserver | null = null;
  let observedRoot: HTMLElement | null = null;
  let reconcileTimer: number | null = null;
  let lastUrl = window.location.href;
  let settings: ExtensionSettings | null = null;
  let hasAppliedLayout = false;

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
    if (!settings) {
      return;
    }
    const shouldPrehideNativeChrome = settings.enabled && isTargetRoute();
    if (shouldPrehideNativeChrome) {
      document.documentElement.setAttribute(MARKERS.active, "true");
      if (settings.dailyGamesPlacement === "main") {
        document.documentElement.removeAttribute(MARKERS.dailyPlacement);
      } else {
        document.documentElement.setAttribute(
          MARKERS.dailyPlacement,
          settings.dailyGamesPlacement
        );
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
      return;
    }

    document.documentElement.removeAttribute(MARKERS.active);
    document.documentElement.removeAttribute(MARKERS.dailyPlacement);
    document.documentElement.removeAttribute(MARKERS.chessTvVisibility);
    document.documentElement.removeAttribute(MARKERS.legendLeagueVisibility);
  }

  function reconcile(): void {
    reconcileTimer = null;
    if (!settings) {
      attachObserver();
      return;
    }

    syncDocumentSettingsMarkers();

    hasAppliedLayout = controller.reconcile(
      document,
      window.location,
      settings
    );
    // An incomplete target document asks the controller to clean up. Re-arm
    // setting-specific pre-hide markers immediately so late native cards cannot
    // paint before the next successful reconciliation.
    syncDocumentSettingsMarkers();
    if (settings.enabled && isTargetRoute()) {
      attachObserver();
    } else {
      observer?.disconnect();
      observer = null;
      observedRoot = null;
    }
  }

  function scheduleReconcile(): void {
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
    const rootWasDetached = Boolean(observedRoot && !observedRoot.isConnected);
    if (window.location.href !== lastUrl || rootWasDetached) {
      lastUrl = window.location.href;
      hasAppliedLayout = false;
      reconcileImmediately();
    }
  }

  settingsSource.subscribe((nextSettings) => {
    settings = normalizeSettings(nextSettings);
    controller.cleanup(document);
    hasAppliedLayout = false;
    reconcileImmediately();
  });

  window.addEventListener("popstate", reconcileImmediately);
  window.addEventListener("hashchange", reconcileImmediately);
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
