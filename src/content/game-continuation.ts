import { GAME_CONTINUATION_OWNER, MARKERS } from "../shared/constants";
import type { LocationLike } from "../shared/models";

const CHESS_COM_HOSTS = new Set(["www.chess.com", "chess.com"]);
const GAME_PATH = /^(?:\/game\/(?:live\/)?|\/live\/game\/)\d+\/?$/;
const USER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GAME_HISTORY_SELECTOR = [
  ".game-history-games-component",
  `[${MARKERS.module}="game-history"]`
].join(",");

interface PresenceGame {
  id?: unknown;
  numericId?: unknown;
  source?: unknown;
  timeclass?: unknown;
}

interface PresenceUser {
  activity?: unknown;
  activityContext?: {
    games?: unknown;
  };
  id?: unknown;
}

export type GamePresenceFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

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
  let historyFallback: HTMLAnchorElement | null = null;

  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    if (
      link.closest(`[${MARKERS.owned}="${GAME_CONTINUATION_OWNER}"]`)
    ) {
      continue;
    }

    try {
      const url = new URL(link.href, document.baseURI);
      if (isChessComGame(url)) {
        if (link.closest(GAME_HISTORY_SELECTOR)) {
          historyFallback ??= link;
          continue;
        }
        return link;
      }
    } catch {
      // Ignore malformed native links and fail closed.
    }
  }
  return historyFallback;
}

export function findCurrentUserUuid(document: Document): string | null {
  for (const script of document.scripts) {
    const source = script.textContent ?? "";
    const contextStart = source.search(/(?:^|[;\s])(?:window\.)?context\s*=/);
    if (contextStart < 0) {
      continue;
    }

    const userStart = source.indexOf('"user"', contextStart);
    if (userStart < 0) {
      continue;
    }

    // The signed-in user UUID is near the start of Chess.com's context object.
    // Keep the scan bounded so unrelated account bootstrap data is not handled.
    const match = source
      .slice(userStart, userStart + 16_384)
      .match(/"uuid"\s*:\s*"([0-9a-f-]+)"/i);
    if (match && USER_UUID.test(match[1])) {
      return match[1];
    }
  }
  return null;
}

function liveGamePath(game: PresenceGame): string | null {
  // Current first-party presence uses RCN for live games and routes those to
  // /game/<numericId>; the older live_chess service uses /game/live/<id>.
  if (game.source !== "live_chess" && game.source !== "rcn") {
    return null;
  }
  if (
    (game.source === "rcn" || game.timeclass !== undefined) &&
    !["bullet", "blitz", "rapid"].includes(String(game.timeclass))
  ) {
    return null;
  }
  const candidate = game.source === "rcn" ? game.numericId : game.numericId ?? game.id;
  if (typeof candidate === "number" && !Number.isSafeInteger(candidate)) {
    return null;
  }
  const id = typeof candidate === "number" ? String(candidate) : candidate;
  if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
    return null;
  }
  return game.source === "rcn" ? `/game/${id}` : `/game/live/${id}`;
}

export async function findActiveLiveGameHref(
  document: Document,
  fetcher: GamePresenceFetch,
  signal?: AbortSignal
): Promise<string | null> {
  const uuid = findCurrentUserUuid(document);
  if (!uuid) {
    return null;
  }

  let pageUrl: URL;
  try {
    pageUrl = new URL(document.baseURI);
  } catch {
    return null;
  }
  if (
    pageUrl.protocol !== "https:" ||
    !CHESS_COM_HOSTS.has(pageUrl.hostname.toLowerCase())
  ) {
    return null;
  }

  const endpoint = new URL("/service/presence/users", pageUrl);
  endpoint.searchParams.set("ids", uuid);

  try {
    const response = await fetcher(endpoint, {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal
    });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { users?: unknown };
    if (!Array.isArray(payload.users)) {
      return null;
    }
    const matchingUsers = payload.users.filter((candidate): candidate is PresenceUser => {
      return (
        typeof candidate === "object" &&
        candidate !== null &&
        "id" in candidate &&
        (candidate as PresenceUser).id === uuid
      );
    });
    if (matchingUsers.length !== 1 || matchingUsers[0].activity !== "playing") {
      return null;
    }

    const currentUser = matchingUsers[0];
    const games = currentUser.activityContext?.games;
    if (!Array.isArray(games) || games.length !== 1) {
      return null;
    }
    const candidate = games[0];
    if (typeof candidate !== "object" || candidate === null) {
      return null;
    }
    const path = liveGamePath(candidate as PresenceGame);
    return path ? new URL(path, pageUrl).href : null;
  } catch {
    return null;
  }
}

export function ensureGameContinuation(
  document: Document,
  gameLink: HTMLAnchorElement | string | null
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
    action.href = typeof gameLink === "string" ? gameLink : gameLink.href;
  }
  return module;
}
