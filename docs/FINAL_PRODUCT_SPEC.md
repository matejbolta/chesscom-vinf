# Chess.com Focused Homepage Extension

## Final Product and Implementation Specification

Document status: planning baseline 1.0
Date: 2026-07-16
Target browsers: Chrome and Brave, Manifest V3
Target experience: signed-in Chess.com homepage on desktop
Source of truth: the user's original product description and `reference-homepage.png`

## 1. Executive Summary

The extension will turn the signed-in Chess.com homepage into a focused personal chess dashboard.

The final experience has three priorities:

1. Start any of six regularly played time controls with one click.
2. Give Game History and Stats the strongest positions below the quick-play area.
3. Remove or demote homepage modules that do not serve the user's normal workflow.

The extension will not attempt to redesign all of Chess.com. It will run only on the relevant homepage route, preserve the main Chess.com navigation, reuse native Chess.com game-start behavior wherever possible, and avoid external services or data collection.

The six required quick-play controls are:

- 10 minutes
- 10 + 5
- 15 + 10
- 30 minutes
- 3 + 2
- 5 + 3

The defining product promise is that one click on one of these controls starts matchmaking for exactly that time control. The user must not have to open New Game, reselect the time control, and click Play again.

## 2. Product Context

### 2.1 Current problem

Chess.com exposes only the most recently used time control as a prominent homepage quick-play action. A user who rotates regularly among several time controls repeatedly has to:

1. Open New Game.
2. Choose a time control.
3. Click Play.

At the same time, the most visually prominent homepage area is occupied by Puzzles, Next Lesson, league progress, and other actions that this user rarely or never needs.

Useful information is available lower on the page, but its default priority is wrong:

- Game History appears below Daily Games, even though Daily Games is normally empty.
- Stats appears below ChessTV and Legend League, despite being the most useful right-column module.

### 2.2 Primary user

The initial product is optimized for one signed-in desktop user who:

- plays several rapid and blitz time controls,
- frequently switches between those time controls,
- does not play Daily Games,
- does not use homepage shortcuts for bots or friends,
- does not need Puzzles or Next Lesson on the homepage,
- values recent Game History and Stats,
- sometimes values Game Review,
- considers ChessTV and Legend League secondary rather than useless.

### 2.3 Product principles

- Optimize for the repeated daily action: start the desired game quickly.
- Preserve useful Chess.com behavior instead of reimplementing it.
- Change visual priority without broadening scope beyond the homepage.
- Make every DOM transformation idempotent and resilient to dynamic rerenders.
- Prefer stable semantic selectors and native actions over brittle generated classes.
- Keep the extension private by design: no telemetry, tracking, servers, or remote code.

## 3. Scope

### 3.1 In scope for version 1

- The signed-in Chess.com homepage route or routes identified during discovery.
- Six fixed one-click game shortcuts.
- Removal of the Puzzles and Next Lesson homepage cards.
- Removal of the homepage New Game, Play Bots, and Play a Friend action buttons.
- Removal of the profile-adjacent Legend League rank/points summary.
- Retention of Game Review.
- Reordering Game History before Daily Games.
- Reordering Stats, ChessTV, and Legend League in that priority order.
- Handling Chess.com's dynamic homepage rerenders.
- Desktop layouts and sensible narrower-window fallback behavior.
- Chrome/Brave Manifest V3 packaging.

### 3.2 Explicit non-goals for version 1

- Redesigning the main left navigation.
- Modifying gameplay, analysis, puzzle, lesson, profile, or other non-homepage pages.
- Playing against bots or friends from the new shortcut panel.
- Supporting Daily Chess as a quick-play time control.
- Replacing Chess.com's matchmaking or calling a private matchmaking API directly.
- Building a general-purpose content blocker.
- Syncing settings between devices.
- Analytics, telemetry, ads, tracking, remote configuration, or external services.
- A user-configurable time-control editor in the first release.
- Mobile-browser support.

### 3.3 Deferred possibilities

These are not version 1 commitments:

- User-configurable time controls and ordering.
- A toggle to hide Daily Games completely.
- A toggle to remove Game Review.
- Compact and spacious layout choices.
- Support for additional Chess.com landing pages.

## 4. Final Homepage Information Architecture

### 4.1 Intended desktop structure

```text
Main Chess.com navigation (unchanged)

Profile identity (kept)             League rank/points summary (hidden)

Quick Play
┌──────────────┬──────────────┬──────────────┐   ┌──────────────────────┐
│ Play 10 min  │ Play 10 + 5  │ Play 15 + 10 │   │ Game Review          │
├──────────────┼──────────────┼──────────────┤   │ latest game/opponent │
│ Play 30 min  │ Play 3 + 2   │ Play 5 + 3   │   │ (kept)               │
└──────────────┴──────────────┴──────────────┘   └──────────────────────┘

┌───────────────────────────────────────────┐   ┌──────────────────────┐
│ Game History                              │   │ Stats                │
├───────────────────────────────────────────┤   ├──────────────────────┤
│ Daily Games                               │   │ Live on ChessTV      │
│ low priority; may show 0                   │   ├──────────────────────┤
│                                           │   │ Legend League        │
└───────────────────────────────────────────┘   └──────────────────────┘
```

This is an information hierarchy, not a fixed pixel-perfect implementation. The implementation may use Chess.com's existing grid containers or an extension-owned grid, provided the final order and prominence match this specification.

### 4.2 Element-by-element decision matrix

| Existing homepage element | Final state | Required treatment |
| --- | --- | --- |
| Main left Chess.com navigation | Keep | Do not alter or duplicate it. |
| Profile avatar/name/identity | Keep | Preserve the native profile link and presentation. |
| Profile-adjacent league rank and points | Hide | Remove the rank/points summary from the top area. |
| Current last-used time-control button | Replace | Replace the four-action stack with the six custom shortcuts. |
| New Game button in dashboard | Hide | Main Play navigation remains available. |
| Play Bots button in dashboard | Hide | Main Play navigation remains available. |
| Play a Friend button in dashboard | Hide | Main Play navigation remains available. |
| Puzzles rating/card/board/action | Hide | The entire dashboard module must stop taking layout space. |
| Next Lesson/card/board/action | Hide | The entire dashboard module must stop taking layout space. |
| Game Review card | Keep | Retain it beside or immediately after Quick Play. |
| Daily Games | Demote | Move below Game History; do not hide in version 1. |
| Game History | Promote | Make it the first module in the main/left content column. |
| Stats | Promote | Make it the first module in the right column. |
| Live on ChessTV | Demote | Place below Stats and above Legend League. |
| Legend League module | Demote | Place below Stats and ChessTV. |

### 4.3 Narrower-window behavior

The layout must remain usable when the browser is narrower than the reference screenshot:

- Quick-play controls may collapse from three columns to two and then one.
- Game Review may move below Quick Play rather than becoming too narrow.
- Labels must remain readable without horizontal scrolling.
- The native Chess.com sidebar must not be covered.
- Reordered native modules may stack while preserving their required priority.

The exact breakpoints should follow the measured Chess.com content container rather than hard-coded assumptions from one screenshot.

## 5. Quick-Play Product Specification

### 5.1 Required controls

| Visual order | Button label | Base time | Increment | Expected action |
| --- | --- | ---: | ---: | --- |
| 1 | Play 10 min | 10 minutes | 0 seconds | Enter matchmaking for 10 + 0. |
| 2 | Play 10 + 5 | 10 minutes | 5 seconds | Enter matchmaking for 10 + 5. |
| 3 | Play 15 + 10 | 15 minutes | 10 seconds | Enter matchmaking for 15 + 10. |
| 4 | Play 30 min | 30 minutes | 0 seconds | Enter matchmaking for 30 + 0. |
| 5 | Play 3 + 2 | 3 minutes | 2 seconds | Enter matchmaking for 3 + 2. |
| 6 | Play 5 + 3 | 5 minutes | 3 seconds | Enter matchmaking for 5 + 3. |

This proposed order groups the four longer controls first and the two blitz controls last. The required set is confirmed; minor visual reordering remains cheap if the user prefers a different sequence after seeing the first build.

### 5.2 Definition of one click

A successful shortcut interaction means:

1. The user presses or activates one shortcut once.
2. The extension invokes the verified native Chess.com flow for that exact time control.
3. Chess.com transitions into matchmaking or the normal immediate pre-match state without another user decision.

The extension may internally open a native panel, select a control, and activate Play if that is the safest available mechanism. Those internal operations must happen as one reliable action from the user's perspective.

### 5.3 Launch implementation priority

The launch adapter should use the first reliable method discovered in this order:

1. Activate an existing native Chess.com quick-play control already configured for the target time control.
2. Reproduce a stable native route or supported page action that Chess.com itself uses.
3. Drive the native New Game UI in the DOM: open it, select the requested control, and activate its Play action.

Do not directly call undocumented matchmaking endpoints, copy authentication tokens, or recreate Chess.com's matchmaking protocol.

### 5.4 Shortcut states

Each shortcut needs these states:

- `ready`: normal interactive state.
- `starting`: immediately after activation; temporarily blocks duplicate activation.
- `failed`: native launch did not reach the expected state within a bounded interval.
- `unavailable`: the required native launch surface cannot be found in the current Chess.com build.

Requirements:

- A double-click must not create two matchmaking attempts.
- Failure must restore the button to a usable state.
- Failure feedback should be short and local, such as `Could not start game`.
- No false success message should appear merely because the shortcut was clicked.
- Keyboard activation with Enter or Space must behave like a mouse click.

### 5.5 Visual style

The panel should feel native to the current Chess.com dark homepage:

- Reuse the page's spacing, border radius, dark surfaces, and readable contrast where practical.
- Use a small clock motif only if it can be implemented without copying protected Chess.com assets.
- Keep labels explicit; avoid ambiguous labels such as only `10` or `3|2` without `Play` context.
- Make the entire button surface interactive.
- Provide visible hover, focus, pressed, and disabled states.
- Do not use animation that delays matchmaking.

## 6. Page Transformation Behavior

### 6.1 Homepage guard

The content script may match a narrow Chess.com URL pattern in the manifest, but it must transform the DOM only when all verified homepage conditions are true.

The guard should consider:

- `location.origin`,
- verified homepage pathname or pathnames,
- signed-in homepage landmarks,
- absence of gameplay or analysis landmarks.

If route identity is uncertain, do nothing. A false negative is safer than modifying a gameplay page.

### 6.2 Hide versus remove

Unwanted native modules should normally be hidden with extension-owned markers and CSS rather than permanently deleted from the document.

Benefits:

- Dynamic rerenders are easier to reconcile.
- Native nodes and listeners remain intact.
- A future disable/restore action is possible.
- Debugging can distinguish native content from extension behavior.

Example marker convention:

```text
data-chess-focus-hidden="puzzles"
data-chess-focus-hidden="next-lesson"
data-chess-focus-owned="quick-play"
```

Final attribute names can differ, but all selectors and markers must use a product-specific prefix to avoid collisions.

### 6.3 Reordering native modules

Prefer moving existing DOM nodes within their intended column containers. Moving a node preserves native descendants and listeners better than cloning it.

For every reordered module, capture enough original placement information to permit restoration during development and to avoid repeated reshuffling.

Required order after every reconciliation:

- main column: Game History, then Daily Games;
- right column: Stats, ChessTV, then Legend League.

If the page combines modules into a different container at a responsive breakpoint, preserve priority even if the result becomes one stacked column.

### 6.4 Dynamic rendering

Assume Chess.com can rerender modules after initial load.

Use a `MutationObserver` or a similarly scoped reconciliation mechanism with these constraints:

- Debounce bursts of mutations.
- Observe the narrowest stable homepage root available.
- Make every reconciliation idempotent.
- Never insert duplicate quick-play panels.
- Never repeatedly move already-correct modules.
- Disconnect or pause observation while performing large extension-owned moves if needed to prevent feedback loops.
- Reapply the desired layout if Chess.com replaces a previously transformed node.

### 6.5 Single-page navigation

If Chess.com changes routes without a full page load:

- detect route changes through verified navigation signals,
- remove or deactivate extension-owned homepage UI when leaving home,
- stop homepage mutation work outside home,
- reconcile again when returning to home.

Do not leave shortcut controls floating on game, analysis, puzzle, or lesson pages.

## 7. Technical Architecture

### 7.1 Recommended project structure

```text
chess-homepage/
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── public/
│   ├── manifest.json
│   └── icons/
├── scripts/
│   ├── build.mjs
│   └── package.mjs
├── src/
│   ├── content/
│   │   ├── content-script.ts
│   │   ├── content.css
│   │   ├── homepage-detector.ts
│   │   ├── module-locator.ts
│   │   ├── layout-controller.ts
│   │   ├── quick-play-renderer.ts
│   │   └── launch-adapter.ts
│   └── shared/
│       ├── constants.ts
│       ├── models.ts
│       └── time-controls.ts
├── tests/
│   ├── fixtures/
│   ├── homepage-detector.test.ts
│   ├── module-locator.test.ts
│   ├── layout-controller.test.ts
│   └── launch-adapter.test.ts
└── docs/
    ├── PRODUCT_BRIEF.md
    ├── FINAL_PRODUCT_SPEC.md
    └── reference-homepage.png
```

A service worker or popup should not be added unless discovery reveals a concrete need. The initial product can likely remain a focused content-script extension.

### 7.2 Component responsibilities

`homepage-detector.ts`

- Determines whether the current document is the intended signed-in homepage.
- Contains route and landmark checks in one testable place.

`module-locator.ts`

- Locates native profile, action-stack, Puzzles, Lesson, Game Review, Daily Games, Game History, Stats, ChessTV, and Legend League modules.
- Keeps Chess.com-specific selector knowledge isolated.
- Returns typed optional results rather than throwing when a module is absent.

`layout-controller.ts`

- Hides low-value modules.
- Reorders retained modules.
- Mounts or updates the extension-owned Quick Play panel.
- Reconciles idempotently after dynamic changes.

`quick-play-renderer.ts`

- Renders the six buttons accessibly.
- Manages ready/starting/failed/unavailable UI states.
- Delegates game start behavior to the launch adapter.

`launch-adapter.ts`

- Maps each extension time control to a verified native Chess.com action.
- Prevents duplicate launches.
- Confirms that the requested native state or navigation occurred.
- Contains no copied credentials or direct private-API calls.

`content-script.ts`

- Owns startup, route lifecycle, mutation observation, and cleanup.
- Coordinates the smaller modules without embedding selector details.

### 7.3 Time-control model

Use a single typed configuration table so labels and launch values cannot drift apart.

Conceptual model:

```ts
interface TimeControl {
  id: TimeControlId;
  label: string;
  baseSeconds: number;
  incrementSeconds: number;
  timeClass: "bullet" | "blitz" | "rapid";
  presetAvailability: "both" | "desktop" | "mobile";
}
```

Tests must assert that every rendered label maps to the exact expected launch values.

### 7.4 Selector strategy

Selector reliability order:

1. Stable IDs, `data-*` attributes, accessible labels, and semantic landmarks.
2. Stable href/action patterns used by native Chess.com controls.
3. Stable human-readable headings constrained to the correct region.
4. Named classes that are demonstrated to be stable in the saved fixture.
5. Structural position only as a narrowly guarded fallback.

Avoid:

- generated class hashes,
- global text searches without a container guard,
- `nth-child` as the primary locator,
- selecting solely by icon appearance,
- assumptions based on one viewport.

### 7.5 Permissions

Request only permissions demonstrated to be necessary.

Expected initial manifest footprint:

- a content-script match for the verified Chess.com HTTPS origin/path pattern;
- no broad browsing history permission;
- no tabs permission unless discovery proves it necessary;
- no remote-code permission;
- no network host permissions unrelated to Chess.com;
- no storage permission unless an enable toggle or preferences are actually added.

## 8. Privacy, Security, and Safety

The extension must:

- run entirely in the browser,
- make no extension-owned external network requests,
- collect no game history, ratings, usernames, page content, or account data,
- send no telemetry or analytics,
- store no Chess.com credentials, cookies, or tokens,
- inject no remote scripts,
- avoid logging account data in production,
- use Chess.com's already authenticated page behavior without copying authentication material.

Saved HTML fixtures must be sanitized before committing. Remove or redact:

- account-specific identifiers not needed for tests,
- email addresses or personal profile data,
- session tokens,
- CSRF values,
- cookies,
- inline secrets or API keys,
- private chat or notification content.

The reference screenshot contains account-visible information and should remain a local project reference unless the user explicitly chooses to publish it.

## 9. Discovery Package Required Before Coding Launch Behavior

The layout can be scaffolded from the screenshot, but reliable quick play requires evidence from the live page.

A complete browser-saved homepage capture from 2026-07-16 is now available locally under `fixtures/raw/2026-07-16/`. It is private, ignored working material and has not yet been sanitized into a test fixture or audited for stable selectors.

### 9.1 Saved page capture

Provide a fresh signed-in homepage capture using the browser's Save Page Complete function, or a sanitized HTML snapshot that includes the relevant dashboard containers.

The capture should represent:

- the normal desktop viewport,
- the visible dashboard shown in the reference screenshot,
- the native current quick-play button,
- the modules to hide and reorder.

### 9.2 Native launch observations

For each required time control, record at least one of:

- the URL before and after launch,
- the DOM attributes of the selected time control and Play control,
- whether a modal or drawer opens,
- whether matchmaking begins without navigation,
- whether the selected time control persists between visits.

The ideal artifact is a short step log plus sanitized DOM snippets for the native controls. A direct hyperlink is useful only if Chess.com itself uses a stable direct hyperlink.

### 9.3 DOM audit deliverable

Before feature implementation, create `docs/DOM_AUDIT.md` containing:

- verified homepage path,
- stable root landmark,
- selector candidates for every module in the decision matrix,
- chosen quick-play launch method,
- dynamic rerender observations,
- responsive-container observations,
- known fallback behavior.

## 10. Delivery Plan

### Phase 0 — Discovery and fixture preparation

Deliverables:

- Fresh saved/sanitized Chess.com homepage fixture.
- DOM audit.
- Verified launch mechanism for all six controls.
- Confirmed homepage route guard.

Exit criteria:

- No selector or launch behavior is based only on visual guessing.
- The six requested time controls can be distinguished unambiguously in native Chess.com behavior.

### Phase 1 — Independent extension scaffold

Deliverables:

- Manifest V3 project.
- TypeScript build and watch scripts.
- Test runner and DOM test environment.
- Original extension icons.
- Project-level `AGENTS.md` and updated README.

Exit criteria:

- Extension loads unpacked in Chrome and Brave.
- Content script activates only on the verified homepage.
- Typecheck, tests, and build commands pass.

### Phase 2 — Static homepage cleanup and ordering

Deliverables:

- Module locator.
- Hiding for top league summary, Puzzles, Next Lesson, and redundant action buttons.
- Game History/Daily Games ordering.
- Stats/ChessTV/Legend League ordering.
- Fixture tests for every transformation.

Exit criteria:

- The final information hierarchy matches Section 4 on initial page load.
- Missing optional modules do not break other transformations.
- Running reconciliation twice produces no duplicate or additional changes.

### Phase 3 — Quick Play panel

Deliverables:

- Six-button responsive panel.
- Typed time-control configuration.
- Launch adapter using verified native behavior.
- Button state handling and duplicate-launch protection.
- Unit and fixture tests for label-to-time-control mapping.

Exit criteria:

- Every shortcut starts the correct requested control with one user action.
- No shortcut accidentally starts the previously selected control.
- A failed native launch gives useful local feedback and recovers.

### Phase 4 — Dynamic-page resilience

Deliverables:

- Debounced mutation reconciliation.
- Single-page route lifecycle handling if needed.
- Cleanup when leaving the homepage.
- Replacement-node and delayed-render tests.

Exit criteria:

- Chess.com rerenders do not restore unwanted modules permanently.
- The Quick Play panel never duplicates.
- No homepage UI remains on non-homepage routes.
- Observer behavior does not create a mutation loop or visible flicker.

### Phase 5 — Visual polish and manual validation

Deliverables:

- Native-feeling dark-theme styles.
- Responsive layouts.
- Focus, hover, active, loading, failure, and unavailable states.
- Manual test notes for Chrome and Brave.

Exit criteria:

- Layout is clear at the reference viewport and narrower desktop widths.
- Buttons are keyboard accessible.
- Native navigation and retained modules still work.
- There is no significant layout flash after normal homepage load.

### Phase 6 — Packaging and release readiness

Deliverables:

- Production build.
- Unpacked-install package.
- Privacy statement.
- Permission justification.
- Release checklist and version alignment.

Exit criteria:

- Clean install succeeds in both Chrome and Brave.
- Build contains no fixtures, account data, source maps if not intended, or unnecessary permissions.
- All automated checks and manual acceptance scenarios pass.

## 11. Test Strategy

### 11.1 Automated tests

Homepage detection:

- Accept the verified signed-in homepage.
- Reject game, analysis, puzzle, lesson, and unrelated routes.
- Reject pages missing required homepage landmarks.

Module location:

- Find every target module in the sanitized fixture.
- Tolerate an absent Daily Games, ChessTV, Game Review, or Legend module.
- Avoid matching similarly named navigation items.

Layout transformation:

- Hide only the requested modules.
- Keep Game Review.
- Keep the main navigation.
- Order Game History before Daily Games.
- Order Stats before ChessTV before Legend League.
- Remain idempotent across repeated calls.
- Reconcile correctly when a native module is replaced.

Quick Play:

- Render exactly six shortcuts.
- Render each required label once.
- Map every label to the correct base and increment.
- Prevent concurrent launch attempts.
- Recover after failure.
- Avoid insertion outside the homepage.

Privacy/sanitization:

- Scan committed fixtures for token- and secret-like patterns.
- Ensure production bundles contain no saved page fixture or reference screenshot.

### 11.2 Manual acceptance matrix

For each of Chrome and Brave:

1. Load the extension unpacked.
2. Open the signed-in homepage in a fresh tab.
3. Confirm Puzzles and Next Lesson are absent with no empty layout holes.
4. Confirm top league rank/points are absent.
5. Confirm New Game, Play Bots, and Play a Friend are absent from the dashboard stack.
6. Confirm all six quick-play shortcuts are visible and readable.
7. Start one game with each shortcut, verifying the exact clock in the resulting match.
8. Confirm rapid switching: start different controls on successive homepage visits.
9. Confirm Game Review remains available and clickable.
10. Confirm Game History appears before Daily Games.
11. Confirm Stats, ChessTV, and Legend League appear in that order.
12. Refresh the homepage and confirm the final layout returns correctly.
13. Navigate away and back through Chess.com's client-side navigation if supported.
14. Resize the window and confirm no overlap or horizontal page breakage.
15. Confirm the main Play navigation, Lessons, Stats, and Game History navigation still work.
16. Temporarily simulate a missing optional module and confirm the rest still transforms.

## 12. Definition of Done

The product is complete for version 1 only when all of the following are true:

- The existing RTV extension remains independent and untouched.
- The Chess.com extension is independently installable in Chrome and Brave.
- It operates only on the verified signed-in Chess.com homepage.
- It exposes exactly the six required time controls.
- Each shortcut reliably starts the labeled control in one user action.
- It does not start the previous/default control by mistake.
- Puzzles, Next Lesson, redundant dashboard actions, and top league points no longer occupy homepage space.
- Game Review remains available.
- Game History precedes Daily Games.
- Stats precedes ChessTV, which precedes Legend League.
- Dynamic rerenders do not undo or duplicate the transformation.
- Narrower desktop layouts remain usable.
- Native retained features continue working.
- Automated tests, typecheck, and production build pass.
- Manual validation passes in both Chrome and Brave.
- No external services, telemetry, tracking, remote code, or account-data collection exist.
- Requested manifest permissions are minimal and documented.

## 13. Risks and Mitigations

### Chess.com changes its DOM

Risk: generated classes or container structures can change.

Mitigation:

- isolate selectors in one module,
- prefer semantic attributes and headings,
- keep sanitized fixture tests,
- fail locally per module rather than breaking the whole page,
- maintain a DOM audit.

### One-click launch uses unstable native internals

Risk: a route or UI sequence may change and launch the wrong control.

Mitigation:

- use native visible actions where possible,
- centralize launch mappings,
- verify the selected clock before triggering Play where the DOM exposes it,
- treat uncertainty as failure rather than falling back to the last-used control.

### Dynamic rendering causes duplicate UI or flicker

Risk: Chess.com replaces nodes after the extension transforms them.

Mitigation:

- extension-owned unique mount marker,
- debounced idempotent reconciliation,
- scoped observer,
- hidden-state CSS applied as early as safely possible.

### Reordering breaks native module behavior

Risk: cloning or rebuilding native components can detach listeners or state.

Mitigation:

- move original nodes instead of cloning,
- do not rewrite native module internals,
- manually validate retained links and controls.

### Account-specific homepage variants

Risk: subscription, experiments, locale, ratings, or account settings can alter modules.

Mitigation:

- treat nonessential modules as optional,
- constrain v1 to the user's verified layout,
- avoid assuming every module exists,
- document observed variant and locale in the DOM audit.

## 14. Confirmed Decisions and Remaining Discovery

### Confirmed product decisions

- Build a separate Chess.com extension, not a feature inside RTV Shadap.
- Target Chrome and Brave.
- Focus on the Chess.com homepage.
- Provide six fixed one-click time controls: 10, 10 + 5, 15 + 10, 30, 3 + 2, and 5 + 3.
- Remove Puzzles and Next Lesson from the top dashboard.
- Replace the existing action stack rather than preserving New Game, Bots, or Friend there.
- Hide top league rank/points.
- Keep Game Review for version 1.
- Promote Game History over Daily Games.
- Promote Stats over ChessTV over Legend League.
- Do not add external services or tracking.

### Discovery-gated technical decisions

- Exact homepage pathname and signed-in landmark.
- Exact stable selectors for each native module.
- Exact native one-click launch mechanism.
- Whether route changes are full page loads or client-side transitions.
- Whether the two-column containers can accept moved nodes directly at every desktop width.
- Whether early CSS can hide unwanted cards before the main controller runs without false matches.

These unknowns block reliable implementation details, but they do not change the final product requirements.

## 15. Immediate Next Action

The next implementation session should sanitize the relevant parts of the available homepage capture, produce `docs/DOM_AUDIT.md`, and perform a launch-flow audit for the six time controls. Once the selector and launch findings are recorded, Phase 0 can be completed and implementation can proceed without guessing at URLs or matchmaking behavior.

## 16. Version 0.2 Product Amendments

The user's first live-production review supersedes the following version 1
constraints:

- Quick Play still renders exactly six controls, but the six IDs are configurable
  from a nine-option Rapid/Blitz catalog. The original six remain defaults.
- A toolbar popup provides a master enable switch and an independent toggle for
  promoting Game History above Daily Games.
- Preferences are stored only in `chrome.storage.local`.
- Quick Play uses Chess.com's native Rapid and Blitz glyphs. The default `3 + 2`
  and `5 + 3` controls are Blitz; the other four defaults are Rapid.
- The subtitle is `Choose time control`.
- ChessTV detection must work when an online card shows a streamer name instead
  of the offline `Live on ChessTV` link.
- VINF branding uses Chess.com's `#81b64c` green and a native-style pressed depth.

## 17. Version 0.3 Product Amendments

The second live-production review makes the top dashboard deliberately more
minimal:

- Hide Game Review completely.
- Remove the Quick Play title, `Choose time control` subtitle, and VINF branding
  mark from the homepage.
- Let the six Quick Play buttons occupy the complete promo width.
- Preserve the normal `2.4rem` module gap when ChessTV is immediately followed by
  Legend League.

The toolbar popup keeps the VINF identity and settings; the homepage itself is
reduced to functional controls only.

## 18. Version 0.4 Product Amendments

- Move the original Daily Games module from the left column into the sidebar.
- Required sidebar order becomes Stats, ChessTV, Daily Games, Legend League.
- Constrain the moved native wrapper to the sidebar width without cloning or
  rebuilding its internals.
- Replace the old `Promote Game History` popup toggle with `Move Daily Games to
  sidebar`; disabling it restores the native left-column placement.
- Migrate the stored legacy `reorderGameHistory` boolean to the new preference so
  existing installations retain the user's choice.

## 19. Version 0.4.1 Product Amendments

- Center each Quick Play label and display only the clock (`10`, `10 + 5`, and so
  on), while retaining the action-oriented accessible name.
- Fill the desktop grid down each column: `10`, `10 + 5`; `15 + 10`, `30`; then
  `3 + 2`, `5 + 3`.
- Give Rapid buttons a subtle Chess.com green tint and Blitz buttons a subtle
  Chess.com yellow tint, using the same colors as their native clock glyphs.

## 20. Version 0.4.2 Product Amendments

- Remove clock glyphs from Quick Play so each button contains only its centered
  time-control label.
- Increase the saturation and contrast of both category surfaces against the gray
  Chess.com canvas, with a slightly stronger Rapid treatment and a restrained
  category-colored inset edge.
- Mix category colors against an opaque dark surface so Chess.com's translucent
  background variables cannot wash out the resulting tint.

## 21. Version 0.4.3 Product Amendments

- Reduce Quick Play row height from `6.8rem` to `5.8rem`, tighten the gap and
  padding, and retain a comfortable `5.8rem` minimum touch target.
- Replace dark gray color mixing with hue-preserving Rapid green and Blitz gold
  surfaces so the category colors remain saturated instead of becoming olive or
  brown.
- Keep the stronger native category color for focus and hover feedback while the
  resting controls remain visually subordinate to the homepage content.

## 22. Version 0.4.4 Product Amendments

- Center the desktop Quick Play grid at `80%` of its previous width so each card
  is approximately 20% narrower; restore full width below the two-column
  responsive breakpoint.
- Increase each card from `5.8rem` to `7rem`, producing a more intentional button
  proportion without restoring the earlier full-width slab appearance.
- Set Rapid intensity midway between versions 0.4.2 and 0.4.3.
- Shift Blitz from 45 to 52 degrees of hue, reduce its saturation slightly, and
  preserve a brighter edge so it reads as yellow-gold rather than orange-brown.

## 23. Version 0.5 Product Amendments

- Move the extension-owned Quick Play panel out of the top promo region and into
  Chess.com's existing left content column immediately above Daily Games or Game
  History.
- Make the Quick Play grid exactly the same width as Game History, with no added
  left or right whitespace inside that column.
- Hide the now-empty native promo row while retaining its verified native launch
  link in the DOM.
- Let Chess.com's existing two-column layout bring the complete sidebar upward,
  placing Stats alongside Quick Play without absolute positioning or rebuilding
  native sidebar modules.
- Preserve a `2.4rem` vertical gap between Quick Play and the first native main
  module.
- Restore Daily Games to its native left position immediately when the sidebar
  placement setting is disabled, without requiring a page reload.

## 24. Version 0.5.1 Product Amendments

- Never render visible `Starting…`, unavailable, or failure text beneath Quick
  Play; these messages must not create a row or move Game History.
- Preserve assistive feedback through a visually hidden ARIA live status region.
- Keep genuine launch failure visible only through the affected button's local
  failure outline.

## 25. Version 0.6 Product Amendments

- Save the enabled toggle, Daily Games placement toggle, each Quick Play preset,
  and preset reset immediately; remove the separate Save button.
- Serialize storage writes so several fast changes cannot finish out of order.
- Show brief `Saving…`, `Settings saved.`, or `Defaults restored.` feedback in the
  popup without requiring any further action.
- Prevent duplicate Quick Play presets by disabling controls already selected in
  the other shortcut menus.
- Match Chess.com's available controls exactly: Blitz `3 min`, `3 + 2`, `5 min`,
  and `5 + 3`; Rapid `10 min`, `10 + 5`, `15 + 10`, `20 min`, `30 min`, and
  `60 min`.
- Remove the nonexistent `15 min` option and migrate a previously saved `15 min`
  selection to `20 min` instead of discarding the user's complete preset set.
- Keep the Quick Play Reset action scoped to presets; it must not change the
  extension-enabled or Daily Games placement toggles.

## 26. Version 0.6.1 Product Amendments

- Present Rapid choices in a natural linear order in the popup: `10 min`,
  `10 + 5`, `15 + 10`, `20 min`, `30 min`, then `60 min`.

## 27. Version 0.7 Product Amendments

- Use a desktop-first union of the current desktop and mobile Chess.com preset
  catalogs instead of either platform's intersection.
- Offer 17 settings choices while continuing to render exactly six user-selected
  homepage shortcuts and preserving all six existing defaults.
- Add Bullet `30 sec`, `20 sec + 1`, `1 min`, `1 + 1`, and `2 + 1`.
- Keep current desktop Blitz `3 min`, `3 + 2`, `5 min`, and `5 + 3` primary;
  retain mobile-only `5 + 2` and `5 + 5` in a separate secondary popup group.
- Keep Rapid `10 min`, `10 + 5`, `15 + 10`, `20 min`, `30 min`, and `60 min`.
- Represent base time internally as integer seconds so sub-minute controls need
  no decimal-minute conversion and map directly onto Chess.com's native `base`
  query parameter.
- Give selected Bullet shortcuts their own amber Chess.com-style category tint,
  distinct from Blitz yellow and Rapid green.

## 28. Version 0.8 Android Product Amendments

- Preserve the Chrome/Brave Manifest V3 extension as an independent desktop
  delivery while adding a separate Android artifact.
- Use Firefox for Android plus Violentmonkey as the supported private-install
  path because Chrome Android does not install desktop extensions and a local
  userscript avoids Firefox add-on signing/store publication.
- Bundle the Android userscript entirely from local project sources. Grant only
  local userscript value storage, value-change listening, and menu-command APIs;
  do not add network APIs or remote code.
- Reuse the shared runtime, settings normalization, time-control catalog, launch
  adapter, renderer, controller, and homepage CSS rather than fork their product
  behavior.
- Add a responsive DOM mode that does not require `.promo-component`,
  `#vue-instance`, or `#vue-sidebar-instance`. Prefer semantic destination paths,
  headings, and native component landmarks while excluding navigation/header
  links.
- In a safe single-column sibling layout, order Quick Play, Game History, Stats,
  ChessTV, Daily Games, and Legend League. Do not move cards across uncertain
  nested container boundaries.
- Fall back from the desktop `.base-container` mutation root to `main`,
  `[role=main]`, or `body` for dynamically rendered responsive content.
- Keep the two-column tablet grid and one-column narrow-phone grid with the
  existing 7rem touch targets and category styling.
- Provide a touch-friendly local settings dialog through a userscript menu
  command, with `#vinf-settings` as a browser-UI-independent fallback.
- Keep Android userscript settings local and separate from desktop
  `chrome.storage.local`.

## 29. Version 0.8.1 Product Amendments

- Hide Chess.com's optional recurring top campaign at the exact
  `#main-banner` landmark whenever VINF is enabled.
- Do not depend on campaign copy, `data-name`, image assets, or generated
  classes because the promoted campaign changes over time.
- Keep the native banner in the DOM with the standard VINF hidden marker so
  disabling VINF or leaving `/home` restores it.
- Reconcile a campaign banner inserted or replaced after initial page load.
- Apply the same shared-runtime behavior to the desktop extension and Android
  userscript without adding a new setting, permission, or network request.

## 30. Version 0.8.2 Product Amendments

- Hide the redundant avatar, username, and country-flag row at the exact
  `.promo-toolbar-user-info` module whenever VINF is enabled.
- Match the semantic module class only; never use the signed-in username, member
  URL, avatar, flag, or other account-specific data as a selector.
- Keep the native row in the DOM so the signed-in homepage landmark remains
  available and cleanup can restore the row.
- Reconcile a promo user-info row replaced after initial page load.
- Apply the behavior through the shared desktop/Android runtime. On responsive
  layouts, hide it only when Chess.com exposes the same exact module class; do
  not broadly hide generic profile controls.

## 31. Version 0.8.3 Product Amendments

- Remove version 0.8.2's incorrect uniqueness assumption for
  `.promo-toolbar-user-info`; live verification still showed the desktop strip.
- Locate and hide every exact `.promo-toolbar-user-info` instance because
  Chess.com may retain multiple breakpoint or Vue-mount variants.
- Keep cleanup reversible for every matched instance and continue to avoid
  username, member URL, avatar, flag, and generic profile selectors.
- Add a regression fixture with two exact module instances and require both to
  hide and restore.

## 32. Version 0.8.4 Product Amendments

- Correct versions 0.8.2 and 0.8.3 using the user-marked live DOM hierarchy:
  the visible avatar, username, and flag row is `header#homepage-toolbar`
  containing `.toolbar-user-info[data-cy="profile-section"]`.
- Hide the complete exact `#homepage-toolbar` while retaining it in the DOM so
  the signed-in homepage guard can still locate its descendant.
- Retain `.promo-toolbar-user-info` hiding for compatibility, but document that
  the live marked instance was empty and was not the visible profile strip.
- Reconcile and restore a dynamically replaced homepage toolbar.
- Apply the exact-ID behavior through the shared desktop/Android runtime without
  broadly hiding `#mobile-toolbar`, generic headers, or generic profile controls.

## 33. Version 0.9 Product Amendments

- Keep Chess.com's native Stats card but make both known row groups
  user-configurable through the desktop popup and Android settings modal.
- Let the user show, hide, and fix the order of summary rows `Games`, `Puzzles`,
  and `Lessons`.
- Let the user show, hide, and fix the order of rating rows `Rapid`, `Bullet`,
  `Blitz`, `Daily`, `Puzzles`, and `Live 960`.
- Default the summary to `Games` only. Default ratings to `Rapid` then `Blitz`
  only.
- Keep Insights outside the setting: always visible and always last.
- Move complete native row wrappers, preserve their behavior, and restore their
  exact original positions when VINF is disabled or leaves `/home`.
- Preserve unknown future Stats rows instead of hiding them. Place unknown
  rating rows before Insights while retaining their relative order.
- Autosave every Stats checkbox, order movement, and Stats-only Reset through
  the same serialized desktop persistence queue. Provide equivalent controls in
  the Android userscript modal.
- Run both desktop and Android delivery at `document-start`, attach observation
  before page landmarks arrive, and wait for persisted settings before applying
  any transformation.
- Reconcile immediately until the first complete homepage layout is available,
  then use a leading 60ms mutation throttle. Keep central Quick Play insertion
  before sidebar/Stats work in the synchronous controller; do not create
  separate painted phases that would cause additional visible jumping.

## 34. Version 0.9.1 Product Amendments

- Preserve Chess.com's native click-to-expand behavior for visible Stats rating
  rows.
- Treat an already-correct Stats order as a true no-op: do not re-append native
  rows merely because expansion changed a descendant subtree.
- Ignore unlabeled rating-shaped expansion content during managed ordering so it
  remains next to the native rating that created it.
- Add a regression test covering both nested and direct-sibling expansion
  content across repeated layout reconciliation.

## 35. Version 0.9.2 Product Amendments

- Prevent a late-inserted native Daily Games row from briefly shifting Quick
  Play downward while VINF waits to move that row into the sidebar.
- Once desktop sidebar placement is active, arm the native left column with a
  document marker and a narrowly scoped semantic CSS rule that hides only a
  direct child containing `/play/online/daily`.
- Keep Quick Play anchored to Game History while sidebar placement is enabled;
  do not reposition Quick Play around the transient Daily Games wrapper.
- Stop matching automatically after Daily Games moves to the right sidebar.
  Remove the marker when the setting is disabled, VINF is disabled, or cleanup
  runs.

## 36. Version 0.9.3 Product Amendments

- Fix the remaining reload jump captured on 2026-07-27: Chess.com can render a
  Daily Games loading header and a Game History skeleton before either module
  has its final semantic link/component landmark.
- Recognize the native `.current-games-header-list` as a pre-hydration Daily
  Games landmark in the desktop left column, move that wrapper to the sidebar
  early, and include it in the temporary native-slot CSS guard.
- If Game History is not recognizable yet, insert Quick Play before the first
  direct native `.home-container-component` instead of appending it after the
  loading cards.
- Preserve the final desktop hierarchy and all existing cleanup, setting, and
  responsive behavior.

## 37. Version 0.9.4 Product Amendments

- Expand visible Rapid and Blitz Stats rows by default using Chess.com's own
  native row buttons.
- Trigger each native row at most once per row instance and only when its native
  downward chevron explicitly indicates a collapsed state.
- Preserve user control after initialization: manually collapsing either row
  must not cause VINF to reopen it during later mutation reconciliation.
- Do not rebuild, clone, or synthesize expanded Stats content.

## 38. Version 0.10.0 Product Amendments

- Add a persisted `Rapid & Blitz on load` setting to both the desktop popup and
  Android userscript dialog with exact `Expanded` and `Retracted` choices.
- Keep `Expanded` as the default and migration result for existing settings.
- Apply the selected initial state once per native Rapid/Blitz row through
  Chess.com's own row button, then preserve every later manual expand/retract
  action.
- Recognize the earlier native
  `.home-current-games-loading-view-toggle-container` Daily Games shell in both
  the module locator and temporary left-column CSS guard.
- From the 2026-07-27 12:51 recording's consecutive frames, prevent the native
  Play/Puzzles/Next Lesson/Game Review promo row from repainting for roughly
  three frames after Quick Play appears.
- Arm the exact enabled `/home` document with a namespaced active marker as soon
  as stored settings load, and use it to pre-hide only the already-audited
  `#homepage-toolbar`, `#main-banner`, `.promo-toolbar-user-info`, and
  `.promo-component` landmarks across native node replacement.
- Remove the active marker immediately when VINF is disabled or the route leaves
  `/home`; retain element-level markers for inspection and reversible cleanup.

## 39. Version 0.11.0 Product Amendments

- Replace the single `Rapid & Blitz on load` preference with an independent
  `Expanded` or `Retracted` preference for every known Stats rating row:
  Rapid, Bullet, Blitz, Daily, Puzzles, and Live 960.
- Place each compact state selector between its rating label and order arrows in
  both the desktop popup and Android settings dialog.
- Keep a hidden row's saved state visible but disabled until that row is ticked
  again; do not discard the choice when visibility changes.
- Default every rating state to `Expanded`. Migrate the retired global
  `statsDefaultState` value to all six rows so existing users retain their prior
  startup choice.
- Apply each visible row's state once through its own native button, then preserve
  every later manual expand/retract action.
- Record the complete 60fps review of all 176 frames in the 2026-07-27 13:32:45
  desktop reload: Quick Play remains fixed from first paint, the promo row stays
  pre-hidden, and remaining Game History/ChessTV hydration is isolated outside
  the stable primary interaction area.

## 40. Version 0.12.0 Product Amendments

- Change the default initial state for all six known Stats rating rows from
  `Expanded` to `Retracted`. Preserve explicitly saved states; Stats Reset and
  new settings use the new retracted defaults.
- Replace the retired Daily Games sidebar boolean with a three-way placement
  choice: `Main column`, `Right column`, or `Hidden`.
- Add independent `Show ChessTV` and `Show Legend League` settings, enabled by
  default.
- Move, restore, or hide complete native wrappers only. Never remove or clone
  Daily Games, ChessTV, or Legend League, and restore every marker and original
  position when VINF is disabled or leaves `/home`.
- Mirror all three module settings in the Android userscript dialog and apply
  them to the responsive single-column flow.
- Migrate `moveDailyGamesToSidebar` and the older `reorderGameHistory` booleans
  to the new Daily Games placement without discarding existing user choices.
- Pre-arm exact setting-specific document markers after storage loads, including
  while the homepage DOM is incomplete, so cards configured as hidden cannot
  flash before mutation reconciliation.

## 41. Version 0.12.1 Product Amendments

- Place the master `Enable VINF` switch in a standalone top settings card.
- Keep `Homepage` as the section for Daily Games placement plus ChessTV and
  Legend League visibility only.
- Apply the same settings hierarchy to the desktop popup and Android userscript
  dialog.
- Replace separate desktop/mobile Blitz optgroups with one shared Blitz group.
- Order that group by base time and then increment: `3 min`, `3 + 2`, `5 min`,
  `5 + 2`, `5 + 3`, `5 + 5`.
- Keep source-platform availability as internal catalog metadata; do not expose
  it as a settings hierarchy.

## 42. Version 0.13.0 Product Amendments

- Add a persisted Quick Play grid-size choice with exact values `6` and `8` to
  both desktop and Android settings.
- Preserve every valid legacy six-control configuration as six-button mode.
  Infer eight-button mode from a valid legacy eight-control array, and otherwise
  fall back to the complete defaults for the selected size.
- Keep the existing six-button defaults and two-row, three-column desktop layout
  unchanged.
- Use this stored order for the eight-button defaults:
  `10-0`, `10-5`, `15-10`, `30-0`, `1-1`, `3-0`, `3-2`, `5-5`.
  With column-first desktop flow, it renders:

      10       15 + 10       1 + 1       3 + 2
      10 + 5   30            3           5 + 5

- Keep the exact current gap and total Game History width in eight-button mode;
  fit four equal columns rather than widening the panel.
- Keep the tablet breakpoint at two columns and the narrow-phone breakpoint at
  one column for either grid size.
- Make Quick Play Reset restore the defaults for the currently selected grid
  size only.
- Shift the Blitz surface away from muted ochre toward a more saturated
  Chess.com lightning-bolt yellow while retaining white-text contrast and a
  darker surface than the native icon.

## 43. Version 0.13.1 Product Amendments

- Keep the cleaner 48-degree lightning-yellow Blitz hue introduced in version
  0.13.0, but restore the calmer visual density of the earlier buttons.
- Lower the Blitz surface and edge lightness to match the perceived weight of
  Rapid and Bullet while retaining enough saturation to resist becoming muddy
  on Chess.com's gray homepage canvas.

## 44. Version 0.13.2 Product Amendments

- Replace the opaque dark-HSL Blitz palette with translucent layers derived
  directly from the sampled native lightning-bolt color `#ead762`.
- Use 50% alpha for the resting surface, 58% for hover, and 75% for the edge.
  This preserves the bolt's cooler yellow relationship on the gray canvas
  instead of turning dark yellow into orange-brown ochre.
- Keep white labels: the 50% resting composite retains suitable contrast for
  the existing large bold button text.

## 45. Version 0.13.3 Product Amendments

- Reduce the sampled Blitz resting surface from 50% to 46% alpha and hover from
  58% to 54% after live-page review found the prior surface slightly too pale.
- Preserve the exact `#ead762` source hue and 75% edge, keeping the result
  between the earlier ochre treatment and the overly light 0.13.2 surface.

## 46. Version 0.13.4 Product Amendments

- Retire alpha blending for the Blitz surface after live review found that even
  the 46% treatment remained too milky against Chess.com's gray canvas.
- Preserve the sampled bolt's perceptual hue with an OKLCH palette:
  `oklch(54% 0.085 100)` at rest, `oklch(58% 0.09 100)` on hover, and
  `oklch(70% 0.11 100)` at the edge.
- Keep the exact sampled `#ead762` as the full-color interaction accent. The
  darker surfaces reduce lightness while retaining enough chroma to avoid both
  the earlier orange-ochre result and the later pale-khaki result.

## 47. Version 0.14.0 Product Amendments

- Expand the persisted Quick Play button-count choices to exactly `1`, `2`, `3`,
  `4`, `6`, and `8` in both the desktop popup and Android settings.
- Keep one desktop row for counts one through four. Preserve the existing two
  rows of three for six and two rows of four for eight.
- Keep the same `1.4rem` gap and exact Game History width for every count. A
  one-button layout therefore renders one full-width control.
- Use these defaults in visible order for the one-row layouts:
  - one: `10`;
  - two: `10`, `15 + 10`;
  - three: `10`, `15 + 10`, `3 + 2`;
  - four: `10`, `10 + 5`, `15 + 10`, `3 + 2`.
- Preserve the established six- and eight-button defaults and their column-first
  stored order.
- Infer any supported count from a complete valid legacy preset array when the
  explicit count is absent. Invalid, duplicate, or wrongly sized arrays fall
  back to the complete defaults for the selected count.
- Keep the README concise: describe the available counts and layout behavior
  without reproducing every default preset combination.

## 48. Version 0.14.1 Product Amendments

- Support the 2026-07-28 Chess.com desktop redesign alongside the legacy
  homepage contract; do not remove legacy selectors because rollout cohorts or
  rollbacks may still serve that shell.
- Recognize the redesigned exact `#home-header` hero,
  `#home-main > .main-component`, and
  `#home-sidebar > .sidebar-component`. Keep the native immediate-match link in
  the hidden hero and continue deriving every launch from it.
- Place Quick Play before the first redesigned main section, keep it exactly
  `728px` wide with Game History at the audited desktop viewport, and preserve
  the established `2.4rem` main/sidebar card gap.
- Recognize redesigned Stats summary rows, link-only rating rows, `/stats`
  header path, and `/leagues/` Legend League path. Preserve unknown native
  sidebar cards after VINF's managed prefix.
- Apply Stats visibility and order to the redesigned non-expandable rows without
  inventing chevrons or synthetic expansion behavior. Preserve saved expansion
  preferences for legacy or future expandable rows.
- Exclude the located Game History card from Game Review path fallback because
  redesigned history rows themselves use `/analysis/game/...` destinations.
- Keep the new private complete-page capture ignored. Publish only a minimal
  sanitized regression fixture containing no account-specific values.

## 49. Version 0.15.0 Product Amendments

- Add `Native play panel` to Homepage settings. It shows or hides the complete
  redesigned `#home-header` play/recommendations hero while retaining the
  existing hidden-by-default focused layout.
- Catalog every right-column card observed in the all-enabled 2026-07-28
  homepage capture: Stats, ChessTV, Daily Games, Streaks, Legend League,
  Daily Puzzle, and Friends.
- Give every normal right-column card independent Show/Hide and fixed-order
  controls in both the desktop popup and Android userscript settings.
- Keep Daily Games tri-state (`Main`, `Right`, `Hidden`) and place that selector
  inside the same ordered right-column list.
- Preserve unknown future native cards visibly after all managed cards.
- Treat Chess.com's shared Streaks/League `.badges-component` safely: move each
  native subtree into a reversible extension-owned card host, never clone it,
  and restore the exact original wrapper/divider order during cleanup.
- Migrate the retired `showChessTv` and `showLegendLeague` booleans into the new
  sidebar visibility array when a saved object has not yet adopted the new
  model.
- Keep private captures ignored. Add only synthetic Daily Puzzle, Streaks,
  Friends, League, and unknown-card structures to the public regression fixture.

## 50. Version 0.15.1 Product Amendments

- Replace the Daily Games `Main` / `Right` / `Hidden` dropdown presentation
  with the same Show/Hide checkbox used by every other managed card.
- Keep a compact `Main` / `Right` selector beside Daily Games. Disable it while
  the card is unticked, retain its selected location, and restore the card there
  when it is ticked again.
- Apply the same interaction and persistence behavior in both the desktop popup
  and Android userscript settings.
- Preserve the existing internal `hidden` placement and document pre-hide
  behavior so this settings-only refinement does not weaken startup stability.

## 51. Version 0.15.2 Product Amendments

- Support the current redesigned Stats rows whose native expand/retract control
  is a direct `.cc-aside-item-component` anchor with a chevron, alongside the
  legacy direct button and the earlier redesigned link-only variant.
- Apply every visible rating's saved initial Expanded/Retracted preference
  through Chess.com's native control once per row instance. Preserve all later
  manual expansion and retraction.
- Recognize both native chevron direction and expanded content following the
  row control. Do not clone or synthesize the graph, breakdown rows, or
  expansion interaction.
- Treat Insights as optional homepage content. The current redesigned homepage
  does not include it; VINF creates no replacement. If a legacy cohort supplies
  a native Insights row, preserve it visibly at the bottom as before.

## 52. Version 0.15.3 Product Amendments

- Rename the VINF right-column setting from `ChessTV & events` to `ChessTV`.
- Treat separate event banners as independent native homepage content. The
  ChessTV label describes only the ChessTV card even if Chess.com's own settings
  happen to group both features under one toggle.

## 53. Version 0.15.4 Product Amendments

- Make the Quick Play preset editor mirror the selected homepage button grid
  instead of always rendering two fields per row.
- Render counts 1–4 as one row with one through four columns. Render six as two
  rows of three and eight as two rows of four.
- Preserve the established column-first order for six and eight so shortcut
  numbers occupy the same positions in settings and on the homepage.
- Apply the same adaptive editor layout to the desktop popup and Android
  settings dialog; retain a single-column fallback on narrow phones.
