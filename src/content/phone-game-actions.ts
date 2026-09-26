import { isChessComGame } from "./game-continuation";
import { nativeGameHasEnded } from "./extreme-oled-controller";
import type { ExtensionSettings, LocationLike } from "../shared/models";

/** Move native component roots, retaining their handlers and confirmation state. */
export class PhoneGameActionsController {
  private row: HTMLElement | null = null;
  private originals = new Map<HTMLElement, Comment>();

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, phoneAndroid: boolean): void {
    if (!phoneAndroid || !settings.enabled || settings.extremeOled || !isChessComGame(location) ||
        !document.documentElement.hasAttribute("data-chesscom-vinf-phone-game") || nativeGameHasEnded(document)) {
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
    const tabs = document.querySelector("#board-layout-sidebar .sidebar-content > .underlined-tabs-component");
    const actions = ["draw", "resign"].map(kind => document.querySelector<HTMLElement>(
      `#board-layout-sidebar .${kind}-button-component`
    ));
    if (!tabs || actions.some(action => !action || action.closest('[role="dialog"], .draw-offer-component'))) {
      this.restore(); return;
    }
    if (!this.row?.isConnected) {
      this.restore();
      this.row = document.createElement("div");
      this.row.className = "chesscom-vinf-phone-actions";
      this.row.dataset.chesscomVinfOwned = "game-actions";
      tabs.before(this.row);
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
      if (anchor.isConnected && action.isConnected) anchor.replaceWith(action);
      else anchor.remove();
    }
    this.originals.clear();
    this.row?.remove(); this.row = null;
  }
}
