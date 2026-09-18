import { GAME_CONTINUATION_OWNER, MARKERS } from "../shared/constants";
import type { LocationLike } from "../shared/models";

const CHESS_COM_HOSTS = new Set(["www.chess.com", "chess.com"]);
const GAME_PATH = /^(?:\/game\/(?:live\/)?|\/live\/game\/)\d+\/?$/;

export function isChessComGame(location: LocationLike): boolean {
  return (
    location.protocol === "https:" &&
    CHESS_COM_HOSTS.has(location.hostname.toLowerCase()) &&
    GAME_PATH.test(location.pathname)
  );
}

export function findGameContinuationLink(
  document: Document
): HTMLAnchorElement | null {
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    if (
      link.closest(`[${MARKERS.owned}="${GAME_CONTINUATION_OWNER}"]`)
    ) {
      continue;
    }

    try {
      const url = new URL(link.href, document.baseURI);
      if (isChessComGame(url)) {
        return link;
      }
    } catch {
      // Ignore malformed native links and fail closed.
    }
  }
  return null;
}

export function ensureGameContinuation(
  document: Document,
  gameLink: HTMLAnchorElement | null
): HTMLElement | null {
  let module = document.querySelector<HTMLElement>(
    `[${MARKERS.owned}="${GAME_CONTINUATION_OWNER}"]`
  );

  if (!gameLink) {
    module?.remove();
    return null;
  }

  if (!module) {
    module = document.createElement("aside");
    module.className = "chesscom-vinf-game-continuation";
    module.setAttribute(MARKERS.owned, GAME_CONTINUATION_OWNER);
    module.setAttribute(MARKERS.module, "open-game");
    module.setAttribute("aria-label", "Game shortcut");

    const action = document.createElement("a");
    action.className = "chesscom-vinf-game-continuation-action";
    action.textContent = "Jump to open game";
    module.append(action);
  }

  const action = module.querySelector<HTMLAnchorElement>("a");
  if (action) {
    action.href = gameLink.href;
  }
  return module;
}
