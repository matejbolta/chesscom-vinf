# ChessComVINF DOM Audit

Audit date: 2026-09-10
Source: private complete-page captures in `fixtures/raw/2026-07-16/` and
the reduced/all-cards 2026-07-28, Recommended Match 2026-07-29, and complete
2026-08-12 homepage captures, plus narrow before-move and in-move Game Review
captures and a narrow responsive homepage Stats capture from 2026-09-10 under
`fixtures/raw/`, plus
user-provided live Inspector samples of the recurring campaign banner and exact
homepage toolbar hierarchy
Observed locale and variants: signed-in English legacy, redesigned desktop, and
responsive mobile-card homepages, plus signed-in English live-game review in a
desktop window narrow enough to activate Chess.com's phone layout
Responsive coverage: sanitized homepage and Game Review fixtures; live signed-in
Android capture was unavailable in this session

## Desktop Best move control — 2026-10-01 (2.8.5)

Actual signed-in Brave desktop Game Review, native Analysis package 2026.9.8:
`.move-by-move-coach-section .flow-buttons-component` contains Explain / Best /
Next native buttons. Best has no aria-label; its child SVG has
`data-glyph="circle-fill-star"`, and its label span is `.flow-buttons-label`.
Scope the icon lookup to this coach flow group; do not select arbitrary star
buttons or depend on the English label. The narrow footer uses the previously
recorded `.game-controls-view-component button[aria-label="Best"]` variant.
The desktop button disappears when showing the best variation. Keep visibility
and enabled guards, and do nothing when absent. This corrects 2.8.0's unverified
assumption that the narrow selector also covered desktop.

Sanitized contract: `tests/fixtures/review-desktop-controls.html`. Live B on 2.8.5
reproduced native Best click behavior; B with the button absent was a no-op.
No live match was altered. Internal classes/glyphs remain subject to site changes.

## Live last-move notation — 2026-10-02 (2.9.0)

Existing private desktop game-result capture (2026-09-18) contains
wc-simple-move-list[board-id="board-single"] with .main-line-row direct child
.node.main-line-ply[data-node="0-N"], white-move/black-move classes, and SAN in
.node-highlight-content. Timestamps are separate siblings. Read highest main-line
index, never selected node or CSS order. Native saved board 1.187.1 source also
renders figurine piece letters in data-figurine; textContent alone would lose N.
Sanitized contract: tests/fixtures/live-last-move.html. Unknown notation/renderer
fails closed to no label. No fresh private live-game DOM was inspected while the
user played. Runtime caches and invalidates only on this list's mutations or
replacement, retaining existing observer/timer behavior.

## Route and homepage guard

- Verified URL: `https://www.chess.com/home`
- Verified metadata: `og:url` is `https://www.chess.com/home`.
- Signed-in marker: `html.user-logged-in`.
- Legacy profile landmark: `[data-cy="profile-section"]` containing a home
  profile action (`[data-page="home"][data-button="profile"]`).
- Legacy dashboard landmarks: `.promo-component`,
  `#vue-instance.layout-column-one`, and
  `#vue-sidebar-instance.layout-column-two`.
- Redesigned dashboard landmarks: exact `#home-header`,
  `#home-main.layout-column-one`, a native immediate-match link, and Game
  History. Either the previous `#home-sidebar.layout-column-two` shell or the
  current `#home-sidebar-container.layout-column-two` wrapper around
  `#home-sidebar` upgrades the page to the redesigned two-column desktop
  contract when present.
- The redesigned shell no longer exposes the old `data-cy` profile landmark.
  Its guard therefore combines the exact signed-in root class, route, shell,
  native launch evidence, and Game History rather than guessing a replacement
  profile selector.
- The desktop guard requires the exact `/home` pathname and one complete
  legacy or redesigned landmark set.
- The responsive guard keeps the same protocol, host, route, signed-in marker,
  and profile requirements, then requires a native launch link, a main content
  host, and at least one of Game History, Daily Games, or Stats.

## Phone Game Review contract

- Verified route shapes:
  `https://www.chess.com/analysis/game/live/<game-id>/review?move=<ply>` and
  `https://www.chess.com/analysis/game/<game-id>/review?move=<ply>`.
- VINF accepts only HTTPS, `chess.com` or `www.chess.com`, and the exact pathname
  shapes above with an optional trailing slash and numeric game ID.
- The page must retain `html.user-logged-in`; signed-out public analysis views
  remain untouched.
- The phone enhancement is width-gated at `max-width: 599px`; it does not run on
  tablet or desktop widths.
- The move-review state is the exact semantic descendant
  `.sidebar-view-content > .move-by-move-container > .move-by-move-component`.
  Chess.com's 2026-09-18 capture no longer includes the former
  `move-by-move-redesign` class. Its native
  `.move-by-move-bottom-section > .game-arc-component` owns the evaluation graph.
- The initial report instead owns its graph through
  `.overview-view-section.overview-view-arc`; VINF deliberately leaves that
  state untouched.
- The board's native post-player chart slot is exact
  `#board-layout-main > #board-layout-analysis > #charts`. VINF moves the native
  `.game-arc-component` into that slot, preserving its Highcharts subtree and
  event handlers rather than recreating the graph.
- Namespaced graph/host markers make the placement idempotent and allow the
  original parent/sibling position to be restored on widening, disable, route
  departure, or state change. Mutation reconciliation replaces a stale moved
  graph if Chess.com rerenders the move-review subtree.

## Live-game continuity and OLED contracts

- OLED mode is presentation-only and is scoped by the runtime to exact HTTPS
  Chess.com `/home`, current `/game/<numeric-id>`, legacy
  `/game/live/<numeric-id>`, alternate `/live/game/<numeric-id>`, and both
  observed Game Review route forms.
- Extension and userscript metadata also match the exact native matchmaking
  bootstrap prefix `/play/online/new*`. VINF makes no visual change there; the
  existing route poll keeps the already-loaded runtime alive when Chess.com
  replaces that URL with an exact live-game route without replacing the page.
- The homepage continuation detector accepts only an already-rendered anchor
  whose parsed URL is HTTPS, uses `chess.com` or `www.chess.com`, and has the
  exact pathname `/game/<numeric-id>`, `/game/live/<numeric-id>`, or
  `/live/game/<numeric-id>` with an optional trailing slash.
- The first exact link outside `.game-history-games-component` wins regardless
  of document order; this is compatible native navigation evidence, not by
  itself proof of active state. The first
  exact link inside Game History remains the latest-finished-game fallback when
  no active-game link is rendered.
- On the inspected homepage, there was no exact cross-device game anchor.
  VINF reads the signed-in UUID from the inline `context.user` bootstrap and
  requests `/service/presence/users?ids=<uuid>` on the same origin.
- The 2026-09-19 live audit confirmed the UUID matches `window.context.user.uuid`,
  the installed 2.2.1 content script executes this request, and both page-world
  and Chromium isolated-world requests succeed without redirect (HTTP 200).
  No-game presence returned `activity: "none"`. During a user-started mobile
  rapid game, the matching user returned `activity: "playing"`, with one game
  containing `id` (UUID), `numericId` (number), `variant: "chess"`,
  `timeclass: "rapid"`, and **`source: "rcn"`**. The old `live_chess`-only check
  was the direct rejection cause, not a missing UUID or blocked endpoint.
- Current first-party [navigation.js](https://www.chess.com/r2/client-packages/navigation/2026.9.4/navigation.js)
  chooses `web_game_live` for `live_chess`, otherwise `web_game_uuid`, preferring
  `numericId` over `id`. Its route table maps those to `/game/live/<id>` and
  `/game/<id>` respectively. This is presence-to-game-link code used by native
  user navigation/popovers, not proof of a dedicated own-game resume API.
- Version 2.2.2 accepts RCN only with a positive numeric ID and a live time class
  (Bullet/Blitz/Rapid), retains legacy support, and requires one matching user
  and one game. Unknown sources, daily games, ambiguity, or malformed IDs fail
  closed. The committed `tests/fixtures/presence-rcn-playing.json` retains only
  these observed structural facts, replacing all user/game identifiers.
- The initial lookup is supplemented by an awaited refresh on ordinary click
  or keyboard activation: the audit also demonstrated a homepage loaded before
  the game retained the earlier result. Concurrent activations share a request;
  no background polling is added. Requests use `cache: "no-store"`, reject
  redirects, and abort after four seconds. Disable/hide/departure invalidates
  pending navigation. Modified/middle/context-menu navigation remains native
  and uses the last resolved anchor URL.
- The built 2.2.2 desktop card matched the actual active mobile game's numeric
  ID, retained its exact label, and existed only once. The user clicked it and
  confirmed it opened that ongoing game before the opponent resigned.
  Android uses the same runtime, but its installed version, fetch isolation,
  and real-device activation remain unverified in this audit.
- Analysis/history links such as `/analysis/game/live/<game-id>` are rejected.
  Query parameters on a valid native live-game URL are preserved unchanged.
- VINF creates one owned full-width `Jump to open game` managed card and removes
  it when no exact native game link exists. It defaults last in Right on desktop
  and therefore last in the shared single-column order on narrow layouts.
  The runtime also compares this semantic link during its existing 750ms
  route/root check so late evidence outside the observed content root is not
  missed.
- A validated presence result is the only active-versus-finished claim. Native
  links outside Game History remain compatible evidence; Game History itself is
  only the deliberate fallback.

OLED black explicitly covers the page canvas, `#mobile-toolbar`,
`#sidebar-main-menu.sidebar-container`, player rows, board analysis/sidebar
surfaces, fixed Game Review controls, and both observed live-game move-control
containers (`.game-buttons-container-component` and
`.game-buttons-container-mobile`). Their direct `.cc-button-secondary` controls
use near-black surfaces with off-white glyphs while retaining Chess.com's
native disabled state. Boards and content cards keep their native surfaces.

## Top dashboard

### Redesigned home hero

The redesigned native header is the exact `section#home-header` inside
`.layout-hero`. Its `.header-component` now contains two distinct direct
children: `.header-hero` is the avatar/username/flag strip, while the
`.cc-section` containing `.header-play-header-grid` is the large native play
and recommendations panel. The immediate-match control lives under
`.play-online-quick-links-component`; the safe launch-link contract is
unchanged.

VINF treats the exact `.header-hero` as the native Profile card. It is hidden by
default, but its card setting can move the original node into Main or Right and
place it according to the shared managed-card order. The `Native play panel`
setting controls only the sibling `.cc-section` containing the play grid and
native launch link. It is hidden by default without deleting that link; setting
`data-chesscom-vinf-native-play-panel="visible"` restores it.

### Homepage toolbar

The legacy visible avatar, username, and country-flag row is the exact
`header#homepage-toolbar`. Its child `.toolbar-user-info` carries
`data-cy="profile-section"`. This exact header is the legacy Profile card. VINF
moves the original node for Main/Right placement or marks it
`data-chesscom-vinf-hidden="profile"` while hidden; it is never cloned or
removed. The signed-in landmark remains queryable in every state.

The 2026-07-26 live Inspector sample corrected versions 0.8.2 and 0.8.3: those
versions targeted a separate `.promo-toolbar-user-info` node, but that node was
empty while `#homepage-toolbar` remained visible. Version 0.8.4 uses the exact
marked header ID. Cleanup restores the header, and mutation reconciliation hides
a replaced header.

### Recurring campaign banner

The dismissible top campaign is the optional `#main-banner`, observed as a
direct child of `.base-container` before `.promo-component`. Its campaign
metadata and creative content change (for example streak promotions), so VINF
uses only the exact stable ID and never matches `data-name`, banner copy, image
URLs, or generated classes.

When VINF is enabled, the controller marks `#main-banner` with
`data-chesscom-vinf-hidden="main-banner"`. It does not remove the native node.
Cleanup removes the marker, restoring the banner if VINF is disabled or the page
leaves `/home`. The mutation observer reapplies the marker when Chess.com inserts
or replaces the banner after initial reconciliation.

### Empty promo toolbar user-info variant

The live hierarchy also contains a separate optional
`.promo-toolbar-user-info` direct child between `#main-banner` and
`.promo-component`. In the marked production sample it is empty and is not the
visible avatar/name row.

Version 0.8.2 assumed this class was unique. Live verification still showed the
desktop row, so version 0.8.3 removed that uniqueness assumption. Current VINF
hides every empty exact instance as `promo-user-info`. Only when neither primary
Profile landmark exists may the first nonempty exact instance become the
managed Profile card. Nodes stay in the DOM, cleanup removes every marker, and
mutation reconciliation handles replacements without account-specific text.

### Native promo row

The four native cards are direct children of `.promo-component`.

| Module | Primary locator | Guard/fallback |
| --- | --- | --- |
| Native action stack | `.play-quick-links-component` then closest direct `.promo-column` | Must contain the verified immediate-match link. |
| Profile-adjacent league summary | Native action column link whose pathname begins `/leagues/` | Hidden with its parent action column. |
| Puzzles | Direct promo child with exact `.promo-title` text `Puzzles` | Also has the named `.promo-puzzles` icon class. |
| Next Lesson | Direct promo child with exact `.promo-title` text `Next Lesson` | Also contains a `/lessons/` link. |
| Game Review | Direct promo child with exact `.promo-title` text `Game Review` | Also contains an `/analysis/game/` link; hidden in v0.3. |

The extension hides all four native promo columns with namespaced attributes. In
version 0.5, it moves the one owned Quick Play panel into
`#vue-instance.layout-column-one` before the first visible native module, then
hides the emptied `.promo-component`. The verified native launch link remains in
that hidden DOM, so launch URL derivation is unchanged. The bare configurable grid
has no heading, subtitle, branding mark, icon, or Game Review card.

A frame-by-frame review of the 2026-07-27 12:51 reload recording showed that
Chess.com can replace and fully paint the native promo row for roughly three
frames after VINF has already created Quick Play. Version 0.10.0 therefore marks
the exact enabled `/home` document with
`data-chesscom-vinf-active="true"` immediately after stored settings load.
Namespaced CSS pre-hides exact `#homepage-toolbar`, `#main-banner`,
`.promo-toolbar-user-info`, and `.promo-component` replacements before the
60ms mutation reconciliation adds element-level markers. The document marker is
removed as soon as VINF is disabled or the route is no longer `/home`.

The current 2026-07-27 13:32:45 desktop recording was then inspected across all
176 source frames at 60fps. The pre-hide remains effective: the native promo row
does not repaint, Daily Games is already in the sidebar at first VINF paint, and
Quick Play keeps the same position throughout. The remaining visible changes
are native hydration below or beside that stable area: Game History briefly
replaces its skeleton before populated rows arrive, and the ChessTV iframe
paints its own white/black loading frames. Version 0.11.0 deliberately does not
add synthetic placeholders or clone native content for those isolated changes.

The redesigned page replaces this four-column promo row with `#home-header`.
The old selectors remain supported for users who are still served the legacy
homepage or an A/B rollback. Game Review path fallback now explicitly excludes
the located Game History card because redesigned history rows themselves link
to `/analysis/game/...`.

## Main content columns

| Module | Primary locator | Node moved |
| --- | --- | --- |
| Quick Play | Extension-owned `[data-chesscom-vinf-owned="quick-play"]` | Inserted into legacy `#vue-instance` or redesigned `#home-main > .main-component` before the first visible native main section |
| Profile | Existing VINF `profile` marker, redesigned `#home-header > .header-component > .header-hero`, legacy `#homepage-toolbar`, or a nonempty exact `.promo-toolbar-user-info` compatibility fallback | Original native profile strip moved to Main or Right, or hidden intact |
| Daily Games | Direct child of `#vue-instance` containing a `/play/online/daily` link; namespaced marker after moving/hiding | `.home-container-component` wrapper moved to the sidebar, restored to main, or hidden intact |
| Recommended Match | Redesigned main-column card containing `.play-online-section-body .challenge-tile-component`, excluding the native `#home-header` action panel; namespaced marker after moving/hiding | Direct `#home-main > .main-component` child moved to the sidebar, restored to main, or hidden intact |
| Game History | `.game-history-games-component` in either main-column host | Legacy `.home-container-component` wrapper or the redesigned direct `.main-section` card |
| Daily Puzzle | `.daily-puzzle-wrap`, `.daily-puzzle-content`, or `.daily-puzzle-preview` | Direct redesigned `.cc-section` sidebar child |
| Streaks | `.streak-badge-sidebar-wrapper` | Native streak subtree, moved intact into a reversible VINF card host |
| Legend League | `#league-badge-sidebar`, `.badge-component`, or a sidebar `/leagues/` link | Legacy direct card or native redesigned badge subtree |
| Friends | `.friends-content` or `/friends` link | Direct redesigned `.cc-section` sidebar child |
| ChessTV | `.tv-player-component`, `.tv-player-iframe`, or `.tv-player-sidebar-close-button`; `/tv` link fallback | Direct `.cc-section` child, optionally hidden intact |
| Stats | Direct sidebar section containing legacy `/stats/overview/...`, redesigned `/stats/<member>`, or native Stats row classes | Direct `.cc-section` child |

Original nodes are moved, not cloned. The controller records their original
parent/sibling positions for route cleanup.

Quick Play fills the same `728px` observed desktop column as Game History. The
native `.layout-component` continues to own both columns, so the `300px` sidebar
starts on the same row as Quick Play without absolute positioning or a replacement
page grid. A `2.4rem` gap separates Quick Play from the first native left module.
When the saved count is zero, the controller removes every extension-owned
Quick Play panel and leaves the native main-card sequence as the column start.

The default managed card order is Profile, Stats, ChessTV, Daily Games,
Recommended Match, Game History, Streaks, Legend League, Daily Puzzle, Friends,
then Open Game Shortcut. All eleven known positions are orderable. The controller filters that one
saved sequence per column: visible movable cards assigned to Main form the
managed prefix below Quick Play, while cards assigned to Right form the managed
sidebar prefix. Every card has independent Show/Hide; Profile, Daily Games,
Recommended Match, Game History, and Open Game Shortcut additionally retain their Main/Right
placement while hidden. Profile defaults hidden with Main remembered;
Recommended Match and Game History default visible in Main. Unknown native
cards are preserved visibly after the managed cards in their native column.

The 2026-07-29 capture confirms that Recommended Match is a native direct
main-column section rather than part of the large `#home-header` panel. Its
generic card heading includes a dynamic count, so VINF does not depend on title
copy or that count. The stable structural contract is a challenge tile inside
`.play-online-section-body`, promoted to the direct
`#home-main > .main-component` child. When moved into the desktop sidebar, VINF
keeps the native node and forces `.play-online-wrapper` to one column because
Chess.com's viewport media query would otherwise retain its two-column
main-card layout inside the 300px sidebar.

The redesigned page nests Streaks, a divider, and Legend League inside one
`.badges-component`. To provide independent visibility and ordering, VINF moves
the two native subtrees—without cloning—into two extension-owned
`.badges-component.sidebar-section` hosts. The source wrapper is hidden only
when no unmanaged content remains. Cleanup restores both subtrees around their
original divider, removes the owned hosts, and restores every direct card's
original parent/sibling position.

Version 0.9.3 marks the document with
`data-chesscom-vinf-daily-placement="sidebar"` as soon as the active desktop
layout is established. Narrowly scoped CSS temporarily hides a direct
`#vue-instance.layout-column-one` child containing either the exact
`/play/online/daily` destination, the native `.current-games-header-list`, or
the earlier `.home-current-games-loading-view-toggle-container`. The two class
fallbacks cover the pre-hydration Daily Games shells observed in 2026-07-27
reload recordings before the anchor exists. The module locator uses the same
fallbacks so the complete wrapper can move to the sidebar during that early
state.

Quick Play normally anchors to Game History. While native cards are hydrating
and Game History has not yet gained `.game-history-games-component`, the
controller anchors Quick Play before the first direct
`.home-container-component`. This keeps the controls at the top rather than
appending them below the Daily Games and Game History skeletons. The Daily
selectors stop matching as soon as its wrapper enters the right sidebar. The
document marker is absent for `Main column` and is removed during cleanup.

Version 0.15 keeps the Daily marker for `Hidden` and replaces card-specific
flags with space-separated `data-chesscom-vinf-sidebar-hidden` IDs. Exact
desktop CSS pre-hides audited Stats, ChessTV, Daily Puzzle, Friends, Streaks,
and Legend League landmarks. Element-level hidden markers remain authoritative
after reconciliation. The runtime re-arms the document marker even while the
target homepage is hydrating, preventing optional cards from briefly painting.

Version 0.16 adds
`data-chesscom-vinf-recommended-placement="sidebar|hidden"` with an exact
`:has(.play-online-section-body .challenge-tile-component)` pre-hide under the
redesigned main host. This prevents the native card from flashing in Main before
it is moved or hidden. The marker is absent for Main and is removed on cleanup.
The locator first accepts VINF's module marker after a move, so mutation
reconciliation remains idempotent.

Version 0.17 adds
`data-chesscom-vinf-game-history-placement="sidebar|hidden"`. Legacy CSS
pre-hides the direct main wrapper containing `.game-history-games-component`;
redesigned CSS pre-hides the direct component itself. The locator accepts
VINF's existing `game-history` module marker before searching the native main
host, so a card already moved Right remains discoverable on every later
reconciliation. At 300px sidebar width, the complete native card is preserved
and its wide history content may scroll horizontally rather than being rebuilt
or truncated.

The player landmark is required because an online ChessTV card replaces the
`Live on ChessTV` header/link with the current streamer name. The original
link-only locator caused another managed card to move above an online TV card.
Namespaced module markers preserve the standard `2.4rem` gap between adjacent
managed cards in legacy hosts.

The native player iframe advertises `allow="autoplay; fullscreen"`. VINF leaves
that iframe completely native: it does not change `src`, `allow`, hidden state,
loading, autoplay, or playback. The ChessTV card setting controls only whether
the complete native card is displayed and where it sits in managed order.

The current large native play panel itself contains a `Game Review` tile and an
`/analysis/game/` link. Game Review heading/path fallbacks therefore exclude
both the located native play panel and Game History. Otherwise the fallback
promotes the complete play panel and hides it as the standalone Game Review
card, making `Native play panel` appear nonfunctional.

The redesigned hosts are `#home-main > .main-component` and
`#home-sidebar > .sidebar-component`. They already use flex gaps, so VINF
normalizes each to the established `2.4rem` spacing and suppresses its own
legacy margin inside those hosts. A direct empty `.main-section` emitted by the
new shell is hidden only while it contains no elements; native hydration makes
it visible again automatically. The observed redesigned widths remain `728px`
for the main column and `300px` for the sidebar.

The 2026-08-12 capture adds one wrapper without changing the actual card host:
`#home-sidebar-container.layout-column-two > #home-sidebar >
.sidebar-component`. The earlier shell put `layout-column-two` directly on
`#home-sidebar`. VINF accepts only those two exact generations as desktop and
continues operating on the same direct `.sidebar-component`; it does not use a
generic layout-column fallback. Exact early-hide rules target
`#home-sidebar > .sidebar-component`, which is stable across both generations.

### Stats card internals

The saved signed-in homepages confirm three Stats schemas inside the native
`.cc-section`:

| Group | Native structure | Recognition |
| --- | --- | --- |
| Summary | Direct `ul.sidebar-ratings-general` containing direct `li.sidebar-ratings-item` rows | An exact descendant text node: `Games`, `Puzzles`, or `Lessons` |
| Ratings | Direct `.stat-section-stats-section` children of the Stats card | Exact `.stat-section-section-link-name` text: `Rapid`, `Bullet`, `Blitz`, `Daily`, `Puzzles`, or `Live 960` |
| Legacy Insights | An optional rating-shaped direct `.stat-section-stats-section` child | Descendant link beginning `/insights/`; exact `Insights` label is a fallback |
| Redesigned summary | Direct `.cc-aside-item-component` children | The same exact Games/Puzzles/Lessons text contract |
| Redesigned ratings | Direct `.stat-item-stats-section` children | Exact `.cc-aside-item-label` text or the semantic `/member/<member>/stats/<category>` path |
| Mobile ratings | Direct `.stats-mobile-card` links inside `.stats-mobile-content` | Semantic `/member/<member>/stats/<category>` paths; Daily uses `/play/online/daily`, with exact native labels as fallbacks |

VINF moves the complete native wrappers rather than rebuilding their icons,
ratings, links, buttons, or expansion behavior. Known rows follow the saved fixed
order and carry the standard hidden marker when disabled in settings. The
mobile cards use the same order and visibility settings but have no expandable
content, so their Expanded/Retracted preference is intentionally a no-op. The
2026-07-28 redesigned capture has no Insights row. If a legacy cohort supplies
one, it is not configurable: VINF keeps that native row visible and appends it
after every other rating row. VINF does not synthesize an Insights shortcut.

After the requested order is established, repeated reconciliation must not
append or otherwise move an already-correct row. Native expansion mutates the
rating subtree and may temporarily insert unlabeled rating-shaped content; VINF
leaves that content unmanaged and in place. This is required for Chess.com's
row-level expand/retract state to remain functional.

VINF applies each visible known rating row's own saved `Expanded` or `Retracted`
initial state once per native row instance. The legacy schema uses the direct
`button.stat-section-button`; the current redesigned schema uses a direct
`a.cc-aside-item-component` whose `.cc-aside-item-chevron` contains the native
arrow glyph. VINF clicks only that native control and only when its explicit
state differs from the preference: `arrow-chevron-bottom` is collapsed and
`arrow-chevron-top`, or native content following the control inside the row, is
expanded. The row is marked with the applied preference before the click, so
expansion mutations cannot retrigger it. Later manual expand/retract actions
remain untouched. A still-hydrating row with no recognizable state is left
unmarked for a later reconciliation.

The summary container itself is hidden when all three known summary rows are
disabled and no unknown summary row exists, avoiding an empty divider block.
Unknown future native rows are not hidden. Unknown rating rows retain their
native relative order after the six known rows and before an optional legacy
Insights row. Cleanup restores every moved row to its original parent/sibling
position and removes all VINF hidden markers.

The first redesigned capture exposed simple links, but the current rollout adds
native chevrons and expandable detail content to those same rating rows. VINF
supports both forms without synthesizing expansion UI: link-only rows remain
untouched, while rows with an explicit native chevron receive their saved
one-time initial state.

The current defaults are:

- summary order `Games`, `Puzzles`, `Lessons`, with only `Games` visible;
- rating order `Rapid`, `Blitz`, `Bullet`, `Daily`, `Puzzles`, `Live 960`, with
  only `Rapid` and `Blitz` visible;
- every rating row's initial state `Retracted`;
- an optional native legacy `Insights` row remains visible at the bottom when
  Chess.com supplies it.

## Verified quick-play launch method

The native current-clock action is an ordinary same-origin link:

```text
/play/online/new?action=createLiveChallenge&base=900&timeIncrement=10&rated=rated
```

This is the observed native one-click action for `15 + 10`. `base` and
`timeIncrement` are seconds. Runtime launch behavior clones this native link and
changes only those two numeric parameters, preserving the native action, rating
mode, origin, path, and any future Chess.com-owned parameters.

| Control | `base` | `timeIncrement` | Preset source |
| --- | ---: | ---: | --- |
| 30 sec | 30 | 0 | Desktop |
| 20 sec + 1 | 20 | 1 | Desktop |
| 1 min | 60 | 0 | Both |
| 1 + 1 | 60 | 1 | Both |
| 2 + 1 | 120 | 1 | Both |
| 3 min | 180 | 0 | Both |
| 3 + 2 | 180 | 2 | Both |
| 5 min | 300 | 0 | Both |
| 5 + 2 | 300 | 2 | Mobile |
| 5 + 3 | 300 | 3 | Desktop |
| 5 + 5 | 300 | 5 | Mobile |
| 10 min | 600 | 0 | Both |
| 10 + 5 | 600 | 5 | Both |
| 15 + 10 | 900 | 10 | Both |
| 20 min | 1200 | 0 | Both |
| 30 min | 1800 | 0 | Both |
| 60 min | 3600 | 0 | Both |

The cross-platform preset audit found that desktop had consolidated `5 + 2` and
`5 + 5` into `5 + 3`, while the mobile client still exposed the older pair.
The settings popup therefore uses a desktop-first union, but presents every
Blitz choice in one time-ordered group: `3 min`, `3 + 2`, `5 min`, `5 + 2`,
`5 + 3`, `5 + 5`. Source-platform availability remains internal metadata. It
stores exactly the selected count of 0, 1, 2, 3, 4, 6, or 8 IDs. Repeated IDs
are valid, so users may dedicate multiple buttons to the same clock. Zero
stores an empty array and renders no Quick Play module. Counts up to four use
one desktop row; six and eight retain their two-row layouts.

Every selected option uses the same verified native route construction. Quick
Play identifies each configured control as Bullet, Blitz, or Rapid and styles the
button with that category's Chess.com color. The minimal controls contain no icon
markup and therefore do not depend on Chess.com's glyph rendering.

If a valid native template link is absent, every extension shortcut is disabled.
The extension does not guess a route or fall back to the last-used control.

## Dynamic and responsive observations

- Homepage modules are rendered by multiple Vue mounts and may be replaced after
  initial HTML delivery.
- The exact `#homepage-toolbar` and redesigned `.header-hero` are two generations
  of the movable Profile card. Preserve the exact native node and signed-in
  landmark while applying Hidden/Main/Right.
- The optional `#main-banner` campaign may be inserted or replaced dynamically;
  repeated reconciliation must hide the current node without deleting it.
- Every optional `.promo-toolbar-user-info` instance follows the same
  reversible, replacement-safe marker behavior; do not assume the class is
  unique across responsive/Vue mounts.
- Desktop and Android delivery both start at `document-start`. The runtime
  attaches an observer before homepage landmarks exist but does not transform
  anything until local settings have loaded.
- Before the first successful layout, a mutation schedules immediate
  reconciliation so VINF can act on the first complete landmark batch. After
  activation, mutation work is leading-throttled at 60ms rather than postponed
  until Chess.com becomes quiet. A route timer handles detached roots and
  client-side navigation.
- The emptied native promo area is hidden after Quick Play moves into the main
  column.
- Below the extension breakpoint, the shortcut grid collapses to two columns
  and then one without covering navigation.
- A responsive page without the desktop column IDs is located from `main` or
  `[role=main]`. Cards are resolved from stable destination paths and semantic
  headings while links inside `nav`, `header`, and `[role=navigation]` are
  excluded.
- In responsive mode, Quick Play precedes the movable Main-card group. When
  retained cards are direct siblings, that group and the conceptual Right-card
  group each follow the same saved managed-card order. Profile, Daily Games,
  Recommended Match, and Game History are omitted for `Hidden`; every other known card
  follows its saved Show/Hide state. VINF does not move responsive cards across
  an uncertain nested container boundary.
- The mutation observer falls back from `.base-container` to `main`,
  `[role=main]`, or `body`, so delayed mobile/responsive card replacement still
  schedules idempotent reconciliation.

## Responsive semantic locator contract

The sanitized `tests/fixtures/homepage-responsive.html` intentionally omits
`.promo-component`, `#vue-instance`, and `#vue-sidebar-instance`. It verifies the
fallback contract without asserting that its wrapper classes are a live Android
capture.

| Module | Responsive fallback |
| --- | --- |
| Native action stack | Valid-looking `action=createLiveChallenge` link, promoted to a semantic card ancestor |
| Puzzles | Content link whose path begins `/puzzles` |
| Next Lesson | Content link whose path begins `/lessons/` |
| Game Review | Content link whose path begins `/analysis/game/` |
| Daily Games | Content link whose path is `/play/online/daily` |
| Game History | Native component class, exact `Game History` heading, or `/games/archive` link |
| Stats | Content link whose path begins `/stats/overview/` |
| ChessTV | Existing player landmarks or `/tv` link |
| Legend League | Existing badge or a `/leagues/` link outside the native action stack |
| Daily Puzzle | Existing `.daily-puzzle-*` component landmarks |
| Streaks | Existing `.streak-badge-sidebar-*` landmarks |
| Friends | Existing `.friends-content` or `/friends` link |

All fallbacks promote the semantic descendant only to a `section`, `article`,
known native card wrapper, sanitized fixture wrapper, or direct main child. This
limits accidental movement of a broader page container.

## Known fallback behavior

- Missing optional Daily Games, ChessTV, Daily Puzzle, Streaks, Legend League,
  Friends, or Game Review modules do not block the remaining transformations.
- An uncertain route or missing signed-in landmark results in no transformation.
- Launch failure restores the controls after a bounded timeout, marks the failed
  button locally, and announces non-persistent text through a visually hidden
  status region without shifting the page.

## Extreme OLED 2.3.0 — 2026-09-20

Audited saved game/review captures show `wc-chess-board#board-single` or
`#board-analysis-board` inside `#board-layout-chessboard`, native `.piece`
classes (`wp`…`wk`, `bp`…`bk`), and exact English Previous Move/Next Move button
aria-labels. Controls are resolved only in board sidebar/game navigation containers.
Clocks are `#board-layout-player-top/bottom .clock-component [role="timer"]`;
`.clock-white`/`.clock-black` keep fractions associated with color when flipped.
Saved first-party board CSS confirms `.promotion-window`, `.promotion-pieces`,
and `.promotion-piece` surfaces; these retain native input with dark styling.

The controller applies reversible visibility/filter markers, resizes the existing
wrapper, and forwards navigation to native buttons. It does not replace the board,
move pieces, or calculate game state. Unsupported/missing boards and detected
canvas boards leave the normal UI visible. Non-English labels, new selectors,
3D themes and native engine resize/hit testing are not proven by fixture tests.

`tests/fixtures/extreme-oled.html` is synthetic (Unicode SVG silhouettes), shaped
from these contracts, not a signed-in capture. IAB checks at 1280x720 and 390x844
verified board/arrows fit, previous forwarding, time bars/low time, clock-off,
Escape restoration and settings appearance; no warning/error logs appeared.
Live play, promotion interaction and physical Android verification remain open.

## Extreme OLED 2.3.1 — native geometry and game lifecycle

The user reported board clipping/unreliable input and a hidden result screen on
2.3.0. Saved first-party CSS contains `wc-chess-board { height:0;
padding-bottom:100%; touch-action:none }` and native percentage-sized pieces;
the first synthetic fixture instead used `aspect-ratio`. VINF's forced wrapper
size/position and board height were not a reliable native geometry contract.
Remove those overrides, preserve native-hidden board descendants, and measure
only for a pointer-transparent owned overlay. A separate absolute scroll spacer
provides 96px of root scrolling without changing native board sizing.

Saved `game-over-result-desktop-2026-09-18.html` shows:
- `.game-over-modal-shell-container` inside `.board-modal-container-container`
  alongside the board in `#board-layout-chessboard`;
- `.player-game-over-component` inside the top/bottom player rows;
- `.game-result` in the sidebar move list (accept only standard result scores).
These release Extreme for the rest of the route; hidden/display-none inactive
results are excluded. Clock zero alone does not imply completion. Exact existing
`.sidebar-view-content > .move-by-move-container > .move-by-move-component`
marks the review state where Extreme may resume; initial reports remain native.

The observed `.clock-player-turn` is the turn indicator; require exactly one
among the two player clocks. Numeric-clock reveal is transient, paired and
latched after either timer falls below 60, even with bars disabled. Whole seconds
truncate fractions; no independent countdown. Observer ignores owned mutations.

Fixture changes include padding-based board sizing, a native-hidden overlay and
pointer probes. T changes turn, L sets low time, E inserts a native-shaped result.
`/extreme-oled?extreme` is the normal fixture; append `&no-clock` or `&low-time`
as needed. The browser was unavailable while the Mac was locked, so these new
visual/input scenarios and real Firefox Android remain unverified. Unit tests
cover paired reveal/locking, turn changes, result arrival/dismissal, route reuse,
initial review and native DOM/style preservation.

## Extreme OLED 2.3.2 — presentation refinement

The saved first-party `chessboard-layout.Cn7fJCzylQ.css` defines
`.board-layout-main` as a column flex container and the actual board's dimensions
through `--boardWidth` / `--boardHeight` in `.board-layout-chessboard .board`.
Below 600px, add only a normal-flow `#board-layout-main::before` spacer
(clamp(128px,18svh,152px)). Do not override those native dimensions, grid columns
or transforms. Marker cleanup also removes the spacer, including at game over.

The owned controls remain pointer-transparent over the board. Interactive shapes
sit outside it: inset clock pills on the left, outlined move circles at lower
right. Native timer/turn/result selectors are unchanged. Bars no longer have a
preference; stale bars-off settings cannot suppress them. Existing settings tests
verify the final card's exact three labels, absence of help/clock switch, and
preserved autosave. New rendered/browser checks remain blocked by the locked Mac.

## Extreme OLED 2.3.3 — live games only

The user confirmed result-screen release, then reported unwanted Extreme OLED
reactivation on entering Game Review moves. Remove all review-route support from
this controller and accept only `wc-chess-board#board-single`; an analysis board
also releases presentation before a route transition has completed. Tests cover
both review URL shapes and the game-end → review → moves → new live game lifecycle.
This does not change the separate ordinary OLED or review-graph controller.

Native Previous Move/Next Move proxies now contain symmetric, aria-hidden SVG
chevrons centered with CSS grid. Clock pills use the existing paired `aria-pressed`
state to hide borders/backgrounds while numbers are hidden. Targets remain
clickable, and keyboard focus still has an accessible outline. New browser QA
remains blocked by the locked Mac; no screenshot was available for this revision.


## Phone play and Review refinement audit — 2.4.0 (2026-09-23)

Evidence: private 2026-09-18 game-result HTML and its `play.css`, shared clock CSS,
`chessboard-layout` CSS, and narrow in-move review HTML/`analysis.js`/mobile footer
CSS. The game capture is a finished game: active-game behavior is checked with
synthetic state, not a new real game. Imported renderer/audio chunks were not
saved; no claim of inspecting their internals or live Android execution.

- Phone gate remains below 600 CSS pixels (responsive, not user-agent sniffing).
  Exact signed-in game routes require the primary board and two readable native
  timers. Recognized native game-result evidence latches presentation off for
  that route; zero time alone does not. Extreme OLED bypasses this presentation.
- Hide only `#mobile-toolbar` and
  `#board-layout-sidebar .sidebar-component > .tabs-component`. The latter is
  the outer Play/New Game/Games/Players selector, hidden only while its first
  native Play tab is active (otherwise it remains available); `.underlined-tabs-component`
  (Moves/Chat/Info) and its active content remain intact.
- `#board-layout-main` is a native column flex container. Its normal-flow empty
  pseudo-element uses clamp(240px, 38svh, 380px). No board CSS variable, size,
  transform, coordinates, pointer listener, or control stickiness is overridden.
- `.board-layout-player .clock-component` retains native content and clock state.
  28px height/18px font/80px minimum width replace 40px/24px/120px; width may grow
  for longer times. Player content can shrink, with an 8px gap to the clock.
  The native player width is `--layoutPlayerWidth`, independent of name width.
- The captured `#live-game-tab-scroll-container` contains
  `wc-simple-move-list[board-id="board-single"] > .timestamps-with-base-time`.
  Its direct `.main-line-row.move-list-row` children have sequential
  `data-whole-move-number` from 1 and `.node.white-move.main-line-ply` plus the
  optional black ply. Native selection uses `.node[data-node]` children.
  CSS flex order is the negative whole-move number, never a DOM reversal. The
  opening header stays outside/above the scroll container. Mutation observation
  handles appended/replaced rows and partial plies. No forced scrolling or
  scrollTop remapping is added; native scroll-into-view can still use real bounds.
  Virtualized slices, spacer children, variations and changed structures are
  deliberately left native. Keyboard/screen-reader DOM traversal remains
  chronological. Actual Chess.com renderer autoscroll remains a live-device
  integration check; fixtures establish DOM identity and visual order only.
- Review header audio selector: `.sidebar-header-header button[aria-label="Toggle
  Coach Audio"]`. Saved `analysis.js` binds this to `isCoachAudioEnabled` and its
  native toggle handler, with alternate speaker icons. The observed muted icon
  is `svg[data-glyph="media-audio-speaker-mute"]`. A different speaker glyph on
  this exact enabled button requests one native toggle; the button is hidden
  only on observed muted state. Unknown/disabled/unsuccessful states remain
  visible. Mutations re-check state and replacement buttons without blind loops.
  English label is the audited contract. Native audio-off preference is retained
  on cleanup; VINF never automatically unmutes or intercepts unrelated audio.
- Review dock is `.game-controls-view-component > .mobile-gr-footer-footer`,
  with group-start (Explain, conditional Best), primary Next, group-end Previous
  Move/Next Move. Native 48px baseline becomes 80px + safe-area-inset-bottom.
  64px-high buttons are 44–56px wide with 30px centered icons. A single removable
  96px + safe-area spacer ends `.sidebar-view-component` so content stays reachable.
  Native hidden/disabled controls retain their state. Existing graph relocation
  and commentary/top navigation are not changed.

Back gesture decision: no gesture, history, unload or resign handler added.
[MDN popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)
describes notification after the active history entry changes;
[MDN beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
permits only a generic browser warning and is unreliable on mobile.
[Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)
traversal cancellation/interception constraints do not supply a universal Android
edge-back hook, particularly across documents/origins. A userscript cannot safely
promise either-edge native-dialog interception; fake history/traps are rejected.
This is a documented API limitation/inference, not an on-device gesture test.

Verification: four focused automated scenarios cover dynamic rows/node identity,
unsupported structure fallback, phone/Extreme/review/home/disable guards, game-end
latching, native mute state/failed toggle/no loop, and dock cleanup. IAB Chromium
sanitized fixtures at 390×844 and 320×740 exercise geometry, scroll, selection,
new move insertion, pointer delivery, muted state, conditional Best, dock controls
and content clearance; 600px verifies the responsive boundary. No real game was
started, played, resigned or otherwise altered. Firefox Android toolbar collapse,
actual native move autoscroll/dragging/audio, and physical bottom safe-area handling
remain unverified. Fixtures emulate native handlers; they do not execute the site
engine. Fixture console checks showed no errors/warnings.


## Phone Review header / evaluation layering — 2.4.1

The 2026-09-18 native header is flex-based with start-button group, center title,
secondary end audio button and end analysis button. Child-count selectors set
center min-width and auto margins. `display:none` on audio leaves those selectors
matching but removes its width, causing the reported rightward shift. Retain that
slot using visibility:hidden plus pointer-events:none after confirmed mute; the
control is neither visible, focusable nor a touch target. This works with one or
two start buttons (overview versus move review) without absolute-positioned titles.

Native `.evaluation-bar-fill` uses position:relative and z-index:-1, while white /
black fills retain their own z-index and transform animation. The opaque OLED
`#board-layout-main` background covers the negative layer without a local stacking
context. Scope isolation:isolate to `.evaluation-bar-bar` under phone Review +
OLED markers. This changes stacking only; the score and colors stay native.
Sanitized browser baseline reproduced both failures. Updated fixture includes
native-shaped header slots and the negative-z fill, including overview variant.

Verification: IAB Chromium fixture at 390×844 reproduced a 36px title-group offset
and hidden evaluation fill before the fix. Both overview and move-review title
groups measure 0px center offset afterward; white/black fill is visibly restored.
No console warnings/errors. Type checking, 170 existing tests and both builds pass.
Physical Firefox Android confirmation is still pending; no real game was touched.


## Shared clocks / native dock positions — 2.5.0 (2026-09-26)

Saved 2026-09-18 game HTML directly associates `.time-white`/`.time-black` with
`data-move-list-el="timestamp"`, `data-ply`, `data-time` and separate native text.
Site CSS uses absolute top:4px for white, bottom:3px for black; pseudo-elements
hold duration bars. VINF swaps top/bottom on those direct full-row children only.
It never changes `data-ply`, values, white/black nodes or horizontal ordering.
The opening `.eco-opening-component` is moved after `#live-game-tab-scroll-container`
with original parent/nextSibling retained; cleanup restores it, including game end.

Native game docks `.game-buttons-container-component` / `-mobile` are flex rows
with five equal-flex direct buttons and a column gap. The Android-only controller
requires exactly First Move / Previous Move / Play / Pause / Next Move / Last Move.
It reads the native gap and uses four grid tracks: original one-fifth width at
each end, equal remaining widths in the center. Only Play/Pause is hidden; native
buttons, handler identity, disabled state, container positioning/padding persist.
Unknown sequences remain native. No Review or Extreme dock is affected.

Review groups keep native markup. Their equal grid slots are selected using the
observed English aria labels Explain (Hint), Best, Previous Move and Next Move.
Missing or hidden conditional buttons leave their assigned position empty.
Share is hidden only inside `.mobile-gr-footer-footer`; all other sharing remains.
This is the audited English DOM contract, not a claim of locale-independent labels.

Shared normal clocks read the exact same native timers and `.clock-player-turn`
state as Extreme. Normal mode requires both parseable timers before hiding native
clock boxes (visibility only; reserved layout remains). Pills follow those boxes;
bars follow the unchanged native board bounds. No independent countdown, game
mutation, board sizing or color overrides. In normal mode there are no proxy move
arrows, content-hiding marker or added Extreme scroll extent. Phone avatar boxes
become 20px; tagline text 11px, with native connection information retained. Native
normal desktop player information dimensions are unchanged. See handoff for device
scope and keyboard persistence/typing guards.

Native annotation/Draw/Resign integration remains unverified: the saved ended-game
DOM has no active action controls; saved entrypoint scripts import missing engine
chunks. No guessed touch adapter, synthetic right click, resign endpoint or
consequential control activation is shipped. User declined live inspection for
now and authorized completion of independent changes first. Board headroom is
unchanged pending requested reference screenshots.


2.5.0 verification: 172 tests and typecheck pass, both builds succeed. Real-browser
IAB fixtures at 390×844 / 320×740 retained 390px / 320px native boards, no horizontal
overflow, delivered board pointer down/up, and restored native clocks, opening and
Play/Pause on disable. At 390px navigation widths were 70.8 / 108.7 / 108.7 / 70.8px
(the outer widths equal the original five-slot formula). Timestamp ply 40 rendered
above ply 39, with both identities retained. Review side slots measured 76.8px each,
with the center unchanged; hiding either left action left its position blank.
768px fixture checks confirmed Android tablet native clocks/four-action dock and
desktop shared clocks/five-action dock. Native-shaped low-time update forced both
numbers visible; automated keyboard test verifies T cannot hide them. No console
warnings/errors. Actual Firefox Android and live Chess.com behavior remain untested.


## 2.6.0 Android local annotations and native action placement

Saved first-party `shared.s4o5uy_kpO.css` from the private ended-game capture defines
`.draw-button-component` and `.resign-button-component`, their disabled/highlight/
wide states, labels/icons and hints. Active roots are absent from the ended-game
HTML; current live handlers/confirmation ownership cannot be established locally.
The new controller selects only those roots within `#board-layout-sidebar`, excludes
dialog/draw-offer ancestry, and preserves the nodes with comment-position anchors.
Destination: before `.sidebar-content > .underlined-tabs-component`, normal Android
phone games only. Missing selectors restore rather than inventing controls. The
sanitized phone fixture now names these component roots. Its fake confirmation
handler tests preservation and explicit activation, not live Chess.com behavior.

Native annotation API remains undocumented in saved assets. Instead, a separate
owned SVG surface overlays `#board-layout-chessboard wc-chess-board#board-single`
without changing its dimensions, DOM or event handlers. No guessed event adapter is
used. Shape positions derive from the current 8×8 native rectangle; piece/class/style
mutations clear marks, avoiding stale annotations after moves or board flips.
Only the selected annotation surface consumes pointer/touch events; off uses
pointer-events:none. Toggle tracks the native bottom clock (or Extreme bottom clock)
with a 44px target. Markers and padding restore on route, disable or game completion.
Browser fixture arrow + square gestures reached zero native board handlers; turning
off restored native down/up delivery. 390px board stayed 390px; tablet stayed 528px.
Actual Android touch delivery and current live action markup remain unverified.


## 2.6.1 recording-driven corrections

The user recordings confirm avatar/text overlap and control/spacing problems in
normal phone gameplay. First-party saved DOM establishes the nested contract
`.player-avatar > .cc-avatar-component.cc-avatar-size-40 > img.cc-avatar-img` and
`.cc-user-block-component > .cc-user-username-component`. The previous fixture used
a text avatar and obsolete username classes, so its passing layout checks did not
cover those defects. The fixture now models the nested sizes, current text classes,
connection bars, native player insets and pinned navigation dock with synthetic data.

Saved chessboard-layout CSS positions `.board-layout-chessboard` relatively. Owned
clock/drawing overlays can be absolute siblings of the board inside this host;
the board and its input tree remain unchanged. Coordinate conversion includes host
border/scroll offsets, and a static/unknown host falls back to viewport positioning.
Native flag sprites depend on their original background size/offsets; do not use
background-size:cover to shrink them. Native connection-state variables are retained.

Runtime hydration regression checks exact bootstrap→game without popstate, late
native controls within 30ms (before the 750ms poll), native board identity, disable
restoration and Review cleanup. Browser evidence and real-device limits are recorded
in HANDOFF's 2.6.1 section; no real game was manipulated during verification.

## Native touch annotation contract — 2.6.4 (2026-09-28)

On the public signed-out Analysis board, right-click d4 produces native
`.highlight.square-44`; repeating removes it without moving pieces. Its board
is `wc-chess-board#board-analysis-board`; gameplay remains scoped to the already
audited `#board-layout-chessboard wc-chess-board#board-single`.

Public source inspected:
- https://www.chess.com/r2/client-packages/analysis/2026.9.8/chessboard-947a29d.23dd9aa2.BlQir_RPs9.chunk.js
- https://www.chess.com/r2/client-packages/analysis/2026.9.8/shared.eager.DLqp4stWnK.chunk.js

The component assigns its API to `element.game`. The native marking pointer-up
branch uses `markings.factory.buildStandardAnalysisHighlight(square)` for a tap
or `buildStandardArrow(from,to)` for a drag and then `markings.toggleOne(mark)`.
The factories accept algebraic squares and obtain colors/style from native options.
`addOne`, `getOne`, and `removeOne` support temporary-preview ownership. The returned
marking object is reused across the userscript/page boundary, avoiding injection
of a sandbox-created object. Missing methods are treated as unavailable.

VINF no longer renders annotation SVG paths or rects. Its empty input shield
retains `.chesscom-vinf-annotations`; native marks render inside the board. The
public API is not documented as stable. Analysis source evidence does not prove
current live-game bundle compatibility or Firefox Android sandbox behavior.
`tests/helpers/native-annotations.ts` is explicitly a contract double with an
illustrative renderer, not copied native implementation.

Native highlights are pooled by square. Temporary same-square previews are
skipped; committed taps still use native highlighting. Arrow previews also skip
existing native keys (`type|fromto`) to avoid duplicate renderer entries.

## Compact mobile player rows — 2.7.0

Native `.player-component:not(.player-theatre) .player-tagline {height:4rem}`
from the saved first-party CSS overrides a less-specific compact rule. Match
specificity and use flex alignment; never size the chessboard for this fix.
`#board-layout-player-{top,bottom} .player-playerContent` owns identity only;
transparent avatar-target buttons are siblings of the original avatar/tagline.
`data-chesscom-vinf-player-hidden` hides those siblings without collapsing space.

Draw/resign component roots are moved from sidebar into
`#board-layout-player-bottom .player-component`, before the native clock and
pencil. Lookup includes tracked moved roots; new native replacements supersede
old owned slots. Original anchors support cleanup. Compact CSS targets only
root buttons, not arbitrary nested dialog/confirmation buttons. Keep native
text accessible and state-driven (Abort before enough moves, Resign afterwards).
The latest user recording demonstrates that transition; no relabeling is needed.

Entry correction reads original top player/board bounds and calls scrollTo once,
never changes board CSS geometry or coordinates. Input cancels before the timeout.
Sanitized fixture includes the native high-specificity 40px tagline regression;
`/phone-game-preview?narrow=1&entry=1&oled=1` supplies a 320px frame with inherited
scroll. These are fixture checks, not actual Firefox Android verification.

## Phone material-only rows — 2.7.1

Saved native markup confirms `wc-captured-pieces` contains
`.captured-pieces-cpiece` and `.captured-pieces-score`, beside the identity block
inside player tagline. Hiding the whole `.player-playerContent` loses material.
Under `data-chesscom-vinf-phone-material`, hide siblings outside the path to
`wc-captured-pieces`, never its ancestors/descendants. The sanitized phone fixture
now includes that nesting on both sides. Captured material remains native/live.
Native actions now target the top player's clock anchor; pencil stays below.
Runtime passes Android/phone scope explicitly; no desktop/tablet identity hiding.

## Gameplay observer scope — 2.7.2

Primary board `.piece` type (`wp` etc.), `square-NN`, and board `.flipped` identify
position/orientation. Inline transforms are animation/drag paint, not position
identity. Ignore paint-only descendants of initialized `wc-chess-board#board-single`
for outer presentation; keep root attributes, initial pieces, replacement and
canvas fallback observable. Clock text-node changes update clocks without a
whole layout reconciliation. Native material `.captured-pieces-cpiece` sprites
receive a neutral-gray filter only under normal phone OLED, preserving shape,
score and updates. New operation-count regression uses the real runtime and
sanitized native marking contract, never a real game.


## 2026-10-01 — 2.8.0 controls and Review entry

Reused saved native evidence rather than touching live games. September18 Review
capture has button[aria-label="Best"] and native Next button with
mobile-gr-footer-primary inside game-controls-view-component. Saved analysis.js
constructs the desktop review best-move action with tooltip Best, conditional on
available review controls. B clicks only rendered/enabled matching buttons; unknown
or translated controls fail open as no-op. Initial phone primary click is captured
before native transition and waits for the relocated graph in
#charts > [data-chesscom-vinf-review-graph="moved"]. No other review controls are moved.

Shared clocks now include Android tablet. Native clock-white/clock-black identity
prevents a board flip from masquerading as a turn switch; sanitized phone fixture
now includes these classes. Same player for60s is measured from observation, not
inferred game history. Dot settings never change native clock or board state.
Phone material layout uses six minmax(0,1fr) tracks: ordinary 1fr tracks preserved
the native minimum clock width and caused unequal spacing. Captured score is
center-aligned in the native wrapper; native sprite colors remain unfiltered.

Browser visual fixture evidence (Codex IAB, default scale, OLED):
- /phone-game-preview?oled=1:390x844 iframe; draw/flag/clock centers224.83,
  284.50,344.16px (equal59.67px gaps). Lower clock344.16, pencil269.58,
  halfway between row midpoint195 andclock344.16.44px icon touch targets.
- Same preview with narrow=1:320x844; centers184/232/280, pencil220;
  body scrollWidth320 and native board320. No horizontal overflow.
- tablet=1:800x844; desktop-style identity/navigation intact, native board528,
  both normal clocks disabled/noninteractive, border0, filled pencil present.
- Native-contract fixture drag creates one arrow on release; active pencil,
  low clock and active dot all compute rgb(182,91,91). Disable removes all
  VINF game controls, restores native Draw to sidebar and preserves390px board.
- /game-review-mobile?oled=1:390x640 viewport; first Next click scrolls57px,
  graph bottom551.89 vs dock top560 (8px clearance). Coach/board/native controls
  retained; repeated clicks/cancellation/route teardown covered automatically.
- Existing preview MutationObserver "parameter1 is not Node" error was present
  before edits and unchanged after; no claim of a clean browser console.
Private fixture screenshot: fixtures/raw/refinements-2026-10-01/phone.png.
Automated:183 tests/25 files, typecheck, desktop and Android builds. Performance
regression budget still passes; dragging now produces zero preview factory calls,
then one native arrow factory call on release. These are sanitized fixtures,
not Firefox Android touch/scroll timing or live desktop verification.


## 2026-10-01 — 2.8.1 Extreme phone rows

Reused existing player/material/action selectors, gated by phone + Android.
Extreme visibility now explicitly includes native captured pieces, relocated
native action descendants, semantic dialogs and the saved first-party CSS roots
cc-confirmation-popover-popover, cc-confirmation-modal-modal, draw-offer-component
and draw-request-component. Those names were verified in stored September18
play CSS. No fabricated native actions or confirmation clicks are introduced.
Sanitized visual harness models a separate confirmation with Cancel/Confirm;
its handlers only record fixture state.

IAB phone fixture /phone-game-preview?extreme=1, 390x844: native board stays390px,
both material rows/action icons visible, upper/lower clock centers align, pencil
visible inactive, nav below lower row without overlap. Both clocks are DIVs with
role=timer and pointer-events:none. Resign opens the native-shaped fixture popup;
Cancel removes it and preserves Extreme/game presentation. Tablet fixture800x844
keeps separate layout, no phone-material marker, both clocks visible/read-only.
Actual device/native popover integration remains unverified. Same known preview
MutationObserver/Node console issue as earlier; no new game activity.
Private evidence: fixtures/raw/refinements-2026-10-01/extreme-phone.png.

## 2.9.3 — Move scrolling and Extreme hints (2026-10-02)

Saved first-party eager.js (`fixtures/raw/native-annotations-2026-09-28/`)
shows native Vje awaiting a render tick, then Hje/mr scrolling the selected node
to the nearest edge. Its Zn check uses scrollHeight-scrollTop-clientHeight to
classify manual scrolling, assuming newest-at-bottom. Phone CSS reversal keeps
native nodes but invalidates that assumption. VINF follows only a new main-line
ply, settles native scroll events for at most 500ms, and cancels immediately on
pointer/touch/wheel/key input. It touches only live-game-tab-scroll-container.
Character-data and data-node changes cover in-place ply hydration; selection
changes alone do not follow. Unknown/variation renderers retain native behavior.

Saved play-global-styles.BlnBr0XWZ6.css from game-over-result-desktop-2026-09-18
uses --color-transparent-black-14 for .hint padding/content-box dots, .capture-hint
borders and dynamic .circle variants. Extreme overrides that token locally rather
than replacing shapes or animations. Native red highlight is #eb6150; preserve
hues with brightness(.8)/opacity(.65), instead of grayscale. Local visual hints
are sanitized representative markup, not a live native board integration test.
