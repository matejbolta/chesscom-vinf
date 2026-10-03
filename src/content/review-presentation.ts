import { ReviewRowActions } from "./review-row-actions";
import type { ExtensionSettings, LocationLike } from "../shared/models";
import { isChessComLiveGameReview } from "./game-review-layout-controller";

const CLEAN = "data-chesscom-vinf-review-clean";
const EXTREME = "data-chesscom-vinf-review-extreme";
const BOARD = "data-chesscom-vinf-review-board";
const MUTED = "data-chesscom-vinf-review-muted";

/** Review styling is independent of live-game state, input and clock overlays. */
export class ReviewPresentationController {
  private rowActions = new ReviewRowActions();
  private board: HTMLElement | null = null;
  private attemptedMute: HTMLButtonElement | null = null;

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, phone: boolean): void {
    if (!settings.enabled || !isChessComLiveGameReview(location) ||
        !document.documentElement.classList.contains("user-logged-in")) {
      this.cleanup(document); return;
    }
    // PhoneExperienceController already handles phone audio, including overview.
    if (!phone) this.muteCoach(document);
    else document.querySelectorAll(`[${MUTED}]`).forEach(button => button.removeAttribute(MUTED));
    const board = document.querySelector<HTMLElement>("#board-layout-chessboard wc-chess-board#board-analysis-board");
    const reviewing = !!document.querySelector(".sidebar-view-content > .move-by-move-container > .move-by-move-component");
    const active = !!board && (reviewing || phone);
    document.documentElement.toggleAttribute(CLEAN, active);
    document.documentElement.toggleAttribute(EXTREME, active && settings.extremeOled);
    if (this.board !== board || !active) this.board?.removeAttribute(BOARD);
    this.board = active ? board : null;
    this.board?.toggleAttribute(BOARD, settings.extremeOled);
    this.rowActions.reconcile(document, active && phone);
  }

  private muteCoach(document: Document): void {
    const button = document.querySelector<HTMLButtonElement>('.sidebar-header-header button[aria-label="Toggle Coach Audio"]');
    const glyph = button?.querySelector("svg[data-glyph]")?.getAttribute("data-glyph");
    if (!button) return;
    if (glyph === "media-audio-speaker-mute") {
      button.setAttribute(MUTED, "true"); this.attemptedMute = null;
    } else {
      button.removeAttribute(MUTED);
      if (glyph?.startsWith("media-audio-speaker") && !button.disabled && this.attemptedMute !== button) {
        this.attemptedMute = button;
        button.click();
        if (button.querySelector('[data-glyph="media-audio-speaker-mute"]')) {
          button.setAttribute(MUTED, "true"); this.attemptedMute = null;
        }
      }
    }
  }

  cleanup(document: Document): void {
    this.rowActions.cleanup();
    document.documentElement.removeAttribute(CLEAN);
    document.documentElement.removeAttribute(EXTREME);
    this.board?.removeAttribute(BOARD); this.board = null;
    document.querySelectorAll(`[${MUTED}]`).forEach(button => button.removeAttribute(MUTED));
    this.attemptedMute = null;
    // Retain the native muted preference, never auto-unmute on disable.
  }
}
