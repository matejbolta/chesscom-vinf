# ChessComVINF DOM Audit

Audit date: 2026-07-27
Source: private complete-page capture in `fixtures/raw/2026-07-16/` plus
user-provided live Inspector samples of the recurring campaign banner and exact
homepage toolbar hierarchy
Observed locale and variant: signed-in English desktop homepage
Responsive coverage: sanitized semantic fixture; live signed-in Android capture
was unavailable in this session

## Route and homepage guard

- Verified URL: `https://www.chess.com/home`
- Verified metadata: `og:url` is `https://www.chess.com/home`.
- Signed-in marker: `html.user-logged-in`.
- Profile landmark: `[data-cy="profile-section"]` containing a home profile
  action (`[data-page="home"][data-button="profile"]`).
- Dashboard landmarks: `.promo-component`, `#vue-instance.layout-column-one`,
  and `#vue-sidebar-instance.layout-column-two`.
- The desktop guard requires the exact `/home` pathname and every landmark above.
- The responsive guard keeps the same protocol, host, route, signed-in marker,
  and profile requirements, then requires a native launch link, a main content
  host, and at least one of Game History, Daily Games, or Stats.

## Top dashboard

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
that hidden DOM, so launch URL derivation is unchanged. The bare six/eight-button grid
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

## Main content columns

| Module | Primary locator | Node moved |
| --- | --- | --- |
| Quick Play | Extension-owned `[data-chesscom-vinf-owned="quick-play"]` | Inserted as a direct child of `#vue-instance` before Daily Games or Game History |
| Daily Games | Direct child of `#vue-instance` containing a `/play/online/daily` link; namespaced marker after moving/hiding | `.home-container-component` wrapper moved to the sidebar, restored to main, or hidden intact |
| Game History | Direct child of `#vue-instance` containing `.game-history-games-component` | `.home-container-component` wrapper |
| Legend League | `#league-badge-sidebar` | Direct child of `#vue-sidebar-instance` (`.home-actions`), optionally hidden intact |
| ChessTV | `.tv-player-component`, `.tv-player-iframe`, or `.tv-player-sidebar-close-button`; `/tv` link fallback | Direct `.cc-section` child, optionally hidden intact |
| Stats | Direct right-column section containing a link whose pathname begins `/stats/overview/` | Direct `.cc-section` child |

Original nodes are moved, not cloned. The controller records their original
parent/sibling positions for route cleanup.

Quick Play fills the same `728px` observed desktop column as Game History. The
native `.layout-component` continues to own both columns, so the `300px` sidebar
starts on the same row as Quick Play without absolute positioning or a replacement
page grid. A `2.4rem` gap separates Quick Play from the first native left module.

The default right-column order is Stats, ChessTV, Daily Games, then Legend
League. Version 0.12.0 makes Daily Games tri-state: the original wrapper is moved
intact and constrained to sidebar width, restored before Game History in its
native main column, or hidden intact. ChessTV and Legend League each have an
independent show/hide setting. Hidden modules stay in the DOM and cleanup restores
all native visibility and positions. The retired `reorderGameHistory` and
`moveDailyGamesToSidebar` booleans migrate to the new placement value.

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

Version 0.12.0 also uses the Daily marker for `Hidden`, and adds early
setting-specific document markers for hidden ChessTV and Legend League. Exact
desktop CSS pre-hides a direct sidebar child containing the already-audited
ChessTV player or `/tv` landmark, and a direct child containing
`#league-badge-sidebar`. Element-level hidden markers remain authoritative after
reconciliation. The runtime re-arms these document markers even while the target
homepage is still hydrating, preventing optional cards from briefly painting.

The player landmark is required because an online ChessTV card replaces the
`Live on ChessTV` header/link with the current streamer name. The original
link-only locator caused Legend League to move above an online TV card.
When ChessTV and Legend League are adjacent after reordering, a namespaced module
marker adds the standard `2.4rem` card gap between them.

### Stats card internals

The saved signed-in homepage confirms two native row groups inside the Stats
`.cc-section`:

| Group | Native structure | Recognition |
| --- | --- | --- |
| Summary | Direct `ul.sidebar-ratings-general` containing direct `li.sidebar-ratings-item` rows | An exact descendant text node: `Games`, `Puzzles`, or `Lessons` |
| Ratings | Direct `.stat-section-stats-section` children of the Stats card | Exact `.stat-section-section-link-name` text: `Rapid`, `Bullet`, `Blitz`, `Daily`, `Puzzles`, or `Live 960` |
| Insights | A rating-shaped direct `.stat-section-stats-section` child | Descendant link beginning `/insights/`; exact `Insights` label is a fallback |

VINF moves the complete native wrappers rather than rebuilding their icons,
ratings, links, buttons, or expansion behavior. Known rows follow the saved fixed
order and carry the standard hidden marker when disabled in settings. Insights
is never configurable: it remains visible and is appended after every other
rating row.

After the requested order is established, repeated reconciliation must not
append or otherwise move an already-correct row. Native expansion mutates the
rating subtree and may temporarily insert unlabeled rating-shaped content; VINF
leaves that content unmanaged and in place. This is required for Chess.com's
row-level expand/retract state to remain functional.

Version 0.11.0 applies each visible known rating row's own saved `Expanded` or
`Retracted` initial state once per native row instance. It clicks Chess.com's
direct `button.stat-section-button` only when the explicit native chevron state
differs from that row's preference: `arrow-chevron-bottom` is collapsed and
`arrow-chevron-top` is expanded. The row is marked with the applied preference
before the click, so expansion mutations cannot retrigger it. Later manual
expand/retract actions remain untouched. A still-hydrating row with no
recognizable state is left unmarked for a later reconciliation.

The summary container itself is hidden when all three known summary rows are
disabled and no unknown summary row exists, avoiding an empty divider block.
Unknown future native rows are not hidden. Unknown rating rows retain their
native relative order after the six known rows and before Insights. Cleanup
restores every moved row to its original parent/sibling position and removes all
VINF hidden markers.

The current defaults are:

- summary order `Games`, `Puzzles`, `Lessons`, with only `Games` visible;
- rating order `Rapid`, `Blitz`, `Bullet`, `Daily`, `Puzzles`, `Live 960`, with
  only `Rapid` and `Blitz` visible;
- every rating row's initial state `Retracted`;
- `Insights` always visible at the bottom.

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
stores exactly the selected grid size of six or eight unique IDs. The original
six controls remain the default six-button grid.

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
- Below the extension breakpoint, the shortcut grid collapses from three columns
  to two and then one without covering navigation.
- A responsive page without the desktop column IDs is located from `main` or
  `[role=main]`. Cards are resolved from stable destination paths and semantic
  headings while links inside `nav`, `header`, and `[role=navigation]` are
  excluded.
- In responsive mode, Quick Play precedes Game History. When all retained cards
  are direct siblings, their default visible order is Game History, Stats,
  ChessTV, Daily Games, Legend League. Daily Games is restored to native flow for
  `Main column` and omitted for `Hidden`; ChessTV and Legend League are omitted
  when disabled. VINF does not move responsive cards across an uncertain nested
  container boundary.
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

All fallbacks promote the semantic descendant only to a `section`, `article`,
known native card wrapper, sanitized fixture wrapper, or direct main child. This
limits accidental movement of a broader page container.

## Known fallback behavior

- Missing optional Daily Games, ChessTV, Legend League, or Game Review modules do
  not block the remaining transformations.
- An uncertain route or missing signed-in landmark results in no transformation.
- Launch failure restores the controls after a bounded timeout, marks the failed
  button locally, and announces non-persistent text through a visually hidden
  status region without shifting the page.
