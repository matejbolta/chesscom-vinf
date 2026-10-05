import { PhoneExperienceController } from "../src/content/phone-experience-controller";
import { AndroidGameControlsController } from "../src/content/android-game-controls";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startVinfRuntime } from "../src/content/runtime";
import {
  MARKERS,
  RECONCILE_DELAY_MS,
  ROUTE_CHECK_INTERVAL_MS
} from "../src/shared/constants";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import { loadResponsiveHomepageFixture } from "./test-utils";

afterEach(() => {
  window.history.replaceState({}, "", "/home");
  document.documentElement.removeAttribute(MARKERS.active);
  document.documentElement.removeAttribute(MARKERS.oled);
  document.documentElement.removeAttribute(MARKERS.oledButtons);
  document.documentElement.removeAttribute(MARKERS.dailyPlacement);
  document.documentElement.removeAttribute(MARKERS.recommendedPlacement);
  document.documentElement.removeAttribute(MARKERS.gameHistoryPlacement);
  document.documentElement.removeAttribute(MARKERS.nativePlayPanel);
  document.documentElement.removeAttribute(MARKERS.sidebarHidden);
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("responsive runtime lifecycle", () => {
  it("applies and removes the OLED marker from saved settings", async () => {
    vi.useFakeTimers();
    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;
    let settingsListener:
      | ((settings: typeof DEFAULT_SETTINGS) => void)
      | undefined;

    startVinfRuntime({
      load: async () => ({ ...DEFAULT_SETTINGS, oledMode: true }),
      subscribe: (listener) => {
        settingsListener = listener;
      }
    });
    await Promise.resolve();

    expect(document.documentElement.getAttribute(MARKERS.oled)).toBe("true");
    settingsListener?.({ ...DEFAULT_SETTINGS, oledMode: false });
    expect(document.documentElement.hasAttribute(MARKERS.oled)).toBe(false);
  });

  it("toggles OLED background and button palette together", async () => {
    vi.useFakeTimers();
    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;
    let settingsListener:
      | ((settings: typeof DEFAULT_SETTINGS) => void)
      | undefined;

    startVinfRuntime({
      load: async () => ({ ...DEFAULT_SETTINGS, oledMode: true }),
      subscribe: (listener) => {
        settingsListener = listener;
      }
    });
    await Promise.resolve();

    expect(document.documentElement.getAttribute(MARKERS.oledButtons)).toBe(
      "true"
    );
    expect(document.documentElement.hasAttribute(MARKERS.oled)).toBe(true);
    settingsListener?.({ ...DEFAULT_SETTINGS, oledMode: false });
    expect(document.documentElement.hasAttribute(MARKERS.oledButtons)).toBe(
      false
    );
    expect(document.documentElement.hasAttribute(MARKERS.oled)).toBe(false);
  });

  it("applies OLED on Chess.com's current numeric live-game route", async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/game/183987646934");
    document.documentElement.className = "user-logged-in";
    document.body.replaceChildren();

    startVinfRuntime({
      load: async () => ({ ...DEFAULT_SETTINGS, oledMode: true }),
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(document.documentElement.getAttribute(MARKERS.oled)).toBe("true");
  });

  it("applies OLED on Chess.com's alternate live-game route", async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/live/game/183987646934");
    document.documentElement.className = "user-logged-in";
    document.body.replaceChildren();

    startVinfRuntime({
      load: async () => ({ ...DEFAULT_SETTINGS, oledMode: true }),
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(document.documentElement.getAttribute(MARKERS.oled)).toBe("true");
  });

  it("keeps OLED on through matchmaking and removes it on an unsupported route", async () => {
    vi.useFakeTimers();
    window.history.replaceState(
      {},
      "",
      "/play/online/new?action=createLiveChallenge&base=600&timeIncrement=0"
    );
    document.documentElement.className = "user-logged-in";
    document.body.replaceChildren();

    startVinfRuntime({
      load: async () => ({ ...DEFAULT_SETTINGS, oledMode: true }),
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(document.documentElement.hasAttribute(MARKERS.oled)).toBe(true);

    window.history.replaceState({}, "", "/game/183987646934");
    await vi.advanceTimersByTimeAsync(ROUTE_CHECK_INTERVAL_MS);

    expect(document.documentElement.getAttribute(MARKERS.oled)).toBe("true");
    window.history.replaceState({}, "", "/puzzles");
    await vi.advanceTimersByTimeAsync(ROUTE_CHECK_INTERVAL_MS);
    expect(document.documentElement.hasAttribute(MARKERS.oled)).toBe(false);
  });

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

  it("notices a native active-game link that appears outside the observed root", async () => {
    vi.useFakeTimers();
    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;
    const historyFallback = document.createElement("a");
    historyFallback.href = "https://www.chess.com/game/111111";
    document
      .querySelector('[data-fixture-module="game-history"]')!
      .append(historyFallback);

    startVinfRuntime({
      load: async () => DEFAULT_SETTINGS,
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(
      document
        .querySelector(".chesscom-vinf-game-continuation a")
        ?.getAttribute("href")
    ).toBe("https://www.chess.com/game/111111");

    const activeGameLink = document.createElement("a");
    activeGameLink.href = "https://www.chess.com/game/live/654321";
    activeGameLink.hidden = true;
    document.body.append(activeGameLink);
    await vi.advanceTimersByTimeAsync(750);

    expect(
      document
        .querySelector(".chesscom-vinf-game-continuation a")
        ?.getAttribute("href")
    ).toBe("https://www.chess.com/game/live/654321");
  });

  it("replaces the history fallback with the current user's presence game", async () => {
    vi.useFakeTimers();
    const fixture = loadResponsiveHomepageFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;
    const userUuid = "12345678-1234-1234-1234-123456789abc";
    const context = document.createElement("script");
    context.textContent = `context = {"user":{"uuid":"${userUuid}"}};`;
    document.head.append(context);
    const historyFallback = document.createElement("a");
    historyFallback.href = "https://www.chess.com/game/111111";
    document
      .querySelector('[data-fixture-module="game-history"]')!
      .append(historyFallback);
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          users: [
            {
              id: userUuid,
              activity: "playing",
              activityContext: {
                games: [{ source: "live_chess", numericId: 654321 }]
              }
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    startVinfRuntime(
      {
        load: async () => DEFAULT_SETTINGS,
        subscribe: () => undefined
      },
      { fetch: fetcher }
    );
    await vi.advanceTimersByTimeAsync(0);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(
      document
        .querySelector(".chesscom-vinf-game-continuation a")
        ?.getAttribute("href")
    ).toBe("https://www.chess.com/game/live/654321");
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
        recommendedMatchPlacement: "hidden",
        gameHistoryPlacement: "hidden",
        homepageSidebarVisible: DEFAULT_SETTINGS.homepageSidebarVisible.filter(
          (id) =>
            id !== "daily-games" &&
            id !== "chess-tv" &&
            id !== "legend-league"
        )
      }),
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(document.documentElement.getAttribute(MARKERS.active)).toBe("true");
    expect(
      document.documentElement.getAttribute(MARKERS.dailyPlacement)
    ).toBe("hidden");
    expect(
      document.documentElement.getAttribute(MARKERS.recommendedPlacement)
    ).toBe("hidden");
    expect(
      document.documentElement.getAttribute(MARKERS.gameHistoryPlacement)
    ).toBe("hidden");
    expect(document.documentElement.getAttribute(MARKERS.sidebarHidden)).toBe(
      "chess-tv daily-games legend-league"
    );
  });
});

it('uses phone gameplay presentation on narrow desktop as well as Firefox Android', async () => {
  vi.useFakeTimers();
  const width=vi.spyOn(window,'innerWidth','get').mockReturnValue(390);
  const media=vi.spyOn(window,'matchMedia').mockImplementation(()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}) as unknown as MediaQueryList);
  const phone=vi.spyOn(PhoneExperienceController.prototype,'reconcile');
  const dock=vi.spyOn(AndroidGameControlsController.prototype,'reconcile');
  for (const agent of ['Desktop Chrome','Mozilla Android Firefox/130']) {
    const ua=vi.spyOn(window.navigator,'userAgent','get').mockReturnValue(agent);
    window.history.replaceState({},'', '/game/123456');
    document.documentElement.className='user-logged-in'; document.body.replaceChildren();
    startVinfRuntime({load:async()=>({...DEFAULT_SETTINGS}),subscribe:()=>{}});
    await Promise.resolve(); await Promise.resolve();
    expect(phone.mock.calls.at(-1)?.slice(3)).toEqual([true,true]);
    expect(dock.mock.calls.at(-1)?.[3]).toBe(true);
    ua.mockRestore();
  }
  width.mockRestore(); media.mockRestore(); phone.mockRestore(); dock.mockRestore();
});
