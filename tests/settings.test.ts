import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  getDefaultSettings,
  normalizeSettings
} from "../src/shared/settings";
import {
  QUICK_PLAY_EXPANSION_FALLBACK_IDS,
  DEFAULT_TIME_CONTROL_IDS_BY_COUNT,
  QUICK_PLAY_PRESET_COUNTS,
  resizeTimeControlIds
} from "../src/shared/time-controls";

describe("settings", () => {
  it("matches the approved installed profile with phone-only defaults", () => {
    const desktop = getDefaultSettings();
    const phone = getDefaultSettings(true);
    expect(desktop).toMatchObject({oledMode:true, extremeOled:false, pokemonMode:false,
      turnDotSize:20,turnPulseDiameter:48,turnAnimationDuration:333,
      pokemonPieces:{p:201,n:12,b:169,r:208,q:38,k:53},
      quickPlayPresetCount:8,timeControlIds:["10-0", "10-5", "15-10", "30-0", "3-0", "3-2", "5-5", "1-1"],
      dailyGamesPlacement:"hidden",recommendedMatchPlacement:"hidden",gameHistoryPlacement:"main"});
    expect(phone).toEqual({...desktop,quickPlayPresetCount:3,timeControlIds:["3-2","10-0","15-10"],turnDotSize:12,homepageSidebarVisible:["stats","open-game"]});
    expect(normalizeSettings(undefined,true)).toEqual(phone);
    expect(normalizeSettings({...phone,turnDotSize:18,homepageSidebarVisible:["chess-tv"]},true))
      .toMatchObject({turnDotSize:18,homepageSidebarVisible:["open-game","chess-tv"]});
  });
  it("uses the requested defaults", () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({turnAnimationDuration: 2500}).turnAnimationDuration).toBe(2500);
    expect(normalizeSettings({turnAnimationDuration: -1}).turnAnimationDuration).toBe(0);
    expect(normalizeSettings({turnAnimationDuration: 6000}).turnAnimationDuration).toBe(5000);
    expect(normalizeSettings({turnAnimationDuration: NaN}).turnAnimationDuration).toBe(333);
    expect(normalizeSettings({turnDotSize: 16, turnPulseScale: 5}).turnPulseDiameter).toBe(48);
    expect(normalizeSettings(normalizeSettings({turnDotSize: 7, turnPulseScale: 1.3}))).toEqual(normalizeSettings({turnDotSize: 7, turnPulseScale: 1.3}));
    expect(normalizeSettings({turnDotSize: 8, turnPulseScale: 5}).turnPulseDiameter).toBe(40);
    expect(normalizeSettings({turnPulseDiameter: 32, turnPulseScale: 5}).turnPulseDiameter).toBe(32);
    expect(normalizeSettings({turnPulseDiameter: -1}).turnPulseDiameter).toBe(0);
    expect(normalizeSettings({turnPulseDiameter: 99}).turnPulseDiameter).toBe(48);
    expect(normalizeSettings({turnPulseDiameter: NaN}).turnPulseDiameter).toBe(48);
    expect(normalizeSettings({homepageCardColumns: {stats: "main", friends: "sidebar", invalid: "main", "chess-tv": "bad"}}).homepageCardColumns).toEqual({stats: "main", friends: "sidebar"});
    expect(normalizeSettings({}).homepageCardColumns).toEqual({});
    expect(DEFAULT_SETTINGS.oledMode).toBe(true);
    expect(normalizeSettings({turnDotSize: 16}).turnDotSize).toBe(16);
    expect(normalizeSettings({turnDotSize: 100}).turnDotSize).toBe(24);
    expect(normalizeSettings({turnDotSize: 0}).turnDotSize).toBe(4);
    expect(normalizeSettings({turnDotSize: NaN}).turnDotSize).toBe(20);
    expect(Object.values(DEFAULT_SETTINGS.statsRatingStates)).toEqual([
      "retracted",
      "retracted",
      "retracted",
      "retracted",
      "retracted",
      "retracted"
    ]);
  });

  it("preserves the OLED appearance preference", () => {
    expect(normalizeSettings({ oledMode: true }).oledMode).toBe(true);
    expect(normalizeSettings({ oledMode: false, oledButtonColors: true }).oledMode).toBe(false);
    expect(normalizeSettings({ oledMode: true, oledButtonColors: false })).not.toHaveProperty("oledButtonColors");
    expect(normalizeSettings({ oledMode: "yes" }).oledMode).toBe(false);
    expect(
      normalizeSettings({ oledButtonColors: true }).oledMode
    ).toBe(true);
    expect(
      normalizeSettings({ oledButtonColors: "yes" }).oledMode
    ).toBe(false);
  });

  it("accepts six supported presets", () => {
    expect(
      normalizeSettings({
        enabled: false,
        moveDailyGamesToSidebar: false,
        timeControlIds: ["30s-0", "20s-1", "1-1", "5-2", "5-5", "60-0"]
      })
    ).toEqual({
      ...DEFAULT_SETTINGS,
      enabled: false,
      oledMode: false,
      quickPlayPresetCount: 6,
      dailyGamesPlacement: "main",
      dailyGamesVisiblePlacement: "main",
      homepageSidebarVisible:
        DEFAULT_SETTINGS.homepageSidebarVisible.filter(
          (id) => id !== "daily-games"
        ),
      timeControlIds: ["30s-0", "20s-1", "1-1", "5-2", "5-5", "60-0"],
    });
  });

  it("accepts repeated Quick Play presets", () => {
    const repeatedIds = [
      "10-0",
      "10-0",
      "10-0",
      "10-0",
      "10-0",
      "10-0"
    ] as const;
    expect(
      normalizeSettings({
        quickPlayPresetCount: 6,
        timeControlIds: repeatedIds
      }).timeControlIds
    ).toEqual(repeatedIds);
    expect(
      normalizeSettings({
        timeControlIds: ["10-0", "10-0", "10-0"]
      })
    ).toMatchObject({
      quickPlayPresetCount: 3,
      timeControlIds: ["10-0", "10-0", "10-0"]
    });
  });

  it("preserves existing presets and fills only new slots when expanding", () => {
    expect(
      resizeTimeControlIds(
        ["5-0", "5-0", "15-10", "30-0", "3-2", "5-3"],
        8
      )
    ).toEqual([
      "5-0",
      "5-0",
      "15-10",
      "30-0",
      "3-2",
      "5-3",
      "10-0",
      "10-5"
    ]);
    expect(resizeTimeControlIds([], 8)).toEqual(
      QUICK_PLAY_EXPANSION_FALLBACK_IDS
    );
  });

  it("keeps only the leading presets when shrinking", () => {
    expect(
      resizeTimeControlIds(
        ["5-0", "5-0", "15-10", "30-0", "3-2", "5-3"],
        3
      )
    ).toEqual(["5-0", "5-0", "15-10"]);
    expect(resizeTimeControlIds(["10-0"], 0)).toEqual([]);
  });

  it("accepts and infers every supported shortcut count", () => {
    for (const count of QUICK_PLAY_PRESET_COUNTS) {
      const normalized = normalizeSettings({
        ...(count === 0 ? { quickPlayPresetCount: 0 } : {}),
        timeControlIds: DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]
      });

      expect(normalized.quickPlayPresetCount).toBe(count);
      expect(normalized.timeControlIds).toEqual(
        DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]
      );
    }
  });

  it("requires an explicit zero-button choice instead of inferring it from missing presets", () => {
    expect(normalizeSettings({ timeControlIds: [] })).toMatchObject({
      quickPlayPresetCount: DEFAULT_SETTINGS.quickPlayPresetCount,
      timeControlIds: DEFAULT_SETTINGS.timeControlIds
    });
    expect(
      normalizeSettings({ quickPlayPresetCount: 0, timeControlIds: [] })
    ).toMatchObject({
      quickPlayPresetCount: 0,
      timeControlIds: []
    });
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

  it("falls back safely for invalid IDs or the wrong count", () => {
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
      profilePlacement: "sidebar",
      profileVisiblePlacement: "sidebar",
      dailyGamesPlacement: "hidden",
      recommendedMatchPlacement: "sidebar",
      recommendedMatchVisiblePlacement: "sidebar",
      gameHistoryPlacement: "hidden",
      gameHistoryVisiblePlacement: "sidebar",
      showChessTv: false,
      showLegendLeague: false
    });
    expect(migrated).toMatchObject({
      profilePlacement: "sidebar",
      profileVisiblePlacement: "sidebar",
      dailyGamesPlacement: "hidden",
      dailyGamesVisiblePlacement: "sidebar",
      recommendedMatchPlacement: "sidebar",
      recommendedMatchVisiblePlacement: "sidebar",
      gameHistoryPlacement: "hidden",
      gameHistoryVisiblePlacement: "sidebar",
      showNativePlayPanel: false
    });
    expect(migrated.homepageSidebarVisible).toEqual(["stats", "open-game", "profile", "recommended-match"]);
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        dailyGamesPlacement: "somewhere"
      }).dailyGamesPlacement
    ).toBe("hidden");
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
        "profile",
        "recommended-match",
        "game-history",
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
        "recommended-match",
        "invalid",
        "friends"
      ]
    });

    expect(normalized.showNativePlayPanel).toBe(true);
    expect(normalized.homepageSidebarOrder).toEqual([
      "friends",
      "profile",
      "recommended-match",
      "game-history",
      "daily-puzzle",
      "stats",
      "streaks",
      "legend-league",
      "chess-tv",
      "daily-games",
      "open-game"
    ]);
    expect(normalized.homepageSidebarVisible).toEqual([
      "friends",
      "stats",
      "open-game"
    ]);
  });

  it("preserves the previous nine-card order and adds Profile first", () => {
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        homepageSidebarOrder: [
          "friends",
          "daily-games",
          "recommended-match",
          "game-history",
          "stats",
          "daily-puzzle",
          "legend-league",
          "streaks",
          "chess-tv"
        ]
      }).homepageSidebarOrder
    ).toEqual([
      "profile",
      "friends",
      "daily-games",
      "recommended-match",
      "game-history",
      "stats",
      "daily-puzzle",
      "legend-league",
      "streaks",
      "chess-tv",
      "open-game"
    ]);
  });

  it("preserves the previous eight-card order and inserts Game History after Recommended Match", () => {
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        homepageSidebarOrder: [
          "friends",
          "daily-games",
          "recommended-match",
          "stats",
          "daily-puzzle",
          "legend-league",
          "streaks",
          "chess-tv"
        ]
      }).homepageSidebarOrder
    ).toEqual([
      "profile",
      "friends",
      "daily-games",
      "recommended-match",
      "game-history",
      "stats",
      "daily-puzzle",
      "legend-league",
      "streaks",
      "chess-tv",
      "open-game"
    ]);
  });

  it("preserves the retired seven-card order and inserts both newer main cards", () => {
    expect(
      normalizeSettings({
        ...DEFAULT_SETTINGS,
        homepageSidebarOrder: [
          "friends",
          "daily-games",
          "stats",
          "daily-puzzle",
          "legend-league",
          "streaks",
          "chess-tv"
        ]
      }).homepageSidebarOrder
    ).toEqual([
      "profile",
      "friends",
      "daily-games",
      "recommended-match",
      "game-history",
      "stats",
      "daily-puzzle",
      "legend-league",
      "streaks",
      "chess-tv",
      "open-game"
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
