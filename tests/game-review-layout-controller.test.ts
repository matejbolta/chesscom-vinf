import { describe, expect, it, vi } from "vitest";
import {
  GameReviewLayoutController,
  isChessComLiveGameReview
} from "../src/content/game-review-layout-controller";
import { MARKERS } from "../src/shared/constants";
import { loadNarrowGameReviewFixture } from "./test-utils";

const REVIEW_LOCATION = {
  protocol: "https:",
  hostname: "www.chess.com",
  pathname: "/analysis/game/live/123456/review"
} as Location;

describe("phone Game Review layout", () => {
  it("recognizes exact Chess.com Game Review routes with or without live", () => {
    expect(isChessComLiveGameReview(REVIEW_LOCATION)).toBe(true);
    expect(
      isChessComLiveGameReview({
        ...REVIEW_LOCATION,
        pathname: "/analysis/game/123456/review"
      })
    ).toBe(true);
    expect(
      isChessComLiveGameReview({ ...REVIEW_LOCATION, pathname: "/home" })
    ).toBe(false);
    expect(
      isChessComLiveGameReview({
        ...REVIEW_LOCATION,
        pathname: "/analysis/game/live/123456"
      })
    ).toBe(false);
    expect(
      isChessComLiveGameReview({ ...REVIEW_LOCATION, hostname: "example.com" })
    ).toBe(false);
    expect(
      isChessComLiveGameReview({ ...REVIEW_LOCATION, protocol: "http:" })
    ).toBe(false);
  });

  it("moves the native move-review graph below the lower player on phones", () => {
    const document = loadNarrowGameReviewFixture();
    const controller = new GameReviewLayoutController();
    const graph = document.querySelector<HTMLElement>(".game-arc-component")!;
    const chartHost = document.querySelector<HTMLElement>("#charts")!;
    const onGraphClick = vi.fn();
    graph.addEventListener("click", onGraphClick);

    expect(controller.reconcile(document, REVIEW_LOCATION, true, true)).toBe(
      true
    );
    expect(graph.parentElement).toBe(chartHost);
    expect(graph.getAttribute(MARKERS.reviewGraph)).toBe("moved");
    expect(
      document
        .querySelector("#board-layout-analysis")
        ?.getAttribute(MARKERS.reviewGraphHost)
    ).toBe("active");
    graph.click();
    expect(onGraphClick).toHaveBeenCalledOnce();

    controller.reconcile(document, REVIEW_LOCATION, true, true);
    expect(chartHost.querySelectorAll(".game-arc-component")).toHaveLength(1);
  });

  it("leaves the initial report and wider tablet or desktop layouts untouched", () => {
    const widerDocument = loadNarrowGameReviewFixture();
    const widerGraph =
      widerDocument.querySelector<HTMLElement>(".game-arc-component")!;
    const widerParent = widerGraph.parentElement;
    const controller = new GameReviewLayoutController();

    expect(
      controller.reconcile(widerDocument, REVIEW_LOCATION, true, false)
    ).toBe(false);
    expect(widerGraph.parentElement).toBe(widerParent);

    const initialDocument = loadNarrowGameReviewFixture();
    const initialGraph =
      initialDocument.querySelector<HTMLElement>(".game-arc-component")!;
    const overviewContainer = initialDocument.createElement("div");
    overviewContainer.className = "overview-view-container";
    const overview = initialDocument.createElement("div");
    overview.className = "overview-view-component";
    const overviewArc = initialDocument.createElement("section");
    overviewArc.className = "overview-view-section overview-view-arc";
    overviewArc.append(initialGraph);
    overview.append(overviewArc);
    overviewContainer.append(overview);
    initialDocument
      .querySelector(".move-by-move-container")
      ?.replaceWith(overviewContainer);
    const initialParent = initialGraph.parentElement;

    expect(
      controller.reconcile(initialDocument, REVIEW_LOCATION, true, true)
    ).toBe(false);
    expect(initialGraph.parentElement).toBe(initialParent);

    const signedOutDocument = loadNarrowGameReviewFixture();
    signedOutDocument.documentElement.classList.remove("user-logged-in");
    const signedOutGraph =
      signedOutDocument.querySelector<HTMLElement>(".game-arc-component")!;
    const signedOutParent = signedOutGraph.parentElement;

    expect(
      controller.reconcile(signedOutDocument, REVIEW_LOCATION, true, true)
    ).toBe(false);
    expect(signedOutGraph.parentElement).toBe(signedOutParent);
  });

  it("restores the graph on disable or route departure", () => {
    const document = loadNarrowGameReviewFixture();
    const controller = new GameReviewLayoutController();
    const graph = document.querySelector<HTMLElement>(".game-arc-component")!;
    const originalParent = graph.parentElement!;
    const skills = originalParent.querySelector(
      ".move-by-move-skills-row-anchor"
    );

    controller.reconcile(document, REVIEW_LOCATION, true, true);
    controller.reconcile(document, REVIEW_LOCATION, false, true);

    expect(graph.parentElement).toBe(originalParent);
    expect(graph.nextElementSibling).toBe(skills);
    expect(graph.hasAttribute(MARKERS.reviewGraph)).toBe(false);
    expect(
      document.querySelector(`[${MARKERS.reviewGraphHost}]`)
    ).toBeNull();
  });

  it("replaces a stale moved graph when Chess.com rerenders its review view", () => {
    const document = loadNarrowGameReviewFixture();
    const controller = new GameReviewLayoutController();
    const oldGraph = document.querySelector<HTMLElement>(".game-arc-component")!;
    const originalParent = oldGraph.parentElement!;

    controller.reconcile(document, REVIEW_LOCATION, true, true);
    const replacement = oldGraph.cloneNode(true) as HTMLElement;
    replacement.removeAttribute(MARKERS.reviewGraph);
    originalParent.prepend(replacement);

    controller.reconcile(document, REVIEW_LOCATION, true, true);

    expect(oldGraph.isConnected).toBe(false);
    expect(replacement.parentElement?.id).toBe("charts");
    expect(
      document.querySelectorAll(`[${MARKERS.reviewGraph}="moved"]`)
    ).toHaveLength(1);
  });
});
