import type { LocationLike } from "../shared/models";
import { isChessComGame } from "./game-continuation";

export class HomeLink {
  private link: HTMLAnchorElement | null = null;

  reconcile(document: Document, location: LocationLike, enabled: boolean, phone: boolean): void {
    const supported = location.protocol === "https:" && ["chess.com", "www.chess.com"].includes(location.hostname) &&
      (isChessComGame(location) || location.pathname === "/play/online/new" ||
        /^\/analysis\/game\/(?:live\/)?\d+(?:\/(?:review|analysis))?\/?$/.test(location.pathname));
    if (!enabled || !phone || !supported || !document.body ||
        !document.documentElement.classList.contains("user-logged-in")) {
      this.link?.remove(); this.link = null; return;
    }
    if (!this.link?.isConnected) {
      this.link = document.createElement("a");
      this.link.className = "chesscom-vinf-go-home chesscom-vinf-game-continuation chesscom-vinf-game-continuation-action";
      this.link.setAttribute("data-chesscom-vinf-owned", "go-home");
      this.link.href = "https://www.chess.com/home";
      this.link.textContent = "Go home";
    }
    const footer = document.querySelector(".navigation-footer, footer");
    if (footer?.parentElement) {
      if (footer.previousElementSibling !== this.link) footer.before(this.link);
    } else {
      const sections = document.querySelectorAll("#board-layout-main, #board-layout-sidebar, #board-layout-comments");
      const contentAfterLink = [...sections].some(section =>
        Boolean(this.link!.compareDocumentPosition(section) & 4)); // DOCUMENT_POSITION_FOLLOWING
      if (this.link.parentElement !== document.body || contentAfterLink) document.body.append(this.link);
    }
  }
}
