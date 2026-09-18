import { describe, expect, it, vi } from "vitest";
import {
  ensureGameContinuation,
  findGameContinuationLink,
  isChessComGame
} from "../src/content/game-continuation";
import { LayoutController } from "../src/content/layout-controller";
import { NativeLaunchAdapter } from "../src/content/launch-adapter";
import { GAME_CONTINUATION_OWNER, MARKERS } from "../src/shared/constants";
import { HOME_LOCATION, loadModernHomepageFixture } from "./test-utils";

describe("game continuation shortcut", () => {
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

  it("uses the first exact native game link, including Game History fallback", () => {
    const document = loadModernHomepageFixture();
    const history = document.querySelector<HTMLElement>(
      ".game-history-games-component"
    )!;
    const latestGame = document.createElement("a");
    latestGame.href = "https://www.chess.com/game/123456";
    history.prepend(latestGame);

    expect(findGameContinuationLink(document)).toBe(latestGame);
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

  it("removes the module when no native game link remains", () => {
    const document = loadModernHomepageFixture();
    const link = document.createElement("a");
    link.href = "https://www.chess.com/game/live/111";
    document.body.append(link);
    expect(ensureGameContinuation(document, link)).not.toBeNull();
    expect(ensureGameContinuation(document, null)).toBeNull();
  });
});
