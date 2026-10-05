import type { ExtensionSettings, LocationLike } from "../shared/models";
import { PIECE_ROLES } from "../shared/pokemon";
import { pokemonSprite } from "../shared/pokemon-art";
import { isChessComGame } from "./game-continuation";
import { isChessComLiveGameReview, isChessComGameAnalysis } from "./game-review-layout-controller";

const ROOT = "data-chesscom-vinf-pokemon";
const BOARD = "data-chesscom-vinf-pokemon-board";

/** Native .piece nodes and class changes do all movement/promotion work.
 * No board observer, input interception, or animation loop is introduced. */
export class PokemonController {
  private board: HTMLElement | null = null;
  private style: HTMLStyleElement | null = null;
  private signature = "";

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings): void {
    const game = isChessComGame(location);
    if (!settings.enabled || !settings.pokemonMode || settings.extremeOled ||
        (!game && !isChessComLiveGameReview(location) && !isChessComGameAnalysis(location)) ||
        !document.documentElement.classList.contains("user-logged-in")) {
      this.cleanup(document); return;
    }
    const board = document.querySelector<HTMLElement>(game
      ? "#board-layout-chessboard wc-chess-board#board-single"
      : "#board-layout-chessboard wc-chess-board#board-analysis-board");
    if (!board || board.querySelector("canvas") || !board.querySelector(".piece")) {
      this.cleanup(document); return;
    }
    if (!document.documentElement.hasAttribute(ROOT)) document.documentElement.setAttribute(ROOT, "");
    if (board !== this.board) {
      this.board?.removeAttribute(BOARD); this.board = board;
    }
    if (!settings.pokemonPiecesEnabled) {
      board.removeAttribute(BOARD); this.style?.remove(); this.style = null; this.signature = ""; return;
    }
    if (!board.hasAttribute(BOARD)) board.setAttribute(BOARD, "");
    const signature = PIECE_ROLES.map(role => settings.pokemonPieces[role]).join(",");
    if (signature === this.signature && this.style?.isConnected) return;
    this.style?.remove();
    this.style = document.createElement("style");
    this.style.setAttribute("data-chesscom-vinf-owned", "pokemon-pieces");
    this.style.textContent = PIECE_ROLES.map(role => `
      [${BOARD}] .piece:is(.w${role},.b${role}) {
        background-image: url("${pokemonSprite(settings.pokemonPieces[role])}") !important;
      }
    `).join("\n");
    document.head.append(this.style); this.signature = signature;
  }

  cleanup(document: Document): void {
    document.documentElement.removeAttribute(ROOT);
    this.board?.removeAttribute(BOARD); this.board = null;
    this.style?.remove(); this.style = null; this.signature = "";
  }
}

/** Animate only a newly completed move, never page load, clock ticks or a flip. */
export function revealPokemonMove(last: HTMLElement, duration: number): void {
  if (duration <= 0 || last.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const label = last.querySelector<HTMLElement>(".vinf-move-label")!;
  for (const part of last.children) part.getAnimations?.().forEach(animation => animation.cancel());
  label.animate?.([{ opacity: 0, transform: "scale(.75)", offset: 0 },
    { opacity: 0, transform: "scale(.75)", offset: .25 },
    { opacity: 1, transform: "scale(1)", offset: 1 }], { duration, easing: "ease-out" });
  for (const [className, distance] of [["vinf-ball-top", "-85%"], ["vinf-ball-bottom", "85%"]]) {
    last.querySelector<HTMLElement>(`.${className}`)?.animate?.([
      { opacity: 1, transform: "translate(-50%, -50%)" },
      { opacity: 1, transform: `translate(-50%, ${distance})`, offset: .3 },
      { opacity: 0, transform: `translate(-50%, ${distance})` }
    ], { duration, easing: "ease-out" });
  }
}
