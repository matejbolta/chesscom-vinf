# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

History before this baseline may not have exact local source snapshots.

## [Unreleased]

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
