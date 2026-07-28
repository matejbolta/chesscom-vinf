import { describe, expect, it } from "vitest";
import { locateHomepageModules } from "../src/content/module-locator";
import {
  loadHomepageFixture,
  loadModernHomepageFixture,
  loadResponsiveHomepageFixture
} from "./test-utils";

describe("locateHomepageModules", () => {
  it("finds every target module without matching the main navigation", () => {
    const modules = locateHomepageModules(loadHomepageFixture());

    expect(modules.homepageToolbar?.dataset.fixtureModule).toBe(
      "homepage-toolbar"
    );
    expect(modules.mainBanner?.id).toBe("main-banner");
    expect(modules.promoUserInfos).toHaveLength(1);
    expect(modules.promoUserInfos[0]?.dataset.fixtureModule).toBe("promo-user-info");
    expect(modules.nativeActionColumn?.dataset.fixtureModule).toBe("native-actions");
    expect(modules.nativeLaunchTemplate?.textContent).toContain("Play 15 + 10");
    expect(modules.topLeagueSummary?.classList.contains("promo-item")).toBe(true);
    expect(modules.puzzles?.dataset.fixtureModule).toBe("puzzles");
    expect(modules.nextLesson?.dataset.fixtureModule).toBe("next-lesson");
    expect(modules.gameReview?.dataset.fixtureModule).toBe("game-review");
    expect(modules.dailyGames?.dataset.fixtureModule).toBe("daily-games");
    expect(modules.gameHistory?.dataset.fixtureModule).toBe("game-history");
    expect(modules.stats?.dataset.fixtureModule).toBe("stats");
    expect(modules.chessTv?.dataset.fixtureModule).toBe("chess-tv");
    expect(modules.legendLeague?.dataset.fixtureModule).toBe("legend-league");
    expect(modules.dailyPuzzle).toBeNull();
    expect(modules.friends).toBeNull();
    expect(modules.streaks).toBeNull();
    expect(modules.badgesContainer).toBeNull();
  });

  it("tolerates absent optional modules", () => {
    const document = loadHomepageFixture();
    for (const name of ["daily-games", "game-review", "chess-tv", "legend-league"]) {
      document.querySelector(`[data-fixture-module="${name}"]`)?.remove();
    }

    const modules = locateHomepageModules(document);
    expect(modules.dailyGames).toBeNull();
    expect(modules.gameReview).toBeNull();
    expect(modules.chessTv).toBeNull();
    expect(modules.legendLeague).toBeNull();
    expect(modules.gameHistory).not.toBeNull();
    expect(modules.stats).not.toBeNull();
  });

  it("recognizes the native Daily Games loading header before its link hydrates", () => {
    const document = loadHomepageFixture();
    const dailyGames = document.querySelector<HTMLElement>(
      '[data-fixture-module="daily-games"]'
    )!;
    dailyGames.querySelector("a")?.replaceWith(document.createElement("span"));

    expect(locateHomepageModules(document).dailyGames).toBe(dailyGames);
  });

  it("recognizes the earlier Daily Games loading-toggle shell", () => {
    const document = loadHomepageFixture();
    const dailyGames = document.querySelector<HTMLElement>(
      '[data-fixture-module="daily-games"]'
    )!;
    dailyGames.innerHTML =
      '<div class="home-current-games-loading-view-toggle-container"></div>';

    expect(locateHomepageModules(document).dailyGames).toBe(dailyGames);
  });

  it("treats the recurring main campaign banner as optional", () => {
    const document = loadHomepageFixture();
    document.querySelector("#main-banner")?.remove();

    expect(locateHomepageModules(document).mainBanner).toBeNull();
  });

  it("treats the exact homepage toolbar as optional", () => {
    const document = loadHomepageFixture();
    document.querySelector("#homepage-toolbar")?.removeAttribute("id");

    expect(locateHomepageModules(document).homepageToolbar).toBeNull();
  });

  it("treats the promo toolbar user info as an optional exact module", () => {
    const document = loadHomepageFixture();
    document
      .querySelector(".promo-toolbar-user-info")
      ?.classList.remove("promo-toolbar-user-info");

    expect(locateHomepageModules(document).promoUserInfos).toEqual([]);
  });

  it("recognizes ChessTV when its online header changes to a streamer name", () => {
    const document = loadHomepageFixture();
    const tv = document.querySelector<HTMLElement>(
      '[data-fixture-module="chess-tv"]'
    )!;
    tv.querySelector('a[href="https://www.chess.com/tv"]')?.remove();
    const streamerHeading = document.createElement("strong");
    streamerHeading.textContent = "aftpawn";
    tv.prepend(streamerHeading);

    expect(locateHomepageModules(document).chessTv).toBe(tv);
  });

  it("finds responsive modules by semantic links and headings", () => {
    const modules = locateHomepageModules(loadResponsiveHomepageFixture());

    expect(modules.layoutMode).toBe("responsive");
    expect(modules.nativeActionColumn?.dataset.fixtureModule).toBe("native-actions");
    expect(modules.puzzles?.dataset.fixtureModule).toBe("puzzles");
    expect(modules.nextLesson?.dataset.fixtureModule).toBe("next-lesson");
    expect(modules.gameReview?.dataset.fixtureModule).toBe("game-review");
    expect(modules.dailyGames?.dataset.fixtureModule).toBe("daily-games");
    expect(modules.gameHistory?.dataset.fixtureModule).toBe("game-history");
    expect(modules.stats?.dataset.fixtureModule).toBe("stats");
    expect(modules.chessTv?.dataset.fixtureModule).toBe("chess-tv");
    expect(modules.legendLeague?.dataset.fixtureModule).toBe("legend-league");
  });

  it("finds the redesigned desktop hosts and does not mistake Game History for Game Review", () => {
    const document = loadModernHomepageFixture();
    const modules = locateHomepageModules(document);

    expect(modules.layoutMode).toBe("desktop");
    expect(modules.leftColumn?.classList.contains("main-component")).toBe(true);
    expect(modules.rightColumn?.classList.contains("sidebar-component")).toBe(
      true
    );
    expect(modules.nativeActionColumn?.id).toBe("home-header");
    expect(modules.nativeLaunchTemplate?.href).toContain(
      "action=createLiveChallenge"
    );
    expect(modules.dailyGames).toBeNull();
    expect(modules.gameHistory?.dataset.fixtureModule).toBe("game-history");
    expect(modules.gameReview).toBeNull();
    expect(modules.puzzles).toBeNull();
    expect(modules.nextLesson).toBeNull();
    expect(modules.stats?.dataset.fixtureModule).toBe("stats");
    expect(modules.chessTv?.dataset.fixtureModule).toBe("chess-tv");
    expect(modules.legendLeague?.dataset.fixtureModule).toBe("legend-league");
    expect(modules.dailyPuzzle?.dataset.fixtureModule).toBe("daily-puzzle");
    expect(modules.friends?.dataset.fixtureModule).toBe("friends");
    expect(modules.streaks?.dataset.fixtureModule).toBe("streaks");
    expect(modules.badgesContainer?.dataset.fixtureModule).toBe("badges");
  });
});
