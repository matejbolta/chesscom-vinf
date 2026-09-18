# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

History before this baseline may not have exact local source snapshots.

## [Unreleased]

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
