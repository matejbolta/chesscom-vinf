# ChessComVINF DOM Audit

Audit date: 2026-07-28
Source: private complete-page captures in `fixtures/raw/2026-07-16/` and
the reduced/all-cards 2026-07-28 captures under `fixtures/raw/` plus
user-provided live Inspector samples of the recurring campaign banner and exact
homepage toolbar hierarchy
Observed locale and variants: signed-in English legacy and redesigned desktop
homepages
Responsive coverage: sanitized semantic fixture; live signed-in Android capture
was unavailable in this session

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
  History. `#home-sidebar.layout-column-two` upgrades the page to the
  redesigned two-column desktop contract when present.
- The redesigned shell no longer exposes the old `data-cy` profile landmark.
  Its guard therefore combines the exact signed-in root class, route, shell,
  native launch evidence, and Game History rather than guessing a replacement
  profile selector.
- The desktop guard requires the exact `/home` pathname and one complete
  legacy or redesigned landmark set.
- The responsive guard keeps the same protocol, host, route, signed-in marker,
  and profile requirements, then requires a native launch link, a main content
  host, and at least one of Game History, Daily Games, or Stats.

## Top dashboard

### Redesigned home hero

The 2026-07-28 rollout removes `.promo-component`, `#homepage-toolbar`, and
`.promo-toolbar-user-info`. Its native play and recommendation area is the
exact `section#home-header` inside `.layout-hero`. The immediate-match control
now lives under `.play-online-quick-links-component`; the safe launch link
contract itself is unchanged.

VINF treats the complete `#home-header` as the redesigned native action module.
It is hidden by default without deleting its native launch link. The Homepage
setting `Native play panel` sets
`data-chesscom-vinf-native-play-panel="visible"` and restores the complete
native hero; disabling that setting hides it again. The empty `.layout-hero`
wrapper has zero rendered height while hidden.

### Homepage toolbar

The visible avatar, username, and country-flag row is the exact
`header#homepage-toolbar`. Its child `.toolbar-user-info` carries
`data-cy="profile-section"`. The signed-in landmark remains queryable when its
ancestor is hidden, so VINF marks the complete header with
`data-chesscom-vinf-hidden="homepage-toolbar"` rather than removing it.

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
desktop row, so version 0.8.3 removes that uniqueness assumption and marks every
exact `.promo-toolbar-user-info` instance with
`data-chesscom-vinf-hidden="promo-user-info"`. Nodes stay in the DOM, so the
signed-in profile landmark remains available to the homepage guard. Cleanup
removes every marker, and mutation reconciliation hides all current or replaced
instances. Version 0.8.4 retains this compatibility behavior while targeting the
actual visible `#homepage-toolbar`.

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
| Daily Games | Direct child of `#vue-instance` containing a `/play/online/daily` link; namespaced marker after moving/hiding | `.home-container-component` wrapper moved to the sidebar, restored to main, or hidden intact |
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

The default managed right-column order is Stats, ChessTV, Daily Games
when present, Streaks, Legend League, Daily Puzzle, then Friends. Version 0.15
makes all seven known positions orderable. Every card has independent Show/Hide;
Daily Games additionally retains its Main/Right placement while hidden.
Unknown native cards are preserved visibly after the managed cards.

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

The player landmark is required because an online ChessTV card replaces the
`Live on ChessTV` header/link with the current streamer name. The original
link-only locator caused another managed card to move above an online TV card.
Namespaced module markers preserve the standard `2.4rem` gap between adjacent
managed cards in legacy hosts.

The redesigned hosts are `#home-main > .main-component` and
`#home-sidebar > .sidebar-component`. They already use flex gaps, so VINF
normalizes each to the established `2.4rem` spacing and suppresses its own
legacy margin inside those hosts. A direct empty `.main-section` emitted by the
new shell is hidden only while it contains no elements; native hydration makes
it visible again automatically. The observed redesigned widths remain `728px`
for the main column and `300px` for the sidebar.

### Stats card internals

The saved signed-in homepages confirm two Stats schemas inside the native
`.cc-section`:

| Group | Native structure | Recognition |
| --- | --- | --- |
| Summary | Direct `ul.sidebar-ratings-general` containing direct `li.sidebar-ratings-item` rows | An exact descendant text node: `Games`, `Puzzles`, or `Lessons` |
| Ratings | Direct `.stat-section-stats-section` children of the Stats card | Exact `.stat-section-section-link-name` text: `Rapid`, `Bullet`, `Blitz`, `Daily`, `Puzzles`, or `Live 960` |
| Legacy Insights | An optional rating-shaped direct `.stat-section-stats-section` child | Descendant link beginning `/insights/`; exact `Insights` label is a fallback |
| Redesigned summary | Direct `.cc-aside-item-component` children | The same exact Games/Puzzles/Lessons text contract |
| Redesigned ratings | Direct `.stat-item-stats-section` children | Exact `.cc-aside-item-label` text or the semantic `/member/<member>/stats/<category>` path |

VINF moves the complete native wrappers rather than rebuilding their icons,
ratings, links, buttons, or expansion behavior. Known rows follow the saved fixed
order and carry the standard hidden marker when disabled in settings. The
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
stores exactly the selected count of 1, 2, 3, 4, 6, or 8 unique IDs. Counts up
to four use one desktop row; six and eight retain their two-row layouts.

Every selected option uses the same verified native route construction. Quick
Play identifies each configured control as Bullet, Blitz, or Rapid and styles the
button with that category's Chess.com color. The minimal controls contain no icon
markup and therefore do not depend on Chess.com's glyph rendering.

If a valid native template link is absent, every extension shortcut is disabled.
The extension does not guess a route or fall back to the last-used control.

## Dynamic and responsive observations

- Homepage modules are rendered by multiple Vue mounts and may be replaced after
  initial HTML delivery.
- The exact `#homepage-toolbar` is the visible profile strip and must be hidden
  reversibly even though its descendant remains the signed-in guard landmark.
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
- In responsive mode, Quick Play precedes Game History. When retained cards are
  direct siblings, known cards follow the saved right-column order. Daily Games
  is restored to native flow for `Main` and omitted for `Hidden`; every other
  known card follows its saved Show/Hide state. VINF does not move responsive
  cards across an uncertain nested container boundary.
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
