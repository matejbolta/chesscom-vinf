import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  normalizeSettings
} from "../src/shared/settings";
import { DEFAULT_EIGHT_TIME_CONTROL_IDS } from "../src/shared/time-controls";

describe("settings", () => {
  it("uses the requested defaults", () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(Object.values(DEFAULT_SETTINGS.statsRatingStates)).toEqual([
      "retracted",
      "retracted",
      "retracted",
      "retracted",
      "retracted",
      "retracted"
    ]);
  });

  it("accepts six unique supported presets", () => {
    expect(
      normalizeSettings({
        enabled: false,
        moveDailyGamesToSidebar: false,
        timeControlIds: ["30s-0", "20s-1", "1-1", "5-2", "5-5", "60-0"]
      })
    ).toEqual({
      enabled: false,
      dailyGamesPlacement: "main",
      showChessTv: true,
      showLegendLeague: true,
      quickPlayPresetCount: 6,
      timeControlIds: ["30s-0", "20s-1", "1-1", "5-2", "5-5", "60-0"],
      statsSummaryOrder: DEFAULT_SETTINGS.statsSummaryOrder,
      statsSummaryVisible: DEFAULT_SETTINGS.statsSummaryVisible,
      statsRatingOrder: DEFAULT_SETTINGS.statsRatingOrder,
      statsRatingVisible: DEFAULT_SETTINGS.statsRatingVisible,
      statsRatingStates: DEFAULT_SETTINGS.statsRatingStates
    });
  });

  it("accepts eight unique presets and infers the eight-button mode", () => {
    const normalized = normalizeSettings({
      timeControlIds: DEFAULT_EIGHT_TIME_CONTROL_IDS
    });

    expect(normalized.quickPlayPresetCount).toBe(8);
    expect(normalized.timeControlIds).toEqual(DEFAULT_EIGHT_TIME_CONTROL_IDS);
  });

  it("falls back to the requested grid's complete defaults", () => {
    const normalized = normalizeSettings({
      quickPlayPresetCount: 8,
      timeControlIds: ["10-0", "10-0", "invalid"]
    });

    expect(normalized.quickPlayPresetCount).toBe(8);
    expect(normalized.timeControlIds).toEqual(DEFAULT_EIGHT_TIME_CONTROL_IDS);
  });

  it("migrates the retired 15-minute preset to 20 minutes", () => {
    expect(
      normalizeSettings({
        enabled: true,
        moveDailyGamesToSidebar: true,
        timeControlIds: ["15-0", "10-5", "15-10", "30-0", "3-2", "5-3"]
      }).timeControlIds
    ).toEqual(["20-0", "10-5", "15-10", "30-0", "3-2", "5-3"]);
  });

  it("falls back safely for duplicates, invalid IDs, or the wrong count", () => {
    expect(
      normalizeSettings({
        enabled: true,
        moveDailyGamesToSidebar: true,
        timeControlIds: ["3-0", "3-0", "invalid"]
      }).timeControlIds
    ).toEqual(DEFAULT_SETTINGS.timeControlIds);
  });

  it("migrates both retired Daily Games booleans", () => {
    expect(
      normalizeSettings({
        enabled: true,
        reorderGameHistory: false,
        timeControlIds: DEFAULT_SETTINGS.timeControlIds
      }).dailyGamesPlacement
    ).toBe("main");
    expect(
      normalizeSettings({
        enabled: true,
        moveDailyGamesToSidebar: true,
        timeControlIds: DEFAULT_SETTINGS.timeControlIds
      }).dailyGamesPlacement
    ).toBe("sidebar");
  });

  it("normalizes module placement and visibility settings", () => {
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        dailyGamesPlacement: "hidden",
        showChessTv: false,
        showLegendLeague: false
      })
    ).toMatchObject({
      dailyGamesPlacement: "hidden",
      showChessTv: false,
      showLegendLeague: false
    });
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        dailyGamesPlacement: "somewhere"
      }).dailyGamesPlacement
    ).toBe("sidebar");
  });

  it("accepts complete Stats orders and filters visible IDs", () => {
    const normalized = normalizeSettings({
      ...DEFAULT_SETTINGS,
      statsSummaryOrder: ["lessons", "games", "puzzles"],
      statsSummaryVisible: ["lessons", "invalid", "games", "lessons"],
      statsRatingOrder: [
        "live-960",
        "puzzles",
        "daily",
        "bullet",
        "blitz",
        "rapid"
      ],
      statsRatingVisible: ["live-960", "rapid", "invalid", "rapid"]
    });

    expect(normalized.statsSummaryOrder).toEqual([
      "lessons",
      "games",
      "puzzles"
    ]);
    expect(normalized.statsSummaryVisible).toEqual(["lessons", "games"]);
    expect(normalized.statsRatingOrder).toEqual([
      "live-960",
      "puzzles",
      "daily",
      "bullet",
      "blitz",
      "rapid"
    ]);
    expect(normalized.statsRatingVisible).toEqual(["live-960", "rapid"]);
  });

  it("restores safe Stats orders while allowing every known row to be hidden", () => {
    const normalized = normalizeSettings({
      ...DEFAULT_SETTINGS,
      statsSummaryOrder: ["games", "games"],
      statsSummaryVisible: [],
      statsRatingOrder: ["rapid", "blitz"],
      statsRatingVisible: []
    });

    expect(normalized.statsSummaryOrder).toEqual(
      DEFAULT_SETTINGS.statsSummaryOrder
    );
    expect(normalized.statsSummaryVisible).toEqual([]);
    expect(normalized.statsRatingOrder).toEqual(
      DEFAULT_SETTINGS.statsRatingOrder
    );
    expect(normalized.statsRatingVisible).toEqual([]);
  });

  it("persists supported per-rating initial states and repairs invalid values", () => {
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        statsRatingStates: {
          ...DEFAULT_SETTINGS.statsRatingStates,
          rapid: "expanded",
          bullet: "invalid"
        }
      }).statsRatingStates
    ).toEqual({
      ...DEFAULT_SETTINGS.statsRatingStates,
      rapid: "expanded"
    });
  });

  it("migrates the retired global Stats state to every rating row", () => {
    expect(
      normalizeSettings({
        statsDefaultState: "expanded"
      }).statsRatingStates
    ).toEqual({
      rapid: "expanded",
      bullet: "expanded",
      blitz: "expanded",
      daily: "expanded",
      puzzles: "expanded",
      "live-960": "expanded"
    });
  });
});
