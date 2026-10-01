import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { startVinfRuntime } from "../src/content/runtime";
import { DEFAULT_SETTINGS } from "../src/shared/settings";

it("synchronizes desktop O/E, leaves T unhandled, and ignores typing, modifiers; supports Review E and leaves T unhandled", async () => {
  vi.useFakeTimers();
  const fixture = new DOMParser().parseFromString(readFileSync("tests/fixtures/phone-game.html", "utf8"), "text/html");
  document.documentElement.innerHTML = fixture.documentElement.innerHTML;
  document.documentElement.className = "user-logged-in";
  window.history.replaceState({}, "", "/game/123456");
  let saved = { ...DEFAULT_SETTINGS };
  const save = vi.fn(async next => { saved = next; });
  startVinfRuntime({ load: async () => saved, subscribe: () => {}, save });
  await vi.advanceTimersByTimeAsync(1);
  const press = async (key: string, target: Element = document.body, options = {}) => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...options }));
    await vi.advanceTimersByTimeAsync(1);
  };
  const time = () => document.querySelector('.chesscom-vinf-extreme-time.bottom')!;
  expect(document.documentElement.hasAttribute("data-chesscom-vinf-normal-clocks")).toBe(true);
  expect(time().getAttribute("aria-pressed")).toBeNull();
  await press("t"); expect(time().textContent).toBe("10:00");
  await press("o"); expect(saved.oledMode).toBe(true);
  await press("e"); expect(saved.extremeOled).toBe(true);
  const input = document.createElement("textarea"); document.body.append(input);
  await press("e", input); await press("o", document.body, { ctrlKey: true });
  expect(save).toHaveBeenCalledTimes(2);
  document.querySelector('#board-layout-player-bottom [role="timer"]')!.textContent = "0:59";
  await vi.advanceTimersByTimeAsync(20); await press("t");
  expect(time().getAttribute("aria-pressed")).toBeNull();
  expect(time().textContent).toBe("59");
  window.history.replaceState({}, "", "/analysis/game/123456/review");
  window.dispatchEvent(new PopStateEvent("popstate"));
  await press("e"); await press("t");
  expect(save).toHaveBeenCalledTimes(3);
  expect(saved.extremeOled).toBe(false);
  expect(document.querySelector('.chesscom-vinf-extreme-controls')).toBeNull();
  document.body.insertAdjacentHTML('beforeend', readFileSync('tests/fixtures/review-desktop-controls.html', 'utf8'));
  const best = document.querySelector<HTMLButtonElement>('.flow-buttons-component button:has([data-glyph="circle-fill-star"])')!;
  vi.spyOn(best, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
  const click = vi.fn(); best.addEventListener('click', click);
  await press('b'); expect(click).toHaveBeenCalledTimes(1);
  await press('b', best); expect(click).toHaveBeenCalledTimes(2); // native control may retain keyboard focus
  await press('b', document.body, {repeat:true}); expect(click).toHaveBeenCalledTimes(2);
  best.hidden = true; await press('b'); expect(click).toHaveBeenCalledTimes(2);
  best.hidden = false; best.disabled = true; await press('b');
  best.disabled = false; await press('b', input); await press('b', document.body, {ctrlKey:true});
  expect(click).toHaveBeenCalledTimes(2);
  best.remove(); // Best is absent when the played move is already best.
  const otherClicks = vi.fn();
  document.querySelectorAll('.flow-buttons-component button').forEach(button => button.addEventListener('click', otherClicks));
  await press('b'); expect(otherClicks).not.toHaveBeenCalled();
  // Retain the native narrow-layout variant without requiring English desktop text.
  document.body.insertAdjacentHTML('beforeend', '<div class="game-controls-view-component"><button aria-label="Best">Best</button></div>');
  const narrowBest = document.querySelector<HTMLButtonElement>('[aria-label="Best"]')!;
  vi.spyOn(narrowBest, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
  narrowBest.addEventListener('click', click);
  await press('b'); expect(click).toHaveBeenCalledTimes(3);
  window.history.replaceState({}, "", "/home");
  window.dispatchEvent(new PopStateEvent("popstate"));
  vi.clearAllTimers(); vi.useRealTimers();
});
