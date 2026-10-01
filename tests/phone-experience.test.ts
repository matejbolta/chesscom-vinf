import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhoneExperienceController } from "../src/content/phone-experience-controller";
import { PhoneGameEntry } from "../src/content/phone-game-entry";
import { DEFAULT_SETTINGS } from "../src/shared/settings";

const game = { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" };
const review = { ...game, pathname: "/analysis/game/live/123456/review" };
const controller = new PhoneExperienceController();
const marker = "data-chesscom-vinf-phone-game";
function fixture(name = "phone-game") {
  const html = readFileSync(`tests/fixtures/${name}.html`, "utf8");
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, "text/html").documentElement.innerHTML;
  document.documentElement.className = "user-logged-in";
}
afterEach(() => { controller.cleanup(document); vi.useRealTimers(); });

describe("phone play and review", () => {
  it("keeps native move nodes/listeners and handles appended/replaced rows, failing open on changed renderers", async () => {
    vi.useFakeTimers(); fixture();
    const wrapper = document.querySelector<HTMLElement>(".timestamps-with-base-time")!;
    const opening = document.querySelector(".eco-opening-component")!;
    const scroll = document.querySelector("#live-game-tab-scroll-container")!;
    expect(opening.nextElementSibling).toBe(scroll);
    const first = wrapper.firstElementChild!;
    const node = first.querySelector<HTMLElement>(".node")!;
    const click = vi.fn(); node.addEventListener("click", click);
    const board = document.querySelector("#board-single")!;
    const boardMarkup = board.outerHTML;
    controller.reconcile(document, game, DEFAULT_SETTINGS, true);
    expect(document.documentElement.hasAttribute(marker)).toBe(true);
    expect(wrapper.firstElementChild).toBe(first);
    expect(scroll.nextElementSibling).toBe(opening);
    expect((wrapper.lastElementChild as HTMLElement).style.getPropertyValue("--chesscom-vinf-move-order")).toBe("-20");
    node.click(); expect(click).toHaveBeenCalledOnce();
    const next = first.cloneNode(true) as HTMLElement;
    next.dataset.wholeMoveNumber = "21"; wrapper.append(next);
    await vi.advanceTimersByTimeAsync(65);
    expect(next.style.getPropertyValue("--chesscom-vinf-move-order")).toBe("-21");
    next.querySelector(".black-move")!.textContent = "Nf6";
    await vi.advanceTimersByTimeAsync(65);
    expect(next.textContent).toContain("Nf6");
    const replacement = next.cloneNode(true); next.replaceWith(replacement);
    await vi.advanceTimersByTimeAsync(65);
    expect(wrapper.lastElementChild).toBe(replacement);
    expect(board.outerHTML).toBe(boardMarkup);
    wrapper.append(document.createElement("div"));
    await vi.advanceTimersByTimeAsync(65);
    expect(wrapper.hasAttribute("data-chesscom-vinf-newest-first")).toBe(false);
    expect((first as HTMLElement).style.getPropertyValue("--chesscom-vinf-move-order")).toBe("");
    controller.cleanup(document);
    expect(opening.nextElementSibling).toBe(scroll);
  });

  it("restores on disable, tablet, home and review transitions; latches native game end", () => {
    fixture();
    for (const [location, settings, phone] of [
      [game, { ...DEFAULT_SETTINGS, enabled: false }, true],
      [game, DEFAULT_SETTINGS, false],
      [{ ...game, pathname: "/home" }, DEFAULT_SETTINGS, true],
      [review, DEFAULT_SETTINGS, true]
    ] as const) {
      controller.reconcile(document, game, DEFAULT_SETTINGS, true);
      expect(document.documentElement.hasAttribute(marker)).toBe(true);
      controller.reconcile(document, location, settings, phone);
      expect(document.documentElement.hasAttribute(marker)).toBe(false);
      expect(document.querySelector('[data-chesscom-vinf-newest-first]')).toBeNull();
    }
    controller.reconcile(document, game, DEFAULT_SETTINGS, true);
    document.querySelector('[role="timer"]')!.textContent = "0:00";
    controller.reconcile(document, game, DEFAULT_SETTINGS, true);
    expect(document.documentElement.hasAttribute(marker)).toBe(true);
    const result = document.createElement("div"); result.className = "game-result"; result.textContent = "1-0";
    document.querySelector("#board-layout-sidebar")!.append(result);
    controller.reconcile(document, game, DEFAULT_SETTINGS, true); result.remove();
    controller.reconcile(document, game, DEFAULT_SETTINGS, true);
    expect(document.documentElement.hasAttribute(marker)).toBe(false);
  });

  it("mutes through the native handler before hiding, watches re-enable and restores presentation", async () => {
    vi.useFakeTimers(); fixture("game-review-narrow");
    const button = document.querySelector<HTMLButtonElement>('[aria-label="Toggle Coach Audio"]')!;
    const svg = button.querySelector("svg")!;
    svg.setAttribute("data-glyph", "media-audio-speaker");
    const click = vi.fn(() => svg.setAttribute("data-glyph", "media-audio-speaker-mute"));
    button.addEventListener("click", click);
    controller.reconcile(document, review, DEFAULT_SETTINGS, true);
    expect(click).toHaveBeenCalledOnce();
    expect(button.hasAttribute("data-chesscom-vinf-coach-muted")).toBe(true);
    controller.reconcile(document, review, DEFAULT_SETTINGS, true);
    expect(document.querySelectorAll(".chesscom-vinf-review-dock-clearance")).toHaveLength(1);
    expect(click).toHaveBeenCalledOnce();
    svg.setAttribute("data-glyph", "media-audio-speaker");
    await vi.advanceTimersByTimeAsync(65);
    expect(click).toHaveBeenCalledTimes(2);
    controller.reconcile(document, review, { ...DEFAULT_SETTINGS, enabled: false }, true);
    expect(button.hasAttribute("data-chesscom-vinf-coach-muted")).toBe(false);
    expect(document.querySelector(".chesscom-vinf-review-dock-clearance")).toBeNull();
    expect(document.querySelectorAll(".mobile-gr-footer-footer button")).toHaveLength(5);
    expect(svg.getAttribute("data-glyph")).toBe("media-audio-speaker-mute");
  });

  it("leaves unknown or unsuccessful audio controls visible and avoids a toggle loop", () => {
    fixture("game-review-narrow");
    const button = document.querySelector<HTMLButtonElement>('[aria-label="Toggle Coach Audio"]')!;
    const svg = button.querySelector("svg")!;
    const click = vi.fn(); button.addEventListener("click", click);
    svg.setAttribute("data-glyph", "unknown");
    controller.reconcile(document, review, DEFAULT_SETTINGS, true);
    expect(click).not.toHaveBeenCalled();
    svg.setAttribute("data-glyph", "media-audio-speaker");
    controller.reconcile(document, review, DEFAULT_SETTINGS, true);
    controller.reconcile(document, review, DEFAULT_SETTINGS, true);
    expect(click).toHaveBeenCalledOnce();
    expect(button.hasAttribute("data-chesscom-vinf-coach-muted")).toBe(false);
  });
});

it("keeps native material intact and scopes material-only rows to Android phones", () => {
  fixture();
  const material = [...document.querySelectorAll('wc-captured-pieces')];
  expect(material).toHaveLength(2);
  controller.reconcile(document, game, DEFAULT_SETTINGS, true, true);
  expect(document.documentElement.hasAttribute('data-chesscom-vinf-phone-material')).toBe(true);
  expect(document.querySelector('.chesscom-vinf-player-toggle')).toBeNull();
  material[0].querySelector('.captured-pieces-score')!.textContent = '+3';
  controller.reconcile(document, game, DEFAULT_SETTINGS, true, true);
  expect([...document.querySelectorAll('wc-captured-pieces')]).toEqual(material);
  expect(material[0].textContent).toContain('+3');
  for (const [location, settings, phone, android] of [
    [review, DEFAULT_SETTINGS, true, true],
    [game, DEFAULT_SETTINGS, false, false],
    [game, DEFAULT_SETTINGS, true, false],
    [game, { ...DEFAULT_SETTINGS, enabled: false }, true, true]
  ] as const) {
    controller.reconcile(document, location, settings, phone, android);
    expect(document.documentElement.hasAttribute('data-chesscom-vinf-phone-material')).toBe(false);
    expect([...document.querySelectorAll('wc-captured-pieces')]).toEqual(material);
  }
});

it("corrects inherited clipping once, yields to input, and cancels pending entry on cleanup", async () => {
  vi.useFakeTimers(); fixture();
  const entry = new PhoneGameEntry();
  document.documentElement.setAttribute(marker, 'true');
  vi.spyOn(document.querySelector('#board-layout-player-top')!, 'getBoundingClientRect')
    .mockReturnValue({ top: -200 } as DOMRect);
  vi.spyOn(document.querySelector('#board-single')!, 'getBoundingClientRect')
    .mockReturnValue({ height: 390, bottom: 250 } as DOMRect);
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(400);
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  entry.reconcile(document, '/game/1');
  await vi.advanceTimersByTimeAsync(350);
  expect(scroll).toHaveBeenCalledWith({ top: 152, behavior: 'instant' });
  entry.reconcile(document, '/game/1'); await vi.advanceTimersByTimeAsync(1000);
  expect(scroll).toHaveBeenCalledTimes(1);
  entry.reconcile(document, '/game/2');
  document.dispatchEvent(new Event('touchstart'));
  await vi.advanceTimersByTimeAsync(400);
  entry.reconcile(document, '/game/2'); await vi.advanceTimersByTimeAsync(400);
  expect(scroll).toHaveBeenCalledTimes(1);
  entry.reconcile(document, '/game/3'); entry.cleanup();
  await vi.advanceTimersByTimeAsync(400); expect(scroll).toHaveBeenCalledTimes(1);
  scroll.mockRestore(); vi.restoreAllMocks();
});
