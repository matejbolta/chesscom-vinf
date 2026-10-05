import { isChessComGameAnalysis } from "./game-review-layout-controller";
import { isChessComGame } from "./game-continuation";
import type { ExtensionSettings, LocationLike } from "../shared/models";

const MARKER = "data-chesscom-vinf-four-moves";
const LABELS = ["First Move", "Previous Move", "Play / Pause", "Next Move", "Last Move"];

export function isFirefoxAndroid(navigator: Pick<Navigator, "userAgent">): boolean {
  return /Android/i.test(navigator.userAgent) && /Firefox\//i.test(navigator.userAgent);
}

export class AndroidGameControlsController {
  private docks = new Set<HTMLElement>();

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, enabledLayout: boolean): void {
    const active = enabledLayout && settings.enabled && (isChessComGame(location) || isChessComGameAnalysis(location)) &&
      document.documentElement.classList.contains("user-logged-in");
    const current = new Set<HTMLElement>();
    if (active) for (const dock of document.querySelectorAll<HTMLElement>(
      ".game-buttons-container-component, .game-buttons-container-mobile, .game-controls-primary-component"
    )) {
      const buttons = [...dock.children];
      const labels = isChessComGameAnalysis(location) && buttons.length === 4 ? LABELS.filter(label => label !== "Play / Pause") : LABELS;
      if (buttons.length !== labels.length || !buttons.every((button, index) =>
        button.matches("button") && button.getAttribute("aria-label") === labels[index])) continue;
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
