import { MaterialFlow } from "./material-flow";
import { ReviewDock } from "./review-dock";
import { isBoardPaintMutation, isClockTextMutation, isOwnedGameMutation } from "./game-mutations";
import type { ExtensionSettings, LocationLike } from "../shared/models";
import { isChessComGame } from "./game-continuation";
import { isChessComLiveGameReview } from "./game-review-layout-controller";
import { nativeGameHasEnded, readClockSeconds } from "./extreme-oled-controller";
import { ReviewEntryScroll } from "./review-entry-scroll";
import { PhoneGameEntry } from "./phone-game-entry";

const GAME = "data-chesscom-vinf-phone-game";
const REVIEW = "data-chesscom-vinf-phone-review";
const ROWS = "data-chesscom-vinf-newest-first";
const MUTED = "data-chesscom-vinf-coach-muted";
const AUDIO_BUTTON = '.sidebar-header-header button[aria-label="Toggle Coach Audio"]';

/** Phone presentation only. Never resize/reparent the board or synthesize game actions. */
export class PhoneExperienceController {
  private entry = new PhoneGameEntry();
  private reviewEntry = new ReviewEntryScroll();
  private reviewDock = new ReviewDock();
  private materialFlow = new MaterialFlow();
  private route = "";
  private finished = false;
  private observer: MutationObserver | null = null;
  private document: Document | null = null;
  private timer: number | null = null;
  private refresh: (() => void) | null = null;
  private wrappers = new Set<HTMLElement>();
  private rows = new Set<HTMLElement>();
  private latestPlies = new Map<HTMLElement, number>();
  private stopFollowing: (() => void) | null = null;
  private muteAttempt: HTMLButtonElement | null = null;
  private openingPositions = new Map<HTMLElement, { parent: Node; next: ChildNode | null }>();
  private spacer: HTMLElement | null = null;

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, phone: boolean, phoneAndroid = phone): void {
    const route = `${location.protocol}//${location.hostname}${location.pathname}`;
    if (route !== this.route) {
      this.cleanup(document);
      this.route = route;
      this.finished = false;
    }
    const signedIn = document.documentElement.classList.contains("user-logged-in");
    const review = isChessComLiveGameReview(location);
    const game = isChessComGame(location);
    if (!settings.enabled || !phone || !signedIn || (!review && !game)) {
      this.cleanup(document);
      return;
    }
    this.document = document;
    this.refresh = () => this.reconcile(document, location, settings, phone, phoneAndroid);
    if (!this.observer && document.body) {
      this.observer = new MutationObserver(records => {
        if (!records.some(record => !isOwnedGameMutation(record) && !isBoardPaintMutation(record) &&
            !(document.documentElement.hasAttribute(GAME) && isClockTextMutation(record)))) return;
        if (this.timer !== null) return;
        this.timer = document.defaultView!.setTimeout(() => {
          this.timer = null;
          this.refresh?.();
        }, 60);
      });
      this.observer.observe(document.body, {
        subtree: true, childList: true, characterData: true, attributes: true,
        attributeFilter: ["class", "data-glyph", "disabled", "data-whole-move-number", "data-node", "hidden", "aria-hidden", "aria-label"]
      });
    }
    if (review) {
      this.materialFlow.cleanup();
      document.documentElement.setAttribute(REVIEW, "true");
      this.updateReview(document);
      this.reviewDock.reconcile(document);
      this.reviewEntry.reconcile(document);
      return;
    }
    if (nativeGameHasEnded(document)) this.finished = true;
    const board = document.querySelector("#board-layout-chessboard wc-chess-board#board-single");
    const timers = document.querySelectorAll('#board-layout-player-top .clock-component [role="timer"], #board-layout-player-bottom .clock-component [role="timer"]');
    if (this.finished || !board || timers.length !== 2 ||
        [...timers].some(timer => readClockSeconds(timer.textContent ?? "") === null)) {
      document.documentElement.removeAttribute(GAME);
      document.documentElement.removeAttribute("data-chesscom-vinf-phone-material");
      this.materialFlow.cleanup();
      if (this.finished) this.entry.cleanup();
      this.clearRows();
      this.restoreOpening();
      return;
    }
    document.documentElement.setAttribute(GAME, "true");
    document.documentElement.toggleAttribute("data-chesscom-vinf-phone-material", phoneAndroid);
    if (phoneAndroid) this.materialFlow.reconcile(document); else this.materialFlow.cleanup();
    this.entry.reconcile(document, route);
    if (settings.extremeOled) {
      // Share entry positioning and player rows; keep Extreme's scroll room/sidebar.
      this.clearRows();
      this.restoreOpening();
      return;
    }
    this.updateRows(document);
    this.moveOpening(document);
  }

  private moveOpening(document: Document): void {
    const list = document.querySelector("#live-game-tab-scroll-container");
    const opening = document.querySelector<HTMLElement>("#board-layout-sidebar .eco-opening-component");
    if (!list?.parentElement || !opening?.parentNode) return;
    if (!this.openingPositions.has(opening)) this.openingPositions.set(opening, { parent: opening.parentNode, next: opening.nextSibling });
    if (list.nextSibling !== opening) list.after(opening);
  }

  private restoreOpening(): void {
    for (const [opening, position] of this.openingPositions) {
      if (position.parent.isConnected) position.parent.insertBefore(opening,
        position.next?.parentNode === position.parent ? position.next : null);
      else opening.remove();
    }
    this.openingPositions.clear();
  }

  private updateRows(document: Document): void {
    const validWrappers = new Set<HTMLElement>();
    const validRows = new Set<HTMLElement>();
    for (const list of document.querySelectorAll<HTMLElement>(
      '#live-game-tab-scroll-container wc-simple-move-list[board-id="board-single"] > .timestamps-with-base-time'
    )) {
      const rows = [...list.children] as HTMLElement[];
      // Fail open for variations, virtualized slices, spacers or a changed renderer.
      // DOM order and the native white/black children always remain chronological.
      if (!rows.length || !rows.every((row, index) =>
        row.matches(".main-line-row.move-list-row") &&
        row.dataset.wholeMoveNumber === String(index + 1) &&
        row.querySelector(":scope > .node.white-move.main-line-ply") &&
        !row.querySelector(".variation")
      )) continue;
      validWrappers.add(list);
      list.setAttribute(ROWS, "true");
      for (const row of rows) {
        validRows.add(row);
        const order = String(-Number(row.dataset.wholeMoveNumber));
        if (row.style.getPropertyValue("--chesscom-vinf-move-order") !== order) {
          row.style.setProperty("--chesscom-vinf-move-order", order);
        }
      }
      const last = rows[rows.length - 1];
      const ply = rows.length * 2 - (last.querySelector(":scope > .black-move.main-line-ply")?.textContent?.trim() ? 0 : 1);
      const previous = this.latestPlies.get(list) ?? -1;
      this.latestPlies.set(list, ply);
      if (ply > previous) this.followLatest(document, list.closest<HTMLElement>("#live-game-tab-scroll-container")!);
    }
    for (const wrapper of this.wrappers) if (!validWrappers.has(wrapper)) {
      wrapper.removeAttribute(ROWS);
      this.latestPlies.delete(wrapper);
      this.stopFollowing?.();
    }
    for (const row of this.rows) if (!validRows.has(row)) row.style.removeProperty("--chesscom-vinf-move-order");
    this.wrappers = validWrappers;
    this.rows = validRows;
  }

  private followLatest(document: Document, container: HTMLElement): void {
    this.stopFollowing?.();
    const view = document.defaultView!;
    // Native SELECT_NODE waits for rendering and assumes the latest ply is at
    // the bottom. Settle only this scroll container, only after a new ply.
    const top = () => { if (container.scrollTop !== 0) container.scrollTop = 0; };
    const stop = () => {
      view.clearTimeout(timer);
      view.cancelAnimationFrame(frame);
      container.removeEventListener("scroll", top);
      for (const event of ["pointerdown", "touchstart", "wheel", "keydown"]) document.removeEventListener(event, stop, true);
      if (this.stopFollowing === stop) this.stopFollowing = null;
    };
    const timer = view.setTimeout(stop, 500);
    const frame = view.requestAnimationFrame(top);
    this.stopFollowing = stop;
    container.addEventListener("scroll", top, { passive: true });
    // Any deliberate input wins immediately; older-move selection stays native.
    for (const event of ["pointerdown", "touchstart", "wheel", "keydown"]) document.addEventListener(event, stop, { capture: true, passive: true });
    top();
  }

  private updateReview(document: Document): void {
    const button = document.querySelector<HTMLButtonElement>(AUDIO_BUTTON);
    const glyph = button?.querySelector("svg[data-glyph]")?.getAttribute("data-glyph");
    if (button && glyph === "media-audio-speaker-mute") {
      button.setAttribute(MUTED, "true");
      this.muteAttempt = null;
    } else if (button) {
      button.removeAttribute(MUTED);
      // Audited native header is a binary enabled/muted speaker control. Unknown
      // icon/button states remain visible; never toggle blindly or retry forever.
      if (glyph?.startsWith("media-audio-speaker") && !button.disabled && this.muteAttempt !== button) {
        this.muteAttempt = button;
        button.click();
        if (button.querySelector('svg[data-glyph="media-audio-speaker-mute"]')) {
          button.setAttribute(MUTED, "true");
          this.muteAttempt = null;
        }
      }
    }
    const footer = document.querySelector<HTMLElement>(".game-controls-view-component > .mobile-gr-footer-footer");
    if (!footer) {
      this.spacer?.remove();
      this.spacer = null;
      return;
    }
    const host = footer.closest(".sidebar-view-component");
    if (!host) return;
    if (!this.spacer?.isConnected || this.spacer.parentElement !== host) {
      this.spacer?.remove();
      this.spacer = document.createElement("div");
      this.spacer.className = "chesscom-vinf-review-dock-clearance";
      this.spacer.setAttribute("aria-hidden", "true");
      host.append(this.spacer);
    }
  }

  private clearRows(): void {
    this.stopFollowing?.();
    this.latestPlies.clear();
    for (const wrapper of this.wrappers) wrapper.removeAttribute(ROWS);
    for (const row of this.rows) row.style.removeProperty("--chesscom-vinf-move-order");
    this.wrappers.clear();
    this.rows.clear();
  }

  cleanup(document: Document): void {
    document.documentElement.removeAttribute("data-chesscom-vinf-phone-material");
    this.entry.cleanup();
    this.reviewEntry.cleanup();
    this.reviewDock.cleanup();
    this.materialFlow.cleanup();
    this.observer?.disconnect();
    this.observer = null;
    if (this.timer !== null) this.document?.defaultView?.clearTimeout(this.timer);
    this.timer = null;
    this.refresh = null;
    this.clearRows();
    this.restoreOpening();
    document.documentElement.removeAttribute(GAME);
    document.documentElement.removeAttribute(REVIEW);
    document.querySelectorAll(`[${MUTED}]`).forEach(button => button.removeAttribute(MUTED));
    this.spacer?.remove();
    this.spacer = null;
    this.muteAttempt = null;
    // The requested native audio-off preference is retained. Never auto-unmute.
  }
}
