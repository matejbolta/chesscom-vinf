# ChessComVINF LLM Handoff

This document is the durable project memory for future coding agents.

Last updated: 2026-10-02.
Current source version: 2.9.0.
2.8.5 fixes desktop Review B using the audited native coach Best control; verified in Brave.
2.8.4 removes doubled padding on the Desktop shortcuts heading to align it with other settings titles.
2.8.3 uses the exact requested concise O/E/X/Z/F/B help text; shortcut behavior is unchanged.
2.8.2 removes only the desktop Alt promotion-shortcut help row; annotation color help remains.
Latest Store-prepared desktop package: `release/chesscom-vinf-2.2.2.zip`.
Android artifact: `dist-android/chesscom-vinf.user.js`.

## Start Here

ChessComVINF means Chess.com Version Infinity. The short product name is VINF,
not WINF. It is an independent Manifest V3 Chrome/Brave extension that improves
the signed-in Chess.com homepage, adds OLED presentation to live games, and
improves phone move-by-move Game Review:

    https://www.chess.com/home
    https://www.chess.com/play/online/new* (matchmaking bootstrap only)
    https://www.chess.com/game/<numeric-game-id>
    https://www.chess.com/game/live/<numeric-game-id> (legacy-compatible)
    https://www.chess.com/live/game/<numeric-game-id>
    https://www.chess.com/analysis/game/live/<game-id>/review
    https://www.chess.com/analysis/game/<game-id>/review

It replaces the visually dominant homepage promo area with a focused configurable
Quick Play grid, promotes Game History and Stats, moves Daily Games into the
sidebar by default, and removes homepage cards that the user does not need.

The extension is implemented and functional. `PRODUCT_BRIEF.md` is the original
historical brief; its old “implementation not started” state is not current.
`FINAL_PRODUCT_SPEC.md` preserves the original detailed specification and the
chronological amendments through version 2.8.1. This handoff is the shortest
canonical statement of the current product.

## Current Development and Distribution Policy

Checkpoint exception (2026-09-19): the user authorized a one-time GitHub push
and preparation of `release/chesscom-vinf-2.2.2.zip` from the existing 2.2.2
source. Archive SHA-256:
`ab355dd5f2678abd48bfad5e112b29b1210c4d1db10b4ee1344a8f63478ef3ed`.
No new screenshots, listing descriptions, or other Store assets were requested
or changed; older screenshot version badges are explicitly acceptable. The ZIP
is prepared for user upload, not submitted by the agent. This is not ongoing
publication authorization. Future completed changes receive appropriate local
version/build/release-record updates and ordinary local commits automatically;
GitHub pushes and Store preparation/upload require a new explicit request.


The user placed VINF in local-only development mode on 2026-09-19. Development,
validation, versioning, desktop builds, Android userscript builds, and durable
handoff maintenance continue locally. Git remains the local source-history
tool: completed work should be reviewed and committed in coherent chunks when
the user asks to bring Git up to date.

For this project, `Git is up to date` means the intended local work is captured
in coherent commits, required version/continuity metadata agrees, and the
working tree contains no unintended changes. It does not mean that the branch
matches `origin`. Do not push, publish, create release tags or GitHub Releases,
alter the remote, prepare/upload a Chrome Web Store submission, or otherwise
synchronize GitHub or the Store unless the user explicitly replaces this
policy. Existing remote, published-version, and Store-package references below
are retained only as historical state. All other product, validation, privacy,
fixture, and handoff rules remain active.

## Last-move indicator (2.9.0)

All gameplay presentations show the latest completed native SAN on the inactive
player's side at the turn-dot center, opposite the active dot. Active side retains
the dot and its pulse. Text uses the active dot's gray/red state, including <60s
and observed >=60s turn duration. Text scales with dot size (minimum 12px).
Shared overlay covers desktop/tablet/phone and normal/OLED/Extreme; never Review.

LastMoveReader reads only wc-simple-move-list[board-id=board-single] main-line
nodes with data-node=0-N; highest N wins regardless of selected node or visual
row order. Native node-highlight-content supplies SAN; data-figurine supplies
piece letters in icon mode. Strict SAN validation hides unsupported/missing text;
no inference from board positions, game API calls or network requests. Require
native clock color to agree with the inactive side before display. Cached until
move-list mutation/replacement; native clock ticks and piece paint do not rescan.
Uses the existing observer, with data-node/data-figurine included; no new timer.

Evidence: sanitized native markup from the existing 2026-09-18 game-result
capture and saved native board bundle (DOM_AUDIT). Tests cover live append,
figurines, capture/check/promotion, selected-old-move exclusion, board flip,
color transition, cached clock updates and Review cleanup in normal/Extreme.
187 tests/typecheck and desktop/Android builds pass. IAB checked desktop Extreme,
phone Extreme and normal tablet fixtures; phone text and dot both rgb(119,119,119),
no fixture console errors. Screenshot: fixtures/raw/desktop-extreme-2026-10-02/last-move.png.
Actual current game and physical Android remain unverified. User is playing;
Brave/extension remain untouched and 2.9.0 must be loaded after the game.
No push or Store work.

## Desktop Extreme OLED controls (2.8.7)

Runtime passes its existing desktop device classification into the shared clock
controller. Desktop Extreme omits the owned previous/next nav and uses the same
native player-row clock geometry/style as normal mode. Phone/tablet retain their
previous navigation/presentation; this is device-based, not a width breakpoint.
Native keyboard handling and board geometry are untouched. Device-mode changes
clean up the overlay before recreation so positions/nav cannot remain stale.

Typecheck, 185 tests and desktop/Android builds pass. IAB sanitized Extreme
fixture (1280x768): board bounds remain x360/y126/560x560; clocks move to the
right edge x920, no nav; non-desktop fixture retains both buttons. No console
errors in that fixture. Test compares normal vs desktop Extreme clock positions,
touch restoration and disable cleanup. Evidence is ignored under
fixtures/raw/desktop-extreme-2026-10-02/after.png.
User was actively playing: Brave and the real game were not touched, and the
extension was NOT reloaded. Built 2.8.7 must be loaded after play ends. No push,
Store work, or actual live-game verification.

## Unified OLED and turn animation settings (2.8.6)

Desktop popup/side panel and Android settings now expose one OLED mode switch.
The sole canonical setting is oledMode: it controls background plus the homepage
play-button palette; O toggles the same value. Removed oledButtonColors from
normalized settings and both editors. Migration preserves existing oledMode when
boolean; only a legacy record without it falls back to oledButtonColors. This
prevents a stale true legacy flag from re-enabling OLED after the user switches off.
Extreme remains independent and existing route scopes are unchanged.

turnAnimationDuration is persisted beside turnDotSize on both surfaces. Label:
Animation duration (ms); integer range 0–5000, default 1000, input step 100. Zero
skips pulses. Changing duration cancels any current pulse; subsequent confirmed
turn changes use the new duration. Reduced-motion still suppresses animation.
No added observers, polling, native-board changes, or gameplay actions.

Verification: typecheck and all 184 tests pass (Android editor test rerun after
restoring its edited value for later assertions); desktop/Android builds pass.
Installed Brave 2.8.6 popup visually checked: one OLED toggle, duration directly
below size, updated O help. Duration autosave tested at 1500 and restored to 1000.
Private screenshot: fixtures/raw/settings-2026-10-01/oled-duration.png. Android
editor/runtime covered by automated checks; no new physical-device verification.
No push or Store work. No new substantive shared-knowledge contribution.

## Desktop Review B selector correction (2.8.5)

The 2.8.0 selector covered only the narrow footer, so B was a no-op on the actual
wide desktop Review. Read-only DOM inspection of Analysis 2026.9.8 found an
unlabelled native button under `.move-by-move-coach-section .flow-buttons-component`,
identified by `svg[data-glyph="circle-fill-star"]`. B now clicks that button, with
the narrow `aria-label="Best"` control retained as a fallback. Existing route,
visibility, disabled, typing, modifier and repeat guards remain. No layout change.

Actual signed-in Brave verification: reproduced failure on 2.8.4, compared native
Best click, reloaded 2.8.5, and confirmed B opens the same native best variation.
A second B with Best absent did nothing. Returned to the originally selected move;
closed DevTools and the temporary extensions tab. Only a completed game's Review
was used. Sanitized markup lives in `tests/fixtures/review-desktop-controls.html`;
private screenshot is ignored under `fixtures/raw/desktop-best-2026-10-01/after-b.png`.
Typecheck, all 184 tests and desktop/Android builds pass. No device verification,
real live-game actions, GitHub push or Store work.

## Extreme rows and retired clock toggle (2.8.1)

Supersedes the 2.8.0 Extreme clock-hiding policy below. Clock hiding is removed
on every platform: no state, click handler, toggle method, T shortcut or T help.
Numeric clocks are div[role=timer][aria-live=off] with pointer-events:none, always
showing native time (whole seconds under a minute). Native clocks still drive
bars, values and low-time colors; no simulated time. All numeric displays lack
pill outlines. Row-positioned clocks share chesscom-vinf-row-clock-controls;
normal-clock-controls remains the normal presentation/z-index marker.

Extreme Android phone games reuse phone-game/material markers and native action
relocation. PhoneExperienceController shares rows only: no normal entry scroll,
opening relocation or newest-first list work while Extreme is selected. Extreme
keeps its own headroom, black board and hidden surrounding site. Phone pencil is
visible even when inactive and occupies the normal lower-row slot. Native Draw/
Resign stay in the upper row; their nested controls and portalled native
confirmation/draw components are visible. Previous/next circles sit below the
lower row. Tablet/desktop keep their separate Extreme layout with clocks always
visible. Crossing phone/tablet width clears obsolete inline clock positioning.

Verified using sanitized phone/tablet browser fixtures, native-shaped confirmation
cancel, unchanged board size, typecheck, 184 automated tests and both builds.
Existing fixture browser MutationObserver error is unchanged from the baseline.
No new Firefox Android/live-game verification, real game actions, push or Store
work. Screenshot evidence stays ignored under fixtures/raw/refinements-2026-10-01.

## Game controls and review refinements (2.8.0)

Supersedes conflicting 2.7.x presentation details below. Tablet uses desktop
layout with touch annotations; desktop additionally has keyboard shortcuts.
Normal live-game clocks now stay visible and noninteractive on desktop/tablet/
phone, without pill borders. Runtime enables shared clocks on Android tablets
as well. Extreme OLED retains hidden-by-default paired clocks and T toggling.
Desktop B on exact Review routes clicks an enabled, rendered native Best control
inside game-controls-view-component; absent/hidden Best is a no-op. Capture-phase
handling suppresses native bubbling B effects in Review. Typing/modifier guards
remain. The popup shortcut guide reflects B and Extreme-only T.

Touch gestures retain the native markings factories/toggle/ownership cleanup but
no longer create previews or measure board bounds on pointermove. Native arrows
and red squares commit only on pointerup; cancellation commits nothing. Pencil
uses a filled SVG, active #b65b5b, matching low-time numerals. Normal visibility
and Extreme inactive hiding remain.

turnDotSize is persisted in both settings surfaces: integer 4–24px, default12.
Dot uses the native active-clock class, tracks color identity across flips where
available, and pulses from 2x to 1x over one second only on confirmed switches.
Reduced-motion skips pulse. Red means active time <60s or the same native turn
has been observed for >=60s using performance.now. Initial late attachment cannot
recover elapsed move time before VINF observed it. No new polling loop: existing
clock events/lifecycle fallback update color. Route/board teardown resets tracking.

Phone-only material rows use six equal grid tracks: material left half; draw,
flag, clock centers across the right half. Bottom clock matches top and pencil
bisects the distance from midpoint to clock. Native board geometry unchanged.
Removed 2.7.2 captured-material gray filter at user request; native dark pieces
may be subtle on black by deliberate preference. Align native score vertically.

ReviewEntryScroll is phone Review only: first native mobile-gr-footer-primary
click arms a bounded 2.5s settle window. After matching graph positions 150ms apart,
scroll minimally to clear the bottom dock plus8px. Subsequent primary clicks do
nothing; touch/wheel/key cancels pending work. Disable/route change cleans listeners
and timers. Existing graph relocation, coach, board and dock structure remain.

Verification: 183 tests/25 files, typecheck and desktop/Android builds; performance
budgets retained. Browser fixture checks and limitations are recorded in DOM_AUDIT.
Actual Firefox Android/tablet and live desktop Review remain unverified; no real
game actions, push, Store package/listing/upload or Store screenshots.

## Gameplay performance correction (2.7.2)

User's 113.824s Firefox Android recording of 2.7.1 inspected at 2s intervals,
with 100ms frames at 13.5–15.5s (piece drag) and 250ms at 106–110s (annotations).
Initial entry now shows the full board; scrolling remains user-controlled.
Native knight arrows/red squares work on the device. At ~107s toggle-off clears
all marks; the later red square is new input, not an uncleared mark. Dark captured
material is visibly low contrast on black; normal phone OLED now tints only the
native material icons to neutral gray. Board-piece rendering is untouched.
Private evidence: `fixtures/raw/performance-2026-09-28`; do not commit recordings.

Confirmed VINF inefficiencies and fixes:
- Touch observer watched every descendant style mutation, rebuilt a signature
  containing inline transforms, then measured/positioned overlays on each drag
  frame. It now watches piece class/structure, compares only piece type/square +
  flipped orientation, and uses resize/root-style events for overlay geometry.
- Clock observer also treated piece paint as layout changes. Shared
  `game-mutations.ts` skips paint only after presentation is established; initial
  hydration, board replacement, canvas fallback and root geometry remain observable.
  Clock text updates use cached layout; structural/resize events invalidate it.
- Runtime/phone observers no longer run broad reconciliation on native clock
  text/mark rendering or owned widget updates. The 750ms lifecycle/API fallback
  remains intentionally; do not remove it without replacing late API hydration.
- Same-square pointermove no longer removes/recreates native arrow preview.
  Clock attributes are written only when changed, reducing observer/style churn.

Measured in `tests/game-performance.test.ts` using real runtime/controllers and
sanitized native API fixture, simulated 60 style-transform frames at 16ms:
2.7.1: 366 geometry reads, 15 phone reconciles, 1 clock reconcile.
2.7.2: 6 geometry reads, 1 phone reconcile, 1 clock reconcile.
30 same-square pointermoves: 30 preview factory calls → 1.
These are operation counts, NOT device CPU/FPS/latency measurements or a claim
that all phone lag is fixed. Regression budgets also cover ten clock ticks,
actual square-change mark cleanup and root-style geometry invalidation.

Verification: 181 tests / 24 files pass, typecheck + desktop/Android builds.
IAB phone fixture verified native annotation calls, input isolation/toggle-off,
unchanged board bounds and computed material contrast. Existing browser-preview
MutationObserver/Node error remains outside fixture-captured errors. Actual
updated Firefox Android smoothness needs user verification. No real game actions,
GitHub push, Store artifacts or Store screenshots.

## Phone material-only rows (2.7.1)

Supersedes the 2.7.0 identity toggles and bottom action placement below.
Normal Android phones (<600px) permanently hide avatar/name/Elo/flag/connection,
while preserving native `wc-captured-pieces` and all its descendants/ancestors.
CSS hides only siblings along the path to that native component, including when
material lives inside `.player-tagline`; no material reparenting or cloning.
The retired `PhonePlayerInfoController` and avatar buttons are removed.
`data-chesscom-vinf-phone-material` is explicitly gated by Android + phone in
runtime and removed on disable, end, Extreme and Review. Desktop narrow windows
are excluded. Top row: material → original draw/Abort/Resign → opponent clock.
Bottom: material → pencil → own clock. Existing native action anchors restore
exact originals. Normal phone numeric clocks are permanently visible; their
buttons are disabled, not focusable, and toggleTimes returns false. Extreme and
desktop behavior remain unchanged. No audio or entry-scroll changes this patch.

Verification: typecheck, 180 tests, desktop/Android builds pass. IAB fixture:
320px material-only rows, noninteractive visible clocks, same native board width,
annotation toggle, disable restoration; 800px tablet retains identity and native
sidebar actions. Material node identity/live score update and mode/route guards
covered in tests. Existing preview MutationObserver/Node console error remains
outside the fixture-captured error stream. Updated Firefox Android is unverified.
No real game interaction, push, Store packaging or screenshots.

## Mobile game entry and compact controls (2.7.0)

Latest supplied recording (33.4s, inspected at 0.5s intervals) shows a clipped
board already during matchmaking at 3s, retained after pairing at 6.5–7s.
There is no finger indicator at that transition. Later scrolling from ~13.5s
coincides with the visible touch indicator. Native Abort changes to Resign
around 22.5s after the first own move; never falsely relabel Abort as Resign.
Ignored frame evidence: `fixtures/raw/mobile-start-2026-09-28`.

- `PhoneGameEntry`: normal phone only, one 350ms post-hydration correction if
  opponent row is clipped or board extends below usable viewport. Target row
  top 48px (bounded by viewport). Touch/pointer/wheel/key cancels, route cleanup
  cancels, and later ticks/resizes cannot rearm. No board sizing/transform changes.
  This supersedes the earlier "no programmatic scroll" decision for entry only.
- Native `:not(.player-theatre)` tagline height specificity was beating our
  compact rule; matched specificity aligns avatar and username centers.
- `PhonePlayerInfoController`: two independent transparent avatar-area buttons,
  28×44px, hide only identity content via visibility, keep layout/restore target.
  No player data saved; cleanup on disable/end/Review/Extreme/route replacement.
- Native action roots now live in own player row before pencil/clock, original
  comment anchors preserve restoration. Icon-only CSS preserves accessible text
  and changing native Abort/Resign state. Draw/Resign/pencil targets 32×44px,
  normal phone clock target 64×44px. Native confirmation actions are unchanged.
  Very narrow phones ellipsize the name to retain rating/flag/signal and controls.
- Normal clock default is visible (including desktop shared T presentation).
  Explicit user toggle persists through same-game mode switching; fresh Extreme
  still defaults hidden, low-time remains forced paired visibility.
- Normal turn dot 4→6px, Extreme unchanged. Home/tablet layout and Review untouched.

Audio investigation: VINF has no in-game audio interception/muting; only Review
coach muting. Quick Play performs a full navigation to the audited native URL.
Previously downloaded first-party shared eager bundle contains Howler's capture
listeners for touchstart/touchend/click/keydown, suspended AudioContext resume,
and queued playback waiting on resume. This explains a possible burst on first
interaction, but is NOT proof of the actual Firefox Android context/permissions
or the exact live-game audio path. Do not claim sound fixed. Check per-site
Firefox autoplay first, compare a harmless tap in blank matchmaking area and
stock native launch; any game test remains user-controlled. No synthetic unlock,
new audio context, global monkeypatch, or permission change was shipped.
Mozilla evidence is in ANDROID.md. Browser allow-autoplay may still require
site interaction. No new shared-knowledge proposal: not a novel verified finding.

Verification: 179 tests pass across 23 files, typecheck and desktop/Android builds.
IAB sanitized fixture at 390px and 320px: native board size retained, centered
avatar/text, compact controls, independent profile hide/restore, default visible
clocks, paired hide/low-time reveal, entry clipped-scroll correction, and disable
restoration. Tests cover cancellation/re-entry/cleanup and native handler identity.
Browser logs retained the pre-existing preview MutationObserver/Node error; the
fixture error listener captured no error during these interactions. Screenshot:
`fixtures/raw/mobile-start-2026-09-28/after-fixture.png`.
Actual updated Firefox Android behavior and audio permission are not verified;
user video is baseline evidence only. No real game actions, push or Store work.

## Native touch annotations (2.6.4)

Supersedes the independent SVG drawing from 2.6.0. The Android phone/tablet
pencil UX and gesture isolation remain; the input shield is now an empty div.
`native-annotations.ts` calls the same `game.markings.factory` methods used by
native right-click handling: `buildStandardArrow` / `buildStandardAnalysisHighlight`,
then `toggleOne`. Native defaults select colors, opacity, and shapes (including
knight arrows). Temporary native previews use an isolated random key and are
removed on completion/cancellation. Cleanup removes only tracked native objects
that have not been replaced by another interaction. No broad clear-all, synthetic
input, game-state calls, or changes to input monitoring.

The Android entry point resolves the page board through documented `unsafeWindow`
access (one additional userscript grant); the Chrome/Brave manifest is unchanged.
Missing/incompatible APIs disable the pencil with an explanatory accessible label
and keep normal board input. Poll/reconciliation picks up late hydration; an API
that throws stays disabled until replaced. Desktop/Home/Review scope unchanged.
Native marks inherit existing Extreme OLED board styling.

Source evidence: public Analysis 2026.9.8 board/marking implementation, downloaded
with explicit user-approved request headers after an initial HTTP403. Details in
`DOM_AUDIT.md`; raw scripts remain ignored under
`fixtures/raw/native-annotations-2026-09-28`. The source explicitly monitors
untrusted pointer input when enabled, so do not replace this adapter with synthetic
right-clicks or tamper with native monitoring. The API is internal and can change.

Verification uses a sanitized native-API contract double; its illustrative renderer
is test-only and is NOT shipped. No actual Firefox Android userscript/page-realm
integration or active-game drawing has been verified. Install updated userscript,
then verify tap, drag, cancel, flip, toggle-off, and post-game/Review cleanup on the
device. Never describe the fixture renderer as the actual Chess.com renderer.

2.6.4 checks: typecheck, 177 tests, desktop/Android builds pass; four annotation
checks rerun after the final duplicate-preview guard. IAB contract fixture at
390px and 800px/Extreme verified marking calls, empty shield, no board input while
active, toggle-off cleanup, and disabled-API fallback. Browser preview logs show
an observer error outside the iframe's captured error stream; fixture gestures
and assertions succeed, but do not claim an entirely clean browser console.
Native device/page-realm integration remains outstanding as stated above.

## Recording-driven phone corrections (2.6.1)

User supplied two private Firefox Android screen recordings (2026-09-28), stock
and VINF. Initial partial-board framing exists in both. In the enabled recording,
the large movement at ~10.1s follows a visible finger gesture and momentum; do not
misdiagnose it as an autonomous extension scroll. Matchmaking's non-OLED background
is intentional. Confirmed regressions: nested avatar overlaps text, inconsistent
player sizing, excessive combined vertical footprint, and transient clock-bar
separation during scrolling. Videos do not verify annotation gestures or clock
reveal. Raw frames remain ignored under fixtures/raw/android-video-review-2026-09-28.

- Native avatar is `.player-avatar > .cc-avatar-component > img`, not the old
  fixture's text/direct image. Resize wrapper, nested component and image to 20px;
  current `cc-user-*`/`cc-text-*` player text to 11px, with 6px avatar/text separation.
  Preserve native flag sprite dimensions/offsets; compact connection bars using
  their existing signal variables. Normal phone only. Native content remains intact.
- Normal headroom is `clamp(48px,10svh,80px)` instead of 240–380px. Draw/Resign and
  inner tabs use 44px rows. Pencil has a 44px flex slot before the native clock,
  with a 32px visible ring on phones. No CSS-only board sizing or programmatic scroll.
- `board-overlay.ts` puts owned overlays in the already-positioned native board
  stage and expresses their bounds relative to that stage. Browser scrolling moves
  them with the board; no board/host styles or dimensions are changed. Unknown
  static hosts retain fixed-position fallback. Both clock and annotation overlays
  share the helper; Extreme's appearance/headroom and desktop clock behavior remain.
- Runtime observes the whole exact gameplay/matchmaking bootstrap document and
  updates phone presentation, actions, clocks, annotations and dock in one order.
  Late controls no longer wait for the 750ms route poll. No history interception,
  native action synthesis or presentation changes on matchmaking are introduced.

Verification: 175 tests, typecheck and desktop/Android builds. The enriched IAB
fixture reproduced 40px avatar images spilling out of 20px wrappers before the fix;
now both are 20px with a 6px gap to text. 360px board stays 360px, normal headroom
296→78px, action row 60→44px. At 320px: no horizontal overflow, 4px separation
between connection/pencil/clock regions, low time forces both numbers, disabling
restores 40px avatars and original actions. Drawing consumes no board events and
off restores native down/up. Board/bar offset stays 5px through scrolling; the
annotation layer matches board bounds. 800px keeps native avatars/clocks and action
placement. Extreme keeps 44px controls and hidden inactive pencil. These are
fixture checks; real Firefox Android after-fix behavior still needs user testing.

## Touch drawing and phone actions (2.6.0)

`TouchAnnotationsController` is Firefox-Android-only, phone and tablet, signed-in
exact live-game routes. It renders an owned SVG sibling over the unmodified native
board rectangle. Pointer capture, touch-action:none and cancellation on the owned
surface isolate gestures; no synthetic native events, private engine calls or
network access. Drag adds/removes an orange arrow, tap adds/removes a red square.
Turning drawing off clears marks and restores native hit testing. Position/orientation
mutations clear stale marks and cancel unfinished strokes; route/disable/end cleanup
removes the overlay. Observer/resize/scroll tracking follows native board geometry.
Normal mode now gives the 44px pencil a real flex slot before the native bottom
clock (2.6.1 replaces the former overlaid button and padding reservation).
Extreme uses its bottom-clock area +100px offset: inactive pencil is transparent but
its tap target remains; enabled pencil is visible. Accessible keyboard focus reveals
it. This is VINF-local drawing, not a reverse-engineered native annotation API.

`PhoneGameActionsController` moves only native `.draw-button-component` and
`.resign-button-component` roots into compact non-clickable slots before the inner
sidebar tabs, only in normal Android phone games with the existing phone marker.
Comment anchors restore the exact original positions. No proxy click handlers or
confirmation changes. Missing/changed component selectors fail open. Saved first-party
CSS establishes these classes; the ended-game DOM cannot prove their current live
ownership, so actual live integration remains unverified. Do not claim fixture
confirmation tests prove current Chess.com handlers.

2.6.0 checks: typecheck, 174 tests, desktop and Android builds. IAB sanitized fixture
checks at 390×844 (normal/Extreme) and 800×1000 (tablet) show isolated arrow/square
input, native pointer delivery after drawing off, unaltered board dimensions,
44px toggle geometry, compact action placement and tablet action scope. At 320×740
ordinary OLED has no horizontal overflow; disable restores original action roots
and a Review route removes both additions. No fixture
console warnings/errors. Actual Firefox Android touch behavior is not verified;
no live game was started, played, drawn on, offered a draw or resigned. No push,
Store package/upload/listing changes. Initial board headroom remains untouched.

## Shared clocks and navigation (2.5.0)

This is the independently verifiable portion of the user's consolidated request.
Shared clock presentation now applies to normal desktop and Firefox Android phone
live games; Android tablets retain native normal clocks. Desktop expansion was
explicitly approved in the clarification. `ExtremeOledController` accepts a
normal-clock presentation flag: reuse the same timers/maxima/low-time latch/turn
and paired reveal state, but set only `data-chesscom-vinf-normal-clocks`, anchor
numeric pills to native clock boxes, and omit Extreme board colors, content hiding,
move proxies and scroll room. Both modes stay off in Game Review/completed games.
Desktop O/E write the same persisted settings as the UI through SettingsSource.save;
T calls the same clock-toggle method as tapping a time area. O works on supported
routes; E/T only exact game routes. Editable/control targets and modified/repeated
keys are ignored. Existing settings subscriptions keep UI and runtime synchronized.

Phone normal gameplay swaps only native timestamp top/bottom positioning, retains
newest-first rows/ply attribution, moves the original opening line below the list
with reversible parent/sibling tracking, and compacts player avatar/text presentation.
`AndroidGameControlsController` requires Firefox Android and the exact native five
button sequence: marks the dock for four-column layout, hides Play/Pause and keeps
its node/handlers, preserving outer widths while Previous/Next grow equally. No
proxy game actions or native board mutations. Review uses fixed two-column side
groups, explicit Hint/Best/Previous/Next columns and dock-only Share hiding.

The earlier native-integration hold was superseded by the user's 2026-09-26
instruction to implement touch drawing and Draw/Resign independently. See 2.6.0
above. The 2026-09-28 recordings and authorization supersede the spacing hold;
2.6.1 reduces normal headroom without commanding scrolling. Android Back remains
a separate task.

Verification for 2.5.0: typecheck, 172 tests and both desktop/Android builds pass.
IAB Chromium sanitized fixtures at 390×844 and 320×740 verify original board
size/input delivery, clock reveal/forced low time, timestamp attribution/order,
opening position, dock geometry and disable restoration. At 768px, Android keeps
native clocks with a four-action dock; desktop has shared clocks with its original
five-action dock. Conditional Hint/Best positions stay fixed. No fixture console
warnings/errors. These are fixture results, not actual Firefox Android or live
Chess.com input verification. No game was started, played or resigned.

## Phone Review corrections (2.4.1)

User phone screenshots confirmed the 2.4.0 dock looked good but exposed a
right-shifted title in both overview and move review, plus an invisible evaluation
bar. Retain the muted coach control's native layout slot with visibility:hidden
and pointer-events:none instead of display:none. Native header child-count rules
then center the title without moving its other controls. The evaluation fill uses
z-index:-1; isolate `.evaluation-bar-bar` only in phone OLED Review to prevent the
opaque ancestor background covering it. No bar sizing, colors or native scores
change. Overview gaps and dock are intentionally unchanged. Real gameplay testing
is pending the user's later session. The fixture now models native header slots
and negative-z fill; `?overview=1` covers the initial report header. IAB 390×844
checks confirmed both title groups centered and the fill visible; 170 tests,
type checking and both builds pass. Physical Android verification remains pending.

## Phone gameplay and Review refinements (2.4.0)

`PhoneExperienceController` adds responsive (<600px) normal gameplay treatment,
including ordinary OLED: hide the mobile toolbar/outer tabs, add 240–380px of
scrollable headroom, compact native clocks, and visually order audited complete
move rows newest-first. No board geometry/input or native action handlers change.
Its mutation observer covers live rows and coach-state changes; runtime polling
also reconciles route/result state. Native result evidence latches the game
presentation off until route change. Extreme OLED uses its existing separate
presentation and stays disabled throughout Game Review.

Phone Review keeps its existing graph/coach/navigation layout. The native audio
control is used to mute, then hidden only after the muted glyph is observed.
Unknown/unresponsive controls stay visible. Disabling restores the button but
retains the requested native mute preference (never auto-unmute). The fixed dock
is 80px plus safe area, with 64px-high buttons and a removable clearance spacer.
Full selector evidence, renderer fallback, API research and verification limits
are in `DOM_AUDIT.md` under the 2.4.0 audit. No Android back interception is shipped:
web navigation APIs cannot reliably substitute the native resign dialog without
history tricks. Keep native resign available and never trigger it from gestures.

170 passing tests (four new focused scenarios), type checking, desktop/Android builds and
sanitized IAB phone checks cover the changes. Physical Firefox Android remains
unverified. `/phone-game` fixture has M/E/D/R keys for append/end/disable/route;
`/game-review-mobile?audio-on=1` verifies native-shaped muting, B conditional Best,
A re-enabled audio, D disable. Fixtures never contact Chess.com or play a game.
Store-prepared package remains 2.2.2; no push, Store build, listing or asset changes.

## Extreme OLED mode (2.3.3)

The final settings card on desktop popup/side panel and Android contains only
OLED background, OLED play buttons, and Extreme OLED mode, with no helper copy.
`extremeOled` remains opt-in (default false). The retired `extremeOledClocks`
preference is discarded by normalization; valid native time bars always show. Homepage
and ordinary OLED are unchanged. Exact signed-in live-game routes only; all Game
Review states stay outside Extreme OLED, including move-by-move. Escape reveals the normal UI until
Extreme is toggled off/on or the route changes. Android can disable Extreme via
the userscript manager settings menu; its settings dialog remains visible.

The 2.3.0 user reported clipped pieces, unreliable taps/drags, blocked browser
bar collapse and hidden game results. 2.3.1 removes all forced board/wrapper
geometry: Chess.com owns its board dimensions and input. Native-hidden
board descendants are no longer forced visible. Scroll room is added outside
layout (96px beyond the viewport/board), root scrolling is enabled and the owned
controls follow native bounds without intercepting the board. A swipe on the
empty area is intended to let Firefox collapse its toolbar; actual Firefox
Android behavior still needs device verification. Never restore CSS-only board
resizing or replace the native engine merely to make a fixture look centered.

On phone widths below 600px, 2.3.2 adds an empty normal-flow pseudo-element above
the player/board rows in `#board-layout-main`: clamp(128px, 18svh, 152px), roughly
3–4 CSS cm. No board sizing, transform or native CSS board variables are changed.
Desktop positioning is unchanged. The extra room can be scrolled away.

White pieces are flat #666 silhouettes without outlines (alpha preserved);
black pieces retain black fill with dim outlines. Move arrows have thin 44px
circular borders at the lower right with centered symmetric SVG chevrons; all
control contents use explicit grid centering. Clock targets are 80x44px pills
inset 12px from the left, with rounded/system-font text. Hidden numbers also hide
the pill borders/backgrounds; invisible tap targets remain available. A 4px dot above/below marks the one native
`.clock-player-turn`; ambiguous/missing turn evidence shows no dot. Clock bars
always show when native timers are readable. Tapping either left clock area toggles both
numeric clocks. Once either native timer reads below 60 seconds, both numbers
are latched visible for that game, including after increments raise time again. Below a minute show integer seconds with the fractional part
removed; above it use minutes:seconds. Missing one timer shows a dash, never a
fabricated value. No numbers/tap targets when both timers are absent.

Clock fractions use each color's maximum observed displayed time since
activation, not an inferred original time control. Bars/numbers turn muted red
below one minute. All time and turn state comes from the DOM; no simulated
clock, network request, account-data storage or gameplay automation was added.
Recognized native result evidence releases Extreme for the rest of that game
route so the site's result/Game Review actions work. A zero clock alone is not
proof of game over. The user confirmed game-end release on 2.3.2, but reported
unwanted reactivation in review moves. Version 2.3.3 removes review routes and
analysis boards from Extreme entirely; the ordinary OLED background and phone
review-graph behavior are unaffected.

Selectors/limits: DOM_AUDIT.md. 166 tests, typecheck and desktop/Android builds
pass. The visual fixture now includes native padding-based board sizing, hidden
board content, pointer delivery probes and T/L/E keys for turn/low-time/result.
New real-browser QA was blocked by the locked Mac/unavailable browser; no claim
of visual, native-input or physical Android verification for this patch. The
prior 2.3.0 synthetic visual checks did not predict the reported live failures.
Store package remains 2.2.2; do not push/package 2.3.3 without a new request.

## Current User Experience

### Homepage

The transformed desktop homepage has:

- the normal Chess.com left navigation untouched;
- an optional bare user-selected 1/2/3/4/6/8-button Quick Play grid at the top
  of the native main/left column; selecting zero removes the module entirely;
- Quick Play exactly as wide as Game History;
- no Quick Play heading, subtitle, logo, clock glyphs, or visible launch-status
  row;
- Game History directly below Quick Play when it remains in Main and Daily
  Games is in the sidebar;
- no transient Daily Games row above Quick Play when Chess.com inserts that
  native module late;
- the right sidebar beginning at the same vertical position as Quick Play;
- a configurable right sidebar containing Profile when placed there, Stats,
  ChessTV, Daily Games, Recommended Match and Game History when placed there,
  Streaks, Legend League, Daily Puzzle, and Friends;
- one fixed user-selected managed-card order, filtered independently within the
  Main and Right columns, with unknown future native cards preserved visibly
  after the managed cards;
- minimal fixed Stats content by default: Games, Rapid, then Blitz; an optional
  legacy Insights row stays last if Chess.com supplies it.

The extension hides by default:

- the optional recurring top campaign at the exact `#main-banner` landmark;
- the native Profile card, represented by the visible avatar, username, and flag
  header at exact `#homepage-toolbar` or the redesigned `.header-hero`; it can
  instead be shown in Main or Right;
- every separate `.promo-toolbar-user-info` compatibility variant;
- Chess.com's legacy native quick-action column; the separate redesigned sibling
  play/recommendations section is hidden by default and can be shown from
  homepage settings;
- the profile-adjacent top Legend League summary inside that column;
- Puzzles;
- Next Lesson;
- Game Review;
- the empty native promo row after Quick Play moves into the main column.

ChessTV remains completely native when its card is shown. VINF does not alter
its iframe source, permission policy, hidden state, loading, autoplay, or
playback.

The native quick-play link remains in the hidden DOM because VINF derives safe
launch URLs from it.

### Quick Play visual rules

- Exactly 0, 1, 2, 3, 4, 6, or 8 controls are rendered, matching the button
  count selected by the user. Zero renders no Quick Play panel or placeholder.
- Labels are centered and time-only: `10`, `10 + 5`, `30 sec`, and so on.
- Accessible names remain action-oriented: for example `Play 10 + 5`.
- Buttons have no icons and do not say `Play` visibly.
- On desktop, counts 1–4 use one row with the selected number of equal columns.
  Six and eight retain column-first flow with two rows and three/four columns.
- Every count keeps the same 1.4rem gaps and fills the exact Game History width;
  a one-button grid is therefore one full-width control.
- The default one- through four-button layouts are:

      1:  10
      2:  10       15 + 10
      3:  10       15 + 10       3 + 2
      4:  10       10 + 5        15 + 10       3 + 2

- The default six-button layout is:

      10       15 + 10       3 + 2
      10 + 5   30            5 + 3

- The default eight-button layout is:

      10       15 + 10       1 + 1       3 + 2
      10 + 5   30            3           5 + 5

- Rapid is green, Blitz uses a chroma-preserving perceptual palette derived from
  Chess.com's sampled lightning-bolt yellow, and Bullet is amber/brown.
- The controls are 7rem high and fill the exact Game History column width.
- Below 980px the grid becomes two columns; below 450px it becomes one column.
- A click must never insert visible `Starting…` or error copy beneath the grid.
  Assistive feedback lives in a visually hidden ARIA status node.
- A failed launch restores the controls after eight seconds and marks only the
  affected button with a local failure outline.

### Popup

The toolbar popup contains:

- VINF branding and the current version;
- a standalone top card containing `Enable VINF` and Homepage Reset;
- an intentionally headerless homepage-settings card with a `Native play panel`
  switch and a managed-card editor
  for Profile, Stats, ChessTV, Daily Games, Recommended Match, Game History,
  Streaks, Legend League, Daily Puzzle, Friends, and Open Game Shortcut;
- Show/Hide checkboxes and fixed-order arrows for every managed card; Profile,
  Daily Games, Recommended Match, Game History, and Open Game Shortcut
  additionally have `Main` /
  `Right` selectors that retain their choices while hidden. The arrows define
  relative order in whichever column those movable cards use;
- a 0/1/2/3/4/6/8 Quick Play count selector and the corresponding number of
  preset selectors, with the selector list absent at zero;
- adaptive count changes that keep the leading selections when shrinking and
  preserve all existing selections while filling only new slots when expanding;
- a preset-selector grid that mirrors the homepage layout: one row for 1–4,
  two column-first rows of three for 6, and two of four for 8;
- a narrow-popup layout that preserves that selected grid instead of falling
  back to two columns, with non-shrinking switch tracks beside wrapped labels;
- summary and rating visibility/order controls for the native Stats card;
- an independent `Expanded` / `Retracted` selector beside every Stats rating
  row;
- separate Homepage, Quick Play, and Stats Reset actions, with Homepage Reset
  placed in the top Enable VINF card;
- a compact header button that opens the same settings UI in Chromium's
  persistent side panel when the browser supports it;
- brief autosave status feedback.

Every toggle, select, Stats checkbox, row movement, and Reset saves immediately.
There is no Save button. Storage writes are serialized so rapid changes cannot
finish out of order. The same time control may be selected for any number of
active shortcuts. Quick Play Reset restores the selected grid size's presets.
Homepage Reset restores only native panel/card visibility, placement, and
order. Stats Reset restores only the Stats visibility/order/state defaults.
The toolbar popup remains the default action. `sidepanel.html` reuses the same
HTML, CSS, JavaScript, storage model, and autosave queue at a responsive width.
The open-panel button is hidden in that surface. When the current browser
provides Chrome 141+'s `chrome.sidePanel.close()`, a compact `×` beside the
version badge closes the global panel for the current window. Opening happens
only from the popup click; the popup closes only after
`chrome.sidePanel.open()` succeeds. Missing methods leave their related action
hidden, and rejected calls keep the remaining UI usable with local fallback
feedback.

Stats defaults are summary order Games/Puzzles/Lessons with only Games visible,
and rating order Rapid/Blitz/Bullet/Daily/Puzzles/Live 960 with only Rapid and
Blitz visible. Every known rating row stores its own initial state, defaulting
to `Retracted`; `Expanded` is also available. Hidden rows retain that choice
while their selector is disabled. VINF applies the selected state once through
each visible native row's own button or current anchor-based chevron control,
then respects every later manual expansion or collapse. The redesigned rollout
does not provide an Insights row. VINF creates no replacement; if a legacy
cohort supplies the native row, it remains visible at the bottom. Known native
rows are moved/hidden rather than rebuilt. Unknown future rows are preserved.

Chess.com still offers the separate Diamond-only Insights product. Its
2026-01-27 Help Center article routes users through `Train` → `Insights`, and
2026 forum activity confirms the service still updates. The 2026-07-28 homepage
rollout removed only the Stats-card shortcut, so VINF must not interpret its
absence as a product shutdown or add a synthetic replacement.

Disabling VINF removes extension-owned UI and restores hidden/moved native nodes.
Profile defaults hidden with Main remembered. Daily Games defaults to the right
sidebar; Recommended Match and Game History default to their native main column.
All four can use Main, Right, or Hidden through the same
checkbox-plus-placement model. Every known managed card can be shown, hidden,
and reordered without rebuilding its content. Chess.com's redesigned combined
Streaks/League wrapper is reversibly separated into two native-content card
hosts so the two items remain independently configurable. Unknown cards are not
hidden or absorbed into this managed model.

### Phone Game Review

Version 2.0.0 begins VINF's in-game chapter with one focused responsive change.
On exact live-game review routes below 600 CSS pixels, entering Chess.com's
redesigned move-by-move view moves the existing native evaluation graph into
`#board-layout-main > #board-layout-analysis > #charts`. That native slot sits
after the lower player/clock row and before the Game Review sidebar toolbar in
the phone flow.

The controller recognizes only the exact semantic
`.sidebar-view-content > .move-by-move-container > .move-by-move-component`
state and its direct
`.move-by-move-bottom-section > .game-arc-component`. It moves the native graph
without cloning or rebuilding its Highcharts content. The initial overview
report, widths of 600 CSS pixels or more, non-live analysis routes, and all
homepage behavior remain unchanged. Original parent/sibling tracking restores
the graph on widening, VINF disable, route or state departure, and handles a
Chess.com rerender without leaving a duplicate graph.

### OLED appearance and game continuity

Version 2.1.0 adds an opt-in `OLED black` setting shared by the Chromium popup,
side panel, and Android dialog. Version 2.1.1 extends true black from the page
canvas to stable Chess.com chrome: the mobile toolbar, retractable navigation,
player rows, analysis/sidebar surfaces, and fixed review controls. It remains
scoped to exact homepage, live-game, and supported Game Review routes at
desktop, tablet, and phone widths, without recoloring the board or content
cards.

Desktop and Android delivery metadata also match Chess.com's native
`/play/online/new*` matchmaking bootstrap. VINF deliberately makes no visual
change there; matching the bootstrap keeps the runtime loaded when Chess.com
turns that same document into an exact live-game route through client-side
navigation, at which point the existing route poll applies OLED normally.

On `/home`, VINF shows one owned, configurable `Jump to open game` managed card.
It makes a same-origin read-only request to Chess.com's native presence service
using the signed-in UUID already present in the page bootstrap, then refreshes
on ordinary click or keyboard activation. A strictly validated `playing` RCN
game uses `/game/<numericId>`; legacy `live_chess` uses `/game/live/<id>`.
Exactly one current-user match and one game are required; RCN must have a live
Bullet/Blitz/Rapid time class. The resolved game takes first priority, followed
by an exact HTTPS Chess.com `/game/<numeric-id>` or legacy
`/game/live/<numeric-id>` anchor outside Game History. Game History deliberately
supplies the latest finished-game fallback. The card defaults last in Right on desktop
and therefore last in the single responsive column. It reuses the native URL
unchanged, including query parameters, and has the same Show/Hide, Main/Right,
and order controls as the other movable cards. Analysis and off-origin links,
daily-game presence entries, and malformed IDs are rejected. Presence data is
not logged or persisted, no ID is guessed, and no new host or browser permission
is used.

### Android tablet

Version 0.8 adds a separate Android delivery without replacing or repackaging
the desktop extension. The supported private-install path is Firefox for Android
plus Violentmonkey and the generated `dist-android/chesscom-vinf.user.js`.

The userscript reuses the desktop runtime, DOM controller, native launch
validation, time-control and Stats catalogs, renderer, and homepage CSS. Its
delivery shell adds only a Violentmonkey settings adapter and a touch-friendly
settings modal with the same Stats controls.
Open the modal through the `VINF settings` userscript command or the
`/home#vinf-settings` fallback.

In a semantic responsive/single-column DOM, nonzero Quick Play precedes the
movable Main-card group. The Main group and conceptual Right group each follow
the same saved managed-card order. Optional cards follow the same
placement/visibility settings as desktop. Legacy native actions,
Puzzles, Next Lesson, Game Review, and `#main-banner` remain hidden. The exact
`#homepage-toolbar` and all
`.promo-toolbar-user-info` variants are also hidden when present unless a
nonempty one is the Profile fallback, without targeting `#mobile-toolbar` or
generic responsive profile controls. In the redesigned `#home-header`,
`.header-hero` follows Profile Hidden/Main/Right and only the sibling play-grid
section follows Native play panel. The grid is two columns at tablet widths and
one column below 450px. ChessTV remains fully native on Android as well.

Read `docs/ANDROID.md` for current platform evidence, installation steps, live
tablet checks, and limitations.

## Time-Control Catalog

The popup offers a desktop-first union of 17 controls observed across current
Chess.com desktop and mobile clients. Exactly 0, 1, 2, 3, 4, 6, or 8 may be
active; zero intentionally selects none.

### Bullet

| ID | Label | Base seconds | Increment | Source |
| --- | --- | ---: | ---: | --- |
| `30s-0` | 30 sec | 30 | 0 | Desktop |
| `20s-1` | 20 sec + 1 | 20 | 1 | Desktop |
| `1-0` | 1 min | 60 | 0 | Both |
| `1-1` | 1 + 1 | 60 | 1 | Both |
| `2-1` | 2 + 1 | 120 | 1 | Both |

### Blitz

| ID | Label | Base seconds | Increment | Source |
| --- | --- | ---: | ---: | --- |
| `3-0` | 3 min | 180 | 0 | Both |
| `3-2` | 3 + 2 | 180 | 2 | Both |
| `5-0` | 5 min | 300 | 0 | Both |
| `5-2` | 5 + 2 | 300 | 2 | Mobile |
| `5-3` | 5 + 3 | 300 | 3 | Desktop |
| `5-5` | 5 + 5 | 300 | 5 | Mobile |

The popup and Android settings present one unified Blitz group ordered `3 min`,
`3 + 2`, `5 min`, `5 + 2`, `5 + 3`, `5 + 5`. Source-platform differences remain
catalog metadata only. In July 2026, desktop had consolidated the latter choices
into `5 + 3`, while the mobile client still exposed `5 + 2` and `5 + 5`. No
official Chess.com rollout notice was found, so retain the union rather than
claiming the platform difference is permanent.

Research context:

- `https://www.chess.com/terms/chess-time-controls`
- `https://www.chess.com/forum/view/livechess/blitz-5-3-phased-rollout`

### Rapid

| ID | Label | Base seconds | Increment | Source |
| --- | --- | ---: | ---: | --- |
| `10-0` | 10 min | 600 | 0 | Both |
| `10-5` | 10 + 5 | 600 | 5 | Both |
| `15-10` | 15 + 10 | 900 | 10 | Both |
| `20-0` | 20 min | 1200 | 0 | Both |
| `30-0` | 30 min | 1800 | 0 | Both |
| `60-0` | 60 min | 3600 | 0 | Both |

### Defaults

The shared per-count default map is:

    0: (none)
    1: 10-0
    2: 10-0, 15-10
    3: 10-0, 15-10, 3-2
    4: 10-0, 10-5, 15-10, 3-2
    6: 10-0, 10-5, 15-10, 30-0, 3-2, 5-3
    8: 10-0, 10-5, 15-10, 30-0, 1-1, 3-0, 3-2, 5-5

The six/eight arrays remain stored in column-first render order. Counts 1–4
render in their straightforward one-row order.

Changing the selected count does not apply those per-count Reset defaults.
Shrinking keeps the first controls that fit. Expanding preserves every current
selection, including intentional duplicates, then fills only the new slots with
the first IDs not already represented from:

    10-0, 10-5, 15-10, 30-0, 3-0, 3-2, 5-5, 1-1

The explicit Quick Play Reset action continues to use the per-count map above.

## Non-Negotiable Product Rules

1. Run homepage behavior only on the exact signed-in Chess.com `/home` or
   `/home/` route. Run the phone review enhancement only on exact HTTPS
   `/analysis/game/live/<game-id>/review` routes.

2. Leave the main Chess.com navigation intact except normal active-game phone
   toolbar hiding (2.4.0) and the opt-in Extreme OLED live-game presentation.

3. Render exactly the selected 0, 1, 2, 3, 4, 6, or 8 Quick Play controls.
   Repeated time controls are valid. Zero renders no Quick Play module.

4. Derive every launch from Chess.com's native immediate-match link. Never call
   a private matchmaking endpoint, copy credentials, inspect cookies, or invent
   a fallback route.

5. Preserve native action parameters and change only numeric `base` and
   `timeIncrement` values.

6. If the native launch template is missing or invalid, disable every shortcut.
   Fail closed.

7. Keep transformations idempotent and reversible. Chess.com dynamically
   replaces Vue-owned nodes and uses client-side navigation.

8. Move native modules rather than clone or rebuild them. Record original
   positions so cleanup can restore the page.

9. Keep Quick Play in the native main column and let Chess.com's existing layout
   position the sidebar. Do not introduce absolute positioning or a replacement
   page grid.

10. Keep the homepage controls minimal: no heading, subtitle, icons, visible
    status row, or extension advertisement.

11. Hide the optional `#main-banner` campaign by its exact ID while VINF is
    enabled, and restore it during cleanup.

12. Hide every empty exact `.promo-toolbar-user-info` compatibility variant;
    when neither exact modern nor legacy Profile landmark exists, a nonempty
    exact variant may serve as the Profile card. Never use account data or a
    generic profile landmark as the selector.

13. Treat the exact `#homepage-toolbar` that owns the visible desktop
    avatar/name/flag row as the legacy Profile card. Keep it in the DOM so
    signed-in detection still works; apply its Hidden/Main/Right setting and do
    not broadly target `#mobile-toolbar` or generic headers.

14. Treat the redesigned exact `#home-header .header-hero` profile strip as the
    current Profile card and apply its Hidden/Main/Right setting. Keep its
    sibling play-grid section hidden by default while preserving the native
    immediate-match link; show only that play panel when its explicit homepage
    setting is enabled.

15. Keep popup settings autosaving. Quick Play Reset is preset-only and Stats
    Reset is Stats-only.

16. Keep any native Insights row visible and last, but do not synthesize one
    when Chess.com omits it. Hide or reorder only positively recognized native
    Stats rows; preserve unknown future rows.

17. Do not add telemetry, analytics, ads, tracking, remote code, remote
    configuration, or extension-owned network requests beyond the documented
    same-origin current-user presence lookup at load and ordinary Open Game
    activation, with no background polling.

18. Never commit or package raw signed-in page captures, account identifiers,
    session markup, tokens, screenshots, or reference assets.

19. Do not broaden hosts, routes, or permissions without an explicit product
    decision.

20. Keep the toolbar popup as the default settings entry point. The optional
    persistent Side Panel UI must reuse the same packaged local settings page,
    open only from a user gesture, and degrade without affecting settings.

21. During move-by-move Game Review, move the native evaluation graph only below
    600 CSS pixels. Never change the initial report or tablet/desktop placement,
    and always restore the original native position during cleanup.

## Native Launch Contract

The saved homepage exposed a normal same-origin link shaped like:

    /play/online/new?action=createLiveChallenge&base=900&timeIncrement=10&rated=rated

`NativeLaunchAdapter` accepts a template only when:

- protocol is HTTPS;
- host is `chess.com` or `www.chess.com`;
- path is exactly `/play/online/new`;
- `action=createLiveChallenge`;
- `rated=rated`;
- existing `base` and `timeIncrement` are numeric.

It clones the URL, preserves Chess.com-owned parameters such as `source`, and
changes only:

    base=<TimeControl.baseSeconds>
    timeIncrement=<TimeControl.incrementSeconds>

The internal model intentionally stores base time as integer seconds. This is
required for `30 sec` and `20 sec + 1`; do not revert to decimal minutes.

Automated tests verify all 17 exact base/increment pairs. They do not start real
games. Live signed-in matchmaking checks remain human-controlled because each
click creates an external side effect.

## Homepage Detection and DOM Contracts

Every runtime guard requires:

- HTTPS;
- host `chess.com` or `www.chess.com`;
- exact pathname `/home` or `/home/`;
- `html.user-logged-in`.

The legacy contract additionally requires its signed-in profile landmark,
`.promo-component`, `#vue-instance.layout-column-one`, and
`#vue-sidebar-instance.layout-column-two`. The 2026-07-28 redesign removed the
old profile data attributes and uses exact `#home-header`,
`#home-main.layout-column-one`, a native immediate-match link, and Game History.
Its desktop right shell is either the previous
`#home-sidebar.layout-column-two` or the 2026-08-12
`#home-sidebar-container.layout-column-two` wrapper containing
`#home-sidebar > .sidebar-component`. VINF recognizes only a complete legacy or
redesigned contract; it does not weaken the fail-closed route guard.

Important locators:

- redesigned native header: exact `#home-header`; its `.header-hero` is the
  configurable Profile card, and its sibling `.cc-section` containing
  `.header-play-header-grid` is the separately configurable native play panel;
- recurring top campaign: exact optional `#main-banner`; never campaign text,
  `data-name`, assets, or generated classes;
- Profile: an existing VINF `profile` marker, redesigned exact
  `#home-header > .header-component > .header-hero`, legacy exact optional
  `#homepage-toolbar`, then a nonempty exact `.promo-toolbar-user-info`
  fallback. The legacy `.toolbar-user-info[data-cy="profile-section"]`
  descendant remains the signed-in guard landmark;
- empty/extra promo user strips: all other exact optional
  `.promo-toolbar-user-info` instances; never username, member URL, avatar,
  flag, or generic profile selectors;
- native action stack: legacy `.play-quick-links-component` promoted to its
  direct promo child, or the redesigned `.cc-section` containing
  `.header-play-header-grid` inside exact `#home-header`;
- native launch template: link containing `action=createLiveChallenge` inside
  that action stack;
- Puzzles/Next Lesson/Game Review: exact English `.promo-title` within a direct
  promo child;
- Game History: `.game-history-games-component`, promoted to the direct legacy
  wrapper or used as the redesigned direct `.main-section`;
- Daily Games: direct left-column child containing `/play/online/daily`, with
  `.current-games-header-list` and the earlier
  `.home-current-games-loading-view-toggle-container` as desktop
  pre-hydration fallbacks;
- redesigned main/sidebar hosts: `#home-main > .main-component` and
  `#home-sidebar > .sidebar-component`; the latter is under either the previous
  direct `#home-sidebar.layout-column-two` shell or the current outer
  `#home-sidebar-container.layout-column-two` shell;
- redesigned Stats: direct sidebar card containing `/stats/<member>` or
  `.stat-item-stats-section`;
- redesigned Daily Puzzle: direct sidebar section containing
  `.daily-puzzle-wrap`, `.daily-puzzle-content`, or `.daily-puzzle-preview`;
- redesigned Streaks: `.streak-badge-sidebar-wrapper`;
- redesigned Legend League: `.badge-component`, `#league-badge-sidebar`, or a
  sidebar `/leagues/` link;
- redesigned Friends: direct sidebar section containing `.friends-content` or
  the `/friends` destination;
- Stats: direct sidebar child containing `/stats/overview/`;
- Stats summary rows: direct `li.sidebar-ratings-item` children of direct
  `ul.sidebar-ratings-general`, recognized by exact descendant text node Games,
  Puzzles, or Lessons;
- Stats rating rows: direct `.stat-section-stats-section` legacy children or
  `.stat-item-stats-section` redesigned children, recognized by exact native
  label text or a semantic Stats path;
- responsive Stats rating cards: direct `.stats-mobile-card` links inside
  `.stats-mobile-content`, recognized primarily by semantic Stats paths, with
  `/play/online/daily` for Daily;
- Stats expansion controls: legacy direct `button.stat-section-button`, or a
  redesigned direct `.cc-aside-item-component` anchor/button containing a
  `.cc-aside-item-chevron` native arrow glyph;
- optional legacy Insights: rating-shaped row containing a link beginning
  `/insights/`, with an exact-label fallback; preserved visibly and appended
  last if present;
- ChessTV: player/iframe/close-button landmark, with `/tv` link fallback;
- Legend League: `#league-badge-sidebar`, promoted to its direct sidebar child.

Read `DOM_AUDIT.md` before changing selectors. Exact English promo titles are a
known locale sensitivity. If Chess.com changes its DOM, update the audit and the
small sanitized fixture together; never patch around uncertainty with broad
generated-class or position-only selectors.

## Dynamic Page Lifecycle

Desktop and Android both start at `document-start`. `runtime.ts`:

- attaches observation immediately, before complete homepage landmarks exist;
- loads local settings and never transforms with guessed defaults while storage
  is pending;
- observes `.base-container`, falling back to `main`, `[role=main]`, `body`, or
  `document.documentElement`;
- reconciles immediately until the first valid homepage layout is available,
  then leading-throttles child/subtree mutations at 60ms instead of postponing
  work until mutations stop;
- checks URL/root replacement every 750ms for SPA navigation and detached roots;
- listens for `popstate`, `hashchange`, and local settings changes;
- cleans up before applying changed settings.

`LayoutController` owns all hide/move/create/restore behavior. Namespaced
`data-chesscom-vinf-*` markers make transformations inspectable and reversible.
Repeated reconciliation must never duplicate Quick Play or reorder already
correct modules unnecessarily. The saved managed-card sequence is filtered
independently into the visible movable Main prefix and Right prefix; Quick Play
remains above the Main prefix. Quick Play/main-column work occurs before sidebar
ordering and Stats normalization in the same synchronous reconcile; the browser
normally paints that as one update rather than three visible phases.
An already-correct Stats card is a strict DOM no-op: descendant expansion
mutations must not cause row re-appends. Unlabeled rating-shaped expansion
content is not part of managed ordering and remains where Chess.com inserts it.
Once desktop sidebar placement is active, the document carries
`data-chesscom-vinf-daily-placement="sidebar"`. CSS immediately hides any late
direct left-column child containing `/play/online/daily` or the native
`.current-games-header-list` or
`.home-current-games-loading-view-toggle-container`. Those are the successive
pre-hydration Daily shells observed in 2026-07-27 reload recordings before the
anchor exists. The module locator recognizes the same structures so the wrapper
can move early. Quick Play stays anchored to Game History when available; if
its final component class has not hydrated yet, Quick Play anchors before the
first direct `.home-container-component` instead of appending below loading
cards. Cleanup and `Main column` placement remove the marker.

Version 0.15 replaces the separate TV/League document flags with the
space-separated `data-chesscom-vinf-sidebar-hidden` marker. After local settings
load, the runtime pre-arms this marker even while `/home` landmarks are
incomplete, then re-arms it after any provisional controller cleanup. Exact
desktop `:has(...)` rules cover the audited Stats, TV, Daily Puzzle, Friends,
Streaks, and League landmarks until element-level hidden markers take over.
Daily Games retains its separate placement marker.

Version 0.16 adds an independent
`data-chesscom-vinf-recommended-placement="sidebar|hidden"` marker. Exact CSS
pre-hides the redesigned direct main-column challenge-tile card before
reconciliation when it belongs in Right or Hidden. The controller moves the
original native card, forces its internal wrapper to one column at sidebar
width, and restores it exactly on Main or cleanup. A saved zero-button choice
skips panel creation and removes any existing owned Quick Play panel.

After stored settings load, the runtime also sets
`data-chesscom-vinf-active="true"` on the exact enabled `/home` document before
complete homepage landmarks are required. Namespaced CSS uses that stable
ancestor to pre-hide unmanaged exact native Profile candidates,
`#main-banner`, empty `.promo-toolbar-user-info`, and `.promo-component`
replacements. Once the controller identifies and marks the Profile node, its
Hidden/Main/Right setting takes over. Within the redesigned `#home-header`, only
the sibling play-grid section follows
`data-chesscom-vinf-native-play-panel="visible"`. This closes a
roughly three-frame native promo repaint found by reviewing the 2026-07-27 12:51
recording at 60fps. Element-level markers remain for inspection and cleanup; the
document marker disappears immediately on disable or route departure.

## Settings and Migration

The only storage key is:

    vinfSettings

Stored shape:

```ts
interface ExtensionSettings {
  enabled: boolean;
  oledMode: boolean;
  oledButtonColors: boolean;
  extremeOled: boolean;
  showNativePlayPanel: boolean;
  profilePlacement: "main" | "sidebar" | "hidden";
  profileVisiblePlacement: "main" | "sidebar";
  dailyGamesPlacement: "main" | "sidebar" | "hidden";
  dailyGamesVisiblePlacement: "main" | "sidebar";
  recommendedMatchPlacement: "main" | "sidebar" | "hidden";
  recommendedMatchVisiblePlacement: "main" | "sidebar";
  gameHistoryPlacement: "main" | "sidebar" | "hidden";
  gameHistoryVisiblePlacement: "main" | "sidebar";
  openGamePlacement: "main" | "sidebar" | "hidden";
  openGameVisiblePlacement: "main" | "sidebar";
  homepageSidebarOrder: HomepageSidebarCardId[]; // shared Main/Right order; all eleven IDs exactly once
  homepageSidebarVisible: HomepageSidebarCardId[]; // visible known cards
  quickPlayPresetCount: 0 | 1 | 2 | 3 | 4 | 6 | 8;
  timeControlIds: TimeControlId[]; // exactly the selected count; repeats valid
  statsSummaryOrder: StatsSummaryId[]; // all three IDs exactly once
  statsSummaryVisible: StatsSummaryId[]; // zero to three known IDs
  statsRatingOrder: StatsRatingId[]; // all six IDs exactly once
  statsRatingVisible: StatsRatingId[]; // zero to six known IDs
  statsRatingStates: Record<
    StatsRatingId,
    "expanded" | "retracted"
  >;
}
```

Defaults are enabled, OLED black off, OLED button colors off, the native play panel hidden, Profile hidden with Main
remembered, every other known card visible except the two separately Main-placed
cards, Daily Games shown in the sidebar with its remembered visible placement
also set to sidebar, Recommended Match and Game History shown in Main with their
remembered visible placements set to Main, six-button mode, and the original
six IDs documented above. The default managed card order is Profile, Stats,
ChessTV, Daily Games, Recommended Match, Game History, Streaks, Legend League,
Daily Puzzle, Friends. Stats defaults are
Games only plus Rapid/Blitz, in the fixed orders described in Current User
Experience, with all six rating-state values initially retracted.
`normalizeSettings` is the persistence boundary; old saved objects infer
their button count from any complete valid 1/2/3/4/6/8-ID array and automatically
gain all Stats defaults. Existing valid six- and eight-ID arrays therefore keep
their previous modes. Zero requires an explicit saved count so an old missing or
empty preset array cannot accidentally disable Quick Play. A complete 1.0.6
nine-card order receives Profile first without changing any existing relative
order. A complete older eight-card order additionally receives Game History
immediately after Recommended Match. A complete older seven-card order receives
Recommended Match after Daily Games and Game History immediately after it. The retired
global `statsDefaultState` value is copied to all six per-rating entries during
migration.

Preserve these migrations:

- old `reorderGameHistory` becomes `dailyGamesPlacement`;
- retired `moveDailyGamesToSidebar` becomes `dailyGamesPlacement`;
- `dailyGamesVisiblePlacement` falls back to the current visible placement, or
  Right when migrating an already-hidden card;
- missing Recommended Match settings default to visible Main; its remembered
  location follows any valid visible placement;
- missing Game History settings default to visible Main; its remembered
  location follows any valid visible placement;
- missing Profile settings default to Hidden with Main remembered;
- a complete previous nine-card order gains Profile first without changing the
  relative order of its existing cards;
- a complete previous eight-card order gains Profile first and Game History immediately after
  Recommended Match without changing the relative order of existing cards;
- a complete retired seven-card order gains Profile first, Recommended Match
  immediately after Daily Games, and Game History immediately after Recommended
  Match without changing the relative order of existing cards;
- retired `showChessTv` and `showLegendLeague` seed the corresponding new card
  visibility entries when the new visibility array is absent;
- retired `15-0` becomes `20-0`.
- retired global `statsDefaultState` becomes the fallback for every missing
  `statsRatingStates` entry.

Invalid or incorrectly sized preset arrays fall back to the complete default
set for the selected grid size instead of rendering a partial grid. Repeated
valid preset IDs are preserved. Interactive count changes are separate from
normalization: they truncate the leading list when shrinking and use the shared
expansion fallback sequence only for newly added slots.
Incomplete/invalid Stats order arrays fall back to their complete defaults.
Visibility arrays filter unknown and duplicate IDs; an empty array is valid.

## Architecture and File Map

    AGENTS.md                         Short mandatory agent instructions
    README.md                         User/developer overview
    docs/HANDOFF.md               Canonical current-state project memory
    docs/FINAL_PRODUCT_SPEC.md        Original full spec plus version amendments
    docs/DOM_AUDIT.md                 Verified selectors and launch contract
    docs/ANDROID.md                   Android platform, install, and test guide
    docs/PRODUCT_BRIEF.md              Historical initial requirements
    docs/PRIVACY.md                    Current privacy and data-handling policy
    docs/RELEASE_CHECKLIST.md          Automated, visual, and live gates
    public/manifest.json               MV3 permissions, matches, and version
    src/content/content-script.ts      Runtime lifecycle and settings listener
    src/content/game-continuation.ts   Exact native game links and owned homepage card
    src/content/game-review-layout-controller.ts  Phone-only native review-graph placement
    src/content/homepage-detector.ts   Exact signed-in homepage guard
    src/content/module-locator.ts      Semantic/native module discovery
    src/content/layout-controller.ts   Idempotent hide/move/order/cleanup logic
    src/content/stats-controller.ts    Native Stats recognition/order/visibility
    src/content/quick-play-renderer.ts Configurable Quick Play UI and interaction states
    src/content/launch-adapter.ts       Validated native URL derivation
    src/content/content.css             Homepage layout and category styling
    src/popup/                          Shared popup/side-panel autosaving UI
    src/userscript/                     Android userscript entry and modal CSS
    src/shared/models.ts                Settings/time-control types
    src/shared/homepage-cards.ts        Known sidebar card catalog and defaults
    src/shared/settings.ts              Normalization, migration, local storage
    src/shared/stats.ts                 Stats row catalogs and defaults
    src/shared/time-controls.ts         17-control catalog and per-count defaults
    tests/fixtures/homepage.html        Small sanitized DOM fixture
    tests/fixtures/homepage-modern.html Redesigned desktop regression fixture
    tests/fixtures/homepage-responsive.html  Responsive semantic fixture
    tests/fixtures/game-review-narrow.html  Sanitized phone Game Review fixture
    tests/visual/                       Local full-page visual harness
    scripts/build.mjs                   Production dist builder
    scripts/build-android.mjs           Android userscript builder
    scripts/package.mjs                 Root-manifest release ZIP builder
    dist/                               Generated unpacked extension
    dist-android/                       Generated Android userscript
    release/                            Generated versioned ZIPs

## Privacy and Fixture Safety

The manifest has only the `storage` and `sidePanel` permissions. `storage`
persists local preferences; `sidePanel` displays the same packaged settings UI
in Chromium's persistent panel and grants no page/account access. The manifest
has no host permission entry; the content script itself is narrowly matched to
`https://www.chess.com/home*`, exact live-game paths, and the live-game `/review`
path shape.

The extension stores only:

- enabled state;
- OLED-black appearance;
- native play-panel visibility;
- Profile visibility and remembered Main/Right placement;
- Daily Games placement;
- Daily Games' remembered Main/Right location while hidden;
- known homepage sidebar card order and visibility;
- selected Quick Play button count and its matching preset IDs;
- Stats summary/rating order and visibility IDs;
- six per-rating initial `expanded` or `retracted` preferences.

It stores no username, UUID, rating, games, credentials, cookies, tokens, page
HTML, or analytics. When Open Game is enabled, it makes a read-only same-origin
presence request at homepage load and ordinary shortcut activation using the
current UUID already embedded by Chess.com; neither
the UUID nor the response is persisted or logged.

The Android userscript grants only `GM_getValue`, `GM_setValue`,
`GM_addValueChangeListener`, and `GM_registerMenuCommand`. It has no remote-code,
cross-origin request, or update grant. Its presentation settings remain in
Violentmonkey's local storage and do not sync with Chrome/Brave.

`fixtures/raw/` may contain private complete signed-in captures and is ignored
except for its README. Never copy a raw capture into tests, `dist`, release ZIPs,
documentation, or conversation output. Extract only the smallest required DOM,
sanitize it, and place it in `tests/fixtures/`. `tests/privacy.test.ts` guards the
fixture and manifest boundaries.

## Development and Verification

Requirements: Node.js 20+ and pnpm.

From the project directory:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm build:android
```

As of version 2.3.3, the suite has 166 passing tests across eighteen files and
covers the homepage plus focused phone Game Review behavior. Important coverage
includes:

- OLED background/button setting normalization, autosave, route scoping, and cleanup;
- native matchmaking bootstrap-to-live-game route transition behavior;
- current-user UUID extraction, strict presence-response validation, and
  cross-device active-game precedence over Game History (the RCN fixture is
  based on a real response; legacy cases remain synthetic);
- activation-time freshness, request deduplication, four-second timeout, and
  cancellation on disable/hide/route departure;
- exact current/legacy/alternate native game URL recognition, card idempotence/removal, and
  late evidence outside the main observer root;

- exact Game Review route variants and sub-600px guards;
- native evaluation-graph movement, idempotence, rerender replacement, and
  restoration on disable or viewport change;
- proof that the initial report and tablet/desktop widths remain untouched;

- exact legacy/redesigned signed-in homepage detection and route rejection;
- semantic module location and missing optional modules;
- idempotent layout, cleanup, native restoration, and shared Main/Right
  managed-card order;
- all 17 launch base/increment mappings;
- every supported 0/1/2/3/4/6/8 shortcut count and mixed
  Bullet/Blitz/Rapid sets;
- launch de-duplication, timeout recovery, and fail-closed behavior;
- settings defaults, migration, normalization, autosave, and repeated Quick
  Play selections, including preserve/truncate/fill behavior across count
  changes on desktop and Android;
- Stats defaults, custom order/visibility, scoped resets, cleanup restoration,
  unknown-row preservation, optional legacy Insights placement, and
  expansion-safe idempotence across desktop rows and the responsive native
  `.stats-mobile-card` grid;
- independent one-time native initial expansion or retraction for every visible
  known rating row, preserving later manual state changes;
- dynamic content replacement, route departure, and settings changes;
- Profile, Daily Games, Recommended Match, and Game History visibility with remembered
  Main/Right placement plus visibility and fixed ordering for all eleven known
  managed cards on desktop and responsive layouts, including custom ordering
  within Main, early hidden-card pre-arming, and retired
  nine-/eight-/seven-card-order migration;
- late and pre-hydration Daily Games insertion with a pre-armed native-slot
  marker, both native loading-shell fallbacks, and Quick Play-first loading
  placement even before Game History receives its final component class;
- fixture and manifest privacy boundaries;
- responsive semantic detection/location, reversible single-column order, and
  mutation reconciliation without desktop column IDs;
- optional and dynamically replaced `#main-banner` campaign hiding plus cleanup;
- multiple optional and dynamically replaced `.promo-toolbar-user-info`
  instances handled as empty compatibility strips or an exact nonempty Profile
  fallback, without account-specific selectors;
- exact legacy `#homepage-toolbar` and redesigned `.header-hero` Profile
  Hidden/Main/Right placement, ordering, and cleanup while the signed-in
  descendant remains available to the page guard;
- redesigned `#home-header`, column-host, Game History, Stats, Daily Puzzle,
  Streaks, League, Friends, ChessTV, and unknown-card compatibility without
  mistaking history or native-panel analysis links for standalone Game Review;
- proof that VINF leaves the native ChessTV iframe source, permissions, hidden
  state, loading, autoplay, and playback untouched;
- legacy button-based, redesigned link-only, and redesigned anchor/chevron
  expandable Stats schema handling, plus non-expandable mobile Stats cards;
- enabled-document pre-hiding of exact native toolbar/hero/banner/promo
  replacements before delayed mutation reconciliation;
- document-start observation, settings-load gating, and landmarks arriving after
  runtime startup;
- popup-to-side-panel opening with the current browser window, plus the narrow
  `storage`/`sidePanel` manifest boundary;
- successful and rejected in-panel close behavior using the same browser
  window.

### Local visual harness

Build first, then run:

```sh
pnpm visual
```

Useful routes:

    http://127.0.0.1:4173/home
    http://127.0.0.1:4173/home?preset-count=0
    http://127.0.0.1:4173/home?preset-count=1
    http://127.0.0.1:4173/home?preset-count=4
    http://127.0.0.1:4173/home?eight-preview=1
    http://127.0.0.1:4173/home?union-preview=1
    http://127.0.0.1:4173/home?pre-hydration=1
    http://127.0.0.1:4173/home?native-panel=1
    http://127.0.0.1:4173/home?sidebar-preview=1
    http://127.0.0.1:4173/home-online-tv
    http://127.0.0.1:4173/home-responsive
    http://127.0.0.1:4173/home-mobile-stats
    http://127.0.0.1:4173/home-modern
    http://127.0.0.1:4173/home-modern?recommended-right=1
    http://127.0.0.1:4173/home-modern?recommended-hidden=1
    http://127.0.0.1:4173/home-modern?main-order-preview=1
    http://127.0.0.1:4173/home-modern?preset-count=0
    http://127.0.0.1:4173/home-narrow-preview
    http://127.0.0.1:4173/home-phone-preview
    http://127.0.0.1:4173/popup-preview
    http://127.0.0.1:4173/popup-narrow-preview
    http://127.0.0.1:4173/popup
    http://127.0.0.1:4173/sidepanel-preview
    http://127.0.0.1:4173/sidepanel.html
    http://127.0.0.1:4173/game-review-mobile
    http://127.0.0.1:4173/game-review-phone-preview

`union-preview=1` renders Bullet, mobile Blitz, and Rapid examples without
starting a game. At the 1600px verification viewport, Quick Play and Game History
were both 728px wide. Version 0.9.0 was visually checked at desktop, extension
popup, and responsive fixture sizes with no browser-console errors. The legacy
desktop Stats fixture rendered Games, Rapid, Blitz, and Insights in that order;
the current redesigned fixture has no Insights row. The popup's Stats controls
were readable and scrollable at 420×600. The shared settings surface must also
be checked at the 360×780 side-panel preview.

### Brave/Chrome unpacked testing

Load the generated `dist/` directory—not the ZIP—in
`brave://extensions` or `chrome://extensions` with Developer Mode and `Load
unpacked`. After rebuilding, press the extension card's Reload button and refresh
Chess.com. A ZIP must be extracted before it can be loaded unpacked.

Do not programmatically start a live matchmaking game during automated or visual
QA. The live checklist belongs to the user in their signed-in browser.

### Android userscript testing

Run `pnpm build:android`, then install
`dist-android/chesscom-vinf.user.js` in Violentmonkey on Firefox for Android.
Detailed local-paste and local-network install methods are in `docs/ANDROID.md`.
The real tablet DOM and live clocks require human-controlled signed-in
testing; automated tests use only a sanitized responsive fixture.

The user's last successful tablet update path was:

    cd /path/to/chesscom-vinf
    python3 -m http.server 4174 --directory dist-android

Then open this in tablet Firefox while both devices are on the same LAN:

    http://<MAC_LAN_IP>:4174/chesscom-vinf.user.js

The LAN IP may change after reconnecting or DHCP renewal; preserve port `4174`
and the userscript filename, but substitute the Mac's current LAN address when
needed.

## Release Procedure

Use VINF's product-era versioning:

- `1.0.0` identifies the completed homepage-only generation;
- the first implemented in-game enhancement begins the next chapter at
  `2.0.0`, without waiting for the complete planned in-game feature set;
- within a product chapter, increment the middle number for each subsequent
  feature release and the final number for bug-fix releases;
- a new major identifies a new VINF product surface or chapter and does not
  require a backward-incompatible change.

Every internal behavior or UI change receives a version bump immediately so the
popup, manifest, and locally loaded unpacked build identify the exact code under
test. For internal development, rebuild `dist/` and `dist-android/`, but do not
create or update Chrome Web Store packages, convenience submission archives,
Store copy, Store screenshots, Git tags, GitHub releases, or pushes.

Only when the user explicitly says that the current version should be prepared
for the Chrome Web Store:

1. Update `package.json` and `public/manifest.json` together.
2. Update the popup's visible version badge.
3. Update this handoff and relevant specification/audit/checklist docs.
4. Run typecheck, all tests, and production build.
5. Perform proportional visual QA through the local harness.
6. Run `pnpm package`.
7. Inspect the ZIP; `manifest.json` must be at its root.
8. Run the privacy scan and confirm no raw fixtures, captures, source maps, or
   account data are included.

Push prepared source changes to `main` when the user asks. The public repository
is source history, not an alternative distribution channel: do not create Git
tags or GitHub Releases unless the user separately and explicitly requests
them.

For Android, also run `pnpm build:android`, inspect the userscript metadata, and
confirm it contains only the four documented local GM grants and no remote
dependency or request directive.

Latest explicitly prepared Store artifact:

    release/chesscom-vinf-2.2.0.zip

SHA-256:

    c2155f2b879bea3baa6409644ba9ddd6825226e82c2043fbffcaacb337e268bc

Android artifact:

    dist-android/chesscom-vinf.user.js

Store submission wrapper archives are retired by user instruction (2026-09-19).
All seven existing `*-store-submission.zip` files were deleted. Future explicit
Store preparation must produce only `release/chesscom-vinf-<version>.zip`, whose
root contains `manifest.json`. Never generate a wrapper ZIP containing the
extension ZIP, listing copy, screenshots, or other handoff materials. Existing
listing assets remain separate; a stale screenshot version badge does not
justify regenerating it. This packaging-policy cleanup changes no extension
behavior or version; source and current uploadable package remain 2.2.2.

The project is an independent public Git repository:

    https://github.com/matejbolta/chesscom-vinf

The complete signed-in Chess.com capture and the original account-specific
reference image remain local under `fixtures/raw/` and are intentionally ignored.
Only `fixtures/raw/README.md` may be committed from that directory.

Public-safe Chrome Web Store copy and synthetic graphic assets live under
`store-listing/`. The public privacy-policy URL is:

    https://github.com/matejbolta/chesscom-vinf/blob/main/docs/PRIVACY.md

Version 1.0.8 is the published Chrome Web Store build verified on 2026-09-18.
`store-listing/SUBMISSION.md` contains the complete
field-by-field 2.2.0 update record using copy-safe fenced text blocks instead
of Markdown blockquotes. The refreshed settings screenshot is public-safe and
shows version 2.2.0; the two homepage screenshots and promo artwork remain
unchanged.

`store-listing/UPDATE_TLDR.md` is the preferred dashboard workflow for each
update. Treat its minimal 0.17.2-to-0.17.3 structure as the canonical template:
name the package to upload, list only dashboard fields or assets that actually
need changing, include copy-ready replacement text only when required, then
point to `SUBMISSION.md` for the full reference. Do not pad it with unchanged
fields, hashes, validation history, release narration, or a condensed replay of
the complete submission process.

The obsolete `v0.15.4` tag and GitHub Release were removed on 2026-07-30 because
Chrome Web Store is the distribution channel. Version 0.17.2 source commit
`beb4163` and version 0.17.3 source commit `fb454d6` are published on `main`.
Version 0.17.3 fixes only narrow toolbar-popup layout and is not tagged or
released on GitHub. Its local `dist/`, `dist-android/`, Store ZIP, and
convenience submission archive are rebuilt and validated. The local release
directory remains ignored by Git.

Version `1.0.0` is the homepage milestone declaring the existing homepage
generation complete. It intentionally changed no homepage behavior. The first
actual in-game enhancement must be versioned `2.0.0`, followed by `2.x.0`
feature increments and `2.x.y` bug-fix increments.

Version `1.0.1` restores the
desktop contract after Chess.com wrapped `#home-sidebar` in
`#home-sidebar-container.layout-column-two`, and caps the toolbar popup at its
intended 390px width after Chromium's intrinsic sizing expanded it to roughly
800px.

Version `1.0.2` moves that width
contract to the popup document root after live Chromium testing showed that a
body-only width still left a wide blank viewport. The persistent side panel
remains fluid.

Version `1.0.3` hides the temporary
toolbar popup's visible scrollbar and reserved gutter without disabling wheel,
trackpad, keyboard, or programmatic scrolling; the persistent side panel keeps
native scrollbar behavior.

Version `1.0.4` explicitly fixes both
the root and body of the toolbar popup at 390px after live Chromium showed that
a percentage body width could collapse the scrollbar-free action surface toward
its minimum content width. Both remain fluid in side-panel mode.

Version `1.0.5` separates the current
redesigned `#home-header` children: the `.header-hero` username strip is always
hidden while VINF is active, while only the sibling section containing
`.header-play-header-grid` follows Native play panel. The redundant explanatory
sentence under that setting was removed on desktop and Android.

Version `1.0.6` excludes the current
play panel's own Game Review tile from standalone Game Review fallback, making
Native play panel functional while keeping the sibling profile strip hidden.
It also makes ChessTV explicitly click-to-load with autoplay denied, removes
the redundant Homepage heading/helper row, and moves Homepage Reset beside
Enable VINF on desktop and Android.

Version `1.0.7` superseded 1.0.6's
ChessTV decision by removing every loading/autoplay intervention and leaving the
native player untouched. It also turns the legacy `#homepage-toolbar` and
redesigned `.header-hero` into one managed Profile card with Show/Hide,
Main/Right placement, remembered location, and shared ordering on desktop and
Android. Existing nine-/eight-/seven-card orders migrate without reshuffling
their previous relative order. The existing `0.17.3` Store artifact remains
the latest prepared package.

Version `1.0.8` fixes a cross-device Chromium/Brave toolbar-popup collapse.
The popup establishes its intrinsic 390px root/body width before JavaScript
marks the settings surface, without using a `100vw` cap that can resolve
against an initially tiny popup viewport. The separately marked persistent
side panel remains fluid at the browser-provided width. It is the current
Store-prepared version, with updated public-safe listing copy and settings
screenshot; its source is pushed only as part of this explicit release task.

Version `2.0.0` begins the in-game product chapter. At phone widths only, the
native evaluation graph moves directly below the board while the redesigned
move-by-move Game Review view is active. The initial report, tablet, and desktop
layouts stay native. The source version and internal desktop/Android builds are
updated, while 1.0.8 remains the latest explicitly Store-prepared package.

Version `2.1.0` adds the opt-in OLED-black page canvas on supported homepage,
live-game, and review routes, plus a responsive homepage continuation card that
reuses an exact native live-game link. The feature adds one local boolean but no
network call, game record, host permission, or Store package; 1.0.8 remains the
latest explicitly Store-prepared package.

Version `2.1.1` fixes the continuation false positive caused by completed
Game History `/game/live/<id>` links, replaces the in-flow card with a
dismissible floating `Jump to open game` action, and extends OLED black to
stable navigation/player/sidebar/control chrome. The current live Android
Game Review screenshot also reports that the evaluation graph remains at the
bottom; the 2026-09-10 saved DOM still passes the existing selector contract,
so a fresh complete saved move-by-move page is required before changing that
selector without guessing. No Store package is prepared.

Version `2.1.2` replaces active-state inference and the floating prompt with a
normal configurable `Jump to open game` managed card. It defaults last in Right
on desktop and last in the shared single phone column, accepts current
`/game/<numeric-id>` and legacy `/game/live/<numeric-id>` links, and deliberately
uses Game History as a finished-game fallback. The same current live-game route
coverage fixes OLED injection. Android settings now show the source version.
The fresh 2026-09-18 narrow saved page verifies that Chess.com removed
`move-by-move-redesign`; VINF now keys on the stable semantic parent hierarchy
while retaining the direct graph child and below-600px guards. No Store package
is prepared.

Version `2.1.3` makes the continuation card a full-width centered link target,
adds the observed `/live/game/<numeric-id>` route and non-`live` Game Review
route to OLED coverage, and OLED-styles the native post-game result shell and
secondary stat/action surfaces. Runtime route checks remain exact; manifest
and userscript patterns are broader only where the platform requires it. No
Store package is prepared.

Version `2.2.0` adds an independent saved `OLED button colors` switch to the
desktop and Android settings. It applies near-black Quick Play and Open Game
surfaces, `#ededed` labels, and restrained accent/interaction states without
changing control geometry or requiring OLED page black. It is the current
Store-prepared version; the published Chrome Web Store version remains 1.0.8
until the prepared package is submitted and approved.

Version `2.2.1` fixes OLED not activating in games launched through Chess.com's
native `/play/online/new*` matchmaking bootstrap. Desktop and Android metadata
now load VINF on that exact same-origin prefix; the bootstrap itself remains
untouched, and the existing 750 ms route check applies OLED only after the URL
becomes an exact supported live-game route. The continuation selector also now
prefers an exact game link outside Game History regardless of DOM order, while
retaining the first history link as the finished-game fallback. Based on a
saved homepage lacking a cross-device active-game link, 2.2.1 added a one-shot
same-origin presence query. Its tests assumed the older `live_chess` source;
that assumption rejected real RCN games and did not fix cross-device discovery.
Version 2.2.2 below supersedes that claim. The UUID, response, and game URL
remain in memory only. This adds no new host, permission, credential access,
or stored-game capability. OLED mode
also covers Chess.com's separate live-game move-navigation tray on narrow
layouts: the tray is black and its five direct secondary controls use
near-black surfaces with `#ededed` glyphs, without changing native geometry or
disabled behavior. Version 2.2.0 remains the latest Store-prepared package; no
2.2.1 Store package has been prepared.

Before every push, run the full test suite. `tests/privacy.test.ts` rejects
absolute home paths, literal private LAN addresses, email addresses,
secret-shaped credentials, and weakened raw-capture ignore rules.

## Version 2.2.2 Cross-Device Investigation and Outcome

On 2026-09-19 the user reproduced a mobile live game opening the desktop's
finished-game fallback. Investigation and repair used only this repository,
its ignored first-party captures, and read-only desktop homepage diagnostics.
No game was started, moved, resigned, or otherwise manipulated by the agent.

Verified evidence:

- Installed Brave extension was enabled at 2.2.1, and DevTools Sources contained
  the new resolver. Source and both local builds also contained it. A controlled
  homepage reload showed the request initiated by `content-script.js`, HTTP 200.
- The exact UUID extraction expression found the correct `context.user.uuid` on
  the current homepage. Page-world and isolated-world requests both succeeded;
  no CSP, credential, redirect, or fetch-binding failure was observed.
- Before the mobile game, presence returned one matching user with activity
  `none`. During the user-started ten-minute mobile game it returned `playing`
  with one `rcn` game, a numeric `numericId`, UUID `id`, `timeclass: "rapid"`,
  and `variant: "chess"`. Version 2.2.1 rejected it solely because it required
  `source === "live_chess"`. Its initial result also stayed cached when a game
  began after the homepage loaded.
- Current navigation package `2026.9.4/navigation.js` maps `live_chess` to
  `/game/live/<id>`, other native presence games to `/game/<id>`, and prefers
  `numericId`. This code supports presence game links in user navigation/popovers;
  it does not establish a dedicated own-game resume endpoint. See `DOM_AUDIT.md`
  for the exact asset URL and sanitized structural evidence.

The shared resolver now accepts the observed RCN format with explicit live time
classes and uses the native current route. Legacy live games remain supported.
Ambiguous users/games, daily games, unknown sources, and invalid IDs fail closed.
The ordinary click/keyboard handler refreshes presence, shares in-flight work,
rejects redirects, bypasses cached responses, and aborts after four seconds.
It navigates only if the route/settings generation is still current; failure
uses the current native-link/history fallback. No recurring requests are added.
No OLED CSS, geometry, card customization, host permission, or persisted data
changed. Modifier/middle/context-menu actions retain native anchor behavior and
the most recently resolved destination.

Validation status:

- Minimal sanitized real-response regression fixture:
  `tests/fixtures/presence-rcn-playing.json`; every account/game identifier is
  synthetic. Tests cover the observed source/mapping and stale-homepage sequence,
  history fallback, malformed/ambiguous evidence, deduplication, timeout,
  disable/hide/departure, and reconciliation retaining the resolved target.
- Strict TypeScript, all 137 tests (17 files), desktop build, Android build, and
  `git diff --check` pass. The `pnpm` launcher could not switch to the pinned
  version because registry access failed; the same scripts were run directly
  using installed TypeScript/Vitest and `node scripts/build*.mjs`. No dependency
  or package-manager metadata was changed.
- Brave was reloaded to 2.2.2. Read-only DOM inspection proved the single card's
  target equaled the active mobile game's numeric ID and retained the label.
  The user then clicked it and confirmed **it opened the ongoing game**. The
  opponent subsequently resigned. This is actual cross-device desktop evidence,
  not a mocked-test claim.
- The installed Android artifact could not be inspected. The regenerated
  `dist-android/chesscom-vinf.user.js` is 2.2.2 and shares the fixed runtime; its
  Firefox/Violentmonkey device test is still required. Install it, open the
  homepage before another device starts a game, activate the shortcut during
  that game, then check newest-finished-game fallback after it ends.

Work remains local. Source/build version is 2.2.2; 2.2.0 remains the last
Store-prepared package. No Git fetch/push, upload, remote synchronization, tag,
release, or Store packaging was performed. Existing local commits were retained.

## Manual Live Checklist Still Outstanding

Before any public release beyond private use, a human in a signed-in browser
should verify:

1. Load `dist/` unpacked in current Brave and Chrome.
2. Start one real match for each currently selected control in the active grid
   and verify the supported button counts as needed.
3. Confirm every resulting clock exactly matches its button.
4. Confirm popup settings, including Stats visibility/order and independent
   per-rating initial states, survive popup close/reopen and browser restart.
5. Confirm extension disable/enable restores and reapplies the native page.
6. Confirm Profile, Daily Games, Recommended Match, and Game History Show/Hide
   and Main/Right placement plus every known managed card's visibility/order
   apply within both columns without a reload.
7. Confirm Recommended Match in Main, Right, and Hidden. At sidebar width its
   native challenge tile must use one column.
8. Confirm Game History in Main, Right, and Hidden; when Right, verify native
   history rows and links remain usable.
9. Confirm Profile in Main, Right, and Hidden, with its native link still usable.
10. Confirm ChessTV retains native loading/autoplay behavior when shown.
11. Confirm refresh, SPA departure/return, and narrow-window behavior.
12. Confirm Game History, Stats, navigation, and every enabled optional card
   remain usable.
13. Install the Android userscript in current Firefox/Violentmonkey and verify
   portrait, landscape, settings persistence, SPA return, and disable/restore.
14. On the Android phone, enter move-by-move Game Review and confirm the native
   evaluation graph appears below the lower player/clock and above the review
   toolbar. Confirm the initial report and tablet layout remain unchanged, graph
   taps work, and widening or disabling VINF restores the native placement.

Do not mark these complete based only on fixtures or URL-construction tests.

## Product Scar Tissue

These decisions came from repeated live visual review. Do not accidentally
reverse them while “cleaning up” code:

- The name is VINF, not WINF.
- The Game Review promo card is intentionally removed from the homepage; the
  version 2 phone review-page enhancement is a separate product surface.
- The Quick Play title and `Choose time control` subtitle were intentionally
  removed for minimalism.
- Visible `Starting…`/failure rows were intentionally removed because they caused
  alarming red text and layout movement.
- Buttons intentionally show only the time, not `Play`.
- Clock icons were intentionally removed.
- Quick Play intentionally matches the full Game History width and aligns left.
- The complete sidebar intentionally starts alongside Quick Play.
- The default managed card order is intentionally Profile, Stats, ChessTV,
  Daily Games, Recommended Match, Game History, Streaks, Legend League, Daily
  Puzzle, Friends, Open Game Shortcut. Every known card has explicit presentation settings. Profile,
  Daily Games, Recommended Match, Game History, and Open Game Shortcut use the same checkbox plus a
  Main/Right selector that preserves location while hidden. Profile intentionally
  defaults hidden with Main remembered; Recommended Match and Game History
  intentionally default visible in Main. The one saved sequence applies
  independently within Main and Right; Quick Play remains pinned above Main.
- The right-column label is intentionally `ChessTV`, not `ChessTV & events`.
  Separate event banners are different native homepage modules even when
  Chess.com's own settings group both features under one toggle.
- ChessTV is intentionally native. Do not remove or replace its iframe source,
  change its permission policy or hidden state, add click-to-load UI, or impose
  any loading/autoplay/playback restriction. Its card setting controls only
  presentation and order.
- A late or pre-hydration native Daily Games row must never flash above or shift
  Quick Play; both native loading-shell fallbacks and the temporary left-slot
  CSS guard are intentional.
- A hydrated native Play/Puzzles/Next Lesson/Game Review promo row must never
  flash above Quick Play. Keep the enabled-document active marker and exact
  pre-hide selectors unless newer frame-by-frame evidence replaces them.
- The category colors went through several iterations; avoid pale green and
  muddy orange-brown. Preserve current Rapid green and Bullet amber/brown. Blitz
  was deliberately moved from muted ochre toward the native lightning-bolt
  yellow in version 0.13. Versions 0.13.2–0.13.3 established the sampled native
  bolt color as `#ead762`, but alpha blending it into the gray canvas remained
  too milky. Version 0.13.4 keeps the sampled hue in a chroma-preserving OKLCH
  palette: `oklch(54% 0.085 100)` surface, `oklch(58% 0.09 100)` hover, and
  `oklch(70% 0.11 100)` edge. Do not recreate a dark yellow by lowering HSL
  lightness or by blending the pale source into gray; those approaches produced
  ochre and milky results respectively.
- Counts 1–4 intentionally use one full-width desktop row with equal columns.
  Six-button mode uses two rows of three. Eight-button mode keeps the same gap
  and total Game History width while using two rows of four.
- Zero is an intentional first-class count that removes the complete Quick Play
  module; do not render an empty panel or infer zero from missing legacy data.
- Desktop and Android preset editors intentionally mirror those positions,
  including the established column-first numbering for six and eight.
- The narrow desktop toolbar popup intentionally keeps the same preset-editor
  columns as the selected homepage grid. Do not reintroduce a generic two-column
  media-query fallback. Switch tracks are non-shrinking so wrapped setting copy
  cannot squeeze or visually break their controls.
- Repeated Quick Play presets are intentional. Never disable a valid choice
  merely because another active shortcut already uses it.
- Changing the Quick Play count intentionally preserves the leading existing
  choices. Shrinking truncates; expanding fills only new slots from
  `10`, `10+5`, `15+10`, `30`, `3`, `3+2`, `5+5`, `1+1`, skipping controls
  already represented. Do not restore the old whole-layout replacement
  behavior.
- Rapid popup order is intentionally `10`, `10+5`, `15+10`, `20`, `30`, `60`.
- Desktop and Android settings intentionally share one Blitz group ordered
  `3`, `3+2`, `5`, `5+2`, `5+3`, `5+5`; do not recreate a mobile subgroup.
- There is intentionally no Save button in the popup.
- Stats intentionally defaults to Games, retracted Rapid, and retracted Blitz.
  The current homepage omits Insights; VINF does not recreate it. An optional
  native legacy Insights row is not configurable and always remains last.
- Unknown future Stats rows must remain visible; never hide unrecognized native
  rows.
- Native Stats expand/retract must remain functional. Never re-append an
  already-correct row after descendant expansion mutations.
- Every visible known rating row intentionally applies its saved
  Expanded/Retracted state only once per native row instance; the row marker
  must prevent mutation
  reconciliation from undoing a later manual action.
- Main-column work intentionally precedes sidebar/Stats work inside one
  synchronous reconcile. Do not split it into separately painted stages.
- The recurring `#main-banner` campaign is intentionally hidden without a
  separate setting; disabling VINF restores it.
- The visible desktop avatar/name/flag strip is `#homepage-toolbar`; together
  with redesigned `.header-hero`, it is the configurable Profile card. Never
  target `#mobile-toolbar` or generic headers.
- Empty `.promo-toolbar-user-info` compatibility variants remain hidden; the
  class is not assumed unique. A nonempty exact variant is only a Profile
  fallback when neither primary Profile landmark exists.
- The redesigned homepage is a separate explicit contract: `#home-header`,
  `#home-main > .main-component`, and `#home-sidebar > .sidebar-component`.
  The right host may receive its desktop-column identity directly from
  `#home-sidebar.layout-column-two` or through the current outer
  `#home-sidebar-container.layout-column-two`; preserve both generations and
  the legacy homepage for A/B cohorts and rollbacks.
- Redesigned Game History contains `/analysis/game/...` links. Always exclude
  the located history card from Game Review path fallback.
- Redesigned Stats rows may be link-only or natively expandable anchor rows.
  Apply visibility/order in both cases, and apply initial state only when an
  explicit native chevron control exists. Never synthesize chevrons, graphs, or
  expansion content.

## Known Limitations and Risks

- Chess.com can change its Vue structure, semantic classes, or native launch
  link at any time.
- Campaign content is intentionally ignored; if Chess.com changes the
  `#main-banner` landmark itself, the exact selector will need a new live audit.
- If Chess.com renames `#homepage-toolbar`, `#home-header`, or
  `.promo-toolbar-user-info`,
  re-audit the exact semantic modules; do not replace them with account-specific
  or broad profile selectors.
- Private complete-page captures and sanitized desktop fixtures cover the
  2026-07-16 legacy shell, 2026-07-28 redesign, 2026-07-29 native Recommended
  Match card, and 2026-08-12 nested redesigned sidebar shell.
- Promo-card detection uses exact English titles and may not work in other
  locales.
- Known Stats row recognition uses semantic paths where available, including
  the native mobile card grid. Exact English native labels remain fallbacks, so
  a pathless non-English Stats rollout may require a sanitized audit update.
- The popup catalog is intentionally static. Reading native controls dynamically
  would require additional active-tab communication/permissions and still would
  not solve mobile/desktop rollout differences.
- The `5+3` consolidation was observed but not confirmed through an official
  Chess.com product announcement.
- ChessTV has online/offline DOM variants; preserve both player and link
  detection.
- Missing native launch evidence disables shortcuts by design. Availability is
  more important than guessing.
- Chrome Android does not support this extension delivery; the supported tablet
  route is Firefox Android plus Violentmonkey.
- The responsive DOM contract is tested with a sanitized semantic fixture, not
  a private signed-in Android capture. A Chess.com experiment or locale variant
  may need a small sanitized locator update after live tablet testing.
- The Game Review DOM was captured from a signed-in desktop browser narrowed to
  Chess.com's phone layout. Real Firefox-for-Android phone verification remains
  outstanding.
- The continuation card depends on Chess.com's undocumented same-origin
  presence response retaining `activity`, `activityContext.games`, `source`,
  `timeclass`, and `numericId`. Unknown sources, multiple games, and malformed
  state fail closed to the first eligible rendered link. Re-audit changes; do
  not add speculative fields or sources. Ordinary activation refreshes the
  lookup, while modified/middle/context-menu navigation uses the last resolved
  native anchor destination. A four-second service timeout uses the fallback.
- Desktop cross-device activation is user-verified for 2.2.2. Actual Android
  2.2.2 installation, fetch behavior, and activation remain to be verified.
- Android settings are intentionally separate from desktop extension settings.
- Generated `dist/` and `release/` are ignored; rebuilding can replace them.
- Generated `dist-android/` is ignored and can be replaced by `build:android`.

## Debugging Playbook

### Extension does nothing on Chess.com

Check:

- URL is exactly `/home` or `/home/`;
- page is signed in and has `html.user-logged-in`;
- the unpacked extension was reloaded after build;
- the page was refreshed after extension reload;
- popup `Enable VINF` persisted as checked;
- either the complete legacy profile/promo/column contract or complete
  redesigned header/main-column contract still exists.

### Quick Play appears but every button is disabled

The native launch template was not found or failed validation. Inspect only the
native action column and compare it with `DOM_AUDIT.md`. Do not add an invented
route fallback.

### Quick Play panel duplicates or modules jump repeatedly

Check mutation-triggered reconciliation, namespaced markers, and original
position tracking. Repeated `reconcile` calls must preserve one owned panel and
an already-correct sidebar prefix.

### A managed card is missing or ordered incorrectly

Check the card's semantic locator in `DOM_AUDIT.md` and its saved position in
`homepageSidebarOrder`. Despite its compatibility name, that stored sequence is
shared by Main and Right. For ChessTV, check both online player landmarks and the
`/tv` fallback because the online card may show a streamer name instead of
`Live on ChessTV`. For Streaks or Legend League, also inspect the shared native
badges wrapper and the reversible VINF-owned card hosts. For Recommended Match,
check the challenge-tile landmark and whether its own placement marker says
`sidebar` or `hidden`. For Game History, check the native history component or
archive landmark and `data-chesscom-vinf-game-history-placement`; after moving
Right, the card must retain its VINF module marker so later reconciliations can
find it.

### Stats order or visibility is wrong

Confirm the Stats card still has either legacy direct
`ul.sidebar-ratings-general` summary rows and `.stat-section-stats-section`
rating wrappers, or redesigned direct `.cc-aside-item-component` summaries and
`.stat-item-stats-section` ratings, or responsive `.stats-mobile-content` with
direct `.stats-mobile-card` links matching `DOM_AUDIT.md`. Known rows should
carry `stats-summary-*` or `stats-rating-*` hidden reasons when disabled. Any
native Insights row must remain unmarked and last. Do not hide an unknown row
to make the card look tidy; capture the smallest sanitized new structure and
update the catalog/audit deliberately.

### The Profile card is missing or in the wrong column

First confirm the popup and `brave://extensions` card show the current source
version; otherwise Brave is reloading a stale unpacked directory. The selected
native node must carry `data-chesscom-vinf-module="profile"`; Hidden adds
`data-chesscom-vinf-hidden="profile"`, while Main/Right moves that exact node
into the selected managed prefix. Prefer redesigned `.header-hero`, then legacy
`#homepage-toolbar`; only a nonempty exact `.promo-toolbar-user-info` can be the
fallback. Empty extras carry `promo-user-info`. Do not replace these exact
selectors with a broad or account-specific profile selector.

### Popup choice resets after closing

All changes should immediately call the serialized `saveSettings` queue. Confirm
the extension has the `storage` permission, `vinfSettings` is written, and the
popup was loaded from the rebuilt extension rather than a stale unpacked build.

### A selected control starts the wrong clock

Treat this as a critical mapping bug. Verify its single catalog entry,
`baseSeconds`, increment, rendered ID, and launch-adapter test. Never fix the
visible label independently of the catalog.

### A native section disappears permanently after disabling VINF

Treat this as a cleanup/original-position bug. Native nodes must be moved, not
cloned, and every extension marker/move must be reversible.

## If You Are a Future Agent

Before editing:

1. Read `AGENTS.md` and this handoff completely.
2. Read `DOM_AUDIT.md` for selector/launch work, `PRIVACY.md` for data or
   permission work, and the relevant final-spec amendments for product history.
3. Inspect the current files and preserve user changes. Do not assume Git exists.
4. Treat the product rules and scar tissue above as current unless the user
   explicitly supersedes them.
5. Keep labels, IDs, base seconds, increments, accessible names, and launch tests
   sourced from the single catalog.
6. Add or update tests for every behavior change.
7. Use the local visual harness for layout, popup, or color changes.
8. Never start a real game without explicit user-controlled live testing.
9. Run typecheck, tests, and build before handoff.
10. Keep package, manifest, popup badge, userscript metadata, docs, and release
    artifacts aligned.
11. Update this handoff after any material change.

The product should feel as if Chess.com itself had chosen a calmer, more useful
homepage: native behavior, less noise, immediate clocks, and no surprises.


## 2.6.2 — Settings labels and desktop shortcut guide (2026-09-28)

- Desktop popup/side panel and Android settings say `Extreme OLED mode (in-game)`.
- Desktop-only static help sits below OLED settings. It explains existing O/E/T/Esc
  behavior and native X/Z/arrows/Alt, mouse annotations, and F/B novelty effects.
  No gameplay behavior or keyboard handlers changed.
- Native shortcuts verified against Chess.com's help:
  https://support.chess.com/en/articles/8609263-what-chat-commands-can-i-use-in-game-chat
- Hold B confirmed by Chess.com's staff announcement:
  https://www.chess.com/news/view/announcing-new-chessboxing-feature
- F directly verified on signed-out https://www.chess.com/analysis in the in-app
  browser: pressing F displayed the yellow fist animation. No real game involved.
  Native availability varies by surface; Courses-only shortcuts intentionally omitted.
- Android receives only the label change, not the desktop help.
- Verification: typecheck, all 175 tests, desktop build, and Android build passed.
  Updated existing label/order assertions. Local popup fixture visually checked
  in the in-app browser (390px settings column in the default 1280px layout):
  label fits, guide wraps and scrolls, no console errors. Native F separately
  observed on public Analysis; Android label covered by userscript test/build,
  not a new Firefox Android device check. No push or Store artifacts.

## 2.6.3 — Compact shortcut help

User requested only O/E/T (Escape inline with E), then X/Z/F/B/Alt, followed
by the color-modifier sentence. Removed other prose, arrow keys, and UI links;
research references remain in the 2.6.2 record above. No keyboard or touch
drawing behavior changed. Native touch annotation reuse remains unverified;
the current independent overlay was chosen to isolate drawing from piece input,
not because native integration was proven impossible.

Verification: typecheck, 175 tests, desktop and Android builds passed. Local
390px popup column visually checked in IAB: guide now about 424px tall instead
of 834px; requested order and wrapping confirmed, no console errors.
