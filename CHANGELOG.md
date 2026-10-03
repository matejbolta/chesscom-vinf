# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

History before this baseline may not have exact local source snapshots.

## [Unreleased]

## [2.16.2] - 2026-10-03

- Make the phone board-settings gear select the native Board tab, distinct from the engine gear; keep the engine-status symbol out of gear slots.
- Add 12px spacing after engine variations.

## [2.16.1] - 2026-10-03

- Center phone Analysis Back under the board; place board settings alongside engine settings and the Analysis toggle in a compact strip, with depth/engine details below.

## [2.16.0] - 2026-10-03

- Tighten phone engine Analysis: add top breathing room, place Back/Settings under the D/E files, and hide the redundant Analysis/Games/Explore tab row.
- Show engine variations before the depth/settings strip; preserve native engine actions and board geometry.

## [2.15.0] - 2026-10-03

- Add a first phone presentation for saved-game engine Analysis routes: OLED surfaces, hidden site navigation/player identities, retained captured material, and compact stationary clocks.
- Keep native engine lines, settings, tabs, evaluations and move interactions; present the four native navigation controls in a safe-area-aware bottom dock.
- Keep standalone Analysis, tablet, desktop and Game Review behavior separate.

## [2.14.1] - 2026-10-03

- Center phone Review actions on the actual chessboard bounds, excluding the evaluation-bar gutter; update alignment on resize without changing board or clock geometry.

## [2.14.0] - 2026-10-03

- Center phone Review's rounded New Game plus above the board and Analysis magnifier below it.
- Apply the phone Review presentation before entering moves as well, including hidden navigation and OLED coach surfaces.
- Allow coach-text descenders to paint without changing the settled layout; improve classification label contrast.
- Apply OLED surfaces to phone draw/resign confirmation containers while preserving native confirmation actions.

## [2.13.2] - 2026-10-03

- Generate popup and side-panel version badges from the package version; reject mismatched manifest versions during the desktop build.

## [2.13.1] - 2026-10-03

- Remove doubled padding from the desktop Pokémon settings heading to align it with the other card titles.

## [2.13.0] - 2026-10-03

- Fix phone captured-material clipping and unnecessary wrapping by restoring native inline sprite flow; keep the advantage score with the final piece group.
- Keep the four-slot phone Review dock throughout Best move's intermediate Hint and Resume states.
- Anchor phone Review clocks to the same fixed right-hand slot as gameplay, independent of native clock-icon changes.
- Add native New Game (+) and Analysis (magnifier) actions above the phone Review board in the draw/resign positions; preserve the native time control and handlers.

## [2.12.0] - 2026-10-03

- Add opt-in Pokémon mode, mutually exclusive with Extreme OLED across settings and the desktop E shortcut; ordinary OLED remains compatible.
- Replace the live turn dot with a Poké Ball that opens to reveal the completed move. Reuse indicator size, pulse and duration settings; honor reduced motion and animate only on confirmed turn changes.
- Offer all 151 Generation I Pokémon for each of the six chess roles, with local previews and a reset team action in desktop and Android settings. Pieces can be switched off independently for a ball-only mode.
- Skin native game and Review pieces with bundled offline sprites, dimmer dark-team artwork and contrasting chess-role badges. Preserve native geometry, movement, promotion classes and annotations; captured-material symbols stay native.

## [2.11.1] - 2026-10-03

- Keep the phone four-slot Review dock when Best move becomes native Resume; retain its return-to-played-line action in the rightmost slot.
- Stabilize the phone coach at a compact 88px with local overflow, disable Review scroll anchoring, and reveal the graph once after native entry settles instead of repeatedly correcting scroll.
- Remove the automatic Start Review re-click; preserve the native single-click checkpoint animation without replaying or guessing readiness.
- Balance phone game entry around the top control row, trim sidebar spacing below the bottom row, and keep material scores with the final captured-piece group when wrapping.

## [2.11.0] - 2026-10-02

- Match the phone Review dock to the four-slot playing dock: optional Hint, Previous, Start/Next, and optional Best move. Keep the two larger middle controls fixed when optional actions disappear.
- Use the native Start Review action in the next-arrow slot until Review starts, then show native single-move Next. Retain first-entry graph positioning, native handlers, disabled states and safe-area clearance.

## [2.10.2] - 2026-10-02

- Fix turn/last-move alignment at the exact board midpoint. Give last moves the clock's font size and own-side clock color, independent of dot settings.
- Remove reserved navigation padding from active phone games and focused Review. Keep game entry alignment briefly active for late hydration/restoration, with a strict limit and immediate cancellation on user input.
- Replace the oversized phone coach shell with compact content height; reveal the graph without waiting for speech or cancelling on a second control tap.
- Honour a stalled first Start Review intent with one guarded native Start retry after changed commentary settles; never replay Next or retry after the board has advanced.

## [2.10.1] - 2026-10-02

- Give phone game entry a consistent settled position after pairing, reload or returning to an open game; yield to user input.
- Reserve a separate phone row slot for turn dots/last moves, align actions and clocks, and wrap long captured material without covering controls. Slightly brighten only dark captured pieces.
- Halve the paused-clock endcap height.
- Stabilize phone Review coach/player heights, remove opening/course promotions and restore recorded-clock contrast. Wait for coach content before the first graph reveal; keep longer commentary locally scrollable.

## [2.10.0] - 2026-10-02

- Simplify move-by-move Game Review on phone, tablet and desktop: remove player identities, coach portraits and decorative headings while retaining commentary, classification/evaluation, captured material, recorded clocks, graph and native controls.
- Add a separate Extreme OLED review presentation with dark board/pieces and readable coach/evaluation information; live-game controls and countdowns remain excluded.
- Extend desktop E to Review and update desktop/Android setting labels. Mute the native coach on wider layouts before hiding the audio button.
- Keep the initial report and homepage unchanged; disabling VINF restores native review presentation.

## [2.9.3] - 2026-10-02

- Align wide Extreme OLED Draw/Resign and time on one board-relative row; retain native buttons and confirmations.
- Keep clock bars flush against both board edges, mark the paused bar with an end cap, and preserve per-player bar references across same-tab reloads.
- Restore recognizable native highlight colors and visible legal-move dots/capture rings in Extreme OLED.
- Follow every new phone move at the top of the reversed list, including black moves within an existing row, while yielding to manual browsing.

## [2.9.2] - 2026-10-02

- Added original native Draw/Resign controls above the board in desktop/tablet Extreme OLED, with compact icons and native confirmation behavior.
- Desktop Extreme clock text now has equal 12px board/right-edge insets.

## [2.9.1] - 2026-10-02

- Added Pulse size (×) beside turn indicator size and duration on desktop/Android. Defaults to 2×, configurable from 1× to 12×, with a 48px rendered diameter cap.

## [2.9.0] - 2026-10-02

- Show the latest native move on the inactive player's side, opposite the turn dot, in normal/OLED/Extreme gameplay on desktop, tablet and phone.
- Match notation color to the active dot, including low-time/long-turn red; preserve native captures, checks, promotions and figurine notation.

## [2.8.7] - 2026-10-02

- Desktop Extreme OLED omits previous/next arrow buttons and places clocks at the normal player-row positions on the right. Phone/tablet presentation is unchanged.

## [2.8.6] - 2026-10-01

- Combined OLED background and play-button colors into one OLED mode toggle on desktop and Android; O toggles both.
- Added Animation duration (ms) below turn indicator size, default 1000, range 0–5000; zero disables the pulse.

## [2.8.5] - 2026-10-01

- Fixed desktop Review B to activate the native Best move control beneath the coach.

## [2.8.4] - 2026-10-01

- Aligned the Desktop shortcuts heading with other settings titles by removing double padding.

## [2.8.3] - 2026-10-01

- Set desktop O/E/X/Z/F/B shortcut descriptions to the requested concise wording.

## [2.8.2] - 2026-10-01

- Removed the Alt promotion-shortcut explanation from desktop settings.

## [2.8.1] - 2026-10-01

- Extreme OLED on phones now shares normal gameplay's material/action rows:
  captured pieces left; Draw, Resign and clock above; pencil and clock below.
- Removed clock hiding on every layout and deleted desktop T handling/help.
  Numeric clocks are read-only, always-visible displays with no click targets.
- Kept Extreme's dark board and scroll space; placed move navigation beneath
  the lower row and preserved native confirmation visibility.


## [2.8.0] - 2026-10-01

- Desktop B activates the visible native Best move control in Game Review.
- Normal desktop/tablet clocks stay visible without a border or hide interaction;
  Extreme OLED retains paired clock toggling.
- Touch annotations now commit on release without drag previews. The pencil is
  filled and uses the low-time red when selected.
- Added a 4–24px turn-dot setting (12px default), a one-second turn-change pulse,
  and red warnings for low time or a move observed for at least 60 seconds.
- Distributed phone controls across the right half of each material row, aligned
  the clocks and material score, and restored native captured-piece colors.
- Phone Review scrolls just enough to reveal the graph after the first green
  primary action; later moves do not reposition the page.


## [2.7.2] - 2026-09-28

- Removed repeated overlay layout measurements during native piece dragging.
  Gameplay observers distinguish board paint and clock text from structural changes.
- Clock ticks reuse overlay geometry; resize, hydration and layout changes still
  reposition it. Avoid writing unchanged clock attributes.
- Annotation previews rebuild only when entering another square. Actual piece
  squares/orientation still clear stale marks; transient drag transforms do not.
- Improve captured-material contrast on normal phone OLED backgrounds.

## [2.7.1] - 2026-09-28

- Normal Android phone rows permanently hide player identity, preserving native
  captured pieces and material scores. Removed the avatar hide/restore toggle.
- Above board: material, native draw and Abort/Resign, opponent clock. Below:
  material, annotation pencil, own clock.
- Normal phone clocks stay visible and cannot be toggled. Extreme OLED and
  desktop clock toggles, tablet presentation and Game Review are unchanged.

## [2.7.0] - 2026-09-28

### Changed

- Normal-game numeric clocks start visible; paired tap/T toggling and the
  low-time visibility latch remain. Extreme OLED retains its hidden default.
- Normal phone play aligns avatars and names, enlarges the turn dot by 50%,
  and places native draw/Abort/Resign icons beside the pencil and clock in the
  player row. Native action labels/state and confirmation handlers remain intact.
- Tap either avatar area to independently hide/restore that player's identity
  information without shifting the board, clock or actions.
- Correct clipped inherited matchmaking scroll once after game entry; any
  touch, pointer, wheel or keyboard input cancels the correction.
- Investigated delayed mobile audio: no audio interception was added. Browser
  autoplay/user-activation is a supported hypothesis, pending device verification.

## [2.6.4] - 2026-09-28

### Changed

- Android phone/tablet drawing now uses Chess.com's native annotation factories
  and renderer, including native arrow shapes and colors. VINF retains only the
  input shield and pencil toggle; no simulated mouse events or piece actions.
- Native previews and owned marks clean up on cancel, toggle-off, position/board
  changes, disable, game end and Review. Unrelated native marks remain intact.
- Added userscript page access (`unsafeWindow`) for the native annotation API.
  If the API is unavailable or fails, drawing disables without blocking the board.


## [2.6.3] - 2026-09-28

### Changed

- Compacted desktop shortcut help to O/E/T and X/Z/F/B/Alt. Escape is an inline
  note; removed arrow-key rows, extra explanations, separate Easter egg heading,
  and source links from the UI. Retained the requested color-modifier sentence.

## [2.6.2] - 2026-09-28

### Changed

- Clarified the desktop and Android setting label as “Extreme OLED mode (in-game)”.
- Added desktop settings help for VINF shortcuts, native Chess.com navigation,
  mouse annotations, promotion override, and F/B Easter eggs. No key handlers changed.

## [2.6.1] - 2026-09-28

### Fixed

- Phone player rows now resize the actual nested native avatar and current
  username/rating components together. Connection bars and flag sprites remain
  legible; the pencil occupies a layout slot instead of overlapping player text.
- Clock bars and drawing overlays attach to the site's positioned board container
  and scroll with it, without resizing the board or relying on delayed viewport
  coordinate updates. Unknown unpositioned containers retain the prior fallback.
- Game/late-control hydration runs the controllers in a consistent order and
  observes the whole gameplay/bootstrap document instead of waiting for polling.

### Changed

- Normal phone headroom is now 48–80px, with a compact 44px Draw/Resign row and
  44px inner tabs. The pencil retains its 44px target with a smaller visible ring.
  Extreme OLED spacing, native scroll decisions and board dimensions are retained.
- Sanitized phone fixture now models native nested avatars, current player text,
  connection bars, player insets and the pinned move dock seen in user recordings.


## [2.6.0] - 2026-09-26

### Added

- Android phone/tablet touch drawing: drag arrows, tap red squares, repeat to
  remove. A clock-adjacent pencil switches between drawing and native board input.
  Normal/OLED keeps the switch visible; Extreme OLED hides its inactive appearance
  while its fixed tap area remains available beside the bottom clock.
- Local SVG annotations consume their own gestures without synthetic board events
  or engine calls. Switching off, changing position/orientation or leaving the game
  clears drawings; Review and desktop remain unchanged.

### Changed

- Normal Android phone games move the original Draw/Resign components above
  Moves/Chat/Info. Native handlers and confirmations stay attached; disabling VINF
  restores original positions. Tablet, Extreme OLED and board headroom stay unchanged.

### Verification limits

- Automated and sanitized browser-fixture checks only; actual Firefox Android and
  current live native action markup remain unverified. No real game was altered.


## [2.5.0] - 2026-09-26

### Added

- Shared native-derived clock bars, turn dots and paired numeric-clock toggling
  in normal Android phone and desktop games. Below-one-minute visibility stays
  forced. Extreme OLED retains its own colors, layout and move controls.
- Desktop O/E shortcuts save the existing ordinary/Extreme OLED settings; T
  toggles shared clock numbers. Typing, settings controls and modified/repeated
  shortcuts are excluded; Extreme OLED stays off throughout Game Review.

### Changed

- Phone gameplay: compact player information, black/newer timestamp above
  white/older timestamp without changing attribution, opening below the move list.
- Android phone/tablet game navigation keeps First/Last widths, removes Play/Pause,
  and divides its freed space between Previous/Next. Desktop stays native.
- Phone Review dock reserves stable Hint/Best slots and expands Previous/Next
  across equal right-side slots; hides Share only within this dock. Central
  action, height, safe area, heading centering and evaluation bar are retained.

### Pending

- Touch annotations and Draw/Resign relocation require native integration evidence;
  the user deferred live inspection and authorized independent work first.
- Initial board-spacing adjustment awaits the user's screenshots. Existing
  gameplay headroom and accepted pre-review spacing are unchanged.
- No Android Back experiment, publication or Store preparation in this batch.

## [2.4.1] - 2026-09-23

### Fixed

- Restore phone Game Review header centering in overview and move review by
  retaining the invisible, noninteractive muted coach button's native layout slot.
- Keep the native evaluation-bar fill above OLED's opaque background using a
  local stacking context. Preserve its colors, score, animation and geometry.
- Keep overview spacing and the enlarged bottom dock unchanged. No gameplay change.

## [2.4.0] - 2026-09-23

### Added

- Phone normal/OLED gameplay: hide the top toolbar and outer game tabs, add
  responsive scrollable headroom, and compact native clocks. Native board size,
  coordinates, input, move navigation, and game actions are untouched.
- Show complete native move rows newest-first visually, preserving chronological
  DOM nodes, white/black ordering and handlers. Unknown list shapes stay native.
- Phone Game Review: mute through the native coach control before hiding it;
  enlarge the bottom dock to 80px plus the safe area, with centered 44–56px by
  64px button targets and content clearance. Preserve all native actions.
- Keep normal gameplay changes separate from Extreme OLED and all Review states.
  Restore presentation on disable, route departure and widths at/above 600px.

- Type checking, 170 tests, and desktop/Android builds pass.

### Limitations

- No Android back-gesture interception: browser traversal/unload APIs cannot
  reliably substitute Chess.com's confirmation without fragile history tricks.
  Native resign controls remain available; VINF never resigns automatically.
- Sanitized fixture/browser checks are not physical Firefox Android verification.
  Unknown coach states stay visible; the requested native mute preference remains
  off after disabling VINF. No network/audio-engine hooks or Store work added.

## [2.3.3] - 2026-09-20

### Fixed

- Keep Extreme OLED off throughout Game Review, including when entering moves.
  Ordinary OLED background and the phone review-graph enhancement are unchanged.
- Replace font arrows with centered SVG chevrons; explicitly center all control
  contents. Hide pill borders/backgrounds with hidden clock numbers while keeping
  their invisible tap targets available. Low-time reveal still locks both on.
- Restore uniform gray white pieces without dark outlines.
- Typecheck, 166 tests and both builds pass. Visual/browser QA remains blocked
  by the locked Mac; no new screenshot or phone appearance verification claimed.

## [2.3.2] - 2026-09-20

### Changed

- Move OLED controls to the bottom of desktop and Android settings, using only
  OLED background, OLED play buttons, and Extreme OLED mode labels.
- Remove the clock-bars preference. Extreme OLED always shows available native
  time bars; old saved bars-off values are discarded during normalization.
- Add 128–152 CSS pixels of mobile headroom above the native board/player rows
  without resizing or transforming the board. Keep the area scrollable.
- Outline move arrows with thin circles and inset both clock areas in pills,
  using a softer system font. Add dark outlines to the uniform gray white pieces.
- Keep paired-clock reveal, low-time locking and native game-end restoration.
  Typecheck/tests/builds pass; browser QA remains blocked by the locked Mac.

## [2.3.1] - 2026-09-20

### Fixed

- Remove Extreme OLED's forced board sizing/positioning implicated in clipped
  pieces and unreliable input. Preserve native-hidden board layers and add
  vertical scroll room for mobile browser toolbar collapse.
- Restore native game-end/result controls when Chess.com reports a result;
  keep the initial Game Review report visible.
- Flatten white pieces to a uniform dim gray and add a tiny native-turn dot.
- Tapping either left clock area reveals/hides both numeric clocks. Once either
  timer is below a minute, both stay visible, including with bars off. Show
  whole seconds below one minute and minutes:seconds above; low-time color now
  begins below 60 seconds. Never simulate time or infer game over from zero.
- Tests and both local builds pass. New browser QA was blocked by the locked
  Mac; actual Firefox Android scrolling, piece input and results need rechecking.

## [2.3.0] - 2026-09-20

### Added

- Optional Extreme OLED Edition for supported games and game reviews: black
  surroundings, a very dark board, outlined black pieces, dim white pieces,
  and previous/next move arrows. The homepage is unchanged.
- Independent clock-bars switch: thin native-time bars above/below the board,
  muted red in low time. No separate timer or additional network requests.
- Desktop/Android settings and Escape-to-reveal on desktop. Local builds only;
  live board input and Android device verification remain outstanding.

## [2.2.2] - 2026-09-19

### Fixed

- Accept Chess.com's observed `rcn` live-game presence and use its native
  `/game/<numericId>` route. Version 2.2.1 incorrectly accepted only
  `live_chess`, so current cross-device games fell back to Game History.
- Refresh presence on ordinary shortcut activation so games started after the
  homepage loaded are discoverable. Deduplicate concurrent requests, time out
  after four seconds, and cancel pending navigation on disable/hide/departure.
- Retain the newest-finished-game fallback and existing card/OLED presentation.
  Desktop continuation was verified against a real mobile game by the user;
  Android uses the same corrected runtime and still needs device verification.

## [2.2.1] - 2026-09-19

### Fixed

- Load VINF on Chess.com's native `/play/online/new` matchmaking bootstrap so
  OLED mode remains available when that document becomes a live game through
  client-side navigation.
- Prefer an exact active-game link outside Game History for `Jump to open game`,
  while retaining the newest finished Game History link as the fallback.
- Add a signed-in, same-origin presence lookup before the finished Game History
  fallback. Its `live_chess`-only assumption did not handle the current RCN
  service; the real cross-device failure is corrected in 2.2.2.
- Apply OLED black to the separate live-game move-navigation tray and use
  near-black, low-glare surfaces for its secondary controls.

## [2.2.0] - 2026-09-18

### Added

- Add an independent saved `OLED button colors` switch for Quick Play and the
  Open Game shortcut on desktop and Android.
- Use near-black control surfaces, `#ededed` text, restrained time-class accent
  borders, and low-glare hover/pressed states without changing control geometry.

## [2.1.3] - 2026-09-18

### Fixed

- Make the entire centered `Jump to open game` card the link target.
- Cover Chess.com's alternate `/live/game/<id>` game route and Game Review
  routes without the `/live/` segment when applying OLED mode.
- Use OLED-black surfaces for the native post-game result dialog while
  retaining its semantic result colors and primary action.

## [2.1.2] - 2026-09-18

### Changed

- Replace active-state inference and the dismissible overlay with an ordinary
  configurable `Jump to open game` card. It defaults to the bottom of Right on
  desktop and the bottom of the single responsive column, using the first exact
  native game link and therefore falling back to the latest Game History row.
- Show the source version in the Android settings header.

### Fixed

- Inject OLED styling on Chess.com's current `/game/<numeric-id>` live-game
  route while retaining legacy `/game/live/<numeric-id>` compatibility.
- Follow the current semantic move-by-move hierarchy after Chess.com removed
  its `move-by-move-redesign` class, restoring the phone-only graph placement.

## [2.1.1] - 2026-09-18

### Fixed

- Exclude completed `/game/live/<id>` links inside Game History from active-game
  detection.
- Replace the in-flow continuation card with a dismissible, full-width floating
  `Jump to open game` action styled like Quick Play.
- Extend OLED black to Chess.com's mobile toolbar, retractable navigation,
  player rows, analysis/sidebar surfaces, and fixed Game Review controls.

## [2.1.0] - 2026-09-18

### Added

- Add a saved OLED-black appearance for the homepage, live games, and Game
  Review across desktop and responsive layouts.
- Show a responsive homepage continuation card when Chess.com's rendered page
  exposes an exact native link to an unfinished live game.

## [2.0.0] - 2026-09-10

### Added

- Keep Chess.com's native evaluation graph directly below the board during
  move-by-move Game Review at phone widths, without changing the initial report,
  tablet, or desktop layouts.
- Support the same reversible layout improvement in the Chromium extension and
  Android userscript while preserving the existing zero-collection boundary.
- Apply Stats rating visibility and saved order to Chess.com's native mobile
  card grid as well as its desktop row layouts.

## [1.0.8] - 2026-08-21

### Added

- Record the current homepage-focused ChessComVINF generation as the standardized changelog baseline.
- Preserve detailed earlier version evidence in `docs/HANDOFF.md` and the existing Git history.
