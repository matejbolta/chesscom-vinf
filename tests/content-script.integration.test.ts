import { afterEach, describe, expect, it, vi } from "vitest";
import { MARKERS, RECONCILE_DELAY_MS } from "../src/shared/constants";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "../src/shared/settings";
import { loadHomepageFixture } from "./test-utils";

afterEach(() => {
  vi.clearAllTimers();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("content script lifecycle", () => {
  it("reconciles rerenders and cleans up after client-side navigation", async () => {
    vi.useFakeTimers();
    let storageListener:
      | ((
          changes: Record<string, chrome.storage.StorageChange>,
          areaName: string
        ) => void)
      | undefined;
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: vi.fn(async () => ({})),
          set: vi.fn(async () => undefined)
        },
        onChanged: {
          addListener: vi.fn(
            (
              listener: (
                changes: Record<string, chrome.storage.StorageChange>,
                areaName: string
              ) => void
            ) => {
              storageListener = listener;
            }
          )
        }
      }
    });
    const fixture = loadHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;

    await import("../src/content/content-script");
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);

    expect(document.documentElement.getAttribute(MARKERS.active)).toBe("true");
    expect(document.querySelector(`[${MARKERS.owned}="quick-play"]`)).not.toBeNull();
    expect(
      document.querySelector('[data-fixture-module="game-review"]')?.getAttribute(
        MARKERS.hidden
      )
    ).toBe("game-review");
    expect(
      document.querySelector("#homepage-toolbar")?.getAttribute(MARKERS.hidden)
    ).toBe("homepage-toolbar");
    expect(document.querySelector("#main-banner")?.getAttribute(MARKERS.hidden)).toBe(
      "main-banner"
    );
    expect(
      document
        .querySelector(".promo-toolbar-user-info")
        ?.getAttribute(MARKERS.hidden)
    ).toBe("promo-user-info");

    const oldPuzzles = document.querySelector<HTMLElement>(
      '[data-fixture-module="puzzles"]'
    )!;
    const newPuzzles = oldPuzzles.cloneNode(true) as HTMLElement;
    newPuzzles.removeAttribute(MARKERS.hidden);
    oldPuzzles.replaceWith(newPuzzles);

    const oldMainBanner = document.querySelector<HTMLElement>("#main-banner")!;
    const newMainBanner = oldMainBanner.cloneNode(true) as HTMLElement;
    newMainBanner.removeAttribute(MARKERS.hidden);
    oldMainBanner.replaceWith(newMainBanner);

    const oldHomepageToolbar = document.querySelector<HTMLElement>(
      "#homepage-toolbar"
    )!;
    const newHomepageToolbar = oldHomepageToolbar.cloneNode(true) as HTMLElement;
    newHomepageToolbar.removeAttribute(MARKERS.hidden);
    oldHomepageToolbar.replaceWith(newHomepageToolbar);

    const oldPromoUserInfo = document.querySelector<HTMLElement>(
      ".promo-toolbar-user-info"
    )!;
    const newPromoUserInfo = oldPromoUserInfo.cloneNode(true) as HTMLElement;
    newPromoUserInfo.removeAttribute(MARKERS.hidden);
    oldPromoUserInfo.replaceWith(newPromoUserInfo);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);

    expect(newPuzzles.getAttribute(MARKERS.hidden)).toBe("puzzles");
    expect(newHomepageToolbar.getAttribute(MARKERS.hidden)).toBe("homepage-toolbar");
    expect(newMainBanner.getAttribute(MARKERS.hidden)).toBe("main-banner");
    expect(newPromoUserInfo.getAttribute(MARKERS.hidden)).toBe("promo-user-info");
    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);

    storageListener?.(
      {
        [SETTINGS_STORAGE_KEY]: {
          newValue: { ...DEFAULT_SETTINGS, enabled: false }
        }
      },
      "local"
    );
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);
    expect(document.documentElement.hasAttribute(MARKERS.active)).toBe(false);
    expect(document.querySelector(`[${MARKERS.owned}]`)).toBeNull();

    storageListener?.(
      {
        [SETTINGS_STORAGE_KEY]: {
          newValue: {
            ...DEFAULT_SETTINGS,
            dailyGamesPlacement: "main",
            timeControlIds: ["3-0", "5-0", "10-0", "20-0", "3-2", "5-3"]
          }
        }
      },
      "local"
    );
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);
    expect(document.documentElement.getAttribute(MARKERS.active)).toBe("true");
    expect(document.querySelector(`[${MARKERS.owned}="quick-play"]`)).not.toBeNull();
    expect(
      Array.from(document.querySelector("#vue-instance")!.children)
        .map((element) => (element as HTMLElement).dataset.fixtureModule)
        .filter(Boolean)
    ).toEqual(["daily-games", "game-history"]);

    window.history.pushState({}, "", "/analysis");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);

    expect(document.querySelector(`[${MARKERS.owned}]`)).toBeNull();
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
    expect(document.documentElement.hasAttribute(MARKERS.active)).toBe(false);
  });
});
