import { boardOverlayHost, placeBoardOverlay } from "./board-overlay";
import type { ExtensionSettings, LocationLike } from "../shared/models";
import { isChessComGame } from "./game-continuation";

const ACTIVE = "data-chesscom-vinf-extreme-oled";
const NORMAL = "data-chesscom-vinf-normal-clocks";
const BOARD = "data-chesscom-vinf-extreme-board";
const OWNER = "chesscom-vinf-extreme-controls";

export function nativeGameHasEnded(document: Document): boolean {
  // Native result evidence only: zero on a clock is not proof of game over.
  const candidates = document.querySelectorAll<HTMLElement>(
    ".game-over-modal-shell-container, #board-layout-player-top .player-game-over-component," +
    "#board-layout-player-bottom .player-game-over-component, #board-layout-sidebar .game-result"
  );
  return [...candidates].some(element => {
    if (element.matches(".game-result") &&
        !/^(1-0|0-1|½-½|1\/2-1\/2)$/.test(element.textContent?.replace(/\s/g, "") ?? "")) return false;
    // Ignore pre-mounted inactive results, but not our own visibility rule.
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      if (node.hidden || node.getAttribute("aria-hidden") === "true" ||
          document.defaultView?.getComputedStyle(node).display === "none") return false;
    }
    return true;
  });
}

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
  private normalClocks = false;
  private board: HTMLElement | null = null;
  private stage: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private scrollRoom: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private timer: number | null = null;
  private document: Document | null = null;
  private route = "";
  private suspendedRoute = "";
  private finishedRoute = "";
  private revealTimes = false;
  private forcedTimes = false;
  private maxima = new Map<string, number>();

  private readonly schedule = (): void => {
    const view = this.document?.defaultView;
    if (!view || this.timer !== null) return;
    this.timer = view.setTimeout(() => {
      this.timer = null;
      if (this.document) this.update(this.document);
    }, 16);
  };

  private readonly scroll = (): void => {
    if (this.overlay?.parentElement === this.document?.body) this.schedule();
  };

  private readonly escape = (event: KeyboardEvent): void => {
    if (this.normalClocks || event.key !== "Escape" || !this.document ||
        this.document.querySelector(".chesscom-vinf-settings-dialog[open]")) return;
    this.suspendedRoute = this.route;
    this.cleanup(this.document);
  };

  toggleTimes(): boolean {
    if (!this.overlay || !this.document) return false;
    if (!this.forcedTimes) this.revealTimes = !this.revealTimes;
    this.update(this.document);
    return true;
  }

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, normalGameClocks = false): boolean {
    const normal = normalGameClocks && !settings.extremeOled;
    if (normal !== this.normalClocks) {
      const forced = this.forcedTimes;
      const reveal = this.revealTimes;
      this.cleanup(document);
      this.forcedTimes = forced;
      this.revealTimes = reveal;
    }
    this.normalClocks = normal;
    const route = `${location.protocol}//${location.hostname}${location.pathname}`;
    if (route !== this.route || !settings.extremeOled) this.suspendedRoute = "";
    if (route !== this.route) {
      this.cleanup(document);
      this.finishedRoute = "";
    }
    this.route = route;
    if (!settings.enabled || (!settings.extremeOled && !normal) || this.suspendedRoute === route ||
        !document.documentElement.classList.contains("user-logged-in") ||
        !isChessComGame(location)) {
      this.cleanup(document);
      return false;
    }
    this.document = document;
    this.update(document);
    if (!this.observer && document.body) {
      this.observer = new MutationObserver(records => {
        if (records.some(record => {
          const target = record.target.nodeType === 1 ? record.target as Element : record.target.parentElement;
          return !target?.closest(`[data-chesscom-vinf-owned], .chesscom-vinf-extreme-scroll-room`);
        })) this.schedule();
      });
      this.observer.observe(document.body, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ["class", "style", "hidden", "aria-hidden", "disabled", "aria-disabled"]
      });
      document.defaultView?.addEventListener("resize", this.schedule);
      document.defaultView?.addEventListener("scroll", this.scroll, true);
      document.defaultView?.visualViewport?.addEventListener("resize", this.schedule);
      document.defaultView?.visualViewport?.addEventListener("scroll", this.scroll);
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
    if (nativeGameHasEnded(document)) this.finishedRoute = this.route;
    if (this.finishedRoute === this.route) {
      this.clearPresentation(document);
      return;
    }
    // Only the audited primary board, never a mini-board or analysis preview.
    const board = document.querySelector<HTMLElement>(
      "wc-chess-board#board-single"
    );
    const stage = board?.closest<HTMLElement>("#board-layout-chessboard");
    const nativeClocks = ["top", "bottom"].map(side => document.querySelector<HTMLElement>(`#board-layout-player-${side} .clock-component`));
    if (!board || !stage || board.querySelector("canvas") || !board.querySelector(".piece") ||
        (this.normalClocks && nativeClocks.some(clock => readClockSeconds(clock?.querySelector('[role="timer"]')?.textContent ?? "") === null))) {
      this.clearPresentation(document);
      return;
    }
    if (board !== this.board || stage !== this.stage) {
      this.clearPresentation(document);
      this.board = board;
      this.stage = stage;
      if (!this.normalClocks) board.setAttribute(BOARD, "true");
      const Resize = document.defaultView?.ResizeObserver;
      if (Resize) {
        this.resizeObserver = new Resize(this.schedule);
        this.resizeObserver.observe(board);
      }
    }
    if (!this.overlay?.isConnected) {
      this.overlay = document.createElement("div");
      this.overlay.className = `${OWNER}${this.normalClocks ? " chesscom-vinf-normal-clock-controls" : ""}`;
      this.overlay.setAttribute("data-chesscom-vinf-owned", "extreme-oled");
      for (const side of ["top", "bottom"]) {
        const bar = document.createElement("div");
        bar.className = `chesscom-vinf-extreme-clock ${side}`;
        bar.setAttribute("role", "meter");
        bar.setAttribute("aria-label", `${side === "top" ? "Top" : "Bottom"} player time remaining`);
        bar.setAttribute("aria-valuemin", "0");
        const line = document.createElement("span");
        line.className = "chesscom-vinf-extreme-fuse";
        bar.append(line);
        this.overlay.append(bar);
        const time = document.createElement("button");
        time.type = "button";
        time.className = `chesscom-vinf-extreme-time ${side}`;
        time.addEventListener("click", () => {
          this.toggleTimes();
        });
        this.overlay.append(time);
        const turn = document.createElement("div");
        turn.className = `chesscom-vinf-extreme-turn ${side}`;
        turn.setAttribute("role", "img");
        turn.setAttribute("aria-label", `${side === "top" ? "Top" : "Bottom"} player to move`);
        turn.hidden = true;
        this.overlay.append(turn);
      }
      const controls = document.createElement("nav");
      controls.setAttribute("aria-label", "Move navigation");
      for (const [label, path] of [["Previous Move", "M15 6 9 12 15 18"], ["Next Move", "M9 6 15 12 9 18"]]) {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", label);
        // Symmetric SVG bounds avoid the baseline/side-bearing offsets of font glyphs.
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("aria-hidden", "true");
        icon.setAttribute("focusable", "false");
        const chevron = document.createElementNS("http://www.w3.org/2000/svg", "path");
        chevron.setAttribute("d", path);
        icon.append(chevron);
        button.append(icon);
        button.addEventListener("click", () => {
          const native = this.nativeControl(document, label);
          if (native && !native.disabled && native.getAttribute("aria-disabled") !== "true" &&
              !native.classList.contains("cc-button-disabled")) native.click();
        });
        controls.append(button);
      }
      if (!this.normalClocks) this.overlay.append(controls);
      boardOverlayHost(board).append(this.overlay);
    }
    if (!this.normalClocks && !this.scrollRoom?.isConnected) {
      this.scrollRoom = document.createElement("div");
      this.scrollRoom.className = "chesscom-vinf-extreme-scroll-room";
      this.scrollRoom.setAttribute("aria-hidden", "true");
      document.body.append(this.scrollRoom);
    }
    document.documentElement.setAttribute(this.normalClocks ? NORMAL : ACTIVE, "true");
    const rect = board.getBoundingClientRect();
    const view = document.defaultView;
    // Follow native geometry; never resize/reposition the board or intercept input.
    placeBoardOverlay(this.overlay, boardOverlayHost(board), rect);
    if (this.scrollRoom) this.scrollRoom.style.top = `${Math.max(view?.innerHeight ?? 0, rect.bottom + (view?.scrollY ?? 0)) + 96}px`;
    for (const button of this.overlay.querySelectorAll<HTMLButtonElement>("nav button")) {
      const native = this.nativeControl(document, button.getAttribute("aria-label")!);
      const disabled = !native || native.disabled || native.getAttribute("aria-disabled") === "true" ||
        native.classList.contains("cc-button-disabled");
      if (button.disabled !== disabled) button.disabled = disabled;
    }
    const activeClocks = document.querySelectorAll(
      "#board-layout-player-top .clock-player-turn, #board-layout-player-bottom .clock-player-turn"
    );
    const clockSeconds = ["top", "bottom"].map(side => readClockSeconds(
      document.querySelector(`#board-layout-player-${side} .clock-component [role="timer"]`)?.textContent ?? ""
    ));
    // Latch for this game: an increment back over a minute must not hide urgency.
    if (clockSeconds.some(seconds => seconds !== null && seconds < 60)) this.forcedTimes = true;
    const showTimes = this.revealTimes || this.forcedTimes;
    for (const side of ["top", "bottom"]) {
      const bar = this.overlay.querySelector<HTMLElement>(`.chesscom-vinf-extreme-clock.${side}`)!;
      const clock = document.querySelector<HTMLElement>(`#board-layout-player-${side} .clock-component`);
      const turn = this.overlay.querySelector<HTMLElement>(`.chesscom-vinf-extreme-turn.${side}`)!;
      turn.hidden = activeClocks.length !== 1 || clock !== activeClocks[0];
      const text = clock?.querySelector('[role="timer"]')?.textContent ?? "";
      const seconds = readClockSeconds(text);
      const time = this.overlay.querySelector<HTMLButtonElement>(`.chesscom-vinf-extreme-time.${side}`)!;
      if (this.normalClocks && clock) {
        const clockRect = clock.getBoundingClientRect();
        time.style.left = `${clockRect.left - rect.left + (clockRect.width - 80) / 2}px`;
        time.style.top = `${clockRect.top - rect.top + (clockRect.height - 44) / 2}px`;
      }
      // Numeric times toggle together; the native-time bars always remain visible.
      time.hidden = clockSeconds.every(value => value === null);
      time.setAttribute("aria-pressed", String(showTimes));
      time.setAttribute("aria-disabled", String(this.forcedTimes));
      const player = side === "top" ? "Top" : "Bottom";
      const whole = seconds === null ? null : Math.floor(seconds);
      const display = whole === null ? "—" : whole < 60 ? String(whole) :
        `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
      time.setAttribute("aria-label", showTimes ? `${player} clock ${display}. ${this.forcedTimes ? "Time stays visible" : "Hide both clocks"}` :
        `${player} clock area: show both clocks`);
      time.dataset.low = String(seconds !== null && seconds < 60);
      const label = showTimes ? display : "";
      if (time.textContent !== label) time.textContent = label;
      bar.hidden = seconds === null;
      if (bar.hidden || seconds === null) continue;
      const key = clock?.classList.contains("clock-white") ? "white" :
        clock?.classList.contains("clock-black") ? "black" : side;
      const maximum = Math.max(this.maxima.get(key) ?? 0, seconds, 1);
      this.maxima.set(key, maximum);
      bar.setAttribute("aria-valuemax", String(maximum));
      bar.setAttribute("aria-valuenow", String(seconds));
      bar.setAttribute("aria-valuetext", text.trim());
      bar.dataset.low = String(seconds < 60);
      bar.firstElementChild!.setAttribute("style", `transform:scaleX(${seconds / maximum})`);
    }
  }

  private clearPresentation(document: Document): void {
    document.documentElement.removeAttribute(ACTIVE);
    document.documentElement.removeAttribute(NORMAL);
    this.board?.removeAttribute(BOARD);
    this.board = null;
    this.stage = null;
    this.overlay?.remove();
    this.overlay = null;
    this.scrollRoom?.remove();
    this.scrollRoom = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.maxima.clear();
  }

  cleanup(document: Document): void {
    this.revealTimes = false;
    this.forcedTimes = false;
    this.observer?.disconnect();
    this.observer = null;
    const view = this.document?.defaultView;
    if (this.timer !== null) view?.clearTimeout(this.timer);
    this.timer = null;
    view?.removeEventListener("resize", this.schedule);
    view?.removeEventListener("scroll", this.scroll, true);
    view?.visualViewport?.removeEventListener("resize", this.schedule);
    view?.visualViewport?.removeEventListener("scroll", this.scroll);
    this.document?.removeEventListener("keydown", this.escape);
    this.clearPresentation(document);
    this.document = null;
  }
}
