import { describe, expect, it, vi } from "vitest";
import { NativeLaunchAdapter } from "../src/content/launch-adapter";
import {
  TIME_CONTROL_CATALOG,
  TIME_CONTROLS
} from "../src/shared/time-controls";
import { loadHomepageFixture } from "./test-utils";

describe("NativeLaunchAdapter", () => {
  it("maps every catalog control to the exact native base and increment", () => {
    const document = loadHomepageFixture();
    const adapter = new NativeLaunchAdapter();
    const expected = new Map([
      ["Play 30 sec", ["30", "0"]],
      ["Play 20 sec + 1", ["20", "1"]],
      ["Play 1 min", ["60", "0"]],
      ["Play 1 + 1", ["60", "1"]],
      ["Play 2 + 1", ["120", "1"]],
      ["Play 3 min", ["180", "0"]],
      ["Play 3 + 2", ["180", "2"]],
      ["Play 5 min", ["300", "0"]],
      ["Play 5 + 3", ["300", "3"]],
      ["Play 5 + 2", ["300", "2"]],
      ["Play 5 + 5", ["300", "5"]],
      ["Play 10 min", ["600", "0"]],
      ["Play 10 + 5", ["600", "5"]],
      ["Play 15 + 10", ["900", "10"]],
      ["Play 20 min", ["1200", "0"]],
      ["Play 30 min", ["1800", "0"]],
      ["Play 60 min", ["3600", "0"]]
    ]);

    for (const control of TIME_CONTROL_CATALOG) {
      const url = adapter.getLaunchUrl(document, control);
      expect(url?.pathname).toBe("/play/online/new");
      expect(url?.searchParams.get("action")).toBe("createLiveChallenge");
      expect(url?.searchParams.get("rated")).toBe("rated");
      expect(url?.searchParams.get("source")).toBe("home");
      expect([
        url?.searchParams.get("base"),
        url?.searchParams.get("timeIncrement")
      ]).toEqual(expected.get(control.label));
    }
  });

  it("navigates once using the derived native route", () => {
    const navigate = vi.fn();
    const adapter = new NativeLaunchAdapter(navigate);
    adapter.launch(loadHomepageFixture(), TIME_CONTROLS[4]);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).toContain("base=180&timeIncrement=2");
  });

  it("fails closed when the native template is missing or altered", () => {
    const missing = loadHomepageFixture();
    missing.querySelector('a[href*="createLiveChallenge"]')?.remove();
    expect(new NativeLaunchAdapter().getLaunchUrl(missing, TIME_CONTROLS[0])).toBeNull();

    const altered = loadHomepageFixture();
    const link = altered.querySelector<HTMLAnchorElement>('a[href*="createLiveChallenge"]');
    link?.setAttribute(
      "href",
      "https://example.com/play/online/new?action=createLiveChallenge&base=900&timeIncrement=10&rated=rated"
    );
    expect(new NativeLaunchAdapter().getLaunchUrl(altered, TIME_CONTROLS[0])).toBeNull();
  });
});
