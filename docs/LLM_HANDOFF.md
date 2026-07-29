# ChessComVINF LLM Handoff

This document is the durable project memory for future coding agents.

Last updated: 2026-07-29.
Current source version: 0.17.2.
Latest Store-prepared desktop package: `release/chesscom-vinf-0.17.2.zip`.
Android artifact: `dist-android/chesscom-vinf.user.js`.

## Start Here

ChessComVINF means Chess.com Version Infinity. The short product name is VINF,
not WINF. It is an independent Manifest V3 Chrome/Brave extension that improves
only the signed-in Chess.com homepage:

    https://www.chess.com/home

It replaces the visually dominant homepage promo area with a focused configurable
Quick Play grid, promotes Game History and Stats, moves Daily Games into the
sidebar by default, and removes homepage cards that the user does not need.

The extension is implemented and functional. `PRODUCT_BRIEF.md` is the original
historical brief; its old “implementation not started” state is not current.
`FINAL_PRODUCT_SPEC.md` preserves the original detailed specification and the
chronological amendments through version 0.17.2. This handoff is the shortest
canonical statement of the current product.

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
- a configurable right sidebar containing Stats, ChessTV, Daily Games,
  Recommended Match and Game History when placed there, Streaks, Legend
  League, Daily Puzzle, and Friends;
- one fixed user-selected managed-card order, filtered independently within the
  Main and Right columns, with unknown future native cards preserved visibly
  after the managed cards;
- minimal fixed Stats content by default: Games, Rapid, then Blitz; an optional
  legacy Insights row stays last if Chess.com supplies it.

The extension hides:

- the optional recurring top campaign at the exact `#main-banner` landmark;
- the visible avatar, username, and flag header at exact `#homepage-toolbar`;
- every separate `.promo-toolbar-user-info` compatibility variant;
- Chess.com's legacy native quick-action column and, by default, redesigned
  exact `#home-header` hero; the redesigned native play/recommendations panel
  can be shown from Homepage settings;
- the profile-adjacent top Legend League summary inside that column;
- Puzzles;
- Next Lesson;
- Game Review;
- the empty native promo row after Quick Play moves into the main column.

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
- a standalone top card containing only `Enable VINF`;
- a `Homepage` card with a `Native play panel` switch and a managed-card editor
  for Stats, ChessTV, Daily Games, Recommended Match, Game History, Streaks,
  Legend League, Daily Puzzle, and Friends;
- Show/Hide checkboxes and fixed-order arrows for every managed card; Daily
  Games, Recommended Match, and Game History additionally have `Main` / `Right`
  selectors that retain their choices while hidden. The arrows define relative
  order in whichever column those movable cards use;
- a 0/1/2/3/4/6/8 Quick Play count selector and the corresponding number of
  preset selectors, with the selector list absent at zero;
- adaptive count changes that keep the leading selections when shrinking and
  preserve all existing selections while filling only new slots when expanding;
- a preset-selector grid that mirrors the homepage layout: one row for 1–4,
  two column-first rows of three for 6, and two of four for 8;
- summary and rating visibility/order controls for the native Stats card;
- an independent `Expanded` / `Retracted` selector beside every Stats rating
  row;
- separate Homepage, Quick Play, and Stats Reset actions;
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
Daily Games defaults to the right sidebar; Recommended Match and Game History
default to their native main column. All three can use Main, Right, or Hidden
through the same checkbox-plus-placement model. Every known managed card can be
shown, hidden, and reordered without rebuilding its content. Chess.com's redesigned combined
Streaks/League wrapper is reversibly separated into two native-content card
hosts so the two items remain independently configurable. Unknown cards are not
hidden or absorbed into this managed model.

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
`.promo-toolbar-user-info` variants are also hidden when present, without
targeting `#mobile-toolbar` or generic responsive profile controls. The
redesigned `#home-header` follows the Native play panel setting. The grid is two
columns at tablet widths and one column below 450px.

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

1. Run only on the exact signed-in Chess.com `/home` or `/home/` route.

2. Leave the main Chess.com navigation intact.

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

12. Hide every exact `.promo-toolbar-user-info` compatibility variant; never
    assume it is unique or use account data or a generic profile landmark as
    the selector.

13. Hide the exact `#homepage-toolbar` that owns the visible desktop
    avatar/name/flag row. Keep it in the DOM so signed-in detection still works;
    do not broadly hide `#mobile-toolbar` or generic headers.

14. Keep the redesigned exact `#home-header` hero hidden by default while
    preserving its native immediate-match link in the DOM; show the complete
    native panel only when its explicit Homepage setting is enabled.

15. Keep popup settings autosaving. Quick Play Reset is preset-only and Stats
    Reset is Stats-only.

16. Keep any native Insights row visible and last, but do not synthesize one
    when Chess.com omits it. Hide or reorder only positively recognized native
    Stats rows; preserve unknown future rows.

17. Do not add telemetry, analytics, ads, tracking, remote code, remote
    configuration, or extension-owned network requests.

18. Never commit or package raw signed-in page captures, account identifiers,
    session markup, tokens, screenshots, or reference assets.

19. Do not broaden hosts, routes, or permissions without an explicit product
    decision.

20. Keep the toolbar popup as the default settings entry point. The optional
    persistent Side Panel UI must reuse the same packaged local settings page,
    open only from a user gesture, and degrade without affecting settings.

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
`#home-main.layout-column-one`, `#home-sidebar.layout-column-two`, a native
immediate-match link, and Game History. VINF recognizes only a complete legacy
or redesigned contract; it does not weaken the fail-closed route guard.

Important locators:

- redesigned native hero: exact `#home-header`, containing
  `.play-online-quick-links-component`;
- recurring top campaign: exact optional `#main-banner`; never campaign text,
  `data-name`, assets, or generated classes;
- visible desktop profile strip: exact optional `#homepage-toolbar`, whose
  `.toolbar-user-info[data-cy="profile-section"]` descendant remains the
  signed-in guard landmark;
- empty/variant promo user strips: all exact optional
  `.promo-toolbar-user-info` instances; never username, member URL, avatar,
  flag, or generic profile selectors;
- native action stack: legacy `.play-quick-links-component` promoted to its
  direct promo child, or redesigned exact `#home-header`;
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
  `#home-sidebar > .sidebar-component`;
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
ancestor to pre-hide exact native `#homepage-toolbar`, `#main-banner`,
`.promo-toolbar-user-info`, and `.promo-component` replacements. `#home-header`
is pre-hidden unless `data-chesscom-vinf-native-play-panel="visible"` is
present. This closes a
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
  showNativePlayPanel: boolean;
  dailyGamesPlacement: "main" | "sidebar" | "hidden";
  dailyGamesVisiblePlacement: "main" | "sidebar";
  recommendedMatchPlacement: "main" | "sidebar" | "hidden";
  recommendedMatchVisiblePlacement: "main" | "sidebar";
  gameHistoryPlacement: "main" | "sidebar" | "hidden";
  gameHistoryVisiblePlacement: "main" | "sidebar";
  homepageSidebarOrder: HomepageSidebarCardId[]; // shared Main/Right order; all nine IDs exactly once
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

Defaults are enabled, the native play panel hidden, every known card visible,
Daily Games shown in the sidebar with its remembered visible placement also set
to sidebar, Recommended Match and Game History shown in Main with their
remembered visible placements set to Main, six-button mode, and the original
six IDs documented above. The default managed card order is Stats, ChessTV,
Daily Games, Recommended Match, Game History, Streaks, Legend League, Daily
Puzzle, Friends. Stats defaults are
Games only plus Rapid/Blitz, in the fixed orders described in Current User
Experience, with all six rating-state values initially retracted.
`normalizeSettings` is the persistence boundary; old saved objects infer
their button count from any complete valid 1/2/3/4/6/8-ID array and automatically
gain all Stats defaults. Existing valid six- and eight-ID arrays therefore keep
their previous modes. Zero requires an explicit saved count so an old missing or
empty preset array cannot accidentally disable Quick Play. A complete old
eight-card order receives Game History immediately after Recommended Match. A
complete older seven-card order receives Recommended Match after Daily Games
and Game History immediately after it. The retired
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
- a complete previous eight-card order gains Game History immediately after
  Recommended Match without changing the relative order of existing cards;
- a complete retired seven-card order gains Recommended Match immediately after
  Daily Games and Game History immediately after Recommended Match without
  changing the relative order of existing cards;
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
    docs/LLM_HANDOFF.md               Canonical current-state project memory
    docs/FINAL_PRODUCT_SPEC.md        Original full spec plus version amendments
    docs/DOM_AUDIT.md                 Verified selectors and launch contract
    docs/ANDROID.md                   Android platform, install, and test guide
    docs/PRODUCT_BRIEF.md              Historical initial requirements
    docs/PRIVACY.md                    Zero-collection privacy promise
    docs/RELEASE_CHECKLIST.md          Automated, visual, and live gates
    public/manifest.json               MV3 permissions, matches, and version
    src/content/content-script.ts      Runtime lifecycle and settings listener
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
`https://www.chess.com/home*`.

The extension stores only:

- enabled state;
- native play-panel visibility;
- Daily Games placement;
- Daily Games' remembered Main/Right location while hidden;
- known homepage sidebar card order and visibility;
- selected Quick Play button count and its matching preset IDs;
- Stats summary/rating order and visibility IDs;
- six per-rating initial `expanded` or `retracted` preferences.

It stores no username, rating, games, credentials, cookies, tokens, page HTML, or
analytics. It makes no extension-owned network requests.

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

As of version 0.17.2, the suite has 93 passing tests across twelve files. Important
coverage includes:

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
  expansion-safe idempotence;
- independent one-time native initial expansion or retraction for every visible
  known rating row, preserving later manual state changes;
- dynamic content replacement, route departure, and settings changes;
- Daily Games, Recommended Match, and Game History visibility with remembered
  Main/Right placement plus visibility and fixed ordering for all nine known
  managed cards on desktop and responsive layouts, including custom ordering
  within Main, early hidden-card pre-arming, and retired
  eight-/seven-card-order migration;
- late and pre-hydration Daily Games insertion with a pre-armed native-slot
  marker, both native loading-shell fallbacks, and Quick Play-first loading
  placement even before Game History receives its final component class;
- fixture and manifest privacy boundaries;
- responsive semantic detection/location, reversible single-column order, and
  mutation reconciliation without desktop column IDs;
- optional and dynamically replaced `#main-banner` campaign hiding plus cleanup;
- multiple optional and dynamically replaced `.promo-toolbar-user-info`
  instances hiding plus cleanup, without account-specific selectors;
- exact and dynamically replaced `#homepage-toolbar` hiding plus cleanup while
  its signed-in descendant remains available to the page guard;
- redesigned `#home-header`, column-host, Game History, Stats, Daily Puzzle,
  Streaks, League, Friends, ChessTV, and unknown-card compatibility without
  mistaking history analysis links for Game Review;
- legacy button-based, redesigned link-only, and redesigned anchor/chevron
  expandable Stats schema handling;
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
    http://127.0.0.1:4173/home-modern
    http://127.0.0.1:4173/home-modern?recommended-right=1
    http://127.0.0.1:4173/home-modern?recommended-hidden=1
    http://127.0.0.1:4173/home-modern?main-order-preview=1
    http://127.0.0.1:4173/home-modern?preset-count=0
    http://127.0.0.1:4173/home-narrow-preview
    http://127.0.0.1:4173/popup-preview
    http://127.0.0.1:4173/popup
    http://127.0.0.1:4173/sidepanel-preview
    http://127.0.0.1:4173/sidepanel.html

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

Use semantic versioning:

- patch for fixes and small visual/order adjustments;
- minor for meaningful user-visible capabilities;
- major only for a stable public milestone.

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

For Android, also run `pnpm build:android`, inspect the userscript metadata, and
confirm it contains only the four documented local GM grants and no remote
dependency or request directive.

Latest explicitly prepared Store artifact:

    release/chesscom-vinf-0.17.2.zip

SHA-256:

    43a4a7742eceb3ab72f8a522305f94f5fed7d4c8a447497e8cdc25c5f4905247

Android artifact:

    dist-android/chesscom-vinf.user.js

Latest convenience Chrome Web Store handoff:

    release/chesscom-vinf-0.17.2-store-submission.zip

SHA-256:

    c024e3d1e3ae0d52bce35fee811113d7b762f8cbb9b362b07f9308bc570d8a97

The project is an independent public Git repository:

    https://github.com/matejbolta/chesscom-vinf

The complete signed-in Chess.com capture and the original account-specific
reference image remain local under `fixtures/raw/` and are intentionally ignored.
Only `fixtures/raw/README.md` may be committed from that directory.

Public-safe Chrome Web Store copy and synthetic graphic assets live under
`store-listing/`. The public privacy-policy URL is:

    https://github.com/matejbolta/chesscom-vinf/blob/main/docs/PRIVACY.md

Version 0.15.4 was submitted to the Chrome Web Store by the user on 2026-07-28.
Treat it as the current submitted store version unless a later handoff records a
review rejection, approval, or newer upload. `store-listing/SUBMISSION.md`
contains the complete field-by-field 0.17.2 update record using copy-safe
fenced text blocks instead of Markdown blockquotes. The settings screenshot is
public-safe and shows the side-panel action and prepared version; the two
homepage screenshots and promo artwork remain unchanged from 0.15.4.

`store-listing/UPDATE_TLDR.md` is the preferred dashboard workflow for this
update. It lists only what changes from the already submitted 0.15.4 version,
what remains unchanged, and the exact package identity. Keep the longer
submission document as the full reference rather than making the user repeat
the original submission process.

The 0.15.4 source release commit is `3f055bd`, and tag `v0.15.4` is public at:

    https://github.com/matejbolta/chesscom-vinf/releases/tag/v0.15.4

That GitHub release includes `chesscom-vinf-0.15.4.zip` with the same SHA-256
recorded in its release. Version 0.17.2 source commit `beb4163` is published on
`main` and prepared for the Chrome Web Store, but is not yet tagged, released on
GitHub, or uploaded to the Chrome Web Store. Its local `dist/`, `dist-android/`,
Store ZIP, and convenience submission archive are rebuilt and validated. The
local release directory remains ignored by Git.

Before every push, run the full test suite. `tests/privacy.test.ts` rejects
absolute home paths, literal private LAN addresses, email addresses,
secret-shaped credentials, and weakened raw-capture ignore rules.

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
6. Confirm Daily Games, Recommended Match, and Game History Show/Hide and
   Main/Right placement plus every known managed card's visibility/order apply
   within both columns without a reload.
7. Confirm Recommended Match in Main, Right, and Hidden. At sidebar width its
   native challenge tile must use one column.
8. Confirm Game History in Main, Right, and Hidden; when Right, verify native
   history rows and links remain usable.
9. Confirm refresh, SPA departure/return, and narrow-window behavior.
10. Confirm Game History, Stats, navigation, and every enabled optional card
   remain usable.
11. Install the Android userscript in current Firefox/Violentmonkey and verify
   portrait, landscape, settings persistence, SPA return, and disable/restore.

Do not mark these complete based only on fixtures or URL-construction tests.

## Product Scar Tissue

These decisions came from repeated live visual review. Do not accidentally
reverse them while “cleaning up” code:

- The name is VINF, not WINF.
- Game Review is intentionally removed.
- The Quick Play title and `Choose time control` subtitle were intentionally
  removed for minimalism.
- Visible `Starting…`/failure rows were intentionally removed because they caused
  alarming red text and layout movement.
- Buttons intentionally show only the time, not `Play`.
- Clock icons were intentionally removed.
- Quick Play intentionally matches the full Game History width and aligns left.
- The complete sidebar intentionally starts alongside Quick Play.
- The default managed card order is intentionally Stats, ChessTV, Daily Games,
  Recommended Match, Game History, Streaks, Legend League, Daily Puzzle,
  Friends. Every known card has explicit presentation settings. Daily Games,
  Recommended Match, and Game History use the same checkbox plus a Main/Right
  selector that preserves location while hidden. Recommended Match and Game
  History intentionally default to Main. The one saved sequence applies
  independently within Main and Right; Quick Play remains pinned above Main.
- The right-column label is intentionally `ChessTV`, not `ChessTV & events`.
  Separate event banners are different native homepage modules even when
  Chess.com's own settings group both features under one toggle.
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
- The visible desktop avatar/name/flag strip is `#homepage-toolbar`; it is
  intentionally hidden without targeting `#mobile-toolbar` or generic headers.
- Every `.promo-toolbar-user-info` compatibility variant remains hidden; the
  live marked instance was empty and the class is not assumed to be unique.
- The 2026-07-28 redesign is a separate explicit contract: `#home-header`,
  `#home-main > .main-component`, and
  `#home-sidebar > .sidebar-component`. Preserve the legacy contract alongside
  it for A/B cohorts and rollbacks.
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
  2026-07-16 legacy shell, 2026-07-28 redesign, and 2026-07-29 native
  Recommended Match card.
- Promo-card detection uses exact English titles and may not work in other
  locales.
- Known Stats row recognition uses exact English native labels. Semantic paths
  are preferred where available, but a non-English Stats rollout may require a
  sanitized audit update.
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
`.stat-item-stats-section` ratings matching `DOM_AUDIT.md`. Known rows should
carry `stats-summary-*` or `stats-rating-*` hidden reasons when disabled. Any
native Insights row must remain unmarked and last. Do not hide an unknown row
to make the card look tidy; capture the smallest sanitized new structure and
update the catalog/audit deliberately.

### The top avatar/name strip remains visible

First confirm the popup and `brave://extensions` card show the current source
version; otherwise Brave is reloading a stale unpacked directory. In version
0.8.4 and later, the visible `#homepage-toolbar` must carry
`data-chesscom-vinf-hidden="homepage-toolbar"`. Separate
`.promo-toolbar-user-info` instances must carry the `promo-user-info` marker,
but the live marked instance was empty. Do not replace either exact selector
with a broad profile selector.

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
