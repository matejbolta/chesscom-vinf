import { installAnnotationFixture } from "./helpers/native-annotations";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { TouchAnnotationsController } from "../src/content/touch-annotations";
import { PhoneExperienceController } from "../src/content/phone-experience-controller";
import { PhoneGameActionsController } from "../src/content/phone-game-actions";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
const game = { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" };
function fixture() {
  document.documentElement.innerHTML = new DOMParser().parseFromString(readFileSync("tests/fixtures/phone-game.html", "utf8"), "text/html").documentElement.innerHTML;
  document.documentElement.className = "user-logged-in";
  document.documentElement.removeAttribute("data-chesscom-vinf-extreme-oled");
  document.documentElement.setAttribute("data-chesscom-vinf-phone-game", "true");
  const board = document.querySelector<HTMLElement>("#board-single")!;
  vi.spyOn(board, "getBoundingClientRect").mockReturnValue({ left: 0, top: 100, width: 400, height: 400, right: 400, bottom: 500 } as DOMRect);
  installAnnotationFixture(board);
  return board;
}
function pointer(layer: Element, type: string, x: number, y: number) {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerId", { value: 1 });
  layer.dispatchEvent(event);
}
it("captures annotation gestures separately, toggles marks, cancels and restores native input on exit", () => {
  const board = fixture(), controller = new TouchAnnotationsController();
  const native = vi.fn(); board.addEventListener("pointerdown", native);
  const bubble = vi.fn(); document.addEventListener("pointerdown", bubble);
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  const button = document.querySelector<HTMLButtonElement>(".chesscom-vinf-annotation-toggle")!;
  const layer = document.querySelector<HTMLDivElement>(".chesscom-vinf-annotations")!;
  expect(layer.style.pointerEvents).toBe("none");
  button.click();
  pointer(layer, "pointerdown", 25, 125); pointer(layer, "pointerup", 25, 125);
  expect(board.querySelectorAll(".highlight")).toHaveLength(1);
  pointer(layer, "pointerdown", 25, 125); pointer(layer, "pointerup", 25, 125);
  expect(board.querySelectorAll(".highlight")).toHaveLength(0);
  pointer(layer, "pointerdown", 25, 125); pointer(layer, "pointermove", 175, 325);
  expect(board.querySelectorAll(".arrow, .highlight")).toHaveLength(0);
  pointer(layer, "pointerup", 175, 325);
  expect(board.querySelectorAll(".arrow")).toHaveLength(1);
  pointer(layer, "pointerdown", 75, 175); pointer(layer, "pointercancel", 75, 175); pointer(layer, "pointerup", 75, 175);
  expect(board.querySelectorAll(".highlight")).toHaveLength(0);
  expect(native).not.toHaveBeenCalled(); expect(bubble).not.toHaveBeenCalled();
  document.documentElement.setAttribute("data-chesscom-vinf-extreme-oled", "true");
  controller.reconcile(document, game, { ...DEFAULT_SETTINGS, extremeOled: true }, true);
  expect(button.dataset.extreme).toBe("true"); expect(button.getAttribute("aria-pressed")).toBe("true");
  board.classList.add("flipped"); controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  expect(board.querySelectorAll(".highlight, .arrow")).toHaveLength(0);
  expect(layer.children).toHaveLength(0);
  button.click(); expect(layer.style.pointerEvents).toBe("none");
  pointer(board, "pointerdown", 25, 125); expect(native).toHaveBeenCalledOnce();
  controller.reconcile(document, { ...game, pathname: "/analysis/game/123456/review" }, DEFAULT_SETTINGS, true);
  expect(document.querySelector(".chesscom-vinf-annotation-toggle")).toBeNull();
  controller.reconcile(document, game, DEFAULT_SETTINGS, false);
  expect(document.querySelector(".chesscom-vinf-annotations")).toBeNull();
  document.removeEventListener("pointerdown", bubble);
});
it("moves only original action roots, leaves confirmations explicit, and restores their exact order", () => {
  fixture(); const controller = new PhoneGameActionsController();
  const resign = document.querySelector<HTMLButtonElement>(".resign-button-component")!;
  const draw = document.querySelector<HTMLButtonElement>(".draw-button-component")!;
  const original = resign.parentNode!;
  const before = [...original.childNodes];
  const confirm = document.createElement("button"); const commit = vi.fn(); confirm.addEventListener("click", commit);
  const open = vi.fn(() => document.body.append(confirm)); resign.addEventListener("click", open);
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  const row = document.querySelector(".chesscom-vinf-phone-actions")!;
  expect(row.parentElement?.closest("#board-layout-player-top")).not.toBeNull();
  expect(row.contains(draw)).toBe(true); expect(row.contains(resign)).toBe(true);
  expect(open).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
  resign.lastChild!.textContent = "Abort";
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  expect(resign.textContent).toContain("Abort");
  resign.lastChild!.textContent = "Resign";
  resign.click(); expect(open).toHaveBeenCalledOnce(); expect(commit).not.toHaveBeenCalled();
  confirm.click(); expect(commit).toHaveBeenCalledOnce();
  controller.reconcile(document, game, { ...DEFAULT_SETTINGS, enabled: false }, true);
  expect([...original.childNodes]).toEqual(before);
  controller.reconcile(document, game, DEFAULT_SETTINGS, false);
  expect(document.querySelector(".chesscom-vinf-phone-actions")).toBeNull();
});

it("uses native factories, preserves unrelated marks, handles flip/cancel/API failure and retries hydration", () => {
  const board = fixture();
  const api = (board as unknown as { game: { markings: import("../src/content/native-annotations").NativeMarkings } }).game.markings;
  const arrow = vi.spyOn(api.factory, "buildStandardArrow");
  const square = vi.spyOn(api.factory, "buildStandardAnalysisHighlight");
  const controller = new TouchAnnotationsController();
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  const button = document.querySelector<HTMLButtonElement>(".chesscom-vinf-annotation-toggle")!;
  const layer = document.querySelector<HTMLElement>(".chesscom-vinf-annotations")!;
  api.addOne(api.factory.buildStandardArrow("a1", "h8"));
  button.click();
  // No preview or duplicate while dragging, even across existing native marks.
  pointer(layer, "pointerdown", 25, 475); pointer(layer, "pointermove", 375, 125);
  expect(board.querySelectorAll(".arrow")).toHaveLength(1);
  pointer(layer, "pointercancel", 375, 125);
  expect(api.getOne("arrow|a1h8")).toBeDefined();
  pointer(layer, "pointerdown", 75, 475); pointer(layer, "pointermove", 125, 375);
  expect(arrow).toHaveBeenCalledTimes(1); // only the unrelated native arrow
  pointer(layer, "pointercancel", 125, 375);
  expect(board.querySelectorAll(".arrow")).toHaveLength(1); // only pre-existing native arrow
  pointer(layer, "pointerdown", 25, 125); pointer(layer, "pointerup", 25, 125);
  expect(square).toHaveBeenLastCalledWith("a8");
  board.classList.add("flipped"); controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  pointer(layer, "pointerdown", 25, 125); pointer(layer, "pointerup", 25, 125);
  expect(square).toHaveBeenLastCalledWith("h1");
  // Another native interaction replaces our mark: cleanup must retain its object.
  api.addOne(api.factory.buildStandardAnalysisHighlight("h1"));
  button.click();
  expect(board.querySelectorAll(".highlight")).toHaveLength(1);
  api.removeOne("highlight|h1");
  expect(board.querySelectorAll(".highlight")).toHaveLength(0);
  expect(api.getOne("arrow|a1h8")).toBeDefined();
  button.click();
  vi.spyOn(api, "toggleOne").mockImplementation(() => { throw new Error("native contract changed"); });
  pointer(layer, "pointerdown", 25, 125); pointer(layer, "pointerup", 25, 125);
  expect(button.disabled).toBe(true); expect(layer.style.pointerEvents).toBe("none");
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  expect(button.disabled).toBe(true); // no exception/retry loop against same API
  installAnnotationFixture(board);
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  expect(button.disabled).toBe(false);
  controller.reconcile(document, game, { ...DEFAULT_SETTINGS, enabled: false }, true);
});

it("keeps drawing unavailable until the native API exists without blocking the board", () => {
  const board = fixture();
  Object.assign(board, { game: undefined });
  const controller = new TouchAnnotationsController();
  controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  const button = document.querySelector<HTMLButtonElement>(".chesscom-vinf-annotation-toggle")!;
  const layer = document.querySelector<HTMLElement>(".chesscom-vinf-annotations")!;
  expect(button.disabled).toBe(true); expect(layer.style.pointerEvents).toBe("none");
  installAnnotationFixture(board); controller.reconcile(document, game, DEFAULT_SETTINGS, true);
  expect(button.disabled).toBe(false);
  controller.reconcile(document, { ...game, pathname: "/analysis/game/123456/review" }, DEFAULT_SETTINGS, true);
  expect(document.querySelector(".chesscom-vinf-annotations")).toBeNull();
});

it("shares phone material, actions and move ordering in Extreme", () => {
  fixture();
  const phone = new PhoneExperienceController(), actions = new PhoneGameActionsController();
  const settings = {...DEFAULT_SETTINGS, extremeOled:true};
  const original = document.querySelector('.resign-button-component')!.parentElement;
  phone.reconcile(document, game, settings, true, true);
  actions.reconcile(document, game, settings, true);
  expect(document.documentElement.hasAttribute('data-chesscom-vinf-phone-material')).toBe(true);
  expect(document.querySelector('#board-layout-player-top .resign-button-component')).not.toBeNull();
  expect(document.querySelector('[data-chesscom-vinf-newest-first]')).not.toBeNull();
  const review = {...game, pathname:'/analysis/game/123456/review'};
  phone.reconcile(document, review, settings, true, true);
  actions.reconcile(document, review, settings, true);
  expect(document.documentElement.hasAttribute('data-chesscom-vinf-phone-material')).toBe(false);
  expect(document.querySelector('.resign-button-component')!.parentElement).toBe(original);
  phone.cleanup(document);
});

it("reuses wide Extreme native actions, restores after Escape/disable, and never auto-confirms", () => {
  fixture(); const controller = new PhoneGameActionsController();
  document.documentElement.removeAttribute('data-chesscom-vinf-phone-game');
  document.documentElement.setAttribute('data-chesscom-vinf-extreme-oled', 'true');
  const overlay = document.createElement('div'); overlay.className = 'chesscom-vinf-extreme-controls'; document.body.append(overlay);
  const resign = document.querySelector<HTMLButtonElement>('.resign-button-component')!;
  const original = resign.parentNode!; const before = [...original.childNodes];
  const open = vi.fn(); resign.addEventListener('click', open);
  const settings = {...DEFAULT_SETTINGS, extremeOled: true};
  controller.reconcile(document, game, settings, false, true);
  controller.reconcile(document, game, settings, false, true);
  expect(document.querySelectorAll('.chesscom-vinf-wide-actions')).toHaveLength(1);
  expect(document.querySelector('.chesscom-vinf-extreme-controls .chesscom-vinf-wide-actions')!.contains(resign)).toBe(true);
  expect(open).not.toHaveBeenCalled(); resign.click(); expect(open).toHaveBeenCalledOnce();
  overlay.remove(); // Overlay cleanup precedes the actions controller.
  document.documentElement.removeAttribute('data-chesscom-vinf-extreme-oled'); // Escape/native end cleanup
  controller.reconcile(document, game, settings, false, true);
  expect([...original.childNodes]).toEqual(before);
  expect(document.querySelector('[data-chesscom-vinf-wide-actions]')).toBeNull();
  document.body.append(overlay);
  document.documentElement.setAttribute('data-chesscom-vinf-extreme-oled', 'true');
  controller.reconcile(document, game, settings, false, true);
  controller.reconcile(document, game, {...settings, enabled: false}, false, true);
  expect([...original.childNodes]).toEqual(before);
});

it("restores native labeled actions when widening from phone, including Extreme", () => {
  fixture();
  const controller = new PhoneGameActionsController();
  const resign = document.querySelector<HTMLButtonElement>('.resign-button-component')!;
  const original = resign.parentNode!;
  const before = [...original.childNodes];
  const text = resign.textContent;
  for (const extremeOled of [false, true]) {
    const settings = {...DEFAULT_SETTINGS, extremeOled};
    document.documentElement.setAttribute('data-chesscom-vinf-phone-game', 'true');
    controller.reconcile(document, game, settings, true);
    expect(original.contains(resign)).toBe(false);
    document.documentElement.removeAttribute('data-chesscom-vinf-phone-game');
    document.documentElement.setAttribute('data-chesscom-vinf-wide-game-rows', '');
    controller.reconcile(document, game, settings, false);
    expect([...original.childNodes]).toEqual(before);
    expect(resign.textContent).toBe(text);
    expect(document.querySelector('.chesscom-vinf-phone-actions')).toBeNull();
  }
});
