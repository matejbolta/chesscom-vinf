import { afterEach, describe, expect, it, vi } from "vitest";
import { RECONCILE_DELAY_MS } from "../src/shared/constants";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import { DEFAULT_EIGHT_TIME_CONTROL_IDS } from "../src/shared/time-controls";
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
    expect(dialog?.querySelectorAll("select")).toHaveLength(14);
    expect(
      dialog?.querySelector<HTMLSelectElement>(
        '[aria-label="Daily Games placement"]'
      )?.value
    ).toBe("sidebar");
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
    ).toHaveLength(9);
    const enabled = dialog?.querySelector<HTMLInputElement>(
      "#chesscom-vinf-userscript-enabled"
    );
    const dailyPlacement = dialog?.querySelector<HTMLSelectElement>(
      '[aria-label="Daily Games placement"]'
    );
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
    presetCount.value = "8";
    presetCount.dispatchEvent(new Event("change", { bubbles: true }));
    let presetSelects = Array.from(
      dialog!.querySelectorAll<HTMLSelectElement>(
        '[aria-label^="Quick Play shortcut "]'
      )
    ).filter((select) => select !== presetCount);
    expect(presetSelects).toHaveLength(8);
    expect(presetSelects.map((select) => select.value)).toEqual(
      DEFAULT_EIGHT_TIME_CONTROL_IDS
    );
    await Promise.resolve();
    expect(setValue).toHaveBeenLastCalledWith("vinfSettings", {
      ...DEFAULT_SETTINGS,
      quickPlayPresetCount: 8,
      timeControlIds: DEFAULT_EIGHT_TIME_CONTROL_IDS
    });

    presetCount.value = "6";
    presetCount.dispatchEvent(new Event("change", { bubbles: true }));
    presetSelects = Array.from(
      dialog!.querySelectorAll<HTMLSelectElement>(
        '[aria-label^="Quick Play shortcut "]'
      )
    ).filter((select) => select !== presetCount);
    expect(presetSelects).toHaveLength(6);
    expect(presetSelects.map((select) => select.value)).toEqual(
      DEFAULT_SETTINGS.timeControlIds
    );
    await Promise.resolve();

    const puzzles = dialog!.querySelector<HTMLInputElement>(
      "#chesscom-vinf-summary-puzzles"
    )!;
    puzzles.checked = true;
    puzzles.dispatchEvent(new Event("change", { bubbles: true }));
    dailyPlacement!.value = "hidden";
    dailyPlacement!.dispatchEvent(new Event("change", { bubbles: true }));
    const showChessTv = dialog!.querySelector<HTMLInputElement>(
      "#chesscom-vinf-userscript-chess-tv"
    )!;
    showChessTv.checked = false;
    showChessTv.dispatchEvent(new Event("change", { bubbles: true }));
    const showLegendLeague = dialog!.querySelector<HTMLInputElement>(
      "#chesscom-vinf-userscript-legend-league"
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
      dailyGamesPlacement: "hidden",
      showChessTv: false,
      showLegendLeague: false,
      statsSummaryVisible: ["games", "puzzles"],
      statsRatingStates: {
        ...DEFAULT_SETTINGS.statsRatingStates,
        rapid: "expanded"
      }
    });
  });
});
