import type { ExtensionSettings, LocationLike } from "../shared/models";
import { isChessComGame } from "./game-continuation";
import { isChessComLiveGameReview } from "./game-review-layout-controller";

const ACTIVE = "data-chesscom-vinf-extreme-oled";
const BOARD = "data-chesscom-vinf-extreme-board";
const OWNER = "chesscom-vinf-extreme-controls";

// Read the site's displayed timer; never invent or run an independent clock.
export function readClockSeconds(text: string): number | null {
  const value = text.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^(?:\d+:)?\d{1,2}:\d{2}(?:\.\d+)?$/.test(value) &&
      !/^\d{1,2}(?:\.\d+)?$/.test(value)) return null;
  const parts = value.split(":").map(Number);
  if (parts.slice(1).some(n => n >= 60)) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

export class ExtremeOledController {
  private board: HTMLElement | null = null;
  private stage: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private timer: number | null = null;
  private document: Document | null = null;
  private route = "";
  private suspendedRoute = "";
  private withClocks = true;
  private maxima = new Map<string, number>();

  private readonly schedule = (): void => {
    const view = this.document?.defaultView;
    if (!view || this.timer !== null) return;
    this.timer = view.setTimeout(() => {
      this.timer = null;
      if (this.document) this.update(this.document);
    }, 16);
  };

  private readonly escape = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !this.document ||
        this.document.querySelector(".chesscom-vinf-settings-dialog[open]")) return;
    this.suspendedRoute = this.route;
    this.cleanup(this.document);
  };

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings): boolean {
    const route = `${location.protocol}//${location.hostname}${location.pathname}`;
    if (route !== this.route || !settings.extremeOled) this.suspendedRoute = "";
    if (route !== this.route) this.cleanup(document);
    this.route = route;
    if (!settings.enabled || !settings.extremeOled || this.suspendedRoute === route ||
        !document.documentElement.classList.contains("user-logged-in") ||
        !(isChessComGame(location) || isChessComLiveGameReview(location))) {
      this.cleanup(document);
      return false;
    }
    this.withClocks = settings.extremeOledClocks;
    this.document = document;
    this.update(document);
    if (!this.observer && document.body) {
      this.observer = new MutationObserver(this.schedule);
      this.observer.observe(document.body, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ["class", "disabled", "aria-disabled"]
      });
      document.defaultView?.addEventListener("resize", this.schedule);
      document.defaultView?.addEventListener("scroll", this.schedule, true);
      document.addEventListener("keydown", this.escape);
    }
    return this.board !== null;
  }

  private nativeControl(document: Document, label: string): HTMLButtonElement | null {
    return document.querySelector<HTMLButtonElement>(
      `#board-layout-sidebar button[aria-label="${label}"],` +
      `.game-buttons-container-component button[aria-label="${label}"],` +
      `.game-buttons-container-mobile button[aria-label="${label}"],` +
      `.game-controls-view-component button[aria-label="${label}"]`
    );
  }

  private update(document: Document): void {
    // Only the audited primary board, never a mini-board or analysis preview.
    const board = document.querySelector<HTMLElement>(
      "wc-chess-board#board-single, wc-chess-board#board-analysis-board"
    );
    const stage = board?.closest<HTMLElement>("#board-layout-chessboard");
    if (!board || !stage || board.querySelector("canvas") || !board.querySelector(".piece")) {
      this.clearPresentation(document);
      return;
    }
    if (board !== this.board || stage !== this.stage) {
      this.clearPresentation(document);
      this.board = board;
      this.stage = stage;
      stage.setAttribute("data-chesscom-vinf-extreme-stage", "true");
      board.setAttribute(BOARD, "true");
      const Resize = document.defaultView?.ResizeObserver;
      if (Resize) {
        this.resizeObserver = new Resize(this.schedule);
        this.resizeObserver.observe(board);
      }
    }
    if (!this.overlay?.isConnected) {
      this.overlay = document.createElement("div");
      this.overlay.className = OWNER;
      this.overlay.setAttribute("data-chesscom-vinf-owned", "extreme-oled");
      for (const side of ["top", "bottom"]) {
        const bar = document.createElement("div");
        bar.className = `chesscom-vinf-extreme-clock ${side}`;
        bar.setAttribute("role", "meter");
        bar.setAttribute("aria-label", `${side === "top" ? "Top" : "Bottom"} player time remaining`);
        bar.setAttribute("aria-valuemin", "0");
        const line = document.createElement("span");
        bar.append(line);
        this.overlay.append(bar);
      }
      const controls = document.createElement("nav");
      controls.setAttribute("aria-label", "Move navigation");
      for (const [label, glyph] of [["Previous Move", "‹"], ["Next Move", "›"]]) {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", label);
        button.textContent = glyph;
        button.addEventListener("click", () => {
          const native = this.nativeControl(document, label);
          if (native && !native.disabled && native.getAttribute("aria-disabled") !== "true" &&
              !native.classList.contains("cc-button-disabled")) native.click();
        });
        controls.append(button);
      }
      this.overlay.append(controls);
      document.body.append(this.overlay);
    }
    document.documentElement.setAttribute(ACTIVE, "true");
    const rect = board.getBoundingClientRect();
    const view = document.defaultView;
    this.overlay.style.left = `${rect.left + (view?.scrollX ?? 0)}px`;
    this.overlay.style.top = `${rect.top + (view?.scrollY ?? 0)}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
    for (const button of this.overlay.querySelectorAll<HTMLButtonElement>("button")) {
      const native = this.nativeControl(document, button.getAttribute("aria-label")!);
      const disabled = !native || native.disabled || native.getAttribute("aria-disabled") === "true" ||
        native.classList.contains("cc-button-disabled");
      if (button.disabled !== disabled) button.disabled = disabled;
    }
    for (const side of ["top", "bottom"]) {
      const bar = this.overlay.querySelector<HTMLElement>(`.chesscom-vinf-extreme-clock.${side}`)!;
      const clock = document.querySelector<HTMLElement>(`#board-layout-player-${side} .clock-component`);
      const text = clock?.querySelector('[role="timer"]')?.textContent ?? "";
      const seconds = readClockSeconds(text);
      bar.hidden = !this.withClocks || seconds === null;
      if (bar.hidden || seconds === null) continue;
      const key = clock?.classList.contains("clock-white") ? "white" :
        clock?.classList.contains("clock-black") ? "black" : side;
      const maximum = Math.max(this.maxima.get(key) ?? 0, seconds, 1);
      this.maxima.set(key, maximum);
      bar.setAttribute("aria-valuemax", String(maximum));
      bar.setAttribute("aria-valuenow", String(seconds));
      bar.setAttribute("aria-valuetext", text.trim());
      bar.dataset.low = String(seconds <= Math.min(30, maximum * 0.1));
      bar.firstElementChild!.setAttribute("style", `transform:scaleX(${seconds / maximum})`);
    }
  }

  private clearPresentation(document: Document): void {
    document.documentElement.removeAttribute(ACTIVE);
    this.board?.removeAttribute(BOARD);
    this.board = null;
    this.stage?.removeAttribute("data-chesscom-vinf-extreme-stage");
    this.stage = null;
    this.overlay?.remove();
    this.overlay = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.maxima.clear();
  }

  cleanup(document: Document): void {
    this.observer?.disconnect();
    this.observer = null;
    const view = this.document?.defaultView;
    if (this.timer !== null) view?.clearTimeout(this.timer);
    this.timer = null;
    view?.removeEventListener("resize", this.schedule);
    view?.removeEventListener("scroll", this.schedule, true);
    this.document?.removeEventListener("keydown", this.escape);
    this.clearPresentation(document);
    this.document = null;
  }
}
