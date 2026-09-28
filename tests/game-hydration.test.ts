import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { startVinfRuntime } from "../src/content/runtime";
import { DEFAULT_SETTINGS } from "../src/shared/settings";

it("applies a hydrated Android game and late native controls before polling, and restores on Review", async () => {
  vi.useFakeTimers();
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("Mozilla Android Mobile Firefox/130.0");
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {} }));
  const fixture = new DOMParser().parseFromString(readFileSync("tests/fixtures/phone-game.html", "utf8"), "text/html");
  document.documentElement.innerHTML = fixture.documentElement.innerHTML;
  document.documentElement.className = "user-logged-in";
  window.history.replaceState({}, "", "/play/online/new");
  const content = document.querySelector(".sidebar-content")!;
  const actions = document.querySelector(".game-icons-container-component")!;
  const dock = document.querySelector(".game-buttons-container-component")!;
  const resign = actions.querySelector(".resign-button-component")!;
  const board = document.querySelector("wc-chess-board")!;
  const boardMarkup = board.outerHTML;
  actions.remove(); dock.remove();
  let changeSettings: (settings: typeof DEFAULT_SETTINGS) => void = () => {};
  startVinfRuntime({ load: async () => DEFAULT_SETTINGS, subscribe: listener => { changeSettings = listener; } });
  await vi.advanceTimersByTimeAsync(1);
  expect(document.querySelector(".chesscom-vinf-extreme-controls")).toBeNull();

  // The native SPA replaces its route and hydrates without a popstate event.
  window.history.replaceState({}, "", "/game/123456");
  content.append(document.createElement("div"));
  await vi.advanceTimersByTimeAsync(30);
  expect(document.documentElement.hasAttribute("data-chesscom-vinf-phone-game")).toBe(true);
  expect(document.querySelector(".chesscom-vinf-extreme-controls")?.parentElement?.id).toBe("board-layout-chessboard");
  expect(document.querySelector(".chesscom-vinf-annotation-toggle")?.nextElementSibling?.classList.contains("clock-component")).toBe(true);
  content.append(actions, dock);
  await vi.advanceTimersByTimeAsync(30);
  expect(document.querySelector(".chesscom-vinf-phone-actions")?.contains(resign)).toBe(true);
  expect(dock.hasAttribute("data-chesscom-vinf-four-moves")).toBe(true);
  expect(board.outerHTML).toBe(boardMarkup);

  changeSettings({ ...DEFAULT_SETTINGS, enabled: false });
  expect(actions.contains(resign)).toBe(true);
  expect(document.querySelector(".chesscom-vinf-annotations")).toBeNull();
  changeSettings(DEFAULT_SETTINGS);
  window.history.replaceState({}, "", "/analysis/game/123456/review");
  content.append(document.createElement("div"));
  await vi.advanceTimersByTimeAsync(30);
  expect(document.querySelector(".chesscom-vinf-extreme-controls")).toBeNull();
  expect(document.querySelector(".chesscom-vinf-phone-actions")).toBeNull();
  expect(actions.contains(resign)).toBe(true);
  vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});
