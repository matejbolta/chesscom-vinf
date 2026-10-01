import { isChessComGame } from "./game-continuation";
import { nativeGameHasEnded } from "./extreme-oled-controller";
import type { ExtensionSettings, LocationLike } from "../shared/models";

/** Move native component roots, retaining their handlers and confirmation state. */
export class PhoneGameActionsController {
  private row: HTMLElement | null = null;
  private originals = new Map<HTMLElement, Comment>();

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, phoneAndroid: boolean, wideExtreme = false): void {
    // The overlay may be replaced/removed before this controller reconciles.
    if (this.row && !this.row.isConnected) this.restore();
    const wide = wideExtreme && settings.extremeOled && document.documentElement.hasAttribute("data-chesscom-vinf-extreme-oled");
    if ((!phoneAndroid && !wide) || !settings.enabled || !isChessComGame(location) ||
        (!wide && !document.documentElement.hasAttribute("data-chesscom-vinf-phone-game")) || nativeGameHasEnded(document)) {
      this.restore(); return;
    }
    for (const [action, anchor] of this.originals) {
      if (!action.isConnected || !anchor.isConnected) {
        const slot = action.parentElement;
        if (this.row?.contains(action)) action.remove();
        if (slot?.parentElement === this.row && !slot.childNodes.length) slot.remove();
        anchor.remove();
        this.originals.delete(action);
      }
    }
    const clock = document.querySelector<HTMLElement>("#board-layout-player-top .player-component > .clock-component");
    const actions = ["draw", "resign"].map(kind => document.querySelector<HTMLElement>(
      `#board-layout-sidebar .${kind}-button-component`
    ) ?? [...this.originals.keys()].find(action => action.matches(`.${kind}-button-component`)));
    if (!clock || actions.some(action => !action || action.closest('[role="dialog"], .draw-offer-component'))) {
      this.restore(); return;
    }
    const host = wide ? document.querySelector<HTMLElement>(".chesscom-vinf-extreme-controls") : clock.parentElement;
    if (!host) { this.restore(); return; }
    if (this.row && (this.row.parentElement !== host || this.row.classList.contains("chesscom-vinf-wide-actions") !== wide)) this.restore();
    if (!this.row?.isConnected) {
      this.restore();
      this.row = document.createElement("div");
      this.row.className = "chesscom-vinf-phone-actions";
      this.row.dataset.chesscomVinfOwned = "game-actions";
      if (wide) host.append(this.row);
      else clock.before(this.row);
      if (wide) {
        this.row.classList.add("chesscom-vinf-wide-actions");
      }
    }
    // Native hydration can replace a component while its original anchor survives.
    for (const [action, anchor] of this.originals) {
      if (!actions.includes(action)) {
        const slot = action.parentElement;
        if (slot?.parentElement === this.row) slot.remove();
        anchor.remove();
        this.originals.delete(action);
      }
    }
    for (const action of actions as HTMLElement[]) {
      if (!this.originals.has(action)) {
        const anchor = document.createComment("VINF native action position");
        action.before(anchor);
        this.originals.set(action, anchor);
        const slot = document.createElement("div");
        slot.append(action);
        this.row.append(slot);
      }
    }
  }

  private restore(): void {
    for (const [action, anchor] of this.originals) {
      if (anchor.isConnected) anchor.replaceWith(action);
      else anchor.remove();
    }
    this.originals.clear();
    this.row?.remove(); this.row = null;
  }
}
