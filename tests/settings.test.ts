import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  normalizeSettings
} from "../src/shared/settings";
import {
  DEFAULT_TIME_CONTROL_IDS_BY_COUNT,
  QUICK_PLAY_PRESET_COUNTS
} from "../src/shared/time-controls";

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
      ...DEFAULT_SETTINGS,
      enabled: false,
      dailyGamesPlacement: "main",
      dailyGamesVisiblePlacement: "main",
      homepageSidebarVisible:
        DEFAULT_SETTINGS.homepageSidebarVisible.filter(
          (id) => id !== "daily-games"
        ),
      timeControlIds: ["30s-0", "20s-1", "1-1", "5-2", "5-5", "60-0"],
    });
  });

  it("accepts and infers every supported shortcut count", () => {
    for (const count of QUICK_PLAY_PRESET_COUNTS) {
      const normalized = normalizeSettings({
        timeControlIds: DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]
      });

      expect(normalized.quickPlayPresetCount).toBe(count);
      expect(normalized.timeControlIds).toEqual(
        DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]
      );
    }
  });

  it("falls back to each requested grid's complete defaults", () => {
    for (const count of QUICK_PLAY_PRESET_COUNTS) {
      const normalized = normalizeSettings({
        quickPlayPresetCount: count,
        timeControlIds: ["10-0", "10-0", "invalid"]
      });

      expect(normalized.quickPlayPresetCount).toBe(count);
      expect(normalized.timeControlIds).toEqual(
        DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]
      );
    }
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
    const migrated = normalizeSettings({
      dailyGamesPlacement: "hidden",
      showChessTv: false,
      showLegendLeague: false
    });
    expect(migrated).toMatchObject({
      dailyGamesPlacement: "hidden",
      dailyGamesVisiblePlacement: "sidebar",
      showNativePlayPanel: false
    });
    expect(migrated.homepageSidebarVisible).toEqual(
      DEFAULT_SETTINGS.homepageSidebarVisible.filter(
        (id) =>
          id !== "daily-games" &&
          id !== "chess-tv" &&
          id !== "legend-league"
      )
    );
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        dailyGamesPlacement: "somewhere"
      }).dailyGamesPlacement
    ).toBe("sidebar");
    expect(
      normalizeSettings({
        dailyGamesPlacement: "hidden",
        dailyGamesVisiblePlacement: "main"
      }).dailyGamesVisiblePlacement
    ).toBe("main");
  });

  it("accepts a complete homepage card order and filters visibility safely", () => {
    const normalized = normalizeSettings({
      ...DEFAULT_SETTINGS,
      showNativePlayPanel: true,
      homepageSidebarOrder: [
        "friends",
        "daily-puzzle",
        "stats",
        "streaks",
        "legend-league",
        "chess-tv",
        "daily-games"
      ],
      homepageSidebarVisible: [
        "friends",
        "stats",
        "daily-games",
        "invalid",
        "friends"
      ]
    });

    expect(normalized.showNativePlayPanel).toBe(true);
    expect(normalized.homepageSidebarOrder).toEqual([
      "friends",
      "daily-puzzle",
      "stats",
      "streaks",
      "legend-league",
      "chess-tv",
      "daily-games"
    ]);
    expect(normalized.homepageSidebarVisible).toEqual([
      "friends",
      "stats",
      "daily-games"
    ]);
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
