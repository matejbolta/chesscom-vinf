import { MARKERS } from "../shared/constants";
import type { LocationLike } from "../shared/models";

const CHESS_COM_HOSTS = new Set(["www.chess.com", "chess.com"]);
const GAME_REVIEW_PATH = /^\/analysis\/game\/(?:live\/)?\d+\/review\/?$/;

interface OriginalPosition {
  parent: HTMLElement;
  nextSibling: ChildNode | null;
}

export function isChessComLiveGameReview(location: LocationLike): boolean {
  return (
    location.protocol === "https:" &&
    CHESS_COM_HOSTS.has(location.hostname.toLowerCase()) &&
    GAME_REVIEW_PATH.test(location.pathname)
  );
}

export class GameReviewLayoutController {
  private readonly originalPositions = new Map<HTMLElement, OriginalPosition>();

  reconcile(
    document: Document,
    location: LocationLike,
    enabled: boolean,
    isPhoneLayout: boolean
  ): boolean {
    if (
      !enabled ||
      !isPhoneLayout ||
      !isChessComLiveGameReview(location) ||
      !document.documentElement.classList.contains("user-logged-in")
    ) {
      this.cleanup(document);
      return false;
    }

    this.restoreGraphsFromDetachedHosts();

    const moveByMove = document.querySelector<HTMLElement>(
      ".sidebar-view-content > .move-by-move-container > .move-by-move-component"
    );
    const chartHost = document.querySelector<HTMLElement>(
      "#board-layout-main > #board-layout-analysis > #charts"
    );
    const analysisHost = chartHost?.parentElement;
    if (
      !moveByMove ||
      !chartHost ||
      analysisHost?.id !== "board-layout-analysis"
    ) {
      this.cleanup(document);
      return false;
    }

    const sourceGraph = moveByMove.querySelector<HTMLElement>(
      ":scope > .move-by-move-bottom-section > .game-arc-component"
    );
    let movedGraph = document.querySelector<HTMLElement>(
      `[${MARKERS.reviewGraph}="moved"]`
    );

    if (sourceGraph && movedGraph && sourceGraph !== movedGraph) {
      this.discardStaleGraph(movedGraph);
      movedGraph = null;
    }

    const graph = sourceGraph ?? movedGraph;
    if (!graph) {
      this.cleanup(document);
      return false;
    }

    if (!this.originalPositions.has(graph) && graph.parentElement) {
      this.originalPositions.set(graph, {
        parent: graph.parentElement,
        nextSibling: graph.nextSibling
      });
    }

    graph.setAttribute(MARKERS.reviewGraph, "moved");
    analysisHost.setAttribute(MARKERS.reviewGraphHost, "active");
    if (graph.parentElement !== chartHost) {
      chartHost.append(graph);
    }
    return true;
  }

  cleanup(document: Document): void {
    for (const [graph, position] of this.originalPositions) {
      if (position.parent.isConnected) {
        const validSibling =
          position.nextSibling?.parentNode === position.parent
            ? position.nextSibling
            : null;
        position.parent.insertBefore(graph, validSibling);
      } else {
        graph.remove();
      }
      graph.removeAttribute(MARKERS.reviewGraph);
    }
    this.originalPositions.clear();

    for (const graph of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.reviewGraph}]`
    )) {
      graph.removeAttribute(MARKERS.reviewGraph);
    }
    for (const host of document.querySelectorAll<HTMLElement>(
      `[${MARKERS.reviewGraphHost}]`
    )) {
      host.removeAttribute(MARKERS.reviewGraphHost);
    }
  }

  private restoreGraphsFromDetachedHosts(): void {
    for (const [graph, position] of this.originalPositions) {
      if (graph.isConnected) {
        if (!position.parent.isConnected) {
          this.discardStaleGraph(graph);
        }
        continue;
      }
      if (!position.parent.isConnected) {
        this.discardStaleGraph(graph);
        continue;
      }

      const validSibling =
        position.nextSibling?.parentNode === position.parent
          ? position.nextSibling
          : null;
      position.parent.insertBefore(graph, validSibling);
      graph.removeAttribute(MARKERS.reviewGraph);
      this.originalPositions.delete(graph);
    }
  }

  private discardStaleGraph(graph: HTMLElement): void {
    graph.remove();
    graph.removeAttribute(MARKERS.reviewGraph);
    this.originalPositions.delete(graph);
  }
}
