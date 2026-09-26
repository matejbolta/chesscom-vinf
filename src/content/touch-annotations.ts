import { isChessComGame } from "./game-continuation";
import { nativeGameHasEnded } from "./extreme-oled-controller";
import type { ExtensionSettings, LocationLike } from "../shared/models";

const NS = "http://www.w3.org/2000/svg";
type Square = [number, number];

/** Local annotations only: never dispatch mouse events or call the chess engine. */
export class TouchAnnotationsController {
  private board: HTMLElement | null = null;
  private layer: SVGSVGElement | null = null;
  private button: HTMLButtonElement | null = null;
  private enabled = false;
  private extreme = false;
  private route = "";
  private finished = false;
  private signature = "";
  private gesture: { id: number; start: Square; end: Square } | null = null;
  private marks = new Map<string, [Square, Square]>();
  private dispose: (() => void) | null = null;

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, android: boolean): void {
    if (this.route !== location.pathname) {
      this.cleanup();
      this.route = location.pathname;
      this.finished = false;
    }
    if (nativeGameHasEnded(document)) this.finished = true;
    const board = document.querySelector<HTMLElement>("#board-layout-chessboard wc-chess-board#board-single");
    if (!android || !settings.enabled || !isChessComGame(location) || this.finished ||
        !document.documentElement.classList.contains("user-logged-in") || !board?.querySelector(".piece")) {
      this.cleanup();
      return;
    }
    this.extreme = document.documentElement.hasAttribute("data-chesscom-vinf-extreme-oled");
    if (board !== this.board) {
      this.cleanup();
      this.board = board;
      this.mount(document);
    }
    this.checkPosition();
    this.position();
  }

  private checkPosition(): void {
    const board = this.board;
    if (!board) return;
    // Clear on a move or orientation change; never leave stale marks.
    const signature = board.className + [...board.querySelectorAll(".piece")]
      .map(piece => piece.className + (piece.getAttribute("style") ?? "")).join("|");
    if (signature !== this.signature) {
      this.signature = signature;
      this.gesture = null;
      this.marks.clear();
      this.render();
    }
  }

  private mount(document: Document): void {
    const layer = document.createElementNS(NS, "svg");
    layer.classList.add("chesscom-vinf-annotations");
    layer.setAttribute("viewBox", "0 0 8 8");
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("data-chesscom-vinf-owned", "annotations");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chesscom-vinf-annotation-toggle";
    button.setAttribute("aria-label", "Draw arrows and red squares");
    button.title = "Draw arrows and red squares";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16-1 4 4-1L20 7l-3-3Z M14 7l3 3"/></svg>';
    button.setAttribute("data-chesscom-vinf-owned", "annotations");
    button.addEventListener("click", event => {
      event.stopPropagation();
      this.enabled = !this.enabled;
      this.gesture = null;
      if (!this.enabled) this.marks.clear();
      this.render();
      this.position();
    });
    this.layer = layer;
    this.button = button;
    document.body.append(layer, button);
    const block = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
    for (const type of ["touchstart", "touchmove", "touchend", "click", "dblclick", "contextmenu", "mousedown", "mouseup"]) {
      layer.addEventListener(type, block, { passive: false });
    }
    layer.addEventListener("pointerdown", event => {
      block(event);
      if (!this.enabled || event.button !== 0) return;
      if (this.gesture) { this.gesture = null; this.render(); return; }
      const square = this.square(event);
      if (!square) return;
      this.gesture = { id: event.pointerId, start: square, end: square };
      layer.setPointerCapture?.(event.pointerId);
    });
    layer.addEventListener("pointermove", event => {
      block(event);
      if (this.gesture?.id !== event.pointerId) return;
      const square = this.square(event);
      if (square) this.gesture.end = square;
      this.render();
    });
    layer.addEventListener("pointerup", event => {
      block(event);
      const gesture = this.gesture;
      this.gesture = null;
      const square = this.square(event);
      if (gesture?.id === event.pointerId && square) {
        const key = `${gesture.start}:${square}`;
        if (this.marks.has(key)) this.marks.delete(key);
        else this.marks.set(key, [gesture.start, square]);
      }
      this.render();
    });
    for (const type of ["pointercancel", "lostpointercapture"]) layer.addEventListener(type, () => {
      this.gesture = null;
      this.render();
    });
    const position = () => this.position();
    const view = document.defaultView!;
    view.addEventListener("scroll", position, true);
    view.addEventListener("resize", position);
    view.visualViewport?.addEventListener("resize", position);
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(position);
    resize?.observe(this.board!);
    const observer = new MutationObserver(() => {
      this.checkPosition();
      this.position();
    });
    observer.observe(this.board!, { attributes: true, childList: true, subtree: true });
    this.dispose = () => {
      observer.disconnect();
      resize?.disconnect();
      view.removeEventListener("scroll", position, true);
      view.removeEventListener("resize", position);
      view.visualViewport?.removeEventListener("resize", position);
    };
    this.render();
  }

  private square(event: PointerEvent): Square | null {
    const rect = this.board!.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * 8 / rect.width);
    const y = Math.floor((event.clientY - rect.top) * 8 / rect.height);
    return x >= 0 && x < 8 && y >= 0 && y < 8 ? [x, y] : null;
  }

  private position(): void {
    if (!this.board || !this.layer || !this.button) return;
    const document = this.board.ownerDocument;
    const rect = this.board.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    this.layer.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;pointer-events:${this.enabled ? "auto" : "none"};display:${visible ? "block" : "none"}`;
    const clock = document.querySelector(this.extreme
      ? ".chesscom-vinf-extreme-time.bottom"
      : "#board-layout-player-bottom .clock-component")?.getBoundingClientRect();
    const left = this.extreme ? rect.left + 100 : (clock?.left ?? rect.right) - 48;
    const top = this.extreme ? rect.bottom + 12 : (clock ? clock.top + (clock.height - 44) / 2 : rect.bottom + 2);
    this.button.style.cssText = `left:${Math.max(rect.left, left)}px;top:${top}px;display:${visible ? "grid" : "none"}`;
    this.button.setAttribute("aria-pressed", String(this.enabled));
    this.button.dataset.extreme = String(this.extreme);
    this.layer.dataset.extreme = String(this.extreme);
    document.documentElement.setAttribute("data-chesscom-vinf-annotations", this.extreme ? "extreme" : "normal");
  }

  private render(): void {
    if (!this.layer) return;
    this.layer.replaceChildren();
    const marks = [...this.marks.values()];
    if (this.gesture) marks.push([this.gesture.start, this.gesture.end]);
    for (const [start, end] of marks) {
      const same = start[0] === end[0] && start[1] === end[1];
      const shape = this.layer.ownerDocument.createElementNS(NS, same ? "rect" : "path");
      if (same) {
        shape.setAttribute("x", String(start[0])); shape.setAttribute("y", String(start[1]));
        shape.setAttribute("width", "1"); shape.setAttribute("height", "1");
        shape.setAttribute("fill", "#df3636"); shape.setAttribute("opacity", ".55");
      } else {
        const x = start[0] + .5, y = start[1] + .5, ex = end[0] + .5, ey = end[1] + .5;
        const angle = Math.atan2(ey-y, ex-x), ux = Math.cos(angle), uy = Math.sin(angle);
        const bx = ex - .36*ux, by = ey - .36*uy;
        shape.setAttribute("d", `M${x-.09*uy} ${y+.09*ux} L${bx-.09*uy} ${by+.09*ux} L${bx-.26*uy} ${by+.26*ux} L${ex} ${ey} L${bx+.26*uy} ${by-.26*ux} L${bx+.09*uy} ${by-.09*ux} L${x+.09*uy} ${y-.09*ux} Z`);
        shape.setAttribute("fill", "#e99b24"); shape.setAttribute("opacity", ".8");
      }
      this.layer.append(shape);
    }
  }

  private cleanup(): void {
    this.board?.ownerDocument.documentElement.removeAttribute("data-chesscom-vinf-annotations");
    this.dispose?.(); this.dispose = null;
    this.layer?.remove(); this.button?.remove();
    this.board = null; this.layer = null; this.button = null;
    this.enabled = false; this.gesture = null; this.signature = ""; this.marks.clear();
  }
}
