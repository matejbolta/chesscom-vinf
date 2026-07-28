import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY
} from "../src/shared/settings";
import {
  DEFAULT_EIGHT_TIME_CONTROL_IDS,
  DEFAULT_TIME_CONTROL_IDS_BY_COUNT,
  getQuickPlayGridDimensions,
  QUICK_PLAY_PRESET_COUNTS
} from "../src/shared/time-controls";

async function flushAsyncWork(): Promise<void> {
  for (let index = 0; index < 30; index += 1) {
    await Promise.resolve();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  window.history.replaceState({}, "", "/");
});

describe("settings popup", () => {
  it("loads saved settings and autosaves every unique selection", async () => {
    const html = readFileSync(
      resolve(process.cwd(), "src/popup/popup.html"),
      "utf8"
    );
    document.documentElement.innerHTML = html;

    const savedSettings = {
      ...DEFAULT_SETTINGS,
      enabled: false,
      dailyGamesPlacement: "main" as const,
      dailyGamesVisiblePlacement: "main" as const,
      homepageSidebarVisible:
        DEFAULT_SETTINGS.homepageSidebarVisible.filter(
          (id) =>
            id !== "daily-games" &&
            id !== "chess-tv" &&
            id !== "legend-league"
        )
    };
    const set = vi.fn(async () => undefined);
    const openSidePanel = vi.fn(async () => undefined);
    const getCurrentWindow = vi.fn(async () => ({ id: 42 }));
    const closePopup = vi
      .spyOn(window, "close")
      .mockImplementation(() => undefined);
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: vi.fn(async () => ({ [SETTINGS_STORAGE_KEY]: savedSettings })),
          set
        }
      },
      sidePanel: {
        open: openSidePanel
      },
      windows: {
        getCurrent: getCurrentWindow
      }
    });

    await import("../src/popup/popup");
    await flushAsyncWork();

    const openSidePanelButton = document.querySelector<HTMLButtonElement>(
      "#open-side-panel"
    )!;
    const closeSidePanelButton = document.querySelector<HTMLButtonElement>(
      "#close-side-panel"
    )!;
    const enabled = document.querySelector<HTMLInputElement>("#enabled")!;
    const dailyGamesPlacement = document.querySelector<HTMLSelectElement>(
      "#homepage-daily-games-placement"
    )!;
    const showDailyGames = document.querySelector<HTMLInputElement>(
      "#homepage-sidebar-list-daily-games"
    )!;
    const showNativePlayPanel = document.querySelector<HTMLInputElement>(
      "#show-native-play-panel"
    )!;
    const showChessTv = document.querySelector<HTMLInputElement>(
      "#homepage-sidebar-list-chess-tv"
    )!;
    const showLegendLeague = document.querySelector<HTMLInputElement>(
      "#homepage-sidebar-list-legend-league"
    )!;
    const presetCount = document.querySelector<HTMLSelectElement>(
      "#quick-play-preset-count"
    )!;
    let selects = Array.from(
      document.querySelectorAll<HTMLSelectElement>("#preset-list select")
    );
    const rapidState = document.querySelector<HTMLSelectElement>(
      '[aria-label="Rapid initial state"]'
    )!;
    const bulletState = document.querySelector<HTMLSelectElement>(
      '[aria-label="Bullet initial state"]'
    )!;
    const masterCard = enabled.closest(".settings-card");
    const homepageCard = document.querySelector<HTMLElement>(
      '[aria-labelledby="homepage-heading"]'
    );

    expect(document.documentElement.dataset.surface).toBe("popup");
    expect(openSidePanelButton.hidden).toBe(false);
    expect(closeSidePanelButton.hidden).toBe(true);
    openSidePanelButton.click();
    await flushAsyncWork();
    expect(getCurrentWindow).toHaveBeenCalledOnce();
    expect(openSidePanel).toHaveBeenCalledWith({ windowId: 42 });
    expect(closePopup).toHaveBeenCalledOnce();
    openSidePanelButton.disabled = false;
    openSidePanel.mockRejectedValueOnce(new Error("Unsupported"));
    openSidePanelButton.click();
    await flushAsyncWork();
    expect(openSidePanelButton.disabled).toBe(false);
    expect(document.querySelector("#status")?.textContent).toBe(
      "Side panel is not available in this browser."
    );
    expect(enabled.checked).toBe(false);
    expect(showDailyGames.checked).toBe(true);
    expect(dailyGamesPlacement.value).toBe("main");
    expect(dailyGamesPlacement.disabled).toBe(false);
    expect(
      Array.from(dailyGamesPlacement.options).map((option) => option.value)
    ).toEqual(["main", "sidebar"]);
    expect(showNativePlayPanel.checked).toBe(false);
    expect(showChessTv.checked).toBe(false);
    expect(
      document.querySelector(
        'label[for="homepage-sidebar-list-chess-tv"]'
      )?.textContent
    ).toBe("ChessTV");
    expect(showLegendLeague.checked).toBe(false);
    expect(presetCount.value).toBe("6");
    expect(
      Array.from(presetCount.options).map((option) => option.value)
    ).toEqual(QUICK_PLAY_PRESET_COUNTS.map(String));
    expect(selects).toHaveLength(6);
    expect(document.querySelectorAll("select")).toHaveLength(14);
    expect(rapidState.value).toBe("retracted");
    expect(rapidState.disabled).toBe(false);
    expect(bulletState.disabled).toBe(true);
    expect(selects.map((select) => select.value)).toEqual(
      DEFAULT_SETTINGS.timeControlIds
    );
    expect(
      document.querySelectorAll(".stats-preference-row")
    ).toHaveLength(9);
    expect(
      document.querySelector<HTMLInputElement>("#stats-summary-list-games")
        ?.checked
    ).toBe(true);
    expect(
      document.querySelector<HTMLInputElement>("#stats-summary-list-puzzles")
        ?.checked
    ).toBe(false);
    expect(
      document.querySelector<HTMLInputElement>("#stats-rating-list-rapid")
        ?.checked
    ).toBe(true);
    expect(
      document.querySelector<HTMLInputElement>("#stats-rating-list-blitz")
        ?.checked
    ).toBe(true);
    expect(masterCard).not.toBeNull();
    expect(masterCard).not.toBe(homepageCard);
    expect(masterCard?.querySelectorAll(".setting-row")).toHaveLength(1);
    expect(homepageCard?.querySelector("#enabled")).toBeNull();
    expect(
      homepageCard?.querySelector("#homepage-daily-games-placement")
    ).not.toBeNull();
    expect(
      homepageCard?.querySelectorAll(".homepage-card-row")
    ).toHaveLength(7);
    expect(document.querySelector(".save-button")).toBeNull();
    expect(Array.from(selects[0].options).map((option) => option.value)).toEqual([
      "30s-0",
      "20s-1",
      "1-0",
      "1-1",
      "2-1",
      "3-0",
      "3-2",
      "5-0",
      "5-2",
      "5-3",
      "5-5",
      "10-0",
      "10-5",
      "15-10",
      "20-0",
      "30-0",
      "60-0"
    ]);
    expect(
      Array.from(selects[0].querySelectorAll("optgroup")).map(
        (group) => group.label
      )
    ).toEqual(["Bullet", "Blitz", "Rapid"]);
    expect(
      selects[0].querySelector<HTMLOptionElement>('option[value="10-5"]')
        ?.disabled
    ).toBe(true);
    expect(
      selects[0].querySelector<HTMLOptionElement>('option[value="10-0"]')
        ?.disabled
    ).toBe(false);

    for (const count of [1, 2, 3, 4, 8] as const) {
      presetCount.value = String(count);
      presetCount.dispatchEvent(new Event("change", { bubbles: true }));
      const dimensions = getQuickPlayGridDimensions(count);
      expect(document.querySelector("#preset-list")?.getAttribute(
        "data-preset-columns"
      )).toBe(String(dimensions.columns));
      expect(document.querySelector("#preset-list")?.getAttribute(
        "data-preset-rows"
      )).toBe(String(dimensions.rows));
      selects = Array.from(
        document.querySelectorAll<HTMLSelectElement>("#preset-list select")
      );
      expect(selects).toHaveLength(count);
      expect(selects.map((select) => select.value)).toEqual(
        DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]
      );
      expect(document.querySelectorAll("select")).toHaveLength(8 + count);
      await flushAsyncWork();
    }
    expect(set).toHaveBeenLastCalledWith({
      [SETTINGS_STORAGE_KEY]: {
        ...savedSettings,
        quickPlayPresetCount: 8,
        timeControlIds: DEFAULT_EIGHT_TIME_CONTROL_IDS
      }
    });

    presetCount.value = "6";
    presetCount.dispatchEvent(new Event("change", { bubbles: true }));
    expect(document.querySelector("#preset-list")?.getAttribute(
      "data-preset-columns"
    )).toBe("3");
    expect(document.querySelector("#preset-list")?.getAttribute(
      "data-preset-rows"
    )).toBe("2");
    selects = Array.from(
      document.querySelectorAll<HTMLSelectElement>("#preset-list select")
    );
    expect(selects).toHaveLength(6);
    expect(selects.map((select) => select.value)).toEqual(
      DEFAULT_SETTINGS.timeControlIds
    );
    await flushAsyncWork();

    enabled.checked = true;
    enabled.dispatchEvent(new Event("change", { bubbles: true }));
    showNativePlayPanel.checked = true;
    showNativePlayPanel.dispatchEvent(new Event("change", { bubbles: true }));
    dailyGamesPlacement.value = "sidebar";
    dailyGamesPlacement.dispatchEvent(new Event("change", { bubbles: true }));
    showDailyGames.checked = false;
    showDailyGames.dispatchEvent(new Event("change", { bubbles: true }));
    await flushAsyncWork();
    expect(dailyGamesPlacement.disabled).toBe(true);
    expect(set).toHaveBeenLastCalledWith({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        enabled: true,
        showNativePlayPanel: true,
        dailyGamesPlacement: "hidden",
        homepageSidebarVisible:
          DEFAULT_SETTINGS.homepageSidebarVisible.filter(
            (id) =>
              id !== "daily-games" &&
              id !== "chess-tv" &&
              id !== "legend-league"
          )
      }
    });
    showDailyGames.checked = true;
    showDailyGames.dispatchEvent(new Event("change", { bubbles: true }));
    showChessTv.checked = true;
    showChessTv.dispatchEvent(new Event("change", { bubbles: true }));
    showLegendLeague.checked = true;
    showLegendLeague.dispatchEvent(new Event("change", { bubbles: true }));
    selects[0].value = "20s-1";
    selects[0].dispatchEvent(new Event("change", { bubbles: true }));
    await flushAsyncWork();

    expect(set).toHaveBeenLastCalledWith({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        enabled: true,
        showNativePlayPanel: true,
        timeControlIds: ["20s-1", "10-5", "15-10", "30-0", "3-2", "5-3"]
      }
    });
    await vi.waitFor(() => {
      expect(document.querySelector("#status")?.textContent).toContain(
        "Settings saved"
      );
    });

    const puzzlesSummary = document.querySelector<HTMLInputElement>(
      "#stats-summary-list-puzzles"
    )!;
    puzzlesSummary.checked = true;
    puzzlesSummary.dispatchEvent(new Event("change", { bubbles: true }));
    document
      .querySelector<HTMLButtonElement>('[aria-label="Move Blitz up"]')!
      .click();
    const blitzState = document.querySelector<HTMLSelectElement>(
      '[aria-label="Blitz initial state"]'
    )!;
    blitzState.value = "expanded";
    blitzState.dispatchEvent(new Event("change", { bubbles: true }));
    await flushAsyncWork();

    expect(set).toHaveBeenLastCalledWith({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        enabled: true,
        showNativePlayPanel: true,
        timeControlIds: ["20s-1", "10-5", "15-10", "30-0", "3-2", "5-3"],
        statsSummaryVisible: ["games", "puzzles"],
        statsRatingOrder: [
          "blitz",
          "rapid",
          "bullet",
          "daily",
          "puzzles",
          "live-960"
        ],
        statsRatingVisible: ["blitz", "rapid"],
        statsRatingStates: {
          ...DEFAULT_SETTINGS.statsRatingStates,
          blitz: "expanded"
        }
      }
    });

    enabled.checked = false;
    enabled.dispatchEvent(new Event("change", { bubbles: true }));
    document.querySelector<HTMLButtonElement>("#reset-presets")!.click();
    await flushAsyncWork();

    expect(set).toHaveBeenLastCalledWith({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        enabled: false,
        showNativePlayPanel: true,
        timeControlIds: DEFAULT_SETTINGS.timeControlIds,
        statsSummaryVisible: ["games", "puzzles"],
        statsRatingOrder: [
          "blitz",
          "rapid",
          "bullet",
          "daily",
          "puzzles",
          "live-960"
        ],
        statsRatingVisible: ["blitz", "rapid"],
        statsRatingStates: {
          ...DEFAULT_SETTINGS.statsRatingStates,
          blitz: "expanded"
        }
      }
    });
    await vi.waitFor(() => {
      expect(document.querySelector("#status")?.textContent).toContain(
        "Defaults restored"
      );
    });

    document.querySelector<HTMLButtonElement>("#reset-stats")!.click();
    await flushAsyncWork();
    document.querySelector<HTMLButtonElement>("#reset-homepage")!.click();
    await flushAsyncWork();
    expect(set).toHaveBeenLastCalledWith({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        enabled: false
      }
    });
  });

  it("reuses the settings UI and closes itself from inside the side panel", async () => {
    const html = readFileSync(
      resolve(process.cwd(), "src/popup/popup.html"),
      "utf8"
    );
    document.documentElement.innerHTML = html;
    window.history.replaceState({}, "", "/sidepanel.html");

    const getCurrentWindow = vi.fn(async () => ({ id: 42 }));
    const closeSidePanel = vi.fn(async () => undefined);
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: vi.fn(async () => ({})),
          set: vi.fn(async () => undefined)
        }
      },
      sidePanel: {
        close: closeSidePanel
      },
      windows: {
        getCurrent: getCurrentWindow
      }
    });

    await import("../src/popup/popup");
    await flushAsyncWork();

    expect(document.documentElement.dataset.surface).toBe("side-panel");
    expect(
      document.querySelector<HTMLButtonElement>("#open-side-panel")?.hidden
    ).toBe(true);
    const closeSidePanelButton = document.querySelector<HTMLButtonElement>(
      "#close-side-panel"
    )!;
    expect(closeSidePanelButton.hidden).toBe(false);
    expect(getCurrentWindow).toHaveBeenCalledOnce();

    closeSidePanelButton.click();
    await flushAsyncWork();
    expect(closeSidePanel).toHaveBeenCalledWith({ windowId: 42 });

    closeSidePanelButton.disabled = false;
    closeSidePanel.mockRejectedValueOnce(new Error("Unsupported"));
    closeSidePanelButton.click();
    await flushAsyncWork();
    expect(closeSidePanelButton.disabled).toBe(false);
    expect(document.querySelector("#status")?.textContent).toBe(
      "Close this panel from the browser toolbar."
    );
  });
});
