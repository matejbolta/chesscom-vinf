import { describe, expect, it, vi } from "vitest";
import { LayoutController } from "../src/content/layout-controller";
import { NativeLaunchAdapter } from "../src/content/launch-adapter";
import { MARKERS } from "../src/shared/constants";
import { DEFAULT_SETTINGS } from "../src/shared/settings";
import {
  HOME_LOCATION,
  loadHomepageFixture,
  loadModernHomepageFixture
} from "./test-utils";

function statsModule(document: Document): HTMLElement {
  return document.querySelector<HTMLElement>(
    '[data-fixture-module="stats"]'
  )!;
}

function summaryOrder(document: Document): string[] {
  return Array.from(
    statsModule(document).querySelectorAll<HTMLElement>(
      ":scope > .sidebar-ratings-general > [data-stats-summary]"
    )
  ).map((row) => row.dataset.statsSummary!);
}

function ratingOrder(document: Document): string[] {
  return Array.from(
    statsModule(document).querySelectorAll<HTMLElement>(
      ":scope > [data-stats-rating]"
    )
  ).map((row) => row.dataset.statsRating!);
}

describe("Stats preferences", () => {
  it("orders and filters the redesigned expandable Stats rows without Insights", () => {
    const document = loadModernHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));

    controller.reconcile(document, HOME_LOCATION);

    const stats = statsModule(document);
    expect(
      Array.from(
        stats.querySelectorAll<HTMLElement>(":scope > [data-stats-summary]")
      ).map((row) => row.dataset.statsSummary)
    ).toEqual(["games", "puzzles", "lessons"]);
    expect(
      Array.from(
        stats.querySelectorAll<HTMLElement>(":scope > [data-stats-rating]")
      ).map((row) => row.dataset.statsRating)
    ).toEqual(["rapid", "blitz", "bullet", "daily", "puzzles"]);
    expect(
      stats
        .querySelector('[data-stats-summary="games"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(false);
    expect(
      stats
        .querySelector('[data-stats-rating="rapid"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(false);
    expect(
      stats
        .querySelector('[data-stats-rating="blitz"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(false);
    expect(
      stats
        .querySelector('[data-stats-rating="bullet"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(true);
    expect(
      Array.from(stats.querySelectorAll<HTMLElement>(":scope > .stats-divider")).map(
        (divider) => divider.hasAttribute(MARKERS.hidden)
      )
    ).toEqual([false, true]);
    expect(
      stats
        .querySelector('[data-stats-rating="rapid"]')
        ?.getAttribute(MARKERS.statsInitialState)
    ).toBe("retracted");
    expect(
      stats
        .querySelector('[data-stats-rating="blitz"]')
        ?.getAttribute(MARKERS.statsInitialState)
    ).toBe("retracted");
    expect(stats.querySelector('a[href*="/insights/"]')).toBeNull();

    controller.cleanup(document);
    expect(
      Array.from(
        stats.querySelectorAll<HTMLElement>(":scope > [data-stats-summary]")
      ).map((row) => row.dataset.statsSummary)
    ).toEqual(["lessons", "games", "puzzles"]);
    expect(
      Array.from(
        stats.querySelectorAll<HTMLElement>(":scope > [data-stats-rating]")
      ).map((row) => row.dataset.statsRating)
    ).toEqual(["bullet", "daily", "rapid", "blitz", "puzzles"]);
    expect(stats.querySelector(`[${MARKERS.hidden}]`)).toBeNull();
  });

  it("applies anchor-based expansion states in the redesigned Stats card", () => {
    const document = loadModernHomepageFixture();
    const clickCounts = new Map<string, number>();

    for (const id of ["rapid", "blitz"]) {
      const row = document.querySelector<HTMLElement>(
        `[data-stats-rating="${id}"]`
      )!;
      const control = row.querySelector<HTMLAnchorElement>(
        ":scope > a.cc-aside-item-component"
      )!;
      const chevron = control.querySelector<SVGElement>("svg[data-glyph]")!;
      if (id === "blitz") {
        const initialContent = document.createElement("div");
        initialContent.dataset.modernExpanded = "";
        row.append(initialContent);
        chevron.setAttribute("data-glyph", "arrow-chevron-top");
      }
      control.addEventListener("click", (event) => {
        event.preventDefault();
        clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1);
        const existingContent = row.querySelector("[data-modern-expanded]");
        if (existingContent) {
          existingContent.remove();
          chevron.setAttribute("data-glyph", "arrow-chevron-bottom");
          return;
        }
        const expandedContent = document.createElement("div");
        expandedContent.dataset.modernExpanded = "";
        row.append(expandedContent);
        chevron.setAttribute("data-glyph", "arrow-chevron-top");
      });
    }

    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    const settings = {
      ...DEFAULT_SETTINGS,
      statsRatingStates: {
        ...DEFAULT_SETTINGS.statsRatingStates,
        rapid: "expanded" as const,
        blitz: "retracted" as const
      }
    };
    controller.reconcile(document, HOME_LOCATION, settings);
    controller.reconcile(document, HOME_LOCATION, settings);

    expect(clickCounts).toEqual(
      new Map([
        ["rapid", 1],
        ["blitz", 1]
      ])
    );
    expect(
      document
        .querySelector('[data-stats-rating="rapid"]')
        ?.querySelector("[data-modern-expanded]")
    ).not.toBeNull();
    expect(
      document
        .querySelector('[data-stats-rating="blitz"]')
        ?.querySelector("[data-modern-expanded]")
    ).toBeNull();

    const rapidControl = document.querySelector<HTMLAnchorElement>(
      '[data-stats-rating="rapid"] > a.cc-aside-item-component'
    )!;
    rapidControl.click();
    controller.reconcile(document, HOME_LOCATION, settings);

    expect(clickCounts.get("rapid")).toBe(2);
    expect(
      document
        .querySelector('[data-stats-rating="rapid"]')
        ?.querySelector("[data-modern-expanded]")
    ).toBeNull();
  });

  it("applies the requested minimal defaults and fixes Insights at the bottom", () => {
    const document = loadHomepageFixture();
    new LayoutController(new NativeLaunchAdapter(vi.fn())).reconcile(
      document,
      HOME_LOCATION
    );

    expect(summaryOrder(document)).toEqual(["games", "puzzles", "lessons"]);
    expect(ratingOrder(document)).toEqual([
      "rapid",
      "blitz",
      "bullet",
      "daily",
      "puzzles",
      "live-960",
      "insights"
    ]);
    expect(
      document
        .querySelector('[data-stats-summary="games"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(false);
    for (const id of ["puzzles", "lessons"]) {
      expect(
        document
          .querySelector(`[data-stats-summary="${id}"]`)
          ?.hasAttribute(MARKERS.hidden)
      ).toBe(true);
    }
    for (const id of ["rapid", "blitz"]) {
      expect(
        document
          .querySelector(`[data-stats-rating="${id}"]`)
          ?.hasAttribute(MARKERS.hidden)
      ).toBe(false);
    }
    for (const id of ["bullet", "daily", "puzzles", "live-960"]) {
      expect(
        document
          .querySelector(`[data-stats-rating="${id}"]`)
          ?.hasAttribute(MARKERS.hidden)
      ).toBe(true);
    }
    expect(
      document
        .querySelector('[data-stats-rating="insights"]')
        ?.hasAttribute(MARKERS.hidden)
    ).toBe(false);
  });

  it("supports custom visibility and order, including an empty summary", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION, {
      ...DEFAULT_SETTINGS,
      statsSummaryOrder: ["lessons", "games", "puzzles"],
      statsSummaryVisible: [],
      statsRatingOrder: [
        "live-960",
        "daily",
        "puzzles",
        "bullet",
        "blitz",
        "rapid"
      ],
      statsRatingVisible: ["live-960", "daily", "rapid"]
    });

    expect(summaryOrder(document)).toEqual(["lessons", "games", "puzzles"]);
    expect(
      document
        .querySelector(".sidebar-ratings-general")
        ?.getAttribute(MARKERS.hidden)
    ).toBe("stats-summary");
    expect(ratingOrder(document)).toEqual([
      "live-960",
      "daily",
      "puzzles",
      "bullet",
      "blitz",
      "rapid",
      "insights"
    ]);
    expect(
      ["live-960", "daily", "rapid"].map((id) =>
        document
          .querySelector(`[data-stats-rating="${id}"]`)
          ?.hasAttribute(MARKERS.hidden)
      )
    ).toEqual([false, false, false]);
  });

  it("preserves unknown native rows before Insights", () => {
    const document = loadHomepageFixture();
    const stats = statsModule(document);
    const unknown = document.createElement("div");
    unknown.className = "stat-section-stats-section";
    unknown.dataset.statsRating = "future-mode";
    unknown.innerHTML =
      '<button><span class="stat-section-section-link-name">Future Mode</span></button>';
    stats.prepend(unknown);

    new LayoutController(new NativeLaunchAdapter(vi.fn())).reconcile(
      document,
      HOME_LOCATION
    );

    expect(ratingOrder(document)).toEqual([
      "rapid",
      "blitz",
      "bullet",
      "daily",
      "puzzles",
      "live-960",
      "future-mode",
      "insights"
    ]);
    expect(unknown.hasAttribute(MARKERS.hidden)).toBe(false);
  });

  it("does not move native rows when an expansion mutates an already ordered card", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);

    const stats = statsModule(document);
    const summary = stats.querySelector<HTMLElement>(
      ":scope > .sidebar-ratings-general"
    )!;
    const rapid = stats.querySelector<HTMLElement>(
      ':scope > [data-stats-rating="rapid"]'
    )!;
    const expandedContent = document.createElement("div");
    expandedContent.dataset.statsExpandedContent = "";
    rapid.append(expandedContent);
    const expandedSibling = document.createElement("div");
    expandedSibling.className = "stat-section-stats-section";
    expandedSibling.dataset.statsExpandedSibling = "";
    rapid.after(expandedSibling);

    const statsAppend = vi.spyOn(stats, "append");
    const summaryAppend = vi.spyOn(summary, "append");
    controller.reconcile(document, HOME_LOCATION);

    expect(statsAppend).not.toHaveBeenCalled();
    expect(summaryAppend).not.toHaveBeenCalled();
    expect(
      rapid.querySelector("[data-stats-expanded-content]")
    ).toBe(expandedContent);
    expect(rapid.nextElementSibling).toBe(expandedSibling);
  });

  it("opens Rapid and Blitz once while preserving later manual collapse", () => {
    const document = loadHomepageFixture();
    const clickCounts = new Map<string, number>();

    for (const id of ["rapid", "blitz"]) {
      const row = document.querySelector<HTMLElement>(
        `[data-stats-rating="${id}"]`
      )!;
      const button = row.querySelector<HTMLButtonElement>(
        ":scope > button.stat-section-button"
      )!;
      button.addEventListener("click", () => {
        clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1);
        const existingContent = row.querySelector("[data-native-expanded]");
        const chevron = button.querySelector("svg[data-glyph]");
        if (existingContent) {
          existingContent.remove();
          chevron?.setAttribute("data-glyph", "arrow-chevron-bottom");
          return;
        }

        const expandedContent = document.createElement("div");
        expandedContent.dataset.nativeExpanded = "";
        row.append(expandedContent);
        chevron?.setAttribute("data-glyph", "arrow-chevron-top");
      });
    }

    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    const settings = {
      ...DEFAULT_SETTINGS,
      statsRatingStates: {
        ...DEFAULT_SETTINGS.statsRatingStates,
        rapid: "expanded" as const,
        blitz: "expanded" as const
      }
    };
    controller.reconcile(document, HOME_LOCATION, settings);
    controller.reconcile(document, HOME_LOCATION, settings);

    expect(clickCounts).toEqual(
      new Map([
        ["rapid", 1],
        ["blitz", 1]
      ])
    );
    expect(
      document.querySelectorAll("[data-native-expanded]")
    ).toHaveLength(2);

    const rapid = document.querySelector<HTMLElement>(
      '[data-stats-rating="rapid"]'
    )!;
    rapid
      .querySelector<HTMLButtonElement>(":scope > button.stat-section-button")
      ?.click();
    controller.reconcile(document, HOME_LOCATION, settings);

    expect(clickCounts.get("rapid")).toBe(2);
    expect(rapid.querySelector("[data-native-expanded]")).toBeNull();
    expect(
      rapid.getAttribute(MARKERS.statsInitialState)
    ).toBe("expanded");
  });

  it("applies independent row states without overriding later manual changes", () => {
    const document = loadHomepageFixture();
    const clickCounts = new Map<string, number>();

    for (const id of ["rapid", "blitz"]) {
      const row = document.querySelector<HTMLElement>(
        `[data-stats-rating="${id}"]`
      )!;
      const button = row.querySelector<HTMLButtonElement>(
        ":scope > button.stat-section-button"
      )!;
      const expandedContent = document.createElement("div");
      expandedContent.dataset.nativeExpanded = "";
      row.append(expandedContent);
      button
        .querySelector("svg[data-glyph]")
        ?.setAttribute("data-glyph", "arrow-chevron-top");
      button.addEventListener("click", () => {
        clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1);
        const currentContent = row.querySelector("[data-native-expanded]");
        const chevron = button.querySelector("svg[data-glyph]");
        if (currentContent) {
          currentContent.remove();
          chevron?.setAttribute("data-glyph", "arrow-chevron-bottom");
          return;
        }
        const content = document.createElement("div");
        content.dataset.nativeExpanded = "";
        row.append(content);
        chevron?.setAttribute("data-glyph", "arrow-chevron-top");
      });
    }

    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    const settings = {
      ...DEFAULT_SETTINGS,
      statsRatingStates: {
        ...DEFAULT_SETTINGS.statsRatingStates,
        rapid: "retracted" as const,
        blitz: "expanded" as const
      }
    };
    controller.reconcile(document, HOME_LOCATION, {
      ...settings
    });
    controller.reconcile(document, HOME_LOCATION, {
      ...settings
    });

    expect(document.querySelectorAll("[data-native-expanded]")).toHaveLength(1);
    expect(clickCounts).toEqual(
      new Map([
        ["rapid", 1]
      ])
    );

    const rapid = document.querySelector<HTMLElement>(
      '[data-stats-rating="rapid"]'
    )!;
    rapid
      .querySelector<HTMLButtonElement>(":scope > button.stat-section-button")
      ?.click();
    controller.reconcile(document, HOME_LOCATION, {
      ...settings
    });

    expect(rapid.querySelector("[data-native-expanded]")).not.toBeNull();
    expect(clickCounts.get("rapid")).toBe(2);
    expect(rapid.getAttribute(MARKERS.statsInitialState)).toBe("retracted");
  });

  it("restores every native Stats row and its original order during cleanup", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);
    controller.cleanup(document);

    expect(summaryOrder(document)).toEqual(["lessons", "games", "puzzles"]);
    expect(ratingOrder(document)).toEqual([
      "bullet",
      "daily",
      "rapid",
      "puzzles",
      "blitz",
      "live-960",
      "insights"
    ]);
    expect(statsModule(document).querySelector(`[${MARKERS.hidden}]`)).toBeNull();
    expect(
      statsModule(document).querySelector(`[${MARKERS.statsInitialState}]`)
    ).toBeNull();
  });
});
