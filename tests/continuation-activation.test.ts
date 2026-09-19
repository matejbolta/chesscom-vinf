import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { startVinfRuntime } from "../src/content/runtime";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import { loadResponsiveHomepageFixture } from "./test-utils";

const playing = JSON.parse(readFileSync(
  resolve(process.cwd(), "tests/fixtures/presence-rcn-playing.json"), "utf8"
));
const none = { users: [{ id: playing.users[0].id, activity: "none" }] };

it("refreshes at activation, deduplicates, falls back and cancels on disable/hide/departure", async () => {
  vi.useFakeTimers();
  const fixture = loadResponsiveHomepageFixture();
  document.documentElement.className = fixture.documentElement.className;
  document.documentElement.innerHTML = fixture.documentElement.innerHTML;
  const context = document.createElement("script");
  context.textContent = `context = {"user":{"uuid":"${playing.users[0].id}"}};`;
  document.head.append(context);
  const history = document.querySelector('[data-fixture-module="game-history"]')!;
  history.innerHTML = '<a href="/game/111">Newest finished</a><a href="/game/222">Older</a>';
  const navigate = vi.fn();
  const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    new Response(JSON.stringify(none))
  );
  let changeSettings!: (settings: typeof DEFAULT_SETTINGS) => void;
  startVinfRuntime({
    load: async () => DEFAULT_SETTINGS,
    subscribe: (listener) => { changeSettings = listener; }
  }, { fetch: fetcher, navigate });
  const action = () => document.querySelector<HTMLAnchorElement>(
    ".chesscom-vinf-game-continuation-action"
  )!;
  const activate = () => action().dispatchEvent(new MouseEvent("click", {
    bubbles: true, cancelable: true, button: 0
  }));
  const flush = () => vi.advanceTimersByTimeAsync(100);
  try {
    await flush();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(action().href).toBe("https://www.chess.com/game/111");
    await vi.advanceTimersByTimeAsync(3_000);
    expect(fetcher).toHaveBeenCalledTimes(1); // No background polling.

    // The actual failure sequence: homepage loaded with no game, then a mobile
    // RCN game begins. An activation must discover it despite the cached result.
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify(playing)));
    activate();
    activate();
    await flush();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("https://www.chess.com/game/987654321");
    document.body.append(document.createElement("div"));
    await flush();
    expect(action().href).toBe("https://www.chess.com/game/987654321");
    expect(document.querySelectorAll(".chesscom-vinf-game-continuation")).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(2);

    navigate.mockClear();
    activate(); // Game has finished; the fresh response is now "none".
    await flush();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("https://www.chess.com/game/111");
    expect(action().href).toBe("https://www.chess.com/game/111");

    // A request that stalls is aborted after four seconds, then falls back.
    navigate.mockClear();
    fetcher.mockImplementationOnce((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    activate();
    await vi.advanceTimersByTimeAsync(4_001);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("https://www.chess.com/game/111");

    for (const updated of [
      { ...DEFAULT_SETTINGS, enabled: false },
      { ...DEFAULT_SETTINGS, openGamePlacement: "hidden" as const }
    ]) {
      navigate.mockClear();
      let finish!: (response: Response) => void;
      fetcher.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
      activate();
      const signal = fetcher.mock.calls.at(-1)?.[1]?.signal;
      changeSettings(updated);
      expect(signal?.aborted).toBe(true);
      finish(new Response(JSON.stringify(playing)));
      await flush();
      expect(navigate).not.toHaveBeenCalled();
      changeSettings(DEFAULT_SETTINGS);
      await flush();
      expect(action().href).toBe("https://www.chess.com/game/111");
    }

    navigate.mockClear();
    let finish!: (response: Response) => void;
    fetcher.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    activate();
    window.history.replaceState({}, "", "/play");
    finish(new Response(JSON.stringify(playing)));
    await flush();
    expect(navigate).not.toHaveBeenCalled();
  } finally {
    changeSettings({ ...DEFAULT_SETTINGS, enabled: false });
    window.history.replaceState({}, "", "/home");
    vi.clearAllTimers();
    vi.useRealTimers();
  }
});
