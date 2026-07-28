import { describe, expect, it, vi } from "vitest";
import { LayoutController } from "../src/content/layout-controller";
import { NativeLaunchAdapter } from "../src/content/launch-adapter";
import { MARKERS } from "../src/shared/constants";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import {
  DEFAULT_EIGHT_TIME_CONTROL_IDS,
  DEFAULT_TIME_CONTROL_IDS_BY_COUNT,
  QUICK_PLAY_PRESET_COUNTS
} from "../src/shared/time-controls";
import {
  HOME_LOCATION,
  loadHomepageFixture,
  loadModernHomepageFixture,
  loadResponsiveHomepageFixture
} from "./test-utils";

function moduleOrder(container: Element): string[] {
  return Array.from(container.children)
    .map(
      (element) =>
        (element as HTMLElement).dataset.fixtureModule ??
        element.getAttribute(MARKERS.module) ??
        undefined
    )
    .filter((name): name is string => Boolean(name));
}

function visibleModuleOrder(container: Element): string[] {
  return Array.from(container.children)
    .filter((element) => !element.hasAttribute(MARKERS.hidden))
    .map(
      (element) =>
        (element as HTMLElement).dataset.fixtureModule ??
        element.getAttribute(MARKERS.module) ??
        undefined
    )
    .filter((name): name is string => Boolean(name));
}

describe("LayoutController", () => {
  it("applies the focused layout to the redesigned desktop shell", () => {
    const document = loadModernHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    expect(controller.reconcile(document, HOME_LOCATION)).toBe(true);

    const main = document.querySelector<HTMLElement>(
      "#home-main > .main-component"
    )!;
    const sidebar = document.querySelector<HTMLElement>(
      "#home-sidebar > .sidebar-component"
    )!;
    const quickPlay = document.querySelector<HTMLElement>(
      `[${MARKERS.owned}="quick-play"]`
    )!;

    expect(quickPlay.parentElement).toBe(main);
    expect(main.firstElementChild).toBe(quickPlay);
    expect(quickPlay.nextElementSibling?.getAttribute("data-fixture-module")).toBe(
      "main-placeholder"
    );
    expect(
      document.querySelector("#home-header")?.getAttribute(MARKERS.hidden)
    ).toBe("native-actions");
    expect(
      document
        .querySelector('[data-fixture-module="game-history"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(false);
    expect(visibleModuleOrder(sidebar)).toEqual([
      "stats",
      "chess-tv",
      "streaks",
      "legend-league",
      "daily-puzzle",
      "friends",
      "unknown-card"
    ]);

    expect(controller.reconcile(document, HOME_LOCATION)).toBe(true);
    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);
    expect(main.firstElementChild).toBe(quickPlay);

    controller.cleanup(document);
    expect(
      document.querySelector(`[${MARKERS.owned}="quick-play"]`)
    ).toBeNull();
    expect(document.querySelector("#home-header")?.hasAttribute(MARKERS.hidden)).toBe(
      false
    );
    expect(moduleOrder(sidebar)).toEqual([
      "daily-puzzle",
      "badges",
      "friends",
      "chess-tv",
      "stats",
      "unknown-card"
    ]);
    expect(main.hasAttribute(MARKERS.layout)).toBe(false);
    expect(sidebar.hasAttribute(MARKERS.layout)).toBe(false);
  });

  it("shows, hides, and orders every known redesigned sidebar card safely", () => {
    const document = loadModernHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    const sidebar = document.querySelector<HTMLElement>(
      "#home-sidebar > .sidebar-component"
    )!;

    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      showNativePlayPanel: true,
      homepageSidebarOrder: [
        "friends",
        "daily-puzzle",
        "legend-league",
        "streaks",
        "chess-tv",
        "stats",
        "daily-games"
      ],
      homepageSidebarVisible: [
        "friends",
        "legend-league",
        "stats"
      ]
    });

    expect(
      document.querySelector("#home-header")?.hasAttribute(MARKERS.hidden)
    ).toBe(false);
    expect(document.documentElement.getAttribute(MARKERS.nativePlayPanel)).toBe(
      "visible"
    );
    expect(visibleModuleOrder(sidebar)).toEqual([
      "friends",
      "legend-league",
      "stats",
      "unknown-card"
    ]);
    expect(
      document
        .querySelector('[data-fixture-module="daily-puzzle"]')
        ?.getAttribute(MARKERS.hidden)
    ).toBe("daily-puzzle");
    expect(
      document
        .querySelector('[data-fixture-module="streaks"]')
        ?.closest(`[${MARKERS.sidebarCard}="streaks"]`)
        ?.getAttribute(MARKERS.hidden)
    ).toBe("streaks");
    expect(
      document
        .querySelector('[data-fixture-module="unknown-card"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(false);

    controller.cleanup(document);
    expect(document.documentElement.hasAttribute(MARKERS.nativePlayPanel)).toBe(
      false
    );
    expect(moduleOrder(sidebar)).toEqual([
      "daily-puzzle",
      "badges",
      "friends",
      "chess-tv",
      "stats",
      "unknown-card"
    ]);
  });

  it("applies the required hierarchy and remains idempotent", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    expect(controller.reconcile(document, HOME_LOCATION)).toBe(true);
    const firstPanel = document.querySelector(`[${MARKERS.owned}="quick-play"]`);
    expect(firstPanel).not.toBeNull();
    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);
    expect(firstPanel?.parentElement).toBe(
      document.querySelector("#vue-instance")
    );
    expect(firstPanel?.nextElementSibling).toBe(
      document.querySelector('[data-fixture-module="game-history"]')
    );
    expect(
      document.querySelector(".promo-component")?.getAttribute(MARKERS.layout)
    ).toBe("quick-play-in-main");

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
    expect(
      document.querySelector('[data-fixture-module="native-actions"]')?.getAttribute(
        MARKERS.hidden
      )
    ).toBe("native-actions");
    expect(
      document.querySelector('[data-fixture-module="puzzles"]')?.getAttribute(
        MARKERS.hidden
      )
    ).toBe("puzzles");
    expect(
      document.querySelector('[data-fixture-module="next-lesson"]')?.getAttribute(
        MARKERS.hidden
      )
    ).toBe("next-lesson");
    expect(
      document.querySelector('[data-fixture-module="game-review"]')?.getAttribute(
        MARKERS.hidden
      )
    ).toBe("game-review");
    expect(document.querySelector("#navigation-sidebar")).not.toBeNull();

    expect(moduleOrder(document.querySelector("#vue-instance")!)).toEqual([
      "game-history"
    ]);
    expect(moduleOrder(document.querySelector("#vue-sidebar-instance")!)).toEqual([
      "stats",
      "chess-tv",
      "daily-games",
      "legend-league"
    ]);

    expect(controller.reconcile(document, HOME_LOCATION)).toBe(true);
    expect(document.querySelector(`[${MARKERS.owned}="quick-play"]`)).toBe(firstPanel);
    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);
  });

  it("renders exactly the six required accessible shortcuts", () => {
    const document = loadHomepageFixture();
    new LayoutController(new NativeLaunchAdapter(vi.fn())).reconcile(
      document,
      HOME_LOCATION
    );

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "button[data-chesscom-vinf-time-control]"
      )
    );
    const labels = buttons.map((button) => button.getAttribute("aria-label"));

    expect(labels).toEqual([
      "Play 10 min",
      "Play 10 + 5",
      "Play 15 + 10",
      "Play 30 min",
      "Play 3 + 2",
      "Play 5 + 3"
    ]);
    expect(
      buttons.map((button) =>
        button.querySelector(".chesscom-vinf-quick-play-label")?.textContent
      )
    ).toEqual(["10", "10 + 5", "15 + 10", "30", "3 + 2", "5 + 3"]);
    expect(buttons.map((button) => button.dataset.timeClass)).toEqual([
      "rapid",
      "rapid",
      "rapid",
      "rapid",
      "blitz",
      "blitz"
    ]);
    expect(document.querySelector(".chesscom-vinf-quick-play-header")).toBeNull();
    expect(document.querySelector(".chesscom-vinf-quick-play-title")).toBeNull();
    expect(document.querySelector(".chesscom-vinf-quick-play-subtitle")).toBeNull();
    expect(document.querySelector(".chesscom-vinf-mark")).toBeNull();
    expect(document.querySelector(".chesscom-vinf-time-icon")).toBeNull();
  });

  it("uses the six configured presets and can keep Daily Games in its native column", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      dailyGamesPlacement: "main",
      timeControlIds: ["30s-0", "20s-1", "1-1", "5-2", "5-5", "60-0"]
    });

    expect(moduleOrder(document.querySelector("#vue-instance")!)).toEqual([
      "daily-games",
      "game-history"
    ]);
    expect(
      document.querySelector(`[${MARKERS.owned}="quick-play"]`)?.nextElementSibling
    ).toBe(document.querySelector('[data-fixture-module="daily-games"]'));
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "button[data-chesscom-vinf-time-control]"
      )
    );
    expect(buttons.map((button) => button.dataset.chesscomVinfTimeControl)).toEqual([
      "30s-0",
      "20s-1",
      "1-1",
      "5-2",
      "5-5",
      "60-0"
    ]);
    expect(
      buttons.map(
        (button) =>
          button.querySelector(".chesscom-vinf-quick-play-label")?.textContent
      )
    ).toEqual(["30 sec", "20 sec + 1", "1 + 1", "5 + 2", "5 + 5", "60"]);
    expect(buttons.map((button) => button.dataset.timeClass)).toEqual([
      "bullet",
      "bullet",
      "bullet",
      "blitz",
      "blitz",
      "rapid"
    ]);
    expect(buttons.map((button) => button.dataset.baseSeconds)).toEqual([
      "30",
      "20",
      "60",
      "300",
      "300",
      "3600"
    ]);
  });

  it("renders the requested eight presets and replaces a stale grid safely", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      quickPlayPresetCount: 8,
      timeControlIds: [...DEFAULT_EIGHT_TIME_CONTROL_IDS]
    });

    const eightPanel = document.querySelector<HTMLElement>(
      `[${MARKERS.owned}="quick-play"]`
    )!;
    expect(eightPanel.dataset.presetCount).toBe("8");
    expect(
      Array.from(
        eightPanel.querySelectorAll<HTMLButtonElement>(
          "[data-chesscom-vinf-time-control]"
        )
      ).map((button) => button.dataset.chesscomVinfTimeControl)
    ).toEqual(DEFAULT_EIGHT_TIME_CONTROL_IDS);

    controller.reconcile(document, HOME_LOCATION, DEFAULT_SETTINGS);
    const sixPanel = document.querySelector<HTMLElement>(
      `[${MARKERS.owned}="quick-play"]`
    )!;
    expect(sixPanel).not.toBe(eightPanel);
    expect(sixPanel.dataset.presetCount).toBe("6");
    expect(
      sixPanel.querySelectorAll("[data-chesscom-vinf-time-control]")
    ).toHaveLength(6);
  });

  it("renders every supported shortcut count with its exact defaults", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    let previousPanel: HTMLElement | null = null;

    for (const count of QUICK_PLAY_PRESET_COUNTS) {
      controller.reconcile(document, HOME_LOCATION, {
        ...DEFAULT_SETTINGS,
        quickPlayPresetCount: count,
        timeControlIds: [...DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]]
      });

      const panel = document.querySelector<HTMLElement>(
        `[${MARKERS.owned}="quick-play"]`
      )!;
      expect(panel.dataset.presetCount).toBe(String(count));
      expect(
        Array.from(
          panel.querySelectorAll<HTMLButtonElement>(
            "[data-chesscom-vinf-time-control]"
          )
        ).map((button) => button.dataset.chesscomVinfTimeControl)
      ).toEqual(DEFAULT_TIME_CONTROL_IDS_BY_COUNT[count]);
      if (previousPanel) {
        expect(panel).not.toBe(previousPanel);
      }
      previousPanel = panel;
    }
  });

  it("restores Daily Games immediately when its sidebar setting is disabled", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);
    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      dailyGamesPlacement: "main"
    });

    expect(moduleOrder(document.querySelector("#vue-instance")!)).toEqual([
      "daily-games",
      "game-history"
    ]);
    expect(moduleOrder(document.querySelector("#vue-sidebar-instance")!)).toEqual([
      "stats",
      "chess-tv",
      "legend-league"
    ]);
    expect(
      document.querySelector(`[${MARKERS.owned}="quick-play"]`)?.nextElementSibling
    ).toBe(document.querySelector('[data-fixture-module="daily-games"]'));
    expect(
      document.documentElement.hasAttribute(MARKERS.dailyPlacement)
    ).toBe(false);
  });

  it("can hide Daily Games without shifting Quick Play", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      dailyGamesPlacement: "hidden"
    });

    const dailyGames = document.querySelector<HTMLElement>(
      '[data-fixture-module="daily-games"]'
    )!;
    expect(dailyGames.getAttribute(MARKERS.hidden)).toBe("daily-games");
    expect(dailyGames.parentElement).toBe(
      document.querySelector("#vue-instance")
    );
    expect(
      document.querySelector(`[${MARKERS.owned}="quick-play"]`)
        ?.nextElementSibling
    ).toBe(document.querySelector('[data-fixture-module="game-history"]'));
    expect(
      document.documentElement.getAttribute(MARKERS.dailyPlacement)
    ).toBe("hidden");
    expect(
      visibleModuleOrder(document.querySelector("#vue-sidebar-instance")!)
    ).toEqual(["stats", "chess-tv", "legend-league"]);
  });

  it("can independently hide ChessTV and Legend League and restore them", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    const rightColumn = document.querySelector<HTMLElement>(
      "#vue-sidebar-instance"
    )!;

    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      homepageSidebarVisible: DEFAULT_SETTINGS.homepageSidebarVisible.filter(
        (id) => id !== "chess-tv" && id !== "legend-league"
      )
    });

    expect(
      document
        .querySelector('[data-fixture-module="chess-tv"]')
        ?.getAttribute(MARKERS.hidden)
    ).toBe("chess-tv");
    expect(
      document
        .querySelector('[data-fixture-module="legend-league"]')
        ?.getAttribute(MARKERS.hidden)
    ).toBe("legend-league");
    expect(document.documentElement.getAttribute(MARKERS.sidebarHidden)).toBe(
      "chess-tv legend-league"
    );
    expect(visibleModuleOrder(rightColumn)).toEqual([
      "stats",
      "daily-games"
    ]);

    controller.reconcile(document, HOME_LOCATION);
    expect(visibleModuleOrder(rightColumn)).toEqual([
      "stats",
      "chess-tv",
      "daily-games",
      "legend-league"
    ]);
    expect(
      document.documentElement.hasAttribute(MARKERS.sidebarHidden)
    ).toBe(false);
  });

  it("pre-hides Daily Games when Chess.com inserts it late in the native column", () => {
    const document = loadHomepageFixture();
    const delayedDaily = document.querySelector<HTMLElement>(
      '[data-fixture-module="daily-games"]'
    )!;
    delayedDaily.remove();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    controller.reconcile(document, HOME_LOCATION);
    expect(
      document.documentElement.getAttribute(MARKERS.dailyPlacement)
    ).toBe("sidebar");

    const leftColumn = document.querySelector<HTMLElement>("#vue-instance")!;
    leftColumn.prepend(delayedDaily);
    expect(delayedDaily.querySelector('a[href*="/play/online/daily"]')).not.toBeNull();
    expect(
      document.documentElement.getAttribute(MARKERS.dailyPlacement)
    ).toBe("sidebar");

    controller.reconcile(document, HOME_LOCATION);
    expect(delayedDaily.parentElement).toBe(
      document.querySelector("#vue-sidebar-instance")
    );
    expect(
      document.querySelector(`[${MARKERS.owned}="quick-play"]`)?.nextElementSibling
    ).toBe(document.querySelector('[data-fixture-module="game-history"]'));

    controller.cleanup(document);
    expect(
      document.documentElement.hasAttribute(MARKERS.dailyPlacement)
    ).toBe(false);
  });

  it("keeps Quick Play first while Daily Games and Game History are still hydrating", () => {
    const document = loadHomepageFixture();
    const dailyGames = document.querySelector<HTMLElement>(
      '[data-fixture-module="daily-games"]'
    )!;
    dailyGames.querySelector("a")?.replaceWith(document.createElement("span"));
    const gameHistory = document.querySelector<HTMLElement>(
      '[data-fixture-module="game-history"]'
    )!;
    gameHistory
      .querySelector(".game-history-games-component")
      ?.classList.remove("game-history-games-component");
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    expect(controller.reconcile(document, HOME_LOCATION)).toBe(true);

    const quickPlay = document.querySelector<HTMLElement>(
      `[${MARKERS.owned}="quick-play"]`
    )!;
    expect(quickPlay.parentElement).toBe(
      document.querySelector("#vue-instance")
    );
    expect(quickPlay.nextElementSibling).toBe(gameHistory);
    expect(dailyGames.parentElement).toBe(
      document.querySelector("#vue-sidebar-instance")
    );
  });

  it("does nothing when VINF is disabled", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    expect(
      controller.reconcile(document, HOME_LOCATION, {
        ...DEFAULT_SETTINGS,
        enabled: false
      })
    ).toBe(false);
    expect(document.querySelector(`[${MARKERS.owned}]`)).toBeNull();
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
    expect(document.querySelector(`[${MARKERS.module}]`)).toBeNull();
  });

  it("hides and restores every exact promo user-info instance", () => {
    const document = loadHomepageFixture();
    const original = document.querySelector<HTMLElement>(
      ".promo-toolbar-user-info"
    )!;
    const duplicate = original.cloneNode(true) as HTMLElement;
    duplicate.dataset.fixtureModule = "promo-user-info-duplicate";
    original.parentElement?.append(duplicate);
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    controller.reconcile(document, HOME_LOCATION);

    const userInfoModules = Array.from(
      document.querySelectorAll<HTMLElement>(".promo-toolbar-user-info")
    );
    expect(userInfoModules).toHaveLength(2);
    expect(
      userInfoModules.map((element) => element.getAttribute(MARKERS.hidden))
    ).toEqual(["promo-user-info", "promo-user-info"]);

    controller.cleanup(document);
    expect(
      userInfoModules.some((element) => element.hasAttribute(MARKERS.hidden))
    ).toBe(false);
  });

  it("cleans up owned UI and restores native ordering", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);
    controller.cleanup(document);

    expect(document.querySelector(`[${MARKERS.owned}]`)).toBeNull();
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
    expect(
      document.documentElement.hasAttribute(MARKERS.dailyPlacement)
    ).toBe(false);
    expect(moduleOrder(document.querySelector("#vue-instance")!)).toEqual([
      "daily-games",
      "game-history"
    ]);
    expect(moduleOrder(document.querySelector("#vue-sidebar-instance")!)).toEqual([
      "legend-league",
      "chess-tv",
      "stats"
    ]);
  });

  it("keeps working when optional modules are absent", () => {
    const document = loadHomepageFixture();
    for (const name of ["daily-games", "game-review", "chess-tv", "legend-league"]) {
      document.querySelector(`[data-fixture-module="${name}"]`)?.remove();
    }

    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    expect(() => controller.reconcile(document, HOME_LOCATION)).not.toThrow();
    expect(
      document.querySelector(".promo-component")?.getAttribute(MARKERS.layout)
    ).toBe("quick-play-in-main");
    expect(moduleOrder(document.querySelector("#vue-sidebar-instance")!)).toEqual([
      "stats"
    ]);
  });

  it("reconciles native modules replaced by a dynamic rerender", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);

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

    const rightColumn = document.querySelector<HTMLElement>("#vue-sidebar-instance")!;
    const oldStats = document.querySelector<HTMLElement>(
      '[data-fixture-module="stats"]'
    )!;
    const newStats = oldStats.cloneNode(true) as HTMLElement;
    oldStats.replaceWith(newStats);
    rightColumn.append(newStats);

    controller.reconcile(document, HOME_LOCATION);

    expect(newPuzzles.getAttribute(MARKERS.hidden)).toBe("puzzles");
    expect(newHomepageToolbar.getAttribute(MARKERS.hidden)).toBe("homepage-toolbar");
    expect(newMainBanner.getAttribute(MARKERS.hidden)).toBe("main-banner");
    expect(newPromoUserInfo.getAttribute(MARKERS.hidden)).toBe("promo-user-info");
    expect(moduleOrder(rightColumn)).toEqual([
      "stats",
      "chess-tv",
      "daily-games",
      "legend-league"
    ]);
    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);
  });

  it("keeps online ChessTV and Daily Games between Stats and Legend League", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);

    const rightColumn = document.querySelector<HTMLElement>("#vue-sidebar-instance")!;
    const tv = document.querySelector<HTMLElement>(
      '[data-fixture-module="chess-tv"]'
    )!;
    tv.querySelector('a[href="https://www.chess.com/tv"]')?.remove();
    tv.prepend(Object.assign(document.createElement("strong"), { textContent: "aftpawn" }));
    rightColumn.append(tv);

    controller.reconcile(document, HOME_LOCATION);
    expect(moduleOrder(rightColumn)).toEqual([
      "stats",
      "chess-tv",
      "daily-games",
      "legend-league"
    ]);
    expect(tv.getAttribute(MARKERS.module)).toBe("chess-tv");
    expect(
      document
        .querySelector('[data-fixture-module="daily-games"]')
        ?.getAttribute(MARKERS.module)
    ).toBe("daily-games");
    expect(
      document
        .querySelector('[data-fixture-module="legend-league"]')
        ?.getAttribute(MARKERS.module)
    ).toBe("legend-league");
  });

  it("cleans up when a client-side route leaves the homepage", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);

    expect(
      controller.reconcile(document, {
        ...HOME_LOCATION,
        pathname: "/analysis"
      })
    ).toBe(false);
    expect(document.querySelector(`[${MARKERS.owned}]`)).toBeNull();
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
  });

  it("applies and restores the responsive single-column hierarchy", () => {
    const document = loadResponsiveHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    expect(controller.reconcile(document, HOME_LOCATION)).toBe(true);
    const main = document.querySelector<HTMLElement>("main")!;
    expect(main.getAttribute(MARKERS.layout)).toBe("single-column");
    expect(main.firstElementChild?.getAttribute(MARKERS.owned)).toBe("quick-play");
    expect(moduleOrder(main)).toEqual([
      "game-history",
      "stats",
      "chess-tv",
      "daily-games",
      "legend-league",
      "native-actions",
      "puzzles",
      "next-lesson",
      "game-review"
    ]);
    for (const name of ["native-actions", "puzzles", "next-lesson", "game-review"]) {
      expect(
        document.querySelector(`[data-fixture-module="${name}"]`)?.hasAttribute(
          MARKERS.hidden
        )
      ).toBe(true);
    }
    expect(
      document.querySelectorAll(`[${MARKERS.owned}="quick-play"]`)
    ).toHaveLength(1);

    controller.cleanup(document);
    expect(moduleOrder(main)).toEqual([
      "native-actions",
      "puzzles",
      "next-lesson",
      "game-review",
      "daily-games",
      "game-history",
      "stats",
      "chess-tv",
      "legend-league"
    ]);
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
  });

  it("supports a minimal responsive flow with optional cards hidden", () => {
    const document = loadResponsiveHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    const main = document.querySelector<HTMLElement>("main")!;

    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      dailyGamesPlacement: "hidden",
      homepageSidebarVisible: DEFAULT_SETTINGS.homepageSidebarVisible.filter(
        (id) =>
          id !== "daily-games" &&
          id !== "chess-tv" &&
          id !== "legend-league"
      )
    });

    expect(visibleModuleOrder(main)).toEqual(["game-history", "stats"]);
    for (const name of ["daily-games", "chess-tv", "legend-league"]) {
      expect(
        document
          .querySelector(`[data-fixture-module="${name}"]`)
          ?.hasAttribute(MARKERS.hidden)
      ).toBe(true);
    }

    controller.cleanup(document);
    expect(document.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
  });
});
