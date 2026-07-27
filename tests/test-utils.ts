import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homepageFixture = readFileSync(
  resolve(process.cwd(), "tests/fixtures/homepage.html"),
  "utf8"
);
const responsiveHomepageFixture = readFileSync(
  resolve(process.cwd(), "tests/fixtures/homepage-responsive.html"),
  "utf8"
);

export const HOME_LOCATION = {
  protocol: "https:",
  hostname: "www.chess.com",
  pathname: "/home"
} as Location;

export function loadHomepageFixture(): Document {
  const parser = new DOMParser();
  return parser.parseFromString(homepageFixture, "text/html");
}

export function loadResponsiveHomepageFixture(): Document {
  const parser = new DOMParser();
  return parser.parseFromString(responsiveHomepageFixture, "text/html");
}
