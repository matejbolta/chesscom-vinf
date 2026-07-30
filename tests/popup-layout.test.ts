import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const popupCss = readFileSync(
  resolve(process.cwd(), "src/popup/popup.css"),
  "utf8"
);

describe("popup layout contracts", () => {
  it("keeps switches at their full track width beside wrapping copy", () => {
    expect(popupCss).toMatch(
      /input\[role="switch"\]\s*\{[^}]*flex:\s*0 0 38px;/s
    );
  });

  it("preserves the selected preset grid in the narrow toolbar popup", () => {
    const narrowRules = popupCss.slice(
      popupCss.indexOf("@media (max-width: 389px)")
    );

    expect(narrowRules).toMatch(
      /\.preset-list\s*\{[^}]*grid-auto-flow:\s*column;[^}]*grid-template-columns:\s*repeat\(\s*var\(--chesscom-vinf-preset-columns\)/s
    );
    expect(narrowRules).toMatch(
      /\.preset-list\s*\{[^}]*grid-template-rows:\s*repeat\(var\(--chesscom-vinf-preset-rows\),\s*auto\);/s
    );
    expect(narrowRules).not.toMatch(
      /\.preset-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s
    );
  });
});
