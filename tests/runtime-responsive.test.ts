import { afterEach, describe, expect, it, vi } from "vitest";
import { startVinfRuntime } from "../src/content/runtime";
import { MARKERS, RECONCILE_DELAY_MS } from "../src/shared/constants";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import { loadResponsiveHomepageFixture } from "./test-utils";

afterEach(() => {
  document.documentElement.removeAttribute(MARKERS.active);
  document.documentElement.removeAttribute(MARKERS.dailyPlacement);
  document.documentElement.removeAttribute(MARKERS.chessTvVisibility);
  document.documentElement.removeAttribute(MARKERS.legendLeagueVisibility);
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("responsive runtime lifecycle", () => {
  it("observes a main element when the desktop base container is absent", async () => {
    vi.useFakeTimers();
    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;

    startVinfRuntime({
      load: async () => DEFAULT_SETTINGS,
      subscribe: () => undefined
    });
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);

    expect(document.documentElement.getAttribute(MARKERS.active)).toBe("true");
    const oldPuzzles = document.querySelector<HTMLElement>(
      '[data-fixture-module="puzzles"]'
    )!;
    const newPuzzles = oldPuzzles.cloneNode(true) as HTMLElement;
    newPuzzles.removeAttribute(MARKERS.hidden);
    oldPuzzles.replaceWith(newPuzzles);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);

    expect(newPuzzles.getAttribute(MARKERS.hidden)).toBe("puzzles");
    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);
  });

  it("observes from startup and transforms as soon as late homepage landmarks arrive", async () => {
    vi.useFakeTimers();
    document.documentElement.className = "";
    document.body.replaceChildren(document.createElement("div"));

    startVinfRuntime({
      load: async () => DEFAULT_SETTINGS,
      subscribe: () => undefined
    });
    await Promise.resolve();

    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.body.innerHTML = fixture.body.innerHTML;
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);

    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);
    expect(
      document
        .querySelector('[data-fixture-module="game-review"]')
        ?.getAttribute(MARKERS.hidden)
    ).toBe("game-review");
  });

  it("waits for stored settings before applying any page changes", async () => {
    vi.useFakeTimers();
    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;
    let resolveSettings: ((settings: typeof DEFAULT_SETTINGS) => void) | undefined;
    const pendingSettings = new Promise<typeof DEFAULT_SETTINGS>((resolve) => {
      resolveSettings = resolve;
    });

    startVinfRuntime({
      load: () => pendingSettings,
      subscribe: () => undefined
    });
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS * 2);

    expect(document.documentElement.hasAttribute(MARKERS.active)).toBe(false);
    expect(document.querySelector(`[${MARKERS.owned}]`)).toBeNull();
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();

    resolveSettings?.({ ...DEFAULT_SETTINGS, enabled: false });
    await Promise.resolve();

    expect(document.documentElement.hasAttribute(MARKERS.active)).toBe(false);
    expect(document.querySelector(`[${MARKERS.owned}]`)).toBeNull();
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
  });

  it("pre-arms hidden module markers as soon as stored settings load", async () => {
    vi.useFakeTimers();
    document.documentElement.className = "";
    document.body.replaceChildren(document.createElement("div"));

    startVinfRuntime({
      load: async () => ({
        ...DEFAULT_SETTINGS,
        dailyGamesPlacement: "hidden",
        showChessTv: false,
        showLegendLeague: false
      }),
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(document.documentElement.getAttribute(MARKERS.active)).toBe("true");
    expect(
      document.documentElement.getAttribute(MARKERS.dailyPlacement)
    ).toBe("hidden");
    expect(
      document.documentElement.getAttribute(MARKERS.chessTvVisibility)
    ).toBe("hidden");
    expect(
      document.documentElement.getAttribute(MARKERS.legendLeagueVisibility)
    ).toBe("hidden");
  });
});
