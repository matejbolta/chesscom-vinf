import { AnalysisRowActions } from "./analysis-row-actions";
import { ReviewRowActions } from "./review-row-actions";
import type { ExtensionSettings, LocationLike } from "../shared/models";
import { isChessComLiveGameReview, isChessComGameAnalysis } from "./game-review-layout-controller";

const CLEAN = "data-chesscom-vinf-review-clean";
const EXTREME = "data-chesscom-vinf-review-extreme";
const BOARD = "data-chesscom-vinf-review-board";
const MUTED = "data-chesscom-vinf-review-muted";

/** Review styling is independent of live-game state, input and clock overlays. */
export class ReviewPresentationController {
  private analysisActions = new AnalysisRowActions();
  private rowActions = new ReviewRowActions();
  private board: HTMLElement | null = null;

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, phone: boolean): void {
    const analysis = isChessComGameAnalysis(location);
    if (!settings.enabled || !(isChessComLiveGameReview(location) || analysis) ||
        !document.documentElement.classList.contains("user-logged-in")) {
      this.cleanup(document); return;
    }
    const board = document.querySelector<HTMLElement>("#board-layout-chessboard wc-chess-board#board-analysis-board");
    const active = !!board;
    document.documentElement.toggleAttribute(CLEAN, active && phone);
    document.documentElement.toggleAttribute("data-chesscom-vinf-analysis", active && analysis);
    document.documentElement.toggleAttribute("data-chesscom-vinf-phone-analysis", active && phone && analysis);
    document.documentElement.toggleAttribute(EXTREME, false);
    if (this.board !== board || !active) this.board?.removeAttribute(BOARD);
    this.board = active ? board : null;
    this.board?.toggleAttribute(BOARD, settings.extremeOled);
    this.rowActions.reconcile(document, active && phone && !analysis);
    this.analysisActions.reconcile(document, active && phone && analysis);
  }

  cleanup(document: Document): void {
    this.rowActions.cleanup();
    this.analysisActions.cleanup();
    document.documentElement.removeAttribute("data-chesscom-vinf-phone-analysis");
    document.documentElement.removeAttribute("data-chesscom-vinf-analysis");
    document.documentElement.removeAttribute(CLEAN);
    document.documentElement.removeAttribute(EXTREME);
    this.board?.removeAttribute(BOARD); this.board = null;
    document.querySelectorAll(`[${MUTED}]`).forEach(button => button.removeAttribute(MUTED));
    // Retain the native muted preference, never auto-unmute on disable.
  }
}
