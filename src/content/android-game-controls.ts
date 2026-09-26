import { isChessComGame } from "./game-continuation";
import type { ExtensionSettings, LocationLike } from "../shared/models";

const MARKER = "data-chesscom-vinf-four-moves";
const LABELS = ["First Move", "Previous Move", "Play / Pause", "Next Move", "Last Move"];

export function isFirefoxAndroid(navigator: Pick<Navigator, "userAgent">): boolean {
  return /Android/i.test(navigator.userAgent) && /Firefox\//i.test(navigator.userAgent);
}

export class AndroidGameControlsController {
  private docks = new Set<HTMLElement>();

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, android: boolean): void {
    const active = android && settings.enabled && !settings.extremeOled && isChessComGame(location) &&
      document.documentElement.classList.contains("user-logged-in");
    const current = new Set<HTMLElement>();
    if (active) for (const dock of document.querySelectorAll<HTMLElement>(
      ".game-buttons-container-component, .game-buttons-container-mobile"
    )) {
      const buttons = [...dock.children];
      if (buttons.length !== LABELS.length || !buttons.every((button, index) =>
        button.matches("button") && button.getAttribute("aria-label") === LABELS[index])) continue;
      const gap = document.defaultView?.getComputedStyle(dock).columnGap ?? "0px";
      const value = gap === "normal" ? "0px" : gap;
      if (dock.style.getPropertyValue("--chesscom-vinf-nav-gap") !== value) dock.style.setProperty("--chesscom-vinf-nav-gap", value);
      dock.setAttribute(MARKER, "true");
      current.add(dock);
    }
    for (const dock of this.docks) if (!current.has(dock)) {
      dock.removeAttribute(MARKER);
      dock.style.removeProperty("--chesscom-vinf-nav-gap");
    }
    this.docks = current;
  }
}
