import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const popupCss = readFileSync(
  resolve(process.cwd(), "src/popup/popup.css"),
  "utf8"
);

describe("popup layout contracts", () => {
  it("establishes the toolbar popup width before script while keeping the side panel fluid", () => {
    expect(popupCss).toMatch(
      /html:not\(\[data-surface="side-panel"\]\),\s*html:not\(\[data-surface="side-panel"\]\) body\s*\{[^}]*min-width:\s*390px;[^}]*width:\s*390px;/s
    );
    expect(popupCss).not.toMatch(/max-width:\s*100vw/);
    expect(popupCss).toMatch(
      /html\[data-surface="side-panel"\]\s*\{[^}]*min-width:\s*0;[^}]*width:\s*100%;/s
    );
    expect(popupCss).toMatch(
      /html\[data-surface="side-panel"\]\s+body\s*\{[^}]*width:\s*100%;/s
    );
    expect(popupCss).toMatch(
      /html\[data-surface="popup"\]\s*\{[^}]*scrollbar-width:\s*none;/s
    );
    expect(popupCss).toMatch(
      /html\[data-surface="popup"\]::\-webkit-scrollbar\s*\{[^}]*display:\s*none;/s
    );
  });

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
