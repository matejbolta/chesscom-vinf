import { NativeAnnotations, readNativeMarkings, type AnnotationApiResolver } from "./native-annotations";
import { boardOverlayHost, placeBoardOverlay } from "./board-overlay";
import { isChessComGame } from "./game-continuation";
import { nativeGameHasEnded } from "./extreme-oled-controller";
import type { ExtensionSettings, LocationLike } from "../shared/models";

type Square = [number, number];

/** Capture touch input separately; Chess.com owns annotation shapes and rendering. */
export class TouchAnnotationsController {
  private board: HTMLElement | null = null;
  private layer: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private enabled = false;
  private extreme = false;
  private route = "";
  private finished = false;
  private signature = "";
  private gesture: { id: number; start: Square } | null = null;
  private annotations: NativeAnnotations | null = null;
  private failedApi: object | null = null;

  constructor(private readonly resolveApi: AnnotationApiResolver = readNativeMarkings) {}
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
    this.refreshApi();
    this.checkPosition();
    this.position();
  }

  private checkPosition(): void {
    const board = this.board;
    if (!board) return;
    // Clear on a move or orientation change; never leave stale marks.
    const signature = String(board.classList.contains("flipped")) + [...board.querySelectorAll(".piece")]
      .map(piece => [...piece.classList].filter(token => /^(?:[wb][pnbrqk]|square-\d+)$/.test(token)).sort().join(" ")).join("|");
    if (signature !== this.signature) {
      this.signature = signature;
      this.gesture = null;
      this.clearMarks();
    }
  }

  private mount(document: Document): void {
    const layer = document.createElement("div");
    layer.classList.add("chesscom-vinf-annotations");
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("data-chesscom-vinf-owned", "annotations");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chesscom-vinf-annotation-toggle";
    button.setAttribute("aria-label", "Draw arrows and red squares");
    button.title = "Draw arrows and red squares";
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75ZM20.71 7.04a1 1 0 0 0 0-1.42l-2.34-2.33a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75Z"/></svg>';
    button.setAttribute("data-chesscom-vinf-owned", "annotations");
    button.addEventListener("click", event => {
      event.stopPropagation();
      this.refreshApi();
      if (!this.annotations) return;
      this.enabled = !this.enabled;
      this.gesture = null;
      if (!this.enabled) this.clearMarks();
      this.position();
    });
    this.layer = layer;
    this.button = button;
    boardOverlayHost(this.board!).append(layer);
    document.body.append(button);
    const block = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
    for (const type of ["touchstart", "touchmove", "touchend", "click", "dblclick", "contextmenu", "mousedown", "mouseup"]) {
      layer.addEventListener(type, block, { passive: false });
    }
    layer.addEventListener("pointerdown", event => {
      block(event);
      this.refreshApi();
      if (!this.enabled || event.button !== 0) return;
      if (this.gesture) { this.gesture = null; return; }
      const square = this.square(event);
      if (!square) return;
      this.gesture = { id: event.pointerId, start: square };
      layer.setPointerCapture?.(event.pointerId);
    });
    // No geometry reads or native marks while dragging: commit on release only.
    layer.addEventListener("pointermove", block);
    layer.addEventListener("pointerup", event => {
      block(event);
      this.refreshApi();
      const gesture = this.gesture;
      this.gesture = null;
      const square = this.square(event);
      if (gesture?.id === event.pointerId && square) {
        this.useNative(api => api.toggle(this.notation(gesture.start), this.notation(square)));
      }
    });
    for (const type of ["pointercancel", "lostpointercapture"]) layer.addEventListener(type, () => {
      this.gesture = null;
    });
    const position = () => this.position();
    const view = document.defaultView!;
    const scroll = () => { if (layer.parentElement === document.body) position(); };
    view.addEventListener("scroll", scroll, true);
    view.addEventListener("resize", position);
    view.visualViewport?.addEventListener("resize", position);
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(position);
    resize?.observe(this.board!);
    const observer = new MutationObserver(records => {
      // Piece transforms and native mark rendering do not change overlay bounds.
      // Only position/orientation changes can invalidate our annotations.
      if (records.some(record => record.type === "attributes"
        ? record.target === this.board || (record.target as Element).matches(".piece")
        : [...record.addedNodes, ...record.removedNodes].some(node =>
          node.nodeType === 1 && ((node as Element).matches(".piece") || (node as Element).querySelector(".piece"))))) {
        this.checkPosition();
      }
    });
    observer.observe(this.board!, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
    const boardStyle = new MutationObserver(position);
    boardStyle.observe(this.board!, { attributes: true, attributeFilter: ["style"] });
    this.dispose = () => {
      observer.disconnect();
      boardStyle.disconnect();
      resize?.disconnect();
      view.removeEventListener("scroll", scroll, true);
      view.removeEventListener("resize", position);
      view.visualViewport?.removeEventListener("resize", position);
    };
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
    const host = boardOverlayHost(this.board);
    placeBoardOverlay(this.layer, host, rect);
    this.layer.style.pointerEvents = this.enabled ? "auto" : "none";
    this.layer.style.display = visible ? "block" : "none";
    const clock = document.querySelector<HTMLElement>("#board-layout-player-bottom .clock-component");
    const flow = (!this.extreme || document.documentElement.hasAttribute("data-chesscom-vinf-phone-material")) &&
      clock?.parentElement?.matches(".player-component");
    this.button.dataset.flow = String(Boolean(flow));
    if (flow && clock) {
      // A real layout slot prevents the pencil from covering player text. The
      // native clock still reserves the space used by the numeric clock target.
      if (this.button.nextSibling !== clock) clock.before(this.button);
      this.button.style.cssText = `display:${visible ? "grid" : "none"}`;
    } else {
      const clockRect = clock?.getBoundingClientRect();
      placeBoardOverlay(this.button, host, {
        left: this.extreme ? rect.left + 100 : Math.max(rect.left, (clockRect?.left ?? rect.right) - 48),
        top: this.extreme ? rect.bottom + 12 : (clockRect ? clockRect.top + (clockRect.height - 44) / 2 : rect.bottom + 2),
        width: 44, height: 44
      });
      this.button.style.display = visible ? "grid" : "none";
    }
    this.button.disabled = !this.annotations;
    this.button.title = this.annotations ? "Draw arrows and red squares" : "Native drawing unavailable on this board";
    this.button.setAttribute("aria-label", this.button.title);
    this.button.setAttribute("aria-pressed", String(this.enabled));
    this.button.dataset.extreme = String(this.extreme);
    this.layer.dataset.extreme = String(this.extreme);
    document.documentElement.setAttribute("data-chesscom-vinf-annotations", this.extreme ? "extreme" : "normal");
  }

  private notation([x, y]: Square): string {
    const flipped = this.board!.classList.contains("flipped");
    return `${"abcdefgh"[flipped ? 7 - x : x]}${flipped ? y + 1 : 8 - y}`;
  }

  private refreshApi(): void {
    let api = null;
    try { api = this.board ? this.resolveApi(this.board) : null; } catch { /* Fail open to normal board input. */ }
    if (api === this.annotations?.api) return;
    this.clearMarks();
    this.enabled = false;
    this.gesture = null;
    this.annotations = api && api !== this.failedApi ? new NativeAnnotations(api) : null;
    this.position();
  }

  private useNative(action: (api: NativeAnnotations) => void): void {
    if (!this.annotations) return;
    try { action(this.annotations); }
    catch {
      this.failedApi = this.annotations.api;
      this.clearMarks();
      this.annotations = null;
      this.enabled = false;
      this.gesture = null;
      this.position();
    }
  }

  private clearMarks(): void {
    try { this.annotations?.clear(); } catch { /* Detached/replaced native API. */ }
  }

  private cleanup(): void {
    this.board?.ownerDocument.documentElement.removeAttribute("data-chesscom-vinf-annotations");
    this.clearMarks();
    this.annotations = null; this.failedApi = null;
    this.dispose?.(); this.dispose = null;
    this.layer?.remove(); this.button?.remove();
    this.board = null; this.layer = null; this.button = null;
    this.enabled = false; this.gesture = null; this.signature = "";
  }
}
