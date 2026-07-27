import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutController } from "../src/content/layout-controller";
import { NativeLaunchAdapter } from "../src/content/launch-adapter";
import { LAUNCH_FAILURE_TIMEOUT_MS } from "../src/shared/constants";
import { HOME_LOCATION, loadHomepageFixture } from "./test-utils";

afterEach(() => {
  vi.useRealTimers();
});

describe("Quick Play interactions", () => {
  it("blocks duplicate launches and recovers with accessible failure feedback", () => {
    vi.useFakeTimers();
    const document = loadHomepageFixture();
    const navigate = vi.fn();
    new LayoutController(new NativeLaunchAdapter(navigate)).reconcile(
      document,
      HOME_LOCATION
    );

    const button = document.querySelector<HTMLButtonElement>(
      'button[data-chesscom-vinf-time-control="10-5"]'
    )!;
    button.click();
    button.click();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(button.dataset.state).toBe("starting");
    expect(button.disabled).toBe(true);
    expect(
      document.querySelector("[data-chesscom-vinf-status]")?.getAttribute("role")
    ).toBe("status");

    vi.advanceTimersByTime(LAUNCH_FAILURE_TIMEOUT_MS);
    expect(button.dataset.state).toBe("failed");
    expect(button.disabled).toBe(false);
    expect(
      document.querySelector("[data-chesscom-vinf-status]")?.textContent
    ).toContain("Could not start 10 + 5");
  });

  it("disables all shortcuts when the native launch surface is unavailable", () => {
    const document = loadHomepageFixture();
    document.querySelector('a[href*="createLiveChallenge"]')?.remove();
    new LayoutController(new NativeLaunchAdapter(vi.fn())).reconcile(
      document,
      HOME_LOCATION
    );

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "button[data-chesscom-vinf-time-control]"
      )
    );
    expect(buttons).toHaveLength(6);
    expect(buttons.every((button) => button.disabled)).toBe(true);
    expect(buttons.every((button) => button.dataset.state === "unavailable")).toBe(
      true
    );
  });

  it("becomes unavailable if Chess.com replaces the native action without a template", () => {
    const document = loadHomepageFixture();
    const controller = new LayoutController(new NativeLaunchAdapter(vi.fn()));
    controller.reconcile(document, HOME_LOCATION);

    document.querySelector('a[href*="createLiveChallenge"]')?.remove();
    controller.reconcile(document, HOME_LOCATION);

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        "button[data-chesscom-vinf-time-control]"
      )
    );
    expect(buttons.every((button) => button.disabled)).toBe(true);
    expect(buttons.every((button) => button.dataset.state === "unavailable")).toBe(
      true
    );
  });
});
