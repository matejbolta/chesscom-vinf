# ChessComVINF

ChessComVINF (Version Infinity) turns the signed-in Chess.com homepage into a
focused dashboard. It provides configurable one-click matchmaking, promotes
Game History and Stats, and removes homepage modules that interrupt the normal
play workflow, including Chess.com's recurring top campaign banner and redundant
homepage avatar/username toolbar. The current redesigned homepage and the
preceding desktop layout are both supported.

![Sanitized ChessComVINF homepage](docs/reference-homepage.png)

ChessComVINF is an independent, unofficial extension and is not affiliated with,
endorsed by, or sponsored by Chess.com.

The extension toolbar popup keeps its master `Enable VINF` switch in a standalone
top card. Its `Homepage` section can show or hide Chess.com's large native play
panel, independently show or hide every known right-column card, and keep those
cards in a user-selected order. Daily Games has the same visibility checkbox,
plus a Main/Right placement selector that remembers its location while hidden.
The remaining sections choose 1,
2, 3, 4, 6, or 8 unique Bullet/Blitz/Rapid Quick Play presets and control the
visibility and fixed order of native Stats rows. Every enabled rating row can
start expanded or retracted independently. Every change saves immediately to
local browser storage; there is no separate Save step.

The Stats card defaults to one summary (`Games`), then retracted `Rapid` and
retracted `Blitz`. Games/Puzzles/Lessons and the six native rating categories
can all be shown, hidden, reordered, and given their own initial
expanded/retracted state. Chess.com's redesigned homepage no longer includes an
Insights row in this card; if a legacy homepage variant provides one, VINF
preserves it at the bottom.

The settings UI offers a unified 17-control desktop/mobile catalog. Quick Play
shows centered, time-only labels with category-colored Bullet, Blitz, and Rapid
buttons. Its preset selectors mirror that chosen grid: 1–4 use one row, while 6
and 8 use two rows of three or four. Every homepage layout keeps the same gaps
and fills the exact Game History column width, while Stats and the remaining
sidebar modules begin alongside it.

Version 0.8 adds a separate Android delivery: a Firefox/Violentmonkey userscript
that reuses the same validated launch, layout, time-control, and dynamic-page
core. It supports a semantic single-column Chess.com layout and includes a
touch-friendly local settings dialog. See `docs/ANDROID.md` for the verified
platform decision, installation, testing, and limitations.

## Development

Requirements: Node.js 20+ and pnpm.

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm build:android
```

Load `dist/` as an unpacked extension in Chrome or Brave. `pnpm package` creates
a versioned zip under `release/`.

`pnpm build:android` creates `dist-android/chesscom-vinf.user.js` for local
installation in Violentmonkey on Firefox for Android. It does not modify the
desktop package.

## Product documentation

- `docs/LLM_HANDOFF.md` is the canonical current-state memory for future agents.
- `docs/PRODUCT_BRIEF.md` records the original requirements.
- `docs/FINAL_PRODUCT_SPEC.md` is the detailed product specification.
- `docs/DOM_AUDIT.md` records the verified selectors and native launch method.
- `docs/PRIVACY.md` documents the zero-collection privacy model.
- `docs/ANDROID.md` documents the Android userscript architecture and install flow.
- `docs/RELEASE_CHECKLIST.md` separates automated validation from live match checks.
- `docs/reference-homepage.png` is a sanitized public visual reference.

Private complete-page captures remain ignored under `fixtures/raw/`. Automated
tests use only small sanitized fixtures under `tests/fixtures/`.

## Privacy and support

ChessComVINF collects and transmits no user data. It stores only local
presentation preferences and makes no extension-owned network requests. Read the
full [privacy policy](docs/PRIVACY.md).

For bugs or support, [open a GitHub issue](https://github.com/matejbolta/chesscom-vinf/issues).
