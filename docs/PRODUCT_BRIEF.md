# Chess.com Homepage Extension — Product Brief

Status: historical initial requirements. The extension is implemented and has
evolved through version 0.7.0. Read `LLM_HANDOFF.md` for current behavior and
`FINAL_PRODUCT_SPEC.md` for the original specification plus later amendments.

## Product Goal

Turn the signed-in `chess.com` homepage into a focused personal dashboard. Frequently used time controls should be launchable with one click, high-value information should appear first, and irrelevant training, league, and play-mode prompts should stop consuming the most prominent space.

This is a Chess.com-homepage-specific extension, not a general page cleaner.

## One-Click Game Shortcuts

The homepage should expose direct quick-play buttons for these time controls:

1. 10 minutes
2. 10 + 5
3. 15 + 10
4. 3 + 2
5. 30 minutes
6. 5 + 3

The intended interaction is genuinely one click from the homepage into matchmaking. It should not open the normal New Game flow and require the user to choose the time control and click Play again.

The existing left-side action stack in the main dashboard currently contains:

- the most recently used time control,
- New Game,
- Play Bots,
- Play a Friend.

Replace this stack with the time-control shortcuts. New Game, Play Bots, and Play a Friend are redundant here because those modes remain available from the main Play navigation.

The removal of the Puzzles and Next Lesson cards creates enough horizontal space for more quick-play shortcuts. The exact grid and responsive layout should be designed after inspecting the live DOM.

## Top Dashboard

Remove:

- the Legend League rank/points summary beside the profile (for example, rank 15 and 310 points),
- the Puzzles card, puzzle rating, board preview, and Solve Puzzle action,
- the Next Lesson card, lesson description, board preview, and Start Lesson action.

Keep provisionally:

- Game Review, including the latest-opponent review. This is less important than quick play but may still be useful.

The top dashboard should prioritize the quick-play controls rather than three large chessboard previews.

## Main Content Ordering

Left/main column order:

1. Game History
2. Daily Games

Daily Games is currently always zero for this user and is low priority. It may be moved below Game History or hidden entirely if DOM constraints make reordering brittle; prefer reordering first so the information remains available.

Right column order:

1. Stats
2. Live on ChessTV
3. Legend League

Stats is the most important of these sections. ChessTV is somewhat relevant but secondary. Legend League is not useless, but it belongs below both.

## Non-Goals

- Do not remove the main left navigation used to reach Play and other Chess.com areas.
- Do not recreate New Game, Play Bots, or Play a Friend shortcuts in the homepage dashboard.
- Do not add servers, telemetry, analytics, ads, tracking, or remote code.
- Do not broaden the extension to unrelated Chess.com pages without an explicit product decision.
- Do not hard-code behavior based only on the reference screenshot; verify selectors and interactions against a saved/current page.

## Required Discovery Before Implementation

1. Save the complete signed-in Chess.com homepage HTML and associated assets, or capture a sanitized DOM fixture sufficient to identify stable containers.
2. Record what Chess.com does when starting each requested time control: direct URL, internal route, form state, API-backed UI action, or existing element click.
3. Determine whether Chess.com already renders reusable controls for non-current time controls elsewhere in the page/app.
4. Identify stable semantic selectors or attributes. Avoid selectors based solely on generated class names or visual position.
5. Check responsive behavior at the user’s normal desktop viewport and at narrower widths.
6. Confirm whether hidden/reordered sections are replaced dynamically after navigation or homepage refresh, which would require mutation handling.

## Acceptance Criteria

- Each requested time control can be started from the homepage with one deliberate click.
- The shortcut label always matches the time control actually sent to matchmaking.
- Puzzles and Next Lesson no longer occupy the top dashboard.
- New Game, Play Bots, and Play a Friend no longer occupy the dashboard shortcut stack.
- The league rank/points summary is hidden.
- Game History appears before Daily Games.
- Stats appears before ChessTV, and ChessTV appears before Legend League.
- Game Review remains available unless a later product decision removes it.
- Refreshes and Chess.com’s dynamic rendering do not silently restore the original layout.
- Changes remain scoped to the intended Chess.com homepage.

## Reference

`reference-homepage.png` is the user-provided homepage screenshot from 2026-07-16. It records the starting layout and should be used as visual context, not as the sole source for DOM selectors.
