import { describe, expect, it } from "vitest";
import { isChessComHomepage } from "../src/content/homepage-detector";
import {
  HOME_LOCATION,
  loadHomepageFixture,
  loadResponsiveHomepageFixture
} from "./test-utils";

describe("isChessComHomepage", () => {
  it("accepts the verified signed-in homepage", () => {
    expect(isChessComHomepage(loadHomepageFixture(), HOME_LOCATION)).toBe(true);
  });

  it("accepts a signed-in responsive homepage with semantic landmarks", () => {
    expect(isChessComHomepage(loadResponsiveHomepageFixture(), HOME_LOCATION)).toBe(
      true
    );
  });

  it.each(["/game/live/123", "/analysis", "/puzzles", "/lessons/example"])(
    "rejects the non-home route %s",
    (pathname) => {
      expect(
        isChessComHomepage(loadHomepageFixture(), {
          ...HOME_LOCATION,
          pathname
        })
      ).toBe(false);
    }
  );

  it("rejects a signed-out or structurally uncertain page", () => {
    const signedOut = loadHomepageFixture();
    signedOut.documentElement.classList.remove("user-logged-in");
    expect(isChessComHomepage(signedOut, HOME_LOCATION)).toBe(false);

    const missingLandmark = loadHomepageFixture();
    missingLandmark.querySelector(".promo-component")?.remove();
    expect(isChessComHomepage(missingLandmark, HOME_LOCATION)).toBe(false);
  });

  it("rejects non-Chess.com and insecure origins", () => {
    expect(
      isChessComHomepage(loadHomepageFixture(), {
        ...HOME_LOCATION,
        hostname: "example.com"
      })
    ).toBe(false);
    expect(
      isChessComHomepage(loadHomepageFixture(), {
        ...HOME_LOCATION,
        protocol: "http:"
      })
    ).toBe(false);
  });
});
