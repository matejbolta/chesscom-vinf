# Release Checklist

## Automated release gate

- [x] TypeScript strict typecheck passes.
- [x] Unit and DOM integration tests pass.
- [x] Production build succeeds.
- [x] Packaged manifest contains only the local `storage` permission.
- [x] Package contains no raw fixture, screenshot, source map, or account data.
- [x] All 17 catalog controls map to their exact native base/increment pairs.
- [x] Popup uses a desktop-first union of Bullet, Blitz, and Rapid presets.
- [x] Desktop and Android settings share one Blitz group ordered `3 min`,
  `3 + 2`, `5 min`, `5 + 2`, `5 + 3`, `5 + 5`.
- [x] The master VINF switch is a standalone top card; Homepage contains only
  Daily Games, ChessTV, and Legend League presentation controls.
- [x] Six/eight Quick Play mode normalizes, autosaves, migrates legacy arrays,
  and uses complete unique defaults for the selected size.
- [x] Desktop and Android settings rebuild the correct number of selectors and
  disable duplicate choices across all active selectors.
- [x] Every toggle, preset change, and preset reset saves without a submit action.
- [x] Stats summary/rating visibility and fixed order normalize and autosave.
- [x] Daily Games `Main column` / `Right column` / `Hidden` placement
  normalizes, autosaves, and migrates both retired boolean settings.
- [x] ChessTV and Legend League visibility normalize and autosave independently.
- [x] Per-rating initial `Expanded` or `Retracted` states normalize, autosave,
  migrate from the retired global state, and are available in both settings
  surfaces.
- [x] Stats Reset is scoped to Stats preferences; Quick Play Reset remains
  preset-only.
- [x] Native Stats rows restore their exact original order during cleanup.
- [x] Unknown future Stats rows remain visible, and Insights remains visible last.
- [x] Expanding a native Stats row does not cause VINF to move rating rows or
  interfere with subsequent expand/retract clicks.
- [x] Every visible known rating row applies its own selected initial state once
  through its native button, and later manual expansion/retraction is preserved.
- [x] A late or pre-hydration native Daily Games insertion is pre-hidden and
  recognized by its semantic link, current-games header, or earlier loading
  view-toggle shell.
- [x] Hidden Daily Games, ChessTV, and Legend League are pre-armed at document
  start and remain reversible during cleanup.
- [x] Enabled `/home` uses a namespaced document marker to pre-hide exact native
  promo/header replacements before delayed mutation reconciliation.
- [x] Quick Play anchors before the first native main card while Game History
  is still an unrecognized loading skeleton.
- [x] Previously stored 15-minute presets migrate safely to 20 minutes.
- [x] Missing native launch template disables every shortcut.
- [x] Repeated and mutation-triggered reconciliation stays idempotent.
- [x] A present or dynamically replaced `#main-banner` is hidden reversibly.
- [x] A present or dynamically replaced `#homepage-toolbar` is hidden reversibly.
- [x] Every present or replaced `.promo-toolbar-user-info` is hidden reversibly.
- [x] Leaving `/home` removes extension-owned UI and restores native order.
- [x] Responsive semantic fixture works without desktop column IDs.
- [x] Responsive mutations reconcile through the `main` observer fallback.
- [x] Document-start observation waits for stored settings and handles homepage
  landmarks that arrive after startup.
- [x] Android userscript bundles only local code, CSS, and four local GM grants.
- [x] Android build remains separate from the Chrome/Brave `dist/` package.

## Visual fixture gate

- [x] Reference desktop width: Quick Play exactly matches Game History width.
- [x] Game Review and the Quick Play heading block are absent.
- [x] The emptied native promo row is hidden.
- [x] The native promo row remains pre-hidden when Chess.com replaces it after
  Quick Play has already rendered.
- [x] The recurring top campaign banner is absent when VINF is enabled.
- [x] The exact homepage avatar/username toolbar is absent when VINF is enabled.
- [x] Separate `.promo-toolbar-user-info` variants are absent when enabled.
- [x] Stats and Quick Play begin at the same vertical position.
- [x] Game History leads the main column after Daily Games moves to the sidebar.
- [x] Stats precedes ChessTV and Legend League.
- [x] Default Stats content is Games, retracted Rapid, retracted Blitz, then
  Insights.
- [x] Daily Games fits between ChessTV and Legend League at sidebar width.
- [x] Main-column placement restores Daily Games to the left column; Hidden
  removes it visually without deleting the native node.
- [x] ChessTV and Legend League can each be hidden without disturbing the
  remaining sidebar order.
- [x] Online ChessTV streamer-title variant remains between Stats and Legend League.
- [x] ChessTV and Legend League retain the standard card gap.
- [x] Bullet, Rapid, and Blitz presets use distinct Chess.com category colors.
- [x] Eight-button mode retains the six-button gap and Game History width while
  fitting two rows of four equal buttons.
- [x] Blitz uses a chroma-preserving OKLCH palette derived from the sampled
  native `#ead762` bolt color rather than ochre HSL or milky alpha blending.
- [x] Starting or failing a launch never inserts a visible status row.
- [x] Settings popup is usable at extension-popup dimensions.
- [x] Stats visibility/order controls remain readable and scrollable at popup
  dimensions.
- [x] Per-rating `Expanded` / `Retracted` selectors are readable at popup
  dimensions, align between their row labels and order arrows, and disable when
  the corresponding row is unticked.
- [x] Selected presets are unavailable in every other active shortcut menu.
- [x] Narrow desktop width: shortcut grid collapses to two columns.
- [x] Stacked width: Quick Play remains usable above the main modules.
- [x] Responsive single-column fixture orders Quick Play, Game History, Stats,
  ChessTV, Daily Games, and Legend League without duplication.

## Live browser gate

Complete these before publishing a release beyond private use:

- [ ] Load `dist/` unpacked in current Chrome.
- [ ] Load `dist/` unpacked in current Brave.
- [ ] Verify one live match for each active clock in both grid sizes.
- [ ] Verify each resulting game clock exactly matches its shortcut label.
- [ ] Verify refresh, homepage departure/return, and narrow-window behavior.
- [ ] Reload repeatedly and confirm a late Daily Games row never shifts Quick
  Play during startup.
- [ ] Reload repeatedly and confirm the native Play/Puzzles/Lesson/Review promo
  row never flashes above Quick Play.
- [ ] Verify a served top campaign banner stays hidden and returns when VINF is disabled.
- [ ] Verify `#homepage-toolbar` stays hidden and returns when VINF is disabled.
- [ ] Verify `.promo-toolbar-user-info` variants stay hidden and restore on disable.
- [ ] Verify history, Stats, and navigation links remain usable.
- [ ] Expand and retract Rapid and Blitz repeatedly with VINF enabled.
- [ ] Select different startup states for multiple enabled rating rows, reload,
  and confirm each persists while later manual row actions remain respected.
- [ ] Verify Stats visibility/order persists across popup close, refresh, and
  browser restart; Insights must remain last.
- [ ] Verify all three Daily Games placements plus ChessTV/Legend visibility
  persist after Brave restarts.
- [ ] Install the userscript in Firefox/Violentmonkey on the Android tablet.
- [ ] Verify portrait and landscape layout on the signed-in tablet homepage.
- [ ] Verify both grid sizes, their real clocks, and Android settings persistence.
- [ ] Verify disable/enable and responsive rerender restoration on the tablet.

The live clock checks intentionally require a human-controlled signed-in session
because starting matchmaking creates a real external side effect.
