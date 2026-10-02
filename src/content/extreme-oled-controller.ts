import { LastMoveReader } from "./last-move";
import { ClockBarReference } from "./clock-bar-reference";
import { isBoardPaintMutation, isClockTextMutation, isOwnedGameMutation } from "./game-mutations";
import { boardOverlayHost, placeBoardOverlay } from "./board-overlay";
import type { ExtensionSettings, LocationLike } from "../shared/models";
import { isChessComGame } from "./game-continuation";

const ACTIVE = "data-chesscom-vinf-extreme-oled";
const NORMAL = "data-chesscom-vinf-normal-clocks";
const BOARD = "data-chesscom-vinf-extreme-board";
const OWNER = "chesscom-vinf-extreme-controls";

function setAttribute(element: Element, name: string, value: string): void {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

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
  private lastMove = new LastMoveReader();
  private normalClocks = false;
  private desktop = false;
  private dotSize = 12;
  private animationDuration = 1000;
  private pulseScale = 2;
  private activePlayer = "";
  private turnStarted = 0;
  private geometryDirty = true;
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
  private reference = new ClockBarReference();

  private readonly schedule = (): void => {
    const view = this.document?.defaultView;
    if (!view || this.timer !== null) return;
    this.timer = view.setTimeout(() => {
      this.timer = null;
      if (this.document) this.update(this.document);
    }, 16);
  };

  private readonly scheduleGeometry = (): void => {
    this.geometryDirty = true;
    this.schedule();
  };

  private readonly scroll = (): void => {
    if (this.overlay?.parentElement === this.document?.body) this.scheduleGeometry();
  };

  private readonly escape = (event: KeyboardEvent): void => {
    if (this.normalClocks || event.key !== "Escape" || !this.document ||
        this.document.querySelector(".chesscom-vinf-settings-dialog[open]")) return;
    this.suspendedRoute = this.route;
    this.cleanup(this.document);
  };

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, normalGameClocks = false, desktop = false): boolean {
    if (this.desktop !== desktop) this.cleanup(document);
    this.desktop = desktop;
    if (this.animationDuration !== settings.turnAnimationDuration || this.pulseScale !== settings.turnPulseScale || this.dotSize !== settings.turnDotSize) {
      this.overlay?.querySelectorAll<HTMLElement>(".chesscom-vinf-extreme-turn").forEach(turn =>
        turn.getAnimations?.().forEach(animation => animation.cancel()));
    }
    this.dotSize = settings.turnDotSize;
    this.pulseScale = settings.turnPulseScale;
    this.animationDuration = settings.turnAnimationDuration;
    const normal = normalGameClocks && !settings.extremeOled;
    if (normal !== this.normalClocks) this.cleanup(document);
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
    this.reference.useGame(document, location.pathname);
    this.geometryDirty = true;
    this.update(document);
    if (!this.observer && document.body) {
      this.observer = new MutationObserver(records => {
        const relevant = records.filter(record => !isOwnedGameMutation(record) && !isBoardPaintMutation(record));
        if (!relevant.length) return;
        this.lastMove.invalidate(relevant);
        if (relevant.some(record => !isClockTextMutation(record))) this.geometryDirty = true;
        this.schedule();
      });
      this.observer.observe(document.body, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ["class", "style", "hidden", "aria-hidden", "disabled", "aria-disabled", "data-node", "data-figurine"]
      });
      document.defaultView?.addEventListener("resize", this.scheduleGeometry);
      document.defaultView?.addEventListener("scroll", this.scroll, true);
      document.defaultView?.visualViewport?.addEventListener("resize", this.scheduleGeometry);
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
        this.resizeObserver = new Resize(this.scheduleGeometry);
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
        setAttribute(bar, "role", "meter");
        setAttribute(bar, "aria-label", `${side === "top" ? "Top" : "Bottom"} player time remaining`);
        setAttribute(bar, "aria-valuemin", "0");
        const line = document.createElement("span");
        line.className = "chesscom-vinf-extreme-fuse";
        bar.append(line);
        this.overlay.append(bar);
        const time = document.createElement("div");
        time.setAttribute("role", "timer");
        time.setAttribute("aria-live", "off");
        time.className = `chesscom-vinf-extreme-time ${side}`;
        this.overlay.append(time);
        const turn = document.createElement("div");
        turn.className = `chesscom-vinf-extreme-turn ${side}`;
        turn.setAttribute("role", "img");
        turn.setAttribute("aria-label", `${side === "top" ? "Top" : "Bottom"} player to move`);
        turn.hidden = true;
        this.overlay.append(turn);
        const lastMove = document.createElement("span");
        lastMove.className = `chesscom-vinf-last-move ${side}`;
        lastMove.hidden = true;
        this.overlay.append(lastMove);
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
      if (!this.normalClocks && !this.desktop) this.overlay.append(controls);
      boardOverlayHost(board).append(this.overlay);
    }
    if (!this.normalClocks && !this.scrollRoom?.isConnected) {
      this.scrollRoom = document.createElement("div");
      this.scrollRoom.className = "chesscom-vinf-extreme-scroll-room";
      this.scrollRoom.setAttribute("aria-hidden", "true");
      document.body.append(this.scrollRoom);
    }
    setAttribute(document.documentElement, this.normalClocks ? NORMAL : ACTIVE, "true");
    const wideExtreme = !this.normalClocks && !document.documentElement.hasAttribute("data-chesscom-vinf-phone-material");
    this.overlay.classList.add("chesscom-vinf-row-clock-controls");
    const desktopExtreme = this.desktop && !this.normalClocks;
    this.overlay.classList.toggle("chesscom-vinf-desktop-extreme-controls", desktopExtreme);
    this.overlay.classList.toggle("chesscom-vinf-wide-extreme-controls", wideExtreme);
    const dotSize = `${this.dotSize}px`;
    if (this.overlay.style.getPropertyValue("--vinf-turn-size") !== dotSize) this.overlay.style.setProperty("--vinf-turn-size", dotSize);
    const rect = this.geometryDirty ? board.getBoundingClientRect() : null;
    const view = document.defaultView;
    // Follow native geometry; never resize/reposition the board or intercept input.
    if (rect) placeBoardOverlay(this.overlay, boardOverlayHost(board), rect);
    if (this.scrollRoom && rect) this.scrollRoom.style.top = `${Math.max(view?.innerHeight ?? 0, rect.bottom + (view?.scrollY ?? 0)) + 96}px`;
    for (const button of this.overlay.querySelectorAll<HTMLButtonElement>("nav button")) {
      const native = this.nativeControl(document, button.getAttribute("aria-label")!);
      const disabled = !native || native.disabled || native.getAttribute("aria-disabled") === "true" ||
        native.classList.contains("cc-button-disabled");
      if (button.disabled !== disabled) button.disabled = disabled;
    }
    const activeClocks = document.querySelectorAll(
      "#board-layout-player-top .clock-player-turn, #board-layout-player-bottom .clock-player-turn"
    );
    // Identify the player by color across flips. Do not pulse on initial mount
    // or transient ambiguous native turn state; only a confirmed player change.
    const active = activeClocks.length === 1 ? activeClocks[0] : null;
    const identity = active ? (active.classList.contains("clock-white") ? "white" :
      active.classList.contains("clock-black") ? "black" :
      active.closest("#board-layout-player-top") ? "top" : "bottom") : "";
    const switched = !!identity && !!this.activePlayer && identity !== this.activePlayer;
    const now = view?.performance.now() ?? 0;
    if (identity && identity !== this.activePlayer) {
      this.activePlayer = identity;
      this.turnStarted = now;
    }
    const slowMove = !!identity && now - this.turnStarted >= 60_000;
    const clockSeconds = ["top", "bottom"].map(side => readClockSeconds(
      document.querySelector(`#board-layout-player-${side} .clock-component [role="timer"]`)?.textContent ?? ""
    ));
    const lastMove = this.lastMove.read(document);
    const activeSeconds = readClockSeconds(active?.querySelector('[role="timer"]')?.textContent ?? "");
    const activeLow = slowMove || activeSeconds !== null && activeSeconds < 60;
    for (const side of ["top", "bottom"]) {
      const bar = this.overlay.querySelector<HTMLElement>(`.chesscom-vinf-extreme-clock.${side}`)!;
      const clock = document.querySelector<HTMLElement>(`#board-layout-player-${side} .clock-component`);
      const turn = this.overlay.querySelector<HTMLElement>(`.chesscom-vinf-extreme-turn.${side}`)!;
      const inactive = activeClocks.length !== 1 || clock !== activeClocks[0];
      if (turn.hidden !== inactive) turn.hidden = inactive;
      const last = this.overlay.querySelector<HTMLElement>(`.chesscom-vinf-last-move.${side}`)!;
      const showLast = !!active && inactive && !!lastMove && !!clock?.classList.contains(`clock-${lastMove.color}`);
      if (last.hidden === showLast) last.hidden = !showLast;
      const notation = showLast ? lastMove!.notation : "";
      if (last.textContent !== notation) last.textContent = notation;
      setAttribute(last, "aria-label", notation ? `Last move: ${notation}` : "Last move");
      setAttribute(last, "data-low", String(activeLow));
      const text = clock?.querySelector('[role="timer"]')?.textContent ?? "";
      const seconds = readClockSeconds(text);
      setAttribute(turn, "data-low", String(!inactive && (slowMove || seconds !== null && seconds < 60)));
      if (!inactive && switched && this.animationDuration > 0 && !view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        turn.getAnimations?.().forEach(animation => animation.cancel());
        // Bound the rendered diameter, independently of the resting dot size.
        const scale = Math.min(this.pulseScale, 48 / this.dotSize);
        turn.animate?.([{ transform: `scale(${scale})` }, { transform: "scale(1)" }],
          { duration: this.animationDuration, easing: "ease-out" });
      }
      const time = this.overlay.querySelector<HTMLElement>(`.chesscom-vinf-extreme-time.${side}`)!;
      if (!wideExtreme && clock && rect) {
        const clockRect = clock.getBoundingClientRect();
        if (document.documentElement.hasAttribute("data-chesscom-vinf-phone-material")) {
          for (const indicator of [turn, last]) {
            // Native clock slot follows the two 44px actions and half of the
            // reserved 64px indicator lane. Reuse its already-read geometry.
            const x = `${clockRect.left - rect.left - 120}px`;
            const y = `${clockRect.top - rect.top + clockRect.height / 2}px`;
            if (indicator.style.getPropertyValue("--vinf-row-x") !== x) indicator.style.setProperty("--vinf-row-x", x);
            if (indicator.style.getPropertyValue("--vinf-row-y") !== y) indicator.style.setProperty("--vinf-row-y", y);
          }
        }
        const width = Math.min(80, clockRect.width);
        time.style.width = `${width}px`;
        time.style.left = `${clockRect.left - rect.left + (clockRect.width - width) / 2}px`;
        time.style.top = `${clockRect.top - rect.top + (clockRect.height - 44) / 2}px`;
      }
      if (wideExtreme && time.style.width) {
        // Phone -> tablet resize restores Extreme's separate clock positions.
        for (const property of ["width", "left", "top"]) time.style.removeProperty(property);
      }
      // Read-only clock display; native-time bars remain visible as well.
      const unavailable = clockSeconds.every(value => value === null);
      if (time.hidden !== unavailable) time.hidden = unavailable;
      const player = side === "top" ? "Top" : "Bottom";
      const whole = seconds === null ? null : Math.floor(seconds);
      const display = whole === null ? "—" : whole < 60 ? String(whole) :
        `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
      setAttribute(time, "aria-label", `${player} clock ${display}`);
      setAttribute(time, "data-low", String(seconds !== null && seconds < 60));
      if (time.textContent !== display) time.textContent = display;
      if (bar.hidden !== (seconds === null)) bar.hidden = seconds === null;
      if (bar.hidden || seconds === null) continue;
      const key = clock?.classList.contains("clock-white") ? "white" :
        clock?.classList.contains("clock-black") ? "black" : side;
      const maximum = this.reference.maximum(key, seconds);
      setAttribute(bar, "aria-valuemax", String(maximum));
      setAttribute(bar, "aria-valuenow", String(seconds));
      setAttribute(bar, "aria-valuetext", text.trim());
      setAttribute(bar, "data-low", String(seconds < 60));
      setAttribute(bar, "data-paused", String(!!active && inactive));
      setAttribute(bar, "style", `--vinf-clock-fraction:${seconds / maximum}`);
      setAttribute(bar.firstElementChild!, "style", `transform:scaleX(${seconds / maximum})`);
    }
    this.geometryDirty = false;
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
    this.activePlayer = "";
    this.turnStarted = 0;
  }

  cleanup(document: Document): void {
    this.observer?.disconnect();
    this.observer = null;
    const view = this.document?.defaultView;
    if (this.timer !== null) view?.clearTimeout(this.timer);
    this.timer = null;
    view?.removeEventListener("resize", this.scheduleGeometry);
    view?.removeEventListener("scroll", this.scroll, true);
    view?.visualViewport?.removeEventListener("resize", this.scheduleGeometry);
    view?.visualViewport?.removeEventListener("scroll", this.scroll);
    this.document?.removeEventListener("keydown", this.escape);
    this.clearPresentation(document);
    this.document = null;
    this.lastMove.reset();
  }
}
