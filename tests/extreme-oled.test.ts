import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExtremeOledController, readClockSeconds } from "../src/content/extreme-oled-controller";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/shared/settings";

const location = { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" };
const settings = { ...DEFAULT_SETTINGS, extremeOled: true };
let controller: ExtremeOledController;
beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  document.documentElement.innerHTML = readFileSync(resolve(process.cwd(), "tests/fixtures/extreme-oled.html"), "utf8");
  document.documentElement.className = "user-logged-in";
  controller = new ExtremeOledController();
});
afterEach(() => {
  controller.cleanup(document);
  vi.clearAllTimers();
  vi.useRealTimers();
});
const bar = (side: string) => document.querySelector<HTMLElement>(`.chesscom-vinf-extreme-clock.${side}`)!;
const clock = (side: string) => document.querySelector(`#board-layout-player-${side} [role="timer"]`)!;

describe("Extreme OLED", () => {
  it("defaults off and discards the retired clock-bars preference", () => {
    expect(normalizeSettings({}).extremeOled).toBe(false);
    expect(normalizeSettings({ extremeOled: true, extremeOledClocks: false })).toMatchObject({extremeOled: true});
    expect(normalizeSettings({ extremeOledClocks: false })).not.toHaveProperty("extremeOledClocks");
    expect(normalizeSettings({ extremeOled: "true", extremeOledClocks: 1 })).toMatchObject({extremeOled: false});
  });
  it.each(["/home", "/play/online/new", "/analysis", "/game/daily/123", "/analysis/game/live/123/review", "/analysis/game/123/review"])("does not affect %s", pathname => {
    expect(controller.reconcile(document, { ...location, pathname }, settings)).toBe(false);
    expect(document.querySelector(".chesscom-vinf-extreme-controls")).toBeNull();
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-extreme-oled")).toBe(false);
  });
  it("requires a signed-in supported host and a known primary board", () => {
    expect(controller.reconcile(document, { ...location, hostname: "other.test" }, settings)).toBe(false);
    document.documentElement.className = "";
    expect(controller.reconcile(document, location, settings)).toBe(false);
    document.documentElement.className = "user-logged-in";
    document.querySelector("wc-chess-board")!.id = "mini-board";
    expect(controller.reconcile(document, location, settings)).toBe(false);
  });
  it("keeps the original board and forwards only previous/next native actions", () => {
    const board = document.querySelector("wc-chess-board")!;
    const original = board.outerHTML;
    const native = document.querySelector<HTMLButtonElement>('.game-buttons-container-component [aria-label="Previous Move"]')!;
    const click = vi.fn(); native.addEventListener("click", click);
    controller.reconcile(document, location, settings);
    controller.reconcile(document, location, settings);
    expect(document.querySelector("wc-chess-board")).toBe(board);
    expect(document.querySelectorAll(".chesscom-vinf-extreme-controls")).toHaveLength(1);
    expect(document.querySelectorAll(".chesscom-vinf-extreme-controls nav button")).toHaveLength(2);
    const proxy = document.querySelector<HTMLButtonElement>('.chesscom-vinf-extreme-controls [aria-label="Previous Move"]')!;
    proxy.click(); expect(click).toHaveBeenCalledTimes(1);
    native.disabled = true;
    controller.reconcile(document, location, settings);
    expect(proxy.disabled).toBe(true);
    proxy.click(); expect(click).toHaveBeenCalledTimes(1);
    controller.cleanup(document);
    expect(board.outerHTML).toBe(original);
    expect(document.querySelector(".chesscom-vinf-extreme-controls")).toBeNull();
  });
  it("uses edge-inset clocks and omits navigation only on desktop Extreme", () => {
    const board = document.querySelector<HTMLElement>("wc-chess-board")!;
    vi.spyOn(board, "getBoundingClientRect").mockReturnValue({left: 100, top: 100, width: 560, height: 560} as DOMRect);
    for (const side of ["top", "bottom"]) {
      const native = clock(side).closest<HTMLElement>(".clock-component")!;
      vi.spyOn(native, "getBoundingClientRect").mockReturnValue({left: 580, top: side === "top" ? 48 : 668, width: 80, height: 44} as DOMRect);
    }
    const positions = () => [...document.querySelectorAll<HTMLElement>('.chesscom-vinf-extreme-time')].map(time => time.style.cssText);
    controller.reconcile(document, location, DEFAULT_SETTINGS, true, true);
    expect(positions().every(position => position.includes("left: 480px"))).toBe(true);
    controller.reconcile(document, location, settings, true, true);
    expect(document.querySelector('.chesscom-vinf-desktop-extreme-controls')).not.toBeNull();
    expect(document.querySelector<HTMLElement>('.chesscom-vinf-extreme-time.top')!.style.left).toBe('');
    expect(document.querySelector('.chesscom-vinf-extreme-controls nav')).toBeNull();
    controller.reconcile(document, location, settings, true, false);
    expect(document.querySelectorAll('.chesscom-vinf-extreme-controls nav button')).toHaveLength(2);
    expect(document.querySelector<HTMLElement>('.chesscom-vinf-extreme-time.top')!.style.left).toBe('');
    controller.reconcile(document, location, {...settings, enabled: false}, true, true);
    expect(document.querySelector('.chesscom-vinf-extreme-controls')).toBeNull();
  });
  it("follows native clock changes, increments and low time without simulating time", async () => {
    controller.reconcile(document, location, settings);
    clock("bottom").textContent = "5:00";
    await vi.advanceTimersByTimeAsync(20);
    expect(bar("bottom").getAttribute("aria-valuenow")).toBe("300");
    expect(bar("bottom").firstElementChild!.getAttribute("style")).toContain("0.5");
    await vi.advanceTimersByTimeAsync(10_000);
    expect(bar("bottom").getAttribute("aria-valuenow")).toBe("300");
    clock("bottom").textContent = "0:20.5";
    await vi.advanceTimersByTimeAsync(20);
    expect(bar("bottom").dataset.low).toBe("true");
    clock("bottom").textContent = "10:05";
    await vi.advanceTimersByTimeAsync(20);
    expect(bar("bottom").getAttribute("aria-valuemax")).toBe("605");
    expect(bar("bottom").dataset.low).toBe("false");
    clock("top").textContent = "Disconnected";
    await vi.advanceTimersByTimeAsync(20);
    expect(bar("top").hidden).toBe(true);
  });
  it("preserves the bar reference through reload/mode switches, separates games and follows paused state", async () => {
    controller.reconcile(document, location, settings);
    clock("bottom").textContent = "5:00";
    await vi.advanceTimersByTimeAsync(20);
    expect(bar("top").dataset.paused).toBe("true");
    expect(bar("bottom").dataset.paused).toBe("false");
    controller.cleanup(document);
    controller = new ExtremeOledController(); // Reload with only the remaining native time.
    controller.reconcile(document, location, settings);
    expect(bar("bottom").getAttribute("aria-valuemax")).toBe("600");
    expect(bar("bottom").firstElementChild!.getAttribute("style")).toContain("0.5");
    controller.reconcile(document, location, DEFAULT_SETTINGS, true);
    expect(bar("bottom").getAttribute("aria-valuemax")).toBe("600");
    clock("bottom").parentElement!.classList.remove("clock-player-turn");
    clock("top").parentElement!.classList.add("clock-player-turn");
    await vi.advanceTimersByTimeAsync(20);
    expect(bar("bottom").dataset.paused).toBe("true");
    controller.reconcile(document, {...location, pathname: "/game/654321"}, settings);
    expect(bar("bottom").getAttribute("aria-valuemax")).toBe("300");
  });

  it("always shows both valid clock bars and restores the game UI on Escape", () => {
    controller.reconcile(document, location, normalizeSettings({ ...settings, extremeOledClocks: false }));
    expect(bar("top").hidden || bar("bottom").hidden).toBe(false);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(controller.reconcile(document, location, settings)).toBe(false);
    controller.reconcile(document, location, { ...settings, extremeOled: false });
    expect(controller.reconcile(document, location, settings)).toBe(true);
  });
  it("restores on disable/departure and replaces detached native boards without duplicates", async () => {
    controller.reconcile(document, location, settings);
    const oldBoard = document.querySelector("wc-chess-board")!;
    const replacement = oldBoard.cloneNode(true) as HTMLElement;
    oldBoard.replaceWith(replacement);
    await vi.advanceTimersByTimeAsync(20);
    expect(oldBoard.hasAttribute("data-chesscom-vinf-extreme-board")).toBe(false);
    expect(document.querySelectorAll(".chesscom-vinf-extreme-controls")).toHaveLength(1);
    controller.reconcile(document, location, { ...settings, enabled: false });
    expect(replacement.hasAttribute("data-chesscom-vinf-extreme-board")).toBe(false);
    controller.reconcile(document, location, settings);
    controller.reconcile(document, { ...location, pathname: "/home" }, settings);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-extreme-oled")).toBe(false);
  });
  it("leaves an analysis board native even before a route transition completes", () => {
    controller.reconcile(document, location, settings);
    document.querySelector("wc-chess-board")!.id = "board-analysis-board";
    expect(controller.reconcile(document, location, settings)).toBe(false);
    expect(document.querySelector(".chesscom-vinf-extreme-controls")).toBeNull();
  });
  it("always displays read-only times, including low time and increments", async () => {
    controller.reconcile(document, location, settings);
    const top = document.querySelector<HTMLElement>(".chesscom-vinf-extreme-time.top")!;
    const bottom = document.querySelector<HTMLElement>(".chesscom-vinf-extreme-time.bottom")!;
    expect([top.textContent, bottom.textContent]).toEqual(["10:00", "10:00"]);
    expect(top.tagName).toBe("DIV");
    expect(top.getAttribute("role")).toBe("timer");
    expect(top.hasAttribute("aria-pressed")).toBe(false);
    top.click(); bottom.click();
    expect([top.textContent, bottom.textContent]).toEqual(["10:00", "10:00"]);
    clock("bottom").textContent = "0:59.9";
    await vi.advanceTimersByTimeAsync(20);
    expect(bottom.textContent).toBe("59");
    clock("bottom").textContent = "1:04";
    await vi.advanceTimersByTimeAsync(20);
    expect(bottom.textContent).toBe("1:04");
  });
  it("uses the native turn class and never guesses during ambiguous states", async () => {
    controller.reconcile(document, location, normalizeSettings({ ...settings, extremeOledClocks: false }));
    const top = document.querySelector<HTMLElement>(".chesscom-vinf-extreme-turn.top")!;
    const bottom = document.querySelector<HTMLElement>(".chesscom-vinf-extreme-turn.bottom")!;
    expect([top.hidden, bottom.hidden]).toEqual([true, false]);
    clock("bottom").parentElement!.classList.remove("clock-player-turn");
    clock("top").parentElement!.classList.add("clock-player-turn");
    await vi.advanceTimersByTimeAsync(20);
    expect([top.hidden, bottom.hidden]).toEqual([false, true]);
    clock("bottom").parentElement!.classList.add("clock-player-turn");
    await vi.advanceTimersByTimeAsync(20);
    expect([top.hidden, bottom.hidden]).toEqual([true, true]);
  });
  it("ignores an old saved bars-off setting and keeps times visible", async () => {
    controller.reconcile(document, location, normalizeSettings({ ...settings, extremeOledClocks: false }));
    const top = document.querySelector<HTMLButtonElement>(".chesscom-vinf-extreme-time.top")!;
    const bottom = document.querySelector<HTMLButtonElement>(".chesscom-vinf-extreme-time.bottom")!;
    expect(top.hidden || bottom.hidden).toBe(false);
    top.click();
    expect([top.textContent, bottom.textContent]).toEqual(["10:00", "10:00"]);
    top.click();
    clock("top").textContent = "0:42.5";
    await vi.advanceTimersByTimeAsync(20);
    bottom.click();
    expect([top.textContent, bottom.textContent]).toEqual(["42", "10:00"]);
    expect(bar("top").hidden || bar("bottom").hidden).toBe(false);
  });
  it.each(["modal", "player", "result"])("releases the native end screen on %s evidence and stays released", async kind => {
    controller.reconcile(document, location, settings);
    if (kind === "modal") document.querySelector("#board-layout-chessboard")!.insertAdjacentHTML("beforeend", '<div class="game-over-modal-shell-container">Game Review</div>');
    if (kind === "player") document.querySelector("#board-layout-player-top")!.insertAdjacentHTML("beforeend", '<div class="player-game-over-component">Won</div>');
    if (kind === "result") document.body.insertAdjacentHTML("beforeend", '<div id="board-layout-sidebar"><span class="game-result">0-1</span></div>');
    await vi.advanceTimersByTimeAsync(20);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-extreme-oled")).toBe(false);
    expect(document.querySelector(".chesscom-vinf-extreme-controls")).toBeNull();
    document.querySelectorAll(".game-over-modal-shell-container, .player-game-over-component, .game-result").forEach(e => e.remove());
    expect(controller.reconcile(document, location, settings)).toBe(false);
    expect(controller.reconcile(document, { ...location, pathname: "/game/654321" }, settings)).toBe(true);
  });
  it("does not mistake a hidden result or a zero clock for a finished game", async () => {
    document.body.insertAdjacentHTML("beforeend", '<div hidden><div class="game-over-modal-shell-container"></div></div>');
    clock("bottom").textContent = "0:00";
    expect(controller.reconcile(document, location, settings)).toBe(true);
    document.querySelector<HTMLElement>("[hidden]")!.hidden = false;
    await vi.advanceTimersByTimeAsync(20);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-extreme-oled")).toBe(false);
  });
  it("stays off from game end through Game Review moves, then resumes for a new live game", async () => {
    controller.reconcile(document, location, settings);
    document.querySelector("#board-layout-player-top")!.insertAdjacentHTML("beforeend", '<div class="player-game-over-component">Won</div>');
    await vi.advanceTimersByTimeAsync(20);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-extreme-oled")).toBe(false);
    document.querySelector(".player-game-over-component")!.remove();
    const reviewLocation = { ...location, pathname: "/analysis/game/live/123/review" };
    expect(controller.reconcile(document, reviewLocation, settings)).toBe(false);
    document.body.insertAdjacentHTML("beforeend", '<div class="sidebar-view-content"><div class="move-by-move-container"><div class="move-by-move-component"></div></div></div>');
    await vi.advanceTimersByTimeAsync(20);
    expect(controller.reconcile(document, reviewLocation, settings)).toBe(false);
    expect(document.querySelector(".chesscom-vinf-extreme-controls")).toBeNull();
    document.querySelector(".move-by-move-container")!.remove();
    expect(controller.reconcile(document, reviewLocation, settings)).toBe(false);
    expect(controller.reconcile(document, { ...location, pathname: "/game/654321" }, settings)).toBe(true);
  });
  it("never rewrites native sizing, positioning, touch behavior or piece transforms", () => {
    const stage = document.querySelector<HTMLElement>("#board-layout-chessboard")!;
    const board = document.querySelector<HTMLElement>("wc-chess-board")!;
    board.style.cssText = "height:0;padding-bottom:100%;touch-action:none";
    stage.style.cssText = "width:360px;position:relative";
    const before = stage.outerHTML;
    controller.reconcile(document, location, settings);
    expect(board.style.height).toBe("0px");
    expect(stage.style.width).toBe("360px");
    controller.cleanup(document);
    expect(stage.outerHTML).toBe(before);
    expect(document.querySelector(".chesscom-vinf-extreme-scroll-room")).toBeNull();
  });
});
it.each([["9:00",540],["0:09.8",9.8],["1:02:03",3723],["8,5",8.5],["Disconnected",null],["1:99",null],["-1",null]])("reads native timer %s", (text,seconds) => {
  expect(readClockSeconds(String(text))).toBe(seconds);
});

it("uses read-only clocks in both normal and Extreme layouts", () => {
  document.documentElement.setAttribute("data-chesscom-vinf-phone-material", "");
  for (const extremeOled of [false, true]) {
    controller.reconcile(document, location, {...DEFAULT_SETTINGS, extremeOled}, true);
    const time = document.querySelector<HTMLElement>('.chesscom-vinf-extreme-time.bottom')!;
    expect(time.tagName).toBe('DIV');
    expect(time.textContent).toBe('10:00');
    time.click();
    expect(time.textContent).toBe('10:00');
  }
  document.documentElement.removeAttribute("data-chesscom-vinf-phone-material");
  controller.reconcile(document, location, settings);
  expect(document.querySelector<HTMLElement>('.chesscom-vinf-extreme-time.bottom')!.style.left).toBe('');
});

it("sizes the turn dot, pulses only on a player change, and warns for low time or a long move", async () => {
  const animate = vi.fn();
  let now = 0;
  const nowSpy = vi.spyOn(window.performance, "now").mockImplementation(() => now);
  vi.stubGlobal('matchMedia', () => ({matches: false}));
  controller.reconcile(document, location, {...DEFAULT_SETTINGS, turnDotSize: 16, turnAnimationDuration: 2500, turnPulseScale: 5}, true);
  const top = document.querySelector<HTMLElement>('.chesscom-vinf-extreme-turn.top')!;
  const bottom = document.querySelector<HTMLElement>('.chesscom-vinf-extreme-turn.bottom')!;
  Object.assign(top, {animate}); Object.assign(bottom, {animate});
  expect(top.parentElement!.style.getPropertyValue('--vinf-turn-size')).toBe('16px');
  now = 60_001;
  await vi.advanceTimersByTimeAsync(60_001);
  clock('bottom').textContent = '8:59';
  await vi.advanceTimersByTimeAsync(20);
  expect(bottom.dataset.low).toBe('true'); expect(animate).not.toHaveBeenCalled();
  clock('bottom').parentElement!.classList.remove('clock-player-turn');
  clock('top').parentElement!.classList.add('clock-player-turn');
  await vi.advanceTimersByTimeAsync(20);
  expect(top.dataset.low).toBe('false'); expect(animate).toHaveBeenCalledTimes(1);
  clock('top').textContent = '0:59';
  await vi.advanceTimersByTimeAsync(20);
  expect(top.dataset.low).toBe('true'); expect(animate).toHaveBeenCalledTimes(1);
  // Native board flip repositions the same color, not a new turn.
  const topClock = clock('top').parentElement!;
  const bottomClock = clock('bottom').parentElement!;
  document.querySelector('#board-layout-player-bottom')!.append(topClock);
  document.querySelector('#board-layout-player-top')!.append(bottomClock);
  await vi.advanceTimersByTimeAsync(20);
  expect(bottom.hidden).toBe(false);
  expect(animate).toHaveBeenCalledTimes(1);
  expect(animate).toHaveBeenLastCalledWith(expect.any(Array), {duration: 2500, easing: "ease-out"});
  expect(animate.mock.calls[0][0][0].transform).toBe('scale(3)'); // 16 × 5 capped at 48px.
  controller.reconcile(document, location, {...DEFAULT_SETTINGS, turnDotSize: 8, turnPulseScale: 5}, true);
  topClock.classList.remove('clock-player-turn'); bottomClock.classList.add('clock-player-turn');
  await vi.advanceTimersByTimeAsync(20);
  expect(animate.mock.calls.at(-1)![0][0].transform).toBe('scale(5)'); // Small dot keeps full multiplier.
  const cancel = vi.fn();
  Object.assign(bottom, {getAnimations: () => [{cancel}]});
  controller.reconcile(document, location, {...DEFAULT_SETTINGS, turnAnimationDuration: 0}, true);
  expect(cancel).toHaveBeenCalled();
  bottomClock.classList.remove('clock-player-turn'); topClock.classList.add('clock-player-turn');
  await vi.advanceTimersByTimeAsync(20);
  expect(animate).toHaveBeenCalledTimes(2);
  nowSpy.mockRestore();
  vi.unstubAllGlobals();
});

it.each([false, true])("shows the native last move opposite the active dot (Extreme %s)", async extremeOled => {
  document.body.insertAdjacentHTML('beforeend', readFileSync('tests/fixtures/live-last-move.html', 'utf8'));
  controller.reconcile(document, location, {...DEFAULT_SETTINGS, extremeOled}, true, true);
  const last = (side: string) => document.querySelector<HTMLElement>(`.chesscom-vinf-last-move.${side}`)!;
  expect(last('top').textContent).toBe('dxc7+');
  expect(last('top').hidden).toBe(false); expect(last('bottom').hidden).toBe(true);
  const list = document.querySelector('wc-simple-move-list')!;
  const read = vi.spyOn(list, 'querySelectorAll');
  clock('bottom').textContent = '0:59'; await vi.advanceTimersByTimeAsync(20);
  expect(last('top').dataset.low).toBe('false'); // Matches its own clock, not the running opponent clock.
  expect(read).not.toHaveBeenCalled(); // Clock ticks reuse notation, no list scans.
  list.querySelector('.main-line-row:last-child')!.insertAdjacentHTML('beforeend',
    '<div class="node white-move main-line-ply" data-node="0-4"><span class="node-highlight-content"><span data-figurine="N"></span>f3</span></div>');
  clock('bottom').parentElement!.classList.remove('clock-player-turn');
  clock('top').parentElement!.classList.add('clock-player-turn');
  await vi.advanceTimersByTimeAsync(20);
  expect(last('bottom').textContent).toBe('Nf3'); expect(last('bottom').hidden).toBe(false);
  expect(last('top').hidden).toBe(true); expect(last('bottom').dataset.low).toBe('true');
  const topClock = clock('top').parentElement!;
  const bottomClock = clock('bottom').parentElement!;
  document.querySelector('#board-layout-player-bottom')!.append(topClock);
  document.querySelector('#board-layout-player-top')!.append(bottomClock);
  await vi.advanceTimersByTimeAsync(20);
  expect(last('top').textContent).toBe('Nf3'); expect(last('bottom').hidden).toBe(true);
  list.querySelector('[data-node="0-4"] .node-highlight-content')!.textContent = 'c8=Q#';
  await vi.advanceTimersByTimeAsync(20);
  expect(last('top').textContent).toBe('c8=Q#');
  controller.reconcile(document, {...location, pathname:'/analysis/game/123456/review'}, {...DEFAULT_SETTINGS, extremeOled}, true, true);
  expect(document.querySelector('.chesscom-vinf-last-move')).toBeNull();
});
