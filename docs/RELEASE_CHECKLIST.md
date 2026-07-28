# Release Checklist

## Automated release gate

- [x] TypeScript strict typecheck passes.
- [x] Unit and DOM integration tests pass.
- [x] Production build succeeds.
- [x] Packaged manifest contains only the local `storage` and `sidePanel`
  permissions.
- [x] Package contains no raw fixture, screenshot, source map, or account data.
- [x] Chrome Web Store copy contains no Markdown blockquote prefixes, reflects
  every current homepage control, and keeps the zero-collection disclosures.
- [x] Public-safe store screenshots use only synthetic identities and reflect
  the current 0.15.5 homepage and settings UI.
- [x] All 17 catalog controls map to their exact native base/increment pairs.
- [x] Popup uses a desktop-first union of Bullet, Blitz, and Rapid presets.
- [x] Desktop and Android settings share one Blitz group ordered `3 min`,
  `3 + 2`, `5 min`, `5 + 2`, `5 + 3`, `5 + 5`.
- [x] The master VINF switch is a standalone top card; Homepage contains the
  native play-panel switch and the complete right-column card editor.
- [x] Quick Play counts 1, 2, 3, 4, 6, and 8 normalize, autosave, migrate legacy
  arrays, and use complete unique defaults for the selected size.
- [x] Desktop and Android preset selectors mirror the selected homepage grid:
  one row for 1–4 and column-first two-row grids for 6 and 8.
- [x] Desktop and Android settings rebuild the correct number of selectors and
  disable duplicate choices across all active selectors.
- [x] Every toggle, preset change, and preset reset saves without a submit action.
- [x] The toolbar popup remains the default action; its header button opens the
  shared settings UI in the side panel from a user gesture.
- [x] The side-panel entry point uses the same local settings code and hides its
  own open-panel action.
- [x] Chrome 141+'s in-panel `×` closes the global panel for the current window;
  rejected or missing close support retains the browser-toolbar fallback.
- [x] Missing or rejected Side Panel API support leaves the popup usable and
  does not change stored settings.
- [x] Stats summary/rating visibility and fixed order normalize and autosave.
- [x] Daily Games visibility plus `Main` / `Right` placement normalize,
  autosave, preserve the selected location while hidden, and migrate both
  retired boolean settings.
- [x] All seven known right-column cards normalize, autosave, show/hide, and
  keep a fixed order.
- [x] Legacy ChessTV/Legend booleans migrate into the new visibility model.
- [x] Per-rating initial `Expanded` or `Retracted` states normalize, autosave,
  migrate from the retired global state, and are available in both settings
  surfaces.
- [x] Stats Reset is scoped to Stats preferences; Quick Play Reset remains
  preset-only.
- [x] Native Stats rows restore their exact original order during cleanup.
- [x] Unknown future Stats rows remain visible, and any native Insights row
  remains visible last.
- [x] Expanding a native Stats row does not cause VINF to move rating rows or
  interfere with subsequent expand/retract clicks.
- [x] Every visible known rating row applies its own selected initial state once
  through its native button, and later manual expansion/retraction is preserved.
- [x] A late or pre-hydration native Daily Games insertion is pre-hidden and
  recognized by its semantic link, current-games header, or earlier loading
  view-toggle shell.
- [x] Hidden Daily Games and known sidebar cards are pre-armed at document start
  and remain reversible during cleanup.
- [x] Enabled `/home` uses a namespaced document marker to pre-hide exact native
  promo/header replacements before delayed mutation reconciliation.
- [x] Quick Play anchors before the first native main card while Game History
  is still an unrecognized loading skeleton.
- [x] Previously stored 15-minute presets migrate safely to 20 minutes.
- [x] Missing native launch template disables every shortcut.
- [x] Repeated and mutation-triggered reconciliation stays idempotent.
- [x] A present or dynamically replaced `#main-banner` is hidden reversibly.
- [x] A present or dynamically replaced `#homepage-toolbar` is hidden reversibly.
- [x] The redesigned `#home-header`, `#home-main`, and `#home-sidebar` shell is
  recognized without weakening the signed-in route guard.
- [x] Redesigned Game History analysis links cannot be mistaken for Game Review.
- [x] Legacy expandable and redesigned link-only Stats rows both preserve native
  behavior while applying configured visibility and order.
- [x] Unknown redesigned sidebar cards remain visible after all managed cards.
- [x] Redesigned Streaks and Legend League remain independently configurable
  despite Chess.com nesting them in one native wrapper.
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
- [x] The redesigned `#home-header` hero is hidden by default and returns intact
  when Native play panel is enabled.
- [x] Separate `.promo-toolbar-user-info` variants are absent when enabled.
- [x] Stats and Quick Play begin at the same vertical position.
- [x] Redesigned Quick Play and Game History remain `728px` wide, with one
  `2.4rem` gap; the redesigned sidebar remains `300px` wide and aligned at the
  same top position.
- [x] Game History leads the main column after Daily Games moves to the sidebar.
- [x] Every captured right-column card follows its saved fixed order.
- [x] Default Stats content is Games, retracted Rapid, and retracted Blitz; an
  optional legacy Insights row remains last when Chess.com supplies it.
- [x] Daily Games renders cleanly at sidebar width in its saved managed
  position.
- [x] Main-column placement restores Daily Games to the left column; Hidden
  removes it visually without deleting the native node.
- [x] Stats, ChessTV, Streaks, Legend League, Daily Puzzle, and Friends
  can each be hidden without disturbing the remaining sidebar order.
- [x] Online ChessTV streamer-title variants remain in their saved managed
  position.
- [x] Every adjacent managed sidebar card retains the standard card gap.
- [x] Bullet, Rapid, and Blitz presets use distinct Chess.com category colors.
- [x] Eight-button mode retains the six-button gap and Game History width while
  fitting two rows of four equal buttons.
- [x] One through four buttons use one desktop row, equal gaps, and the complete
  Game History width.
- [x] Blitz uses a chroma-preserving OKLCH palette derived from the sampled
  native `#ead762` bolt color rather than ochre HSL or milky alpha blending.
- [x] Starting or failing a launch never inserts a visible status row.
- [x] Settings popup is usable at extension-popup dimensions.
- [x] Shared settings UI is usable at Chromium side-panel dimensions.
- [x] The in-panel `×` is visible beside the version badge without crowding the
  settings title at side-panel width.
- [x] Homepage's seven-card visibility/order editor is readable and scrollable
  at extension-popup dimensions.
- [x] Stats visibility/order controls remain readable and scrollable at popup
  dimensions.
- [x] Per-rating `Expanded` / `Retracted` selectors are readable at popup
  dimensions, align between their row labels and order arrows, and disable when
  the corresponding row is unticked.
- [x] Selected presets are unavailable in every other active shortcut menu.
- [x] Narrow desktop width: shortcut grid collapses to two columns.
- [x] Stacked width: Quick Play remains usable above the main modules.
- [x] Responsive single-column fixture orders Quick Play, Game History, and all
  present managed cards without duplication.

## Live browser gate

Complete these before publishing a release beyond private use:

- [ ] Load `dist/` unpacked in current Chrome.
- [ ] Load `dist/` unpacked in current Brave.
- [ ] Verify one live match for each active clock in every supported grid size.
- [ ] Verify each resulting game clock exactly matches its shortcut label.
- [ ] Verify refresh, homepage departure/return, and narrow-window behavior.
- [ ] Reload repeatedly and confirm a late Daily Games row never shifts Quick
  Play during startup.
- [ ] Reload repeatedly and confirm the native Play/Puzzles/Lesson/Review promo
  row never flashes above Quick Play.
- [ ] Verify a served top campaign banner stays hidden and returns when VINF is disabled.
- [ ] Verify `#homepage-toolbar` stays hidden and returns when VINF is disabled.
- [ ] On the redesigned homepage, verify `#home-header` follows Native play
  panel and still returns during full VINF cleanup.
- [ ] Verify `.promo-toolbar-user-info` variants stay hidden and restore on disable.
- [ ] Verify history, Stats, and navigation links remain usable.
- [ ] If Chess.com serves expandable Stats rows, expand and retract Rapid and
  Blitz repeatedly with VINF enabled. On the redesigned link-only card, verify
  both links remain usable instead.
- [ ] Select different startup states for multiple enabled rating rows, reload,
  and confirm each persists while later manual row actions remain respected.
- [ ] Verify Stats visibility/order persists across popup close, refresh, and
  browser restart; any native Insights row must remain last.
- [ ] Verify Daily Games visibility and Main/Right placement plus every known
  sidebar card's visibility/order persist after Brave restarts.
- [ ] Open settings from the popup into Chrome's side panel; verify it remains
  open across homepage tab changes, autosaved changes apply, and the internal
  `×` closes the panel.
- [ ] Repeat the side-panel check in current Brave. If Brave does not expose the
  open/close method, verify the remaining native browser control and popup
  fallback remain usable.
- [ ] Install the userscript in Firefox/Violentmonkey on the Android tablet.
- [ ] Verify portrait and landscape layout on the signed-in tablet homepage.
- [ ] Verify all grid sizes, their real clocks, and Android settings persistence.
- [ ] Verify disable/enable and responsive rerender restoration on the tablet.

The live clock checks intentionally require a human-controlled signed-in session
because starting matchmaking creates a real external side effect.
