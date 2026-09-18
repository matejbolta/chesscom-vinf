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
  the currently prepared Store version, 2.2.0.
- [x] All 17 catalog controls map to their exact native base/increment pairs.
- [x] Popup uses a desktop-first union of Bullet, Blitz, and Rapid presets.
- [x] Desktop and Android settings share one Blitz group ordered `3 min`,
  `3 + 2`, `5 min`, `5 + 2`, `5 + 3`, `5 + 5`.
- [x] The master VINF switch and Homepage Reset share the standalone top card;
  the headerless homepage-settings card contains the native play-panel switch
  and the complete managed-card editor.
- [x] Quick Play counts 0, 1, 2, 3, 4, 6, and 8 normalize, autosave, migrate
  legacy arrays, and use complete defaults for the selected size; zero
  removes the complete Quick Play module.
- [x] Desktop and Android preset selectors mirror the selected homepage grid:
  one row for 1–4 and column-first two-row grids for 6 and 8.
- [x] At 320px toolbar-popup width, that preset grid remains intact and switch
  tracks cannot shrink beside wrapped labels.
- [x] Desktop and Android settings rebuild the correct number of selectors and
  allow repeated time-control choices across all active selectors.
- [x] Changing the shortcut count preserves leading selections when shrinking
  and fills only new slots from the shared non-repeating fallback sequence when
  expanding, on both desktop and Android.
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
- [x] Recommended Match visibility plus `Main` / `Right` placement normalize,
  autosave, preserve the selected location while hidden, and retain an existing
  seven-card order during migration.
- [x] Game History visibility plus `Main` / `Right` placement normalize,
  autosave, preserve the selected location while hidden, and retain existing
  eight- and seven-card orders during migration.
- [x] All eleven known managed cards normalize, autosave, show/hide, and use one
  fixed relative order within both Main and Right placements.
- [x] Profile visibility plus `Main` / `Right` placement normalize, autosave,
  preserve the selected location while hidden, and migrate into previous saved
  card orders without changing their relative order.
- [x] Legacy ChessTV/Legend booleans migrate into the new visibility model.
- [x] Per-rating initial `Expanded` or `Retracted` states normalize, autosave,
  migrate from the retired global state, and are available in both settings
  surfaces.
- [x] Stats Reset is scoped to Stats preferences; Quick Play Reset remains
  preset-only.
- [x] Native Stats rows restore their exact original order during cleanup.
- [x] Responsive `.stats-mobile-card` ratings obey the same saved visibility
  and order, collapse to the selected native grid rows, and restore on cleanup.
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
- [x] Right-column or hidden Recommended Match is pre-armed at document start,
  discovered without dynamic text, and remains reversible during cleanup.
- [x] Right-column or hidden Game History is pre-armed at document start,
  rediscovered through its module marker after moving, and remains reversible
  during cleanup.
- [x] Enabled `/home` uses a namespaced document marker to pre-hide exact native
  promo/header replacements before delayed mutation reconciliation.
- [x] Quick Play anchors before the first native main card while Game History
  is still an unrecognized loading skeleton.
- [x] Previously stored 15-minute presets migrate safely to 20 minutes.
- [x] Missing native launch template disables every shortcut.
- [x] Repeated and mutation-triggered reconciliation stays idempotent.
- [x] A present or dynamically replaced `#main-banner` is hidden reversibly.
- [x] A present or dynamically replaced `#homepage-toolbar` is managed
  reversibly as Profile.
- [x] The redesigned `#home-header` and `#home-main` shell recognizes both the
  previous direct `#home-sidebar.layout-column-two` generation and the current
  `#home-sidebar-container.layout-column-two > #home-sidebar` generation
  without weakening the signed-in route guard.
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
- [x] Desktop and Android metadata include only the homepage, live-game, and
  exact live-game review path shapes, with no added permissions or network capability.
- [x] Phone move-by-move review moves the one native evaluation graph into the
  post-board chart slot idempotently and restores it on disable, widening, route
  departure, state change, or native rerender.
- [x] The initial review report and widths of 600 CSS pixels or more remain
  untouched.
- [x] OLED black normalizes and autosaves in both settings surfaces and adds no
  permissions, remote resources, or stored account/game data.
- [x] OLED button colors normalize and autosave independently, apply only to
  Quick Play and Open Game, and preserve their layout and full click targets.
- [x] The continuation detector accepts only exact current or legacy native
  Chess.com game paths, allows Game History as the deliberate fallback, rejects
  analysis and off-origin links, remains idempotent, and removes its card when
  native evidence disappears.

## Visual fixture gate

- [x] Reference desktop width: Quick Play exactly matches Game History width.
- [x] Game Review and the Quick Play heading block are absent.
- [x] The emptied native promo row is hidden.
- [x] The native promo row remains pre-hidden when Chess.com replaces it after
  Quick Play has already rendered.
- [x] The recurring top campaign banner is absent when VINF is enabled.
- [x] The exact homepage avatar/username toolbar and redesigned
  `#home-header .header-hero` follow Profile Hidden/Main/Right independently of
  Native play panel.
- [x] Separate `.promo-toolbar-user-info` variants are absent when enabled.
- [x] Stats and Quick Play begin at the same vertical position.
- [x] Redesigned Quick Play and Game History remain `728px` wide, with one
  `2.4rem` gap; the redesigned sidebar remains `300px` wide and aligned at the
  same top position.
- [x] Game History leads the main column after Daily Games moves to the sidebar.
- [x] Every captured right-column card follows its saved fixed order.
- [x] Profile, Daily Games, Recommended Match, and Game History follow that same saved
  relative order when two or more are placed in Main, below Quick Play.
- [x] Default Stats content is Games, retracted Rapid, and retracted Blitz; an
  optional legacy Insights row remains last when Chess.com supplies it.
- [x] Daily Games renders cleanly at sidebar width in its saved managed
  position.
- [x] Main-column placement restores Daily Games to the left column; Hidden
  removes it visually without deleting the native node.
- [x] Recommended Match defaults to Main, renders as one column at sidebar
  width when moved Right, and hides/restores without rebuilding its native tile.
- [x] Game History defaults to Main, moves intact to the sidebar with horizontal
  overflow available for its native wide content, and hides/restores cleanly.
- [x] Stats, ChessTV, Streaks, Legend League, Daily Puzzle, and Friends
  can each be hidden without disturbing the remaining sidebar order.
- [x] Online ChessTV streamer-title variants remain in their saved managed
  position.
- [x] ChessTV iframe source, permission policy, hidden state, loading, autoplay,
  and playback remain native and untouched while its card is shown.
- [x] Every adjacent managed sidebar card retains the standard card gap.
- [x] Bullet, Rapid, and Blitz presets use distinct Chess.com category colors.
- [x] Eight-button mode retains the six-button gap and Game History width while
  fitting two rows of four equal buttons.
- [x] One through four buttons use one desktop row, equal gaps, and the complete
  Game History width.
- [x] Zero buttons leaves no Quick Play panel or empty homepage placeholder.
- [x] Blitz uses a chroma-preserving OKLCH palette derived from the sampled
  native `#ead762` bolt color rather than ochre HSL or milky alpha blending.
- [x] Starting or failing a launch never inserts a visible status row.
- [x] Settings popup is usable at extension-popup dimensions.
- [x] Toolbar popup root and body establish a deterministic 390px intrinsic
  width before script initialization rather than collapsing or expanding from
  a browser-dependent initial viewport; the side panel remains fluid.
- [x] Eight-preset settings render as four columns by two rows without overflow
  in the dedicated 320px popup fixture.
- [x] Shared settings UI is usable at Chromium side-panel dimensions.
- [x] The in-panel `×` is visible beside the version badge without crowding the
  settings title at side-panel width.
- [x] Homepage's eleven-card visibility/order editor is readable and scrollable
  at extension-popup dimensions.
- [x] Stats visibility/order controls remain readable and scrollable at popup
  dimensions.
- [x] Per-rating `Expanded` / `Retracted` selectors are readable at popup
  dimensions, align between their row labels and order arrows, and disable when
  the corresponding row is unticked.
- [x] Repeated presets remain available in every active shortcut menu.
- [x] Narrow desktop width: shortcut grid collapses to two columns.
- [x] Stacked width: Quick Play remains usable above the main modules.
- [x] Responsive single-column fixture keeps Quick Play first, then applies the
  saved order within its Main and conceptual Right groups without duplication.
- [x] At 390×844, the move-review evaluation graph renders below the lower
  player/clock and above the Game Review toolbar without horizontal overflow.
- [x] At tablet and desktop fixture widths, VINF leaves the native graph parent
  and surrounding layout unchanged.
- [x] OLED fixture previews use a true-black page canvas and stable navigation,
  player, sidebar, and control surfaces at desktop and phone widths; the
  continuation card stays inside its managed column without overflow.

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
- [ ] Verify Profile in Hidden, Main, and Right for both `#homepage-toolbar` and
  redesigned `.header-hero`, then verify native position restoration on disable.
- [ ] On the redesigned homepage, verify `#home-header` follows Native play
  panel and still returns during full VINF cleanup.
- [ ] Verify empty `.promo-toolbar-user-info` variants stay hidden and restore
  on disable; if a nonempty fallback is served without either primary Profile
  landmark, verify it follows Profile settings.
- [ ] With ChessTV shown, verify its native loading/autoplay/player behavior is
  identical with VINF enabled and disabled.
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
- [ ] Verify Recommended Match in Main, Right, and Hidden; when Right, confirm
  its tile remains a readable single column and its saved order persists.
- [ ] Verify Game History in Main, Right, and Hidden; when Right, confirm its
  native rows remain usable and its saved order persists.
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
- [ ] Install the userscript in Firefox/Violentmonkey on the Android phone and
  confirm the evaluation graph moves below the board only after entering
  move-by-move Game Review.
- [ ] On the phone, confirm graph taps still select moves, leaving move review
  restores the initial report layout, and rotation/widening restores the native
  placement without duplication.
- [ ] Enable OLED black on desktop, tablet, and phone; verify the homepage, a
  live game, and Game Review use a true-black canvas without obscuring native UI.
- [ ] While a live game is unfinished, open `/home` on desktop and responsive
  layouts; confirm one continuation card appears and returns to that exact game.

The live clock checks intentionally require a human-controlled signed-in session
because starting matchmaking creates a real external side effect.
