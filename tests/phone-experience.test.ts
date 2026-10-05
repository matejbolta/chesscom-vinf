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

  it("follows each new white/black ply at the top, settles native scrolling, and yields to browsing", async () => {
    vi.useFakeTimers(); fixture();
    const scroll = document.querySelector<HTMLElement>("#live-game-tab-scroll-container")!;
    const wrapper = document.querySelector<HTMLElement>(".timestamps-with-base-time")!;
    scroll.scrollTop = 200;
    controller.reconcile(document, game, DEFAULT_SETTINGS, true);
    expect(scroll.scrollTop).toBe(0);
    await vi.advanceTimersByTimeAsync(600);
    scroll.scrollTop = 100;
    const row = wrapper.lastElementChild!.cloneNode(true) as HTMLElement;
    row.dataset.wholeMoveNumber = '21'; row.querySelector('.black-move')!.remove(); wrapper.append(row);
    await vi.advanceTimersByTimeAsync(80);
    expect(scroll.scrollTop).toBe(0);
    scroll.scrollTop = 300; scroll.dispatchEvent(new Event('scroll')); // Native post-render scroll.
    expect(scroll.scrollTop).toBe(0);
    document.dispatchEvent(new Event('touchstart'));
    scroll.scrollTop = 100; scroll.dispatchEvent(new Event('scroll'));
    expect(scroll.scrollTop).toBe(100);
    row.querySelector('.white-move')!.classList.add('selected');
    await vi.advanceTimersByTimeAsync(80);
    expect(scroll.scrollTop).toBe(100); // Selection is not a new move.
    row.insertAdjacentHTML('beforeend', '<div class="node black-move main-line-ply" data-node="0-41"> </div>');
    await vi.advanceTimersByTimeAsync(80);
    expect(scroll.scrollTop).toBe(100);
    row.querySelector('.black-move')!.firstChild!.nodeValue = 'Nf6';
    await vi.advanceTimersByTimeAsync(80);
    expect(scroll.scrollTop).toBe(0);
    controller.cleanup(document);
    scroll.scrollTop = 150; scroll.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(600);
    expect(scroll.scrollTop).toBe(150);
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
    controller.reconcile(document, game, DEFAULT_SETTINGS, true);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-phone-postgame")).toBe(true);
    result.remove();
    controller.reconcile(document, game, DEFAULT_SETTINGS, true);
    expect(document.documentElement.hasAttribute(marker)).toBe(false);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-phone-postgame")).toBe(true);
    controller.reconcile(document, game, {...DEFAULT_SETTINGS,enabled:false}, true);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-phone-postgame")).toBe(false);
  });

  it("recovers when the new game URL arrives before the old result disappears", () => {
    fixture();
    const firstGame = { ...game, pathname: "/game/700001" };
    const nextGame = { ...game, pathname: "/game/700002" };
    controller.reconcile(document, firstGame, DEFAULT_SETTINGS, true);
    const result = document.createElement("div");
    result.className = "game-over-modal-shell-container";
    document.body.append(result);
    controller.reconcile(document, firstGame, DEFAULT_SETTINGS, true);
    controller.reconcile(document, nextGame, DEFAULT_SETTINGS, true);
    expect(document.documentElement.hasAttribute(marker)).toBe(false);
    result.remove();
    controller.reconcile(document, nextGame, DEFAULT_SETTINGS, true);
    expect(document.documentElement.hasAttribute(marker)).toBe(true);
    expect(document.documentElement.hasAttribute("data-chesscom-vinf-phone-postgame")).toBe(false);
    document.body.append(result); // Native component reuse for the new game's result.
    controller.reconcile(document, nextGame, DEFAULT_SETTINGS, true);
    result.remove();
    controller.reconcile(document, nextGame, DEFAULT_SETTINGS, true);
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
  let scrollY = 400;
  vi.spyOn(document.querySelector('#board-layout-player-top')!, 'getBoundingClientRect')
    .mockImplementation(() => ({ top: 200 - scrollY } as DOMRect));
  vi.spyOn(document.querySelector('#board-single')!, 'getBoundingClientRect')
    .mockImplementation(() => ({ height: 390, top: 256 - scrollY } as DOMRect));
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(options => { scrollY = (options as ScrollToOptions).top!; });
  entry.reconcile(document, '/game/1');
  await vi.advanceTimersByTimeAsync(700);
  expect(scroll).toHaveBeenCalledWith({ top: 200, behavior: 'instant' });
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

it('waits for hydration and uses the same target for an already visible row and same-route re-entry', async () => {
  vi.useFakeTimers(); fixture();
  const entry = new PhoneGameEntry();
  document.documentElement.setAttribute(marker, 'true');
  const rowRect = vi.spyOn(document.querySelector('#board-layout-player-top')!, 'getBoundingClientRect');
  let top = 100, scrollY = 0;
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);
  rowRect.mockImplementation(() => ({top:top-scrollY} as DOMRect));
  const boardRect = vi.spyOn(document.querySelector('#board-single')!, 'getBoundingClientRect');
  boardRect.mockReturnValue({height:0} as DOMRect);
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(options => { scrollY = (options as ScrollToOptions).top!; });
  entry.reconcile(document, '/game/1');
  await vi.advanceTimersByTimeAsync(700); expect(scroll).not.toHaveBeenCalled();
  boardRect.mockImplementation(() => ({height:390, top:top+56-scrollY} as DOMRect));
  await vi.advanceTimersByTimeAsync(500);
  expect(scroll).toHaveBeenLastCalledWith({top:100,behavior:'instant'});
  top = 130; // late native layout shift after the first correction
  await vi.advanceTimersByTimeAsync(600);
  expect(scroll).toHaveBeenLastCalledWith({top:130,behavior:'instant'});
  entry.cleanup(); top = 150;
  entry.reconcile(document, '/game/1'); await vi.advanceTimersByTimeAsync(700);
  expect(scroll).toHaveBeenLastCalledWith({top:150,behavior:'instant'});
  expect(scroll).toHaveBeenCalledTimes(3);
  entry.cleanup(); vi.restoreAllMocks(); vi.useRealTimers();
});
