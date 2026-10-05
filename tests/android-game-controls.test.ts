import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { AndroidGameControlsController, isFirefoxAndroid } from "../src/content/android-game-controls";
import { DEFAULT_SETTINGS } from "../src/shared/settings";

it("guards supported native dock, preserves handlers/disabled state and restores on exit", () => {
  const fixture = new DOMParser().parseFromString(readFileSync("tests/fixtures/phone-game.html", "utf8"), "text/html");
  document.documentElement.innerHTML = fixture.documentElement.innerHTML;
  document.documentElement.className = "user-logged-in";
  const controller = new AndroidGameControlsController();
  const location = { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" };
  const dock = document.querySelector(".game-buttons-container-component")!;
  const next = dock.querySelector<HTMLButtonElement>('[aria-label="Next Move"]')!;
  const click = vi.fn(); next.addEventListener("click", click);
  expect(isFirefoxAndroid({ userAgent: "Mozilla Android Mobile Firefox/130.0" })).toBe(true);
  controller.reconcile(document, location, DEFAULT_SETTINGS, false);
  expect(dock.hasAttribute("data-chesscom-vinf-four-moves")).toBe(false);
  controller.reconcile(document, location, DEFAULT_SETTINGS, true);
  expect(dock.hasAttribute("data-chesscom-vinf-four-moves")).toBe(true);
  next.click(); expect(click).toHaveBeenCalledOnce();
  next.disabled = true; controller.reconcile(document, location, DEFAULT_SETTINGS, true);
  expect(next.disabled).toBe(true);
  for (const [path, settings] of [["/game/123456", { ...DEFAULT_SETTINGS, extremeOled: true }],
    ["/game/123456", { ...DEFAULT_SETTINGS, enabled: false }], ["/analysis/game/123456/review", DEFAULT_SETTINGS]] as const) {
    controller.reconcile(document, { ...location, pathname: path }, settings, true);
    expect(dock.hasAttribute("data-chesscom-vinf-four-moves")).toBe(false);
  }
  expect(dock.children).toHaveLength(5);
});

it.each([false, true])("supports saved analysis navigation with or without native play/pause (%s)", play => {
  document.documentElement.className = "user-logged-in";
  const names = ["First Move","Previous Move",...(play ? ["Play / Pause"] : []),"Next Move","Last Move"];
  document.body.innerHTML = '<div class="game-controls-primary-component">'+names.map(name=>`<button aria-label="${name}"></button>`).join('')+'</div>';
  const controller = new AndroidGameControlsController();
  controller.reconcile(document,{protocol:"https:",hostname:"www.chess.com",pathname:"/analysis/game/live/123/analysis"},DEFAULT_SETTINGS,true);
  expect(document.querySelector('[data-chesscom-vinf-four-moves]')).not.toBeNull();
});
