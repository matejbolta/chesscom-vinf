# Android Installation and Architecture

Last verified: 2026-09-10.

## Recommended platform

Use **Firefox for Android with Violentmonkey** on the tablet, then install the
generated `chesscom-vinf.user.js` userscript.

This is the most practical private-install route:

- Google documents that Chrome Web Store extensions can only be used on
  computers; choosing “Add to Desktop” on Android queues an install for a
  desktop browser rather than installing it on Android.
- Firefox for Android officially supports extensions from its Android add-on
  catalog.
- Mozilla's Android add-on catalog lists Violentmonkey as Android-compatible.
- A userscript can be installed locally and persist across browser restarts
  without publishing VINF to an extension store or signing a private Firefox
  extension.

Primary capability sources:

- [Chrome Web Store mobile limitation](https://support.google.com/chrome_webstore/answer/1698338)
- [Firefox for Android extension installation](https://support.mozilla.org/en-US/kb/find-and-install-add-ons-firefox-android)
- [Mozilla's Firefox Android development guide](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/)
- [Violentmonkey for Firefox Android](https://addons.mozilla.org/en-US/android/addon/violentmonkey/)
- [Violentmonkey privileged API reference](https://violentmonkey.github.io/api/gm/)

Brave's desktop extension documentation does not establish Android extension
support, so Brave Android is not a supported VINF target. Browsers that expose
experimental Chromium-extension support were rejected as the primary route
because reliability and long-term maintenance matter more than retaining the
Chromium brand on the tablet.

## Build

From the `chesscom-vinf` project directory:

```sh
pnpm typecheck
pnpm test
pnpm build:android
```

The installable file is generated at:

```text
dist-android/chesscom-vinf.user.js
```

The Android build is separate from `dist/`. The existing Chrome/Brave extension
and its release ZIP are not replaced or repackaged by `build:android`.

## Install on the Android tablet

1. Install current Firefox for Android from the Play Store.
2. In Firefox, open **Menu → Extensions** and install **Violentmonkey**. If it is
   not in the short in-browser list, open the Mozilla Android add-on link above.
3. Build `dist-android/chesscom-vinf.user.js` on the development computer.
4. Install the script using either method below.
5. Sign in to Chess.com in Firefox and open `https://www.chess.com/home`.

### Method A: paste into a new local script

This needs no hosting or developer account.

1. Transfer `chesscom-vinf.user.js` to the tablet or open it on the development
   computer so its text can be copied securely.
2. Open the Violentmonkey dashboard from Firefox's Extensions menu.
3. Choose **New**, replace the template with the complete generated file, and
   save it.
4. Confirm the script is enabled and its matches cover the Chess.com homepage
   plus the native matchmaking bootstrap, live-game, and review routes.

### Method B: serve the generated file on the local network

On the development computer, from the project directory:

```sh
python3 -m http.server 4174 --directory dist-android
```

While the computer and tablet are on the same trusted network, open this address
in Firefox on the tablet, replacing the host with the computer's LAN address:

```text
http://COMPUTER-LAN-IP:4174/chesscom-vinf.user.js
```

Violentmonkey should open its install screen. Review the four local GM grants plus `unsafeWindow` page access and
the Chess.com match before choosing Install. Stop the temporary server after the
script is installed.

### Last successful local install

The user successfully installed VINF on the tablet from the Mac with this exact
workflow:

```sh
cd /path/to/chesscom-vinf
python3 -m http.server 4174 --directory dist-android
```

Then, while the Mac and tablet were on the same local network, the user opened
this URL in tablet Firefox:

```text
http://<MAC_LAN_IP>:4174/chesscom-vinf.user.js
```

Use this again for later userscript updates. Replace `<MAC_LAN_IP>` with the
Mac's current private LAN address. That address may change after reconnecting to
Wi-Fi or a router/DHCP lease change; if the URL stops responding, determine the
Mac's current LAN address and substitute it while keeping port `4174` and the
same filename.

## Settings on Android

On the Chess.com homepage, open Firefox's Extensions menu, choose Violentmonkey,
and run **VINF settings**. The command opens a touch-friendly modal with the
master VINF toggle in its own top card. A separate `Homepage` card contains the
Native play panel switch plus visibility and fixed-order controls for every
known managed card. Profile, Daily Games, Recommended Match, and Game History
use the same visibility checkbox plus a `Main` / `Right` selector that remembers
their location while hidden. The one saved sequence determines their relative order
within either placement. Quick Play can use 0, 1, 2, 3, 4, 6, or 8 presets from
the same unified Bullet, Blitz, and Rapid groups as desktop. Zero removes Quick
Play entirely, and the same time control may be selected more than once.
Shrinking the grid keeps its leading selections; expanding it preserves every
existing selection and fills only the new slots. Its editor mirrors the
homepage grid above phone width: one row for 1–4 and column-first two-row grids
for 6 and 8. The Blitz group is ordered `3 min`, `3 + 2`, `5 min`, `5 + 2`,
`5 + 3`, `5 + 5`.
The modal also provides Stats visibility/order controls and an independent
`Expanded` or `Retracted` selector for every rating row. A selector remains
visible but disabled while its row is unticked, preserving the saved choice for
the next time that row is enabled. All rating rows default to `Retracted`.

If the browser does not surface userscript commands, open:

```text
https://www.chess.com/home#vinf-settings
```

Settings are stored only in Violentmonkey's local value store. They do not sync
with the desktop extension's `chrome.storage.local`; configure the tablet once.

## Architecture

The generated userscript is a separate delivery shell around the shared VINF
core:

```text
userscript metadata + GM settings adapter
                  ↓
shared runtime lifecycle
                  ↓
homepage detector → semantic module locator → reversible layout controller
                  ↓
validated native launch adapter + shared configurable Quick Play renderer/CSS
same-origin presence resolver → validated live-game continuation URL

live-game review guard → reversible phone evaluation-graph placement
```

The Android shell contributes only:

- a Violentmonkey local-settings adapter;
- the settings menu command and responsive modal;
- bundled local CSS and userscript metadata.

It makes no matchmaking request. Matchmaking still derives from the native
same-origin Chess.com immediate-match link already present in the signed-in
homepage, and changes only `base` and `timeIncrement`. When the Open Game
shortcut is enabled, the shared runtime makes a read-only request to
Chess.com's same-origin presence service on homepage load and ordinary shortcut
activation, sharing concurrent requests without background polling. Version
2.2.2 recognizes the observed `rcn` live-game source and uses `/game/<numericId>`;
legacy `live_chess` continues to use `/game/live/<id>`.

## Responsive behavior

VINF has two DOM modes:

- **Two-column:** either the legacy `#vue-instance` /
  `#vue-sidebar-instance` hosts or redesigned `#home-main` / `#home-sidebar`
  hosts—including the current outer `#home-sidebar-container` shell—keep their
  existing behavior, with the saved card order filtered independently within
  Main and Right.
- **Responsive/single-column:** VINF finds cards using semantic URLs, headings,
  and native component landmarks. Quick Play is inserted before the movable
  Main-card group; that group and the conceptual Right-card group each follow
  the saved card order. Profile, Daily Games, Recommended Match, and Game History follow
  their visibility plus Main/Right placement, and every other known card follows
  its Show/Hide setting. Legacy native action, Puzzles, Next Lesson,
  Game Review, and the optional
  `#main-banner` campaign are hidden. Every optional
  `.promo-toolbar-user-info` compatibility variant is also hidden unless it is
  the selected nonempty Profile fallback. The exact `#homepage-toolbar` or
  redesigned `#home-header .header-hero` follows the Profile card's
  Hidden/Main/Right setting; unrelated mobile profile controls are not
  targeted. Only the sibling play-grid section follows Native play panel while
  the launch link remains in the DOM. ChessTV embeds remain fully native; VINF
  does not alter their loading, autoplay, permissions, or playback.

At tablet widths Quick Play uses two columns. At narrow phone widths it becomes
one column. Controls keep 7rem touch targets, no hover dependency, visible focus,
and a reduced-motion mode.

On live-game review routes below 600 CSS pixels, the shared runtime moves the
native evaluation graph into Chess.com's existing chart slot immediately below
the lower player and clock while move-by-move review is active. The initial
report and tablet/desktop widths remain native. The graph returns to its original
parent on widening, disable, route departure, or review-state replacement.

The shared `OLED black` setting applies true black to the page canvas, mobile
toolbar, retractable navigation, player rows, sidebar, and review controls on
the homepage, exact live-game routes, and Game Review at phone and tablet
widths. The independent `OLED button colors` setting gives Quick Play and the
Open Game shortcut near-black surfaces, off-white text, and muted accents. The
OLED page setting also makes the separate live-game move-navigation tray black
and gives its five direct controls low-glare near-black surfaces while
preserving Chess.com's disabled states.
The shared controller adds a full-width `Jump to open game` managed card when
it can resolve either a strictly validated current live game through Chess.com's
same-origin presence service or an eligible native `/game/<id>` or legacy
`/game/live/<id>` link. It defaults to the bottom of the single column and falls
back to the latest Game History link. The UUID and game result remain in memory
only; no game data is stored. The settings header shows the installed source
version.

On 2026-09-19, a user-started mobile rapid game exposed `rcn` presence on the
desktop homepage, and the user confirmed that the desktop 2.2.2 shortcut opened
that exact ongoing game. This verifies mobile-to-desktop continuation, not the
installed Firefox/Violentmonkey runtime. Install the regenerated 2.2.2 userscript,
open its homepage before starting a game on another device, then activate the
shortcut while that game is active. Also check the newest-history fallback
after the game ends. Those Android checks remain outstanding.

The userscript runs at `document-start`. Its shared observer begins at
`.base-container`, responsive `main`/`[role=main]`, `body`, or the document
element as soon as one exists, while waiting for stored settings before changing
the page. Initial incomplete DOM batches reconcile immediately; after activation,
mutations are leading-throttled at 60ms. The 750ms route/root check, idempotent
markers, and original-position restoration all apply on Android.

## Test checklist on the real tablet

Automated tests use a sanitized responsive fixture and never start a game. On
the signed-in tablet, verify:

1. The script changes only the exact `/home` and supported live-game review
   routes and leaves other Chess.com routes untouched.
2. Quick Play appears once, above Game History, in portrait and landscape.
3. Puzzles, Next Lesson, Game Review, and the redundant action stack are absent.
   If Chess.com serves `#main-banner`, confirm it is absent too.
   If it serves `.promo-toolbar-user-info`, confirm that strip is absent too.
   If it serves `#homepage-toolbar`, confirm that header is absent too.
   If it serves `#home-header`, verify the Native play panel setting.
4. Game History and Stats remain usable. Verify Daily Games, Recommended Match,
   and Game History in each placement, then show/hide and reorder every
   available managed card in both placement groups.
5. In every nonzero grid size, each active button starts the exact displayed
   clock; also verify that zero removes the complete Quick Play module. Do
   this manually; every click can enter real matchmaking.
6. Change a preset, each homepage-module setting, Stats visibility/order, and
   several per-rating initial states through VINF settings; reload the page and
   confirm persistence.
7. Navigate away and back, rotate the tablet, and leave the page idle long
   enough for Chess.com to rerender dynamic cards; no duplicate panel should
   appear.
8. Disable VINF and confirm native cards and their original order return.
9. On a phone, enter move-by-move Game Review and confirm the evaluation graph
   sits below the lower player/clock and above the Game Review toolbar. Confirm
   the initial report is unchanged, then rotate or widen past 600 CSS pixels and
   verify the native placement returns.
10. Enable OLED black and verify a true-black canvas on the homepage, an active
    live game, and Game Review in portrait and landscape.
11. While a live game is open on another device, open `/home` and confirm the
    bottom-of-column `Jump to open game` card opens that live game. After it
    ends, reload `/home` and confirm the card falls back to the latest completed
    Game History row.

## Limitations

- The responsive selectors are covered by a sanitized semantic fixture, but the
  private signed-in Android page could not be captured in this development
  session. Chess.com experiments, locales, or future DOM changes may require a
  small sanitized tablet DOM sample and a locator update.
- The Game Review contract was captured from Chess.com's phone layout in a
  narrow signed-in desktop window; final Firefox-for-Android phone verification
  remains manual.
- Exact English card headings remain a fallback for some cards; semantic URLs
  are preferred where available.
- The settings of the Android userscript and desktop extension are intentionally
  separate.
- Chrome Android and Brave Android are not supported targets for this delivery.
- When Chess.com removes or changes the validated native immediate-match link,
  Quick Play fails closed instead of guessing a matchmaking URL.

### Extreme OLED mode (2.3.3)

At the bottom of VINF settings, the three switches are OLED background, OLED
play buttons and Extreme OLED mode. Clock bars are always shown in Extreme mode
when native timers are readable; there is no separate clock switch. Supported
active games only; Extreme never applies to Game Review, including moves.
Use the userscript manager's VINF settings menu to disable it and reveal game
controls. The settings dialog remains visible. Swipe the empty area around the
board to scroll; a small scroll extent is provided so Firefox can collapse its
browser bar without changing the native board's dimensions. Phone layouts add 128–152 CSS
pixels of black headroom above the player/board rows.

Tap either left clock area to reveal/hide both numeric clocks. Below one minute
for either player, both stay visible for that game even after a time increment. Numbers
show whole seconds below a minute; the small dot above/below identifies the
native side to move. Native results release Extreme automatically.

2.3.0 had user-reported clipping, unreliable input and a hidden result screen.
2.3.1 removes its forced board geometry and restores the result UI. Builds/tests
pass, but new browser checks were blocked by the locked Mac. Recheck scrolling,
all-file taps/drags, promotion and game-end behavior on the real Android device.

2.3.3 uses centered SVG chevrons in the outlined move circles. Clock-pill outlines
disappear with the numbers while their invisible tap areas remain active. White
pieces are flat gray again, without dark outlines. Game-end release was confirmed
by the user; the subsequent unwanted Game Review reactivation is now disabled.
Native board sizing/input is unchanged. Browser QA is still blocked by the locked
Mac; recheck control appearance and the review transition on the phone.


### Phone play and Review (2.4.0)

Normal games below 600 CSS pixels now have blank scrollable headroom above the
opponent, compact native clocks, hidden top/outer navigation, and newest-first
complete move rows. Scroll on the blank area to position the native board;
VINF never resizes it. Inner Moves/Chat/Info and native game controls remain.
Extreme OLED retains its own presentation; it stays off throughout Review.

Review mutes via the native coach toggle before hiding it, retains the mute
preference, and enlarges the bottom dock with safe-area/content clearance.
Unknown audio states keep the native button visible. Disable restores presentation.

Android edge-back remains native: a userscript cannot reliably replace browser
navigation with Chess.com's resign-confirmation dialog without fragile history
tricks. Use the native resign control when intended; VINF never auto-resigns.

Validated with automated checks and sanitized IAB Chromium phone fixtures, not
physical Firefox Android. On-device verification remains for browser-toolbar
collapse, live move-list autoscroll and board interaction, coach audio, bottom
safe-area behavior, and phone/tablet orientation changes. No real game was used
for these tests. See `DOM_AUDIT.md` for evidence and exact applicability limits.


2.4.1 fixes the user-reported Review heading offset and invisible OLED evaluation
bar. The hidden muted coach button retains its layout slot; the native bar fill
gets a local stacking context. Overview spacing and the dock stay unchanged.
Browser fixture verification is separate from physical Firefox Android checks.


### 2.5.0 partial consolidated improvements

Normal phone games now share the paired clock numbers/bars/turn indication and
low-time lock with Extreme OLED, with compact player information. Timestamps are
reversed vertically without changing move ownership; opening is below the moves.
Phone/tablet native game docks omit Play/Pause and widen Previous/Next; phone
Review reserves Hint/Best positions and broadens the right-side navigation targets.
Tablet normal clocks and tablet Review remain unchanged.

Touch annotations and moving Draw/Resign are pending safe native integration
inspection. Initial board positioning remains pending screenshots. No back guard
is included. Fixture checks do not establish real Firefox Android behavior.


### 2.6.0 touch drawing and phone actions

Tap the pencil beside your clock to draw: drag between squares for an arrow, tap a
square for a red highlight, repeat to remove. While selected, board touches draw
instead of moving pieces. Tap the pencil again to clear drawings and resume play.
A board position/flip change also clears marks. This works on phone and tablet;
drawings are local VINF overlays, not native engine annotations.

In Extreme OLED the inactive pencil is invisible: its 44px tap area is immediately
to the right of the bottom clock area. Tap there to enable; the pencil becomes
visible while drawing. In normal/ordinary OLED it is always visible.
Normal phone Draw/Resign now sit below your row and above Moves/Chat/Info, using
original native controls and confirmations. Board headroom remains unchanged.
Automated/browser-fixture checks passed; actual Firefox Android remains untested.


### 2.6.1 recording-driven layout fixes

Normal phone play uses compact nested avatars/text, a non-overlapping pencil slot,
48–80px scrollable headroom, and compact Draw/Resign and inner-tab rows. Board sizes
stay native. Bars/drawings scroll with the board container, and late native controls
are adapted promptly. Numeric clocks still toggle together and lock visible below
one minute; Extreme's spacing remains separate. Install the rebuilt userscript for
these fixes. Validation used the more faithful fixture, not an updated phone capture.

## Native annotation access (2.6.4)

Update the complete generated userscript, including its metadata header. The new
`unsafeWindow` grant lets the drawing adapter reach the page board's existing
annotation API; no network or cookie grants are added. Retain the userscript
manager's default injection mode. If page API access is unavailable, the pencil
is disabled and normal board input remains usable. Native drawing requires
actual Firefox Android / Violentmonkey verification after installation.

Reference: https://violentmonkey.github.io/api/gm/#unsafewindow

## Compact game rows and sound investigation (2.7.0)

Normal phone games show clocks initially. Tap either clock area to hide/show
both; either side below one minute forces both visible. Tap either avatar area
to independently hide/restore that player's info. Draw, native Abort/Resign,
pencil and clock share the player row. Long names truncate on narrow phones.
A one-shot entry scroll correction yields immediately to touch/scroll/key input.
Extreme presentation and Game Review remain separate.

Delayed start/move sounds are **not confirmed fixed**. Source inspection found
native Howler audio-unlock and resume queues, consistent with autoplay blocking,
but the device's actual AudioContext state and native live-game path were not
inspected. VINF does not intercept game audio. The homepage shortcut performs
normal full-page navigation; a homepage tap cannot be assumed to unlock the
new page's audio. Do not add fake events, audio replacement or global patches.

Check chess.com's Firefox site permissions / autoplay setting. Mozilla documents
per-site exceptions and notes that some sites still require interaction:
https://support.mozilla.org/en-US/kb/playing-videos-firefox-android
Web Audio contexts can be suspended until user activation:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
A user-controlled harmless tap outside the board during matchmaking is a useful
comparison, as is native launch with VINF disabled. Never start/play a real game
as an automated audio test. Desktop fixtures cannot establish Android audio behavior.

### 2.7.1 phone row redesign

Normal phone player identity is permanently hidden (no avatar toggle). Native
captured material remains visible and updates normally. Top row: material,
draw, Abort/Resign, opponent clock. Bottom: material, pencil, own clock.
Normal phone clocks are always visible and not tappable. Extreme retains its
clock toggle; tablet, desktop and Review are unchanged. Actual updated device
verification is still required; local fixture and automated checks passed.

### 2.7.2 performance correction

Removed per-drag-frame overlay measurements and redundant same-square arrow
preview rebuilds. Clock ticks update values without remeasuring the board.
Native moves, annotations, clock state and board sizing remain site-owned.
Dark captured material is gray on normal phone OLED for readability.
Fixture operation counts improved substantially; actual Firefox Android FPS and
touch latency have not been profiled or verified for this build.


## 2.8.0 — October 2026 local update

Reinstall the rebuilt dist-android/chesscom-vinf.user.js for release-only native
annotations, a filled red active pencil, configurable turn dot, fixed normal
clocks on both phone/tablet and the refined phone material rows. Phone Review's
first green action now reveals its graph once. Tablet retains desktop layout;
keyboard shortcuts remain desktop-only. Extreme retains paired clock hiding.
This update passed sanitized browser checks, not a new Firefox Android device run.
