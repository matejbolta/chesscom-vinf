import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  ensureGameContinuation,
  findActiveLiveGameHref,
  findCurrentUserUuid,
  findGameContinuationLink,
  isChessComGame
} from "../src/content/game-continuation";
import { LayoutController } from "../src/content/layout-controller";
import { NativeLaunchAdapter } from "../src/content/launch-adapter";
import { GAME_CONTINUATION_OWNER, MARKERS } from "../src/shared/constants";
import { HOME_LOCATION, loadModernHomepageFixture } from "./test-utils";

describe("game continuation shortcut", () => {
  const userUuid = "12345678-1234-1234-1234-123456789abc";

  it("recognizes current and legacy exact Chess.com game routes", () => {
    for (const pathname of [
      "/game/123456",
      "/game/live/123456",
      "/live/game/123456"
    ]) {
      expect(
        isChessComGame({
          protocol: "https:",
          hostname: "www.chess.com",
          pathname
        })
      ).toBe(true);
    }
    expect(
      isChessComGame({
        protocol: "https:",
        hostname: "www.chess.com",
        pathname: "/analysis/game/live/123456"
      })
    ).toBe(false);
    expect(
      isChessComGame({
        protocol: "https:",
        hostname: "example.com",
        pathname: "/game/123456"
      })
    ).toBe(false);
  });

  it("uses the first exact Game History link as its fallback", () => {
    const document = loadModernHomepageFixture();
    const history = document.querySelector<HTMLElement>(
      ".game-history-games-component"
    )!;
    const latestGame = document.createElement("a");
    latestGame.href = "https://www.chess.com/game/123456";
    history.prepend(latestGame);

    expect(findGameContinuationLink(document)).toBe(latestGame);
  });

  it("prefers an active-game link outside Game History over the history fallback", () => {
    const document = loadModernHomepageFixture();
    const history = document.querySelector<HTMLElement>(
      ".game-history-games-component"
    )!;
    const finishedGame = document.createElement("a");
    finishedGame.href = "https://www.chess.com/game/123456";
    history.prepend(finishedGame);

    const activeGame = document.createElement("a");
    activeGame.href = "https://www.chess.com/game/live/654321";
    document.body.append(activeGame);

    expect(findGameContinuationLink(document)).toBe(activeGame);
  });

  it("uses Chess.com's current-user presence game before the history fallback", async () => {
    const document = loadModernHomepageFixture();
    const context = document.createElement("script");
    context.textContent = `context = {"user":{"uuid":"${userUuid}"}};`;
    document.head.append(context);
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          users: [
            {
              id: userUuid,
              activity: "playing",
              activityContext: {
                games: [
                  { source: "live_chess", numericId: 987654321 }
                ]
              }
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    expect(findCurrentUserUuid(document)).toBe(userUuid);
    await expect(findActiveLiveGameHref(document, fetcher)).resolves.toBe(
      "https://www.chess.com/game/live/987654321"
    );
    expect(fetcher).toHaveBeenCalledWith(
      new URL(
        `https://www.chess.com/service/presence/users?ids=${userUuid}`
      ),
      {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        cache: "no-store",
        redirect: "error",
        signal: undefined
      }
    );
  });

  it("fails closed when presence does not prove a current live game", async () => {
    const document = loadModernHomepageFixture();
    const context = document.createElement("script");
    context.textContent = `window.context = {"user":{"uuid":"${userUuid}"}};`;
    document.head.append(context);
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          users: [
            {
              id: userUuid,
              activity: "online",
              activityContext: {
                games: [{ source: "live_chess", numericId: 987654321 }]
              }
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(findActiveLiveGameHref(document, fetcher)).resolves.toBeNull();
  });

  // Structural facts captured from a real cross-device mobile game on
  // 2026-09-19; both account and game identifiers are synthetic.
  const rcnPresence = JSON.parse(readFileSync(
    resolve(process.cwd(), "tests/fixtures/presence-rcn-playing.json"), "utf8"
  ));

  it("maps the observed RCN live presence to Chess.com's current native route", async () => {
    const document = loadModernHomepageFixture();
    const script = document.createElement("script");
    script.textContent = `context = {"user":{"uuid":"${userUuid}"}};`;
    document.head.append(script);
    const fetcher = vi.fn(async () => new Response(JSON.stringify(rcnPresence)));
    expect(await findActiveLiveGameHref(document, fetcher)).toBe(
      "https://www.chess.com/game/987654321"
    );
  });

  it.each([
    ["unrelated user", (p: any) => { p.users[0].id = "other"; }],
    ["duplicate users", (p: any) => { p.users.push(p.users[0]); }],
    ["ambiguous games", (p: any) => { p.users[0].activityContext.games.push(p.users[0].activityContext.games[0]); }],
    ["daily game", (p: any) => { p.users[0].activityContext.games[0].timeclass = "daily"; }],
    ["unknown source", (p: any) => { p.users[0].activityContext.games[0].source = "unknown"; }],
    ["missing numeric ID", (p: any) => { delete p.users[0].activityContext.games[0].numericId; }],
    ["off-origin ID", (p: any) => { p.users[0].activityContext.games[0].numericId = "https://example.com/game/1"; }],
    ["unsafe numeric ID", (p: any) => { p.users[0].activityContext.games[0].numericId = Number.MAX_SAFE_INTEGER + 1; }],
    ["not playing", (p: any) => { p.users[0].activity = "none"; }],
    ["malformed games", (p: any) => { p.users[0].activityContext.games = [null]; }]
  ])("rejects %s instead of inventing an active game", async (_name, change) => {
    const document = loadModernHomepageFixture();
    const script = document.createElement("script");
    script.textContent = `context = {"user":{"uuid":"${userUuid}"}};`;
    document.head.append(script);
    const payload = structuredClone(rcnPresence);
    change(payload);
    expect(await findActiveLiveGameHref(document, async () =>
      new Response(JSON.stringify(payload))
    )).toBeNull();
  });

  it("renders one full-width managed card in the default desktop sidebar", () => {
    const document = loadModernHomepageFixture();
    const nativeLink = document.createElement("a");
    nativeLink.href = "https://www.chess.com/game/123456?source=homepage";
    document.querySelector(".game-history-games-component")!.prepend(nativeLink);
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);

    const module = document.querySelector<HTMLElement>(
      `[${MARKERS.owned}="${GAME_CONTINUATION_OWNER}"]`
    )!;
    expect(module.parentElement).toBe(
      document.querySelector("#home-sidebar > .sidebar-component")
    );
    expect(module.getAttribute(MARKERS.module)).toBe("open-game");
    expect(module.textContent).toBe("Jump to open game");
    expect(module.querySelector("a")?.href).toBe(nativeLink.href);
    expect(module.querySelector("a")?.className).toContain(
      "chesscom-vinf-game-continuation-action"
    );

    controller.reconcile(document, HOME_LOCATION);
    expect(
      document.querySelectorAll(
        `[${MARKERS.owned}="${GAME_CONTINUATION_OWNER}"]`
      )
    ).toHaveLength(1);
  });

  it("lets verified presence override the native history link", () => {
    const document = loadModernHomepageFixture();
    const historyLink = document.createElement("a");
    historyLink.href = "https://www.chess.com/game/123456";
    document.querySelector(".game-history-games-component")!.prepend(historyLink);
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    controller.reconcile(
      document,
      HOME_LOCATION,
      undefined,
      "https://www.chess.com/game/live/987654321"
    );

    expect(
      document.querySelector<HTMLAnchorElement>(
        ".chesscom-vinf-game-continuation-action"
      )?.href
    ).toBe("https://www.chess.com/game/live/987654321");
  });

  it("removes the module when no native game link remains", () => {
    const document = loadModernHomepageFixture();
    const link = document.createElement("a");
    link.href = "https://www.chess.com/game/live/111";
    document.body.append(link);
    expect(ensureGameContinuation(document, link)).not.toBeNull();
    expect(ensureGameContinuation(document, null)).toBeNull();
  });
});
