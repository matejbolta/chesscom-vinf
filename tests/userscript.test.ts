import { afterEach, describe, expect, it, vi } from "vitest";
import { RECONCILE_DELAY_MS } from "../src/shared/constants";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import {
  getQuickPlayGridDimensions,
  QUICK_PLAY_EXPANSION_FALLBACK_IDS,
  QUICK_PLAY_PRESET_COUNTS
} from "../src/shared/time-controls";
import { loadResponsiveHomepageFixture } from "./test-utils";

afterEach(() => {
  vi.clearAllTimers();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Android userscript shell", () => {
  it("uses documented GM APIs and opens its local settings command", async () => {
    vi.useFakeTimers();
    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;

    let menuCommand: (() => void) | undefined;
    const setValue = vi.fn();
    vi.stubGlobal("__VINF_USERSCRIPT_CSS__", "");
    vi.stubGlobal("GM_getValue", vi.fn(() => DEFAULT_SETTINGS));
    vi.stubGlobal("GM_setValue", setValue);
    vi.stubGlobal("GM_addValueChangeListener", vi.fn(() => 1));
    vi.stubGlobal(
      "GM_registerMenuCommand",
      vi.fn((_label: string, listener: () => void) => {
        menuCommand = listener;
        return "VINF settings";
      })
    );
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };

    await import("../src/userscript/userscript");
    await vi.advanceTimersByTimeAsync(RECONCILE_DELAY_MS);

    expect(document.querySelectorAll("[data-chesscom-vinf-owned='quick-play']")).toHaveLength(
      1
    );
    expect(menuCommand).toBeTypeOf("function");
    menuCommand?.();
    await Promise.resolve();

    const dialog = document.querySelector<HTMLDialogElement>(
      "[data-chesscom-vinf-userscript-settings]"
    );
    expect(dialog?.open).toBe(true);
    expect(dialog?.querySelectorAll("select")).toHaveLength(16);
    expect(
      dialog?.querySelector<HTMLSelectElement>(
        '[aria-label="Daily Games placement"]'
      )?.value
    ).toBe("sidebar");
    expect(
      dialog?.querySelector<HTMLSelectElement>(
        '[aria-label="Recommended Match placement"]'
      )?.value
    ).toBe("main");
    expect(
      dialog?.querySelector<HTMLSelectElement>(
        '[aria-label="Game History placement"]'
      )?.value
    ).toBe("main");
    expect(
      dialog?.querySelector<HTMLSelectElement>(
        '[aria-label="Rapid initial state"]'
      )?.value
    ).toBe("retracted");
    expect(
      dialog?.querySelector<HTMLSelectElement>(
        '[aria-label="Bullet initial state"]'
      )?.disabled
    ).toBe(true);
    expect(
      dialog?.querySelectorAll(".chesscom-vinf-settings-preference-row")
    ).toHaveLength(18);
    const enabled = dialog?.querySelector<HTMLInputElement>(
      "#chesscom-vinf-userscript-enabled"
    );
    const dailyPlacement = dialog?.querySelector<HTMLSelectElement>(
      '[aria-label="Daily Games placement"]'
    );
    const showDailyGames = dialog?.querySelector<HTMLInputElement>(
      "#chesscom-vinf-homepage-daily-games"
    );
    const showNativePlayPanel = dialog?.querySelector<HTMLInputElement>(
      "#chesscom-vinf-userscript-native-play-panel"
    );
    expect(
      dialog?.querySelector(
        'label[for="chesscom-vinf-homepage-chess-tv"]'
      )?.textContent
    ).toBe("ChessTV");
    const firstPreset = dialog?.querySelector<HTMLSelectElement>(
      '[aria-label="Quick Play shortcut 1"]'
    );
    expect(enabled?.closest(".chesscom-vinf-settings-card")).not.toBe(
      dailyPlacement?.closest(".chesscom-vinf-settings-card")
    );
    expect(
      enabled
        ?.closest(".chesscom-vinf-settings-card")
        ?.querySelectorAll(".chesscom-vinf-settings-row")
    ).toHaveLength(1);
    expect(
      dailyPlacement
        ?.closest(".chesscom-vinf-settings-card")
        ?.querySelector("h3")?.textContent
    ).toBe("Homepage");
    expect(showDailyGames?.checked).toBe(true);
    expect(dailyPlacement?.disabled).toBe(false);
    expect(
      Array.from(dailyPlacement?.options ?? []).map((option) => option.value)
    ).toEqual(["main", "sidebar"]);
    expect(
      Array.from(firstPreset?.querySelectorAll("optgroup") ?? []).map(
        (group) => group.label
      )
    ).toEqual(["Bullet", "Blitz", "Rapid"]);
    expect(
      Array.from(firstPreset?.options ?? []).map((option) => option.value)
    ).toEqual([
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
      dialog?.querySelector<HTMLInputElement>(
        "#chesscom-vinf-summary-games"
      )?.checked
    ).toBe(true);
    expect(
      dialog?.querySelector<HTMLInputElement>(
        "#chesscom-vinf-summary-puzzles"
      )?.checked
    ).toBe(false);

    const presetCount = dialog!.querySelector<HTMLSelectElement>(
      '[aria-label="Quick Play shortcut count"]'
    )!;
    expect(Array.from(presetCount.options).map((option) => option.value)).toEqual(
      QUICK_PLAY_PRESET_COUNTS.map(String)
    );
    let presetSelects = Array.from(
      dialog!.querySelectorAll<HTMLSelectElement>(
        '[aria-label^="Quick Play shortcut "]'
      )
    ).filter((select) => select !== presetCount);
    presetSelects[0].value = "5-0";
    presetSelects[1].value = "5-0";
    const resizeExpectations = [
      [
        8,
        [
          "5-0",
          "5-0",
          "15-10",
          "30-0",
          "3-2",
          "5-3",
          "10-0",
          "10-5"
        ]
      ],
      [3, ["5-0", "5-0", "15-10"]],
      [6, ["5-0", "5-0", "15-10", "10-0", "10-5", "30-0"]],
      [4, ["5-0", "5-0", "15-10", "10-0"]],
      [2, ["5-0", "5-0"]],
      [1, ["5-0"]],
      [0, []],
      [8, [...QUICK_PLAY_EXPANSION_FALLBACK_IDS]]
    ] as const;
    for (const [count, expectedIds] of resizeExpectations) {
      presetCount.value = String(count);
      presetCount.dispatchEvent(new Event("change", { bubbles: true }));
      const dimensions = getQuickPlayGridDimensions(count);
      const presetList = dialog!.querySelector(
        ".chesscom-vinf-settings-presets"
      );
      expect(presetList?.getAttribute("data-preset-columns")).toBe(
        String(dimensions.columns)
      );
      expect(presetList?.getAttribute("data-preset-rows")).toBe(
        String(dimensions.rows)
      );
      expect(presetList?.hasAttribute("hidden")).toBe(count === 0);
      presetSelects = Array.from(
        dialog!.querySelectorAll<HTMLSelectElement>(
          '[aria-label^="Quick Play shortcut "]'
        )
      ).filter((select) => select !== presetCount);
      expect(presetSelects).toHaveLength(count);
      expect(presetSelects.map((select) => select.value)).toEqual(expectedIds);
      await Promise.resolve();
    }
    expect(setValue).toHaveBeenLastCalledWith("vinfSettings", {
      ...DEFAULT_SETTINGS,
      quickPlayPresetCount: 8,
      timeControlIds: QUICK_PLAY_EXPANSION_FALLBACK_IDS
    });

    presetCount.value = "6";
    presetCount.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      dialog!
        .querySelector(".chesscom-vinf-settings-presets")
        ?.getAttribute("data-preset-columns")
    ).toBe("3");
    expect(
      dialog!
        .querySelector(".chesscom-vinf-settings-presets")
        ?.getAttribute("data-preset-rows")
    ).toBe("2");
    presetSelects = Array.from(
      dialog!.querySelectorAll<HTMLSelectElement>(
        '[aria-label^="Quick Play shortcut "]'
      )
    ).filter((select) => select !== presetCount);
    expect(presetSelects).toHaveLength(6);
    expect(presetSelects.map((select) => select.value)).toEqual(
      QUICK_PLAY_EXPANSION_FALLBACK_IDS.slice(0, 6)
    );
    presetCount
      .closest(".chesscom-vinf-settings-card")
      ?.querySelector<HTMLButtonElement>("button")
      ?.click();
    await Promise.resolve();
    expect(presetSelects.map((select) => select.value)).toEqual(
      DEFAULT_SETTINGS.timeControlIds
    );
    expect(
      Array.from(presetSelects[0].options).every(
        (option) => !option.disabled
      )
    ).toBe(true);
    presetSelects[0].value = presetSelects[1].value;
    presetSelects[0].dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
    expect(setValue).toHaveBeenLastCalledWith("vinfSettings", {
      ...DEFAULT_SETTINGS,
      timeControlIds: ["10-5", "10-5", "15-10", "30-0", "3-2", "5-3"]
    });

    const puzzles = dialog!.querySelector<HTMLInputElement>(
      "#chesscom-vinf-summary-puzzles"
    )!;
    puzzles.checked = true;
    puzzles.dispatchEvent(new Event("change", { bubbles: true }));
    showNativePlayPanel!.checked = true;
    showNativePlayPanel!.dispatchEvent(new Event("change", { bubbles: true }));
    showDailyGames!.checked = false;
    showDailyGames!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(dailyPlacement!.disabled).toBe(true);
    const showChessTv = dialog!.querySelector<HTMLInputElement>(
      "#chesscom-vinf-homepage-chess-tv"
    )!;
    showChessTv.checked = false;
    showChessTv.dispatchEvent(new Event("change", { bubbles: true }));
    const showLegendLeague = dialog!.querySelector<HTMLInputElement>(
      "#chesscom-vinf-homepage-legend-league"
    )!;
    showLegendLeague.checked = false;
    showLegendLeague.dispatchEvent(new Event("change", { bubbles: true }));
    const rapidState = dialog!.querySelector<HTMLSelectElement>(
      '[aria-label="Rapid initial state"]'
    )!;
    rapidState.value = "expanded";
    rapidState.dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
    expect(setValue).toHaveBeenLastCalledWith("vinfSettings", {
      ...DEFAULT_SETTINGS,
      showNativePlayPanel: true,
      dailyGamesPlacement: "hidden",
      homepageSidebarVisible:
        DEFAULT_SETTINGS.homepageSidebarVisible.filter(
          (id) =>
            id !== "daily-games" &&
            id !== "chess-tv" &&
            id !== "legend-league"
        ),
      timeControlIds: ["10-5", "10-5", "15-10", "30-0", "3-2", "5-3"],
      statsSummaryVisible: ["games", "puzzles"],
      statsRatingStates: {
        ...DEFAULT_SETTINGS.statsRatingStates,
        rapid: "expanded"
      }
    });
  });
});
