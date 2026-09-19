import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExtremeOledController, readClockSeconds } from "../src/content/extreme-oled-controller";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/shared/settings";

const location = { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" };
const settings = { ...DEFAULT_SETTINGS, extremeOled: true, extremeOledClocks: true };
let controller: ExtremeOledController;
beforeEach(() => {
  vi.useFakeTimers();
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
  it("defaults off and preserves the clock preference independently", () => {
    expect(normalizeSettings({}).extremeOled).toBe(false);
    expect(normalizeSettings({ extremeOled: true, extremeOledClocks: false })).toMatchObject({extremeOled: true, extremeOledClocks: false});
    expect(normalizeSettings({ extremeOled: "true", extremeOledClocks: 1 })).toMatchObject({extremeOled: false, extremeOledClocks: true});
  });
  it.each(["/home", "/play/online/new", "/analysis", "/game/daily/123"])("does not affect %s", pathname => {
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
    expect(document.querySelectorAll(".chesscom-vinf-extreme-controls button")).toHaveLength(2);
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
  it("hides both clocks when selected and restores the game UI on Escape", () => {
    controller.reconcile(document, location, { ...settings, extremeOledClocks: false });
    expect(bar("top").hidden && bar("bottom").hidden).toBe(true);
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
  it("supports the observed review board and omits clocks when none exist", () => {
    document.querySelector("wc-chess-board")!.id = "board-analysis-board";
    document.querySelectorAll(".clock-component").forEach(e=>e.remove());
    expect(controller.reconcile(document, { ...location, pathname: "/analysis/game/live/123/review" }, settings)).toBe(true);
    expect(bar("top").hidden && bar("bottom").hidden).toBe(true);
  });
});
it.each([["9:00",540],["0:09.8",9.8],["1:02:03",3723],["8,5",8.5],["Disconnected",null],["1:99",null],["-1",null]])("reads native timer %s", (text,seconds) => {
  expect(readClockSeconds(String(text))).toBe(seconds);
});
