import { afterEach, describe, expect, it, vi } from "vitest";
import { startVinfRuntime } from "../src/content/runtime";
import { MARKERS } from "../src/shared/constants";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import { loadNarrowGameReviewFixture } from "./test-utils";

afterEach(() => {
  window.history.replaceState({}, "", "/home");
  vi.clearAllTimers();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Game Review runtime lifecycle", () => {
  it("reacts to the phone breakpoint and restores the native graph when it widens", async () => {
    vi.useFakeTimers();
    let matches = true;
    let mediaListener: EventListener | undefined;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return matches;
        },
        media: "(max-width: 599px)",
        onchange: null,
        addEventListener: (_type: string, listener: EventListener) => {
          mediaListener = listener;
        },
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    );
    window.history.replaceState(
      {},
      "",
      "/analysis/game/live/123456/review?move=32"
    );
    const fixture = loadNarrowGameReviewFixture();
    document.documentElement.className = fixture.documentElement.className;
    document.documentElement.innerHTML = fixture.documentElement.innerHTML;
    const graph = document.querySelector<HTMLElement>(".game-arc-component")!;
    const originalParent = graph.parentElement;

    startVinfRuntime({
      load: async () => DEFAULT_SETTINGS,
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(graph.parentElement?.id).toBe("charts");
    expect(graph.getAttribute(MARKERS.reviewGraph)).toBe("moved");

    matches = false;
    mediaListener?.(new Event("change"));

    expect(graph.parentElement).toBe(originalParent);
    expect(graph.hasAttribute(MARKERS.reviewGraph)).toBe(false);
  });

  it("applies OLED on Game Review routes without the live segment", async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/analysis/game/123456/review");
    document.documentElement.className = "user-logged-in";
    document.body.replaceChildren();

    startVinfRuntime({
      load: async () => ({ ...DEFAULT_SETTINGS, oledMode: true }),
      subscribe: () => undefined
    });
    await Promise.resolve();

    expect(document.documentElement.getAttribute(MARKERS.oled)).toBe("true");
  });
});
