# ChessComVINF LLM Handoff

This document is the durable project memory for future coding agents.

Last updated: 2026-07-27.
Current source version: 0.13.4.
Latest desktop package: `release/chesscom-vinf-0.13.4.zip`.
Android artifact: `dist-android/chesscom-vinf.user.js`.

## Start Here

ChessComVINF means Chess.com Version Infinity. The short product name is VINF,
not WINF. It is an independent Manifest V3 Chrome/Brave extension that improves
only the signed-in Chess.com homepage:

    https://www.chess.com/home

It replaces the visually dominant homepage promo area with a focused six/eight-button
Quick Play grid, promotes Game History and Stats, moves Daily Games into the
sidebar by default, and removes homepage cards that the user does not need.

The extension is implemented and functional. `PRODUCT_BRIEF.md` is the original
historical brief; its old “implementation not started” state is not current.
`FINAL_PRODUCT_SPEC.md` preserves the original detailed specification and the
chronological amendments through version 0.13.4. This handoff is the shortest
canonical statement of the current product.

## Current User Experience

### Homepage

The transformed desktop homepage has:

- the normal Chess.com left navigation untouched;
- a bare user-selected six- or eight-button Quick Play grid at the top of the
  native main/left column;
- Quick Play exactly as wide as Game History;
- no Quick Play heading, subtitle, logo, clock glyphs, or visible launch-status
  row;
- Game History directly below Quick Play when Daily Games is in the sidebar;
- no transient Daily Games row above Quick Play when Chess.com inserts that
  native module late;
- the right sidebar beginning at the same vertical position as Quick Play;
- right-sidebar order: Stats, ChessTV, Daily Games, Legend League;
- minimal fixed Stats content by default: Games, Rapid, Blitz, then Insights.

The extension hides:

- the optional recurring top campaign at the exact `#main-banner` landmark;
- the visible avatar, username, and flag header at exact `#homepage-toolbar`;
- every separate `.promo-toolbar-user-info` compatibility variant;
- Chess.com's native homepage quick-action column;
- the profile-adjacent top Legend League summary inside that column;
- Puzzles;
- Next Lesson;
- Game Review;
- the empty native promo row after Quick Play moves into the main column.

The native quick-play link remains in the hidden DOM because VINF derives safe
launch URLs from it.

### Quick Play visual rules

- Exactly six or eight controls are rendered, matching the grid size selected
  by the user.
- Labels are centered and time-only: `10`, `10 + 5`, `30 sec`, and so on.
- Accessible names remain action-oriented: for example `Play 10 + 5`.
- Buttons have no icons and do not say `Play` visibly.
- Desktop grid flow is column-first with two rows: three columns for six
  controls and four columns for eight.
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
- a `Homepage` card containing the Daily Games placement selector
  (`Main column`, `Right column`, or `Hidden`) and independent `Show ChessTV`
  and `Show Legend League` toggles;
- a six/eight Quick Play size selector and the corresponding number of preset
  selectors;
- summary and rating visibility/order controls for the native Stats card;
- an independent `Expanded` / `Retracted` selector beside every Stats rating
  row;
- separate Quick Play and Stats Reset actions;
- brief autosave status feedback.

Every toggle, select, Stats checkbox, row movement, and Reset saves immediately.
There is no Save button. Storage writes are serialized so rapid changes cannot
finish out of order. A choice already used by one shortcut is disabled in the
other active selectors. Quick Play Reset restores the selected grid size's
presets. Stats Reset restores only the Stats visibility/order/state defaults.
Neither Reset changes the homepage module settings.

Stats defaults are summary order Games/Puzzles/Lessons with only Games visible,
and rating order Rapid/Blitz/Bullet/Daily/Puzzles/Live 960 with only Rapid and
Blitz visible. Every known rating row stores its own initial state, defaulting
to `Retracted`; `Expanded` is also available. Hidden rows retain that choice
while their selector is disabled. VINF applies the selected state once through
each visible native row's own button, then respects every later manual expansion
or collapse. Insights is not configurable: it always remains visible at the
bottom. Known native rows are moved/hidden rather than rebuilt. Unknown future
rows are preserved.

Disabling VINF removes extension-owned UI and restores hidden/moved native nodes.
Daily Games defaults to the right sidebar between ChessTV and Legend League. It
can instead return to its original main column or be hidden. ChessTV and Legend
League can be hidden independently. All three settings move or hide complete
native nodes and update immediately without a reload.

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

In a semantic responsive/single-column DOM, default visible order is Quick Play,
Game History, Stats, ChessTV, Daily Games, Legend League. Optional cards follow
the same placement/visibility settings as desktop. Native actions, Puzzles,
Next Lesson, Game Review, and `#main-banner` remain hidden. The exact
`#homepage-toolbar` and all `.promo-toolbar-user-info` variants are also hidden
when present, without targeting `#mobile-toolbar` or generic responsive profile
controls. The grid is two columns at tablet widths and one column below 450px.

Read `docs/ANDROID.md` for current platform evidence, installation steps, live
tablet checks, and limitations.

## Time-Control Catalog

The popup offers a desktop-first union of 17 controls observed across current
Chess.com desktop and mobile clients. Exactly six or eight may be active at once.

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

Do not change the six defaults casually. Their stored/render order is:

    10-0, 10-5, 15-10, 30-0, 3-2, 5-3

Because the desktop grid flows by column, that produces the intended two-row
layout shown above.

The eight-button stored/render order is:

    10-0, 10-5, 15-10, 30-0, 1-1, 3-0, 3-2, 5-5

That produces the documented two-row, four-column layout.

## Non-Negotiable Product Rules

1. Run only on the exact signed-in Chess.com `/home` or `/home/` route.

2. Leave the main Chess.com navigation intact.

3. Render exactly the selected six or eight unique Quick Play controls.

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

14. Keep popup settings autosaving. Quick Play Reset is preset-only and Stats
    Reset is Stats-only.

15. Keep Insights visible and last. Hide or reorder only positively recognized
    native Stats rows; preserve unknown future rows.

16. Do not add telemetry, analytics, ads, tracking, remote code, remote
    configuration, or extension-owned network requests.

17. Never commit or package raw signed-in page captures, account identifiers,
    session markup, tokens, screenshots, or reference assets.

18. Do not broaden hosts, routes, or permissions without an explicit product
    decision.

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

The runtime guard requires all of:

- HTTPS;
- host `chess.com` or `www.chess.com`;
- exact pathname `/home` or `/home/`;
- `html.user-logged-in`;
- signed-in profile landmark;
- `.promo-component`;
- `#vue-instance.layout-column-one`;
- `#vue-sidebar-instance.layout-column-two`.

Important locators:

- recurring top campaign: exact optional `#main-banner`; never campaign text,
  `data-name`, assets, or generated classes;
- visible desktop profile strip: exact optional `#homepage-toolbar`, whose
  `.toolbar-user-info[data-cy="profile-section"]` descendant remains the
  signed-in guard landmark;
- empty/variant promo user strips: all exact optional
  `.promo-toolbar-user-info` instances; never username, member URL, avatar,
  flag, or generic profile selectors;
- native action stack: `.play-quick-links-component`, promoted to its direct
  promo child;
- native launch template: link containing `action=createLiveChallenge` inside
  that action stack;
- Puzzles/Next Lesson/Game Review: exact English `.promo-title` within a direct
  promo child;
- Game History: `.game-history-games-component`, promoted to the direct left
  column child;
- Daily Games: direct left-column child containing `/play/online/daily`, with
  `.current-games-header-list` and the earlier
  `.home-current-games-loading-view-toggle-container` as desktop
  pre-hydration fallbacks;
- Stats: direct sidebar child containing `/stats/overview/`;
- Stats summary rows: direct `li.sidebar-ratings-item` children of direct
  `ul.sidebar-ratings-general`, recognized by exact descendant text node Games,
  Puzzles, or Lessons;
- Stats rating rows: direct `.stat-section-stats-section` children, recognized
  by exact `.stat-section-section-link-name` text;
- Insights: rating-shaped row containing a link beginning `/insights/`, with an
  exact-label fallback; always visible and appended last;
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
correct modules unnecessarily. Quick Play/main-column work occurs before
sidebar ordering and Stats normalization in the same synchronous reconcile; the
browser normally paints that as one update rather than three visible phases.
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

Version 0.12 uses the same marker with value `hidden` for hidden Daily Games,
and adds `data-chesscom-vinf-chess-tv="hidden"` plus
`data-chesscom-vinf-legend-league="hidden"`. After local settings load, the
runtime pre-arms these exact document markers even while `/home` landmarks are
incomplete, then re-arms them after any provisional controller cleanup. Exact
desktop `:has(...)` rules cover the already-audited native TV and league
landmarks until element-level hidden markers take over. Main-column placement,
showing a card, disabling VINF, or leaving `/home` removes the relevant marker.

After stored settings load, the runtime also sets
`data-chesscom-vinf-active="true"` on the exact enabled `/home` document before
complete homepage landmarks are required. Namespaced CSS uses that stable
ancestor to pre-hide exact native `#homepage-toolbar`, `#main-banner`,
`.promo-toolbar-user-info`, and `.promo-component` replacements. This closes a
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
  dailyGamesPlacement: "main" | "sidebar" | "hidden";
  showChessTv: boolean;
  showLegendLeague: boolean;
  quickPlayPresetCount: 6 | 8;
  timeControlIds: TimeControlId[]; // exactly the selected count of unique IDs
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

Defaults are enabled, Daily Games in the sidebar, ChessTV and Legend League
visible, six-button mode, and the original six IDs documented above. Stats
defaults are Games only plus Rapid/Blitz, in the fixed orders described in
Current User Experience, with all six rating-state values initially retracted.
`normalizeSettings` is the persistence boundary; old saved objects infer
six-button mode from their valid six-ID array and automatically gain all Stats
defaults. A valid legacy eight-ID array infers eight-button mode. The retired
global `statsDefaultState` value is copied to all six per-rating entries during
migration.

Preserve these migrations:

- old `reorderGameHistory` becomes `dailyGamesPlacement`;
- retired `moveDailyGamesToSidebar` becomes `dailyGamesPlacement`;
- retired `15-0` becomes `20-0`.
- retired global `statsDefaultState` becomes the fallback for every missing
  `statsRatingStates` entry.

Invalid, duplicate, or incorrectly sized preset arrays fall back to the complete
default set for the selected grid size instead of rendering a partial grid.
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
    src/content/quick-play-renderer.ts Six/eight-button UI and interaction states
    src/content/launch-adapter.ts       Validated native URL derivation
    src/content/content.css             Homepage layout and category styling
    src/popup/                          Autosaving settings UI
    src/userscript/                     Android userscript entry and modal CSS
    src/shared/models.ts                Settings/time-control types
    src/shared/settings.ts              Normalization, migration, local storage
    src/shared/stats.ts                 Stats row catalogs and defaults
    src/shared/time-controls.ts         17-control catalog and 6/8 defaults
    tests/fixtures/homepage.html        Small sanitized DOM fixture
    tests/fixtures/homepage-responsive.html  Responsive semantic fixture
    tests/visual/                       Local full-page visual harness
    scripts/build.mjs                   Production dist builder
    scripts/build-android.mjs           Android userscript builder
    scripts/package.mjs                 Root-manifest release ZIP builder
    dist/                               Generated unpacked extension
    dist-android/                       Generated Android userscript
    release/                            Generated versioned ZIPs

## Privacy and Fixture Safety

The manifest has only the `storage` permission. It has no host permission entry;
the content script itself is narrowly matched to `https://www.chess.com/home*`.

The extension stores only:

- enabled state;
- Daily Games placement;
- ChessTV and Legend League visibility;
- selected Quick Play grid size and its six or eight preset IDs;
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

As of version 0.13.4, the suite has 70 passing tests across twelve files. Important
coverage includes:

- exact signed-in homepage detection and route rejection;
- semantic module location and missing optional modules;
- idempotent layout, cleanup, native restoration, and sidebar order;
- all 17 launch base/increment mappings;
- exactly six or eight accessible rendered shortcuts and mixed
  Bullet/Blitz/Rapid sets;
- launch de-duplication, timeout recovery, and fail-closed behavior;
- settings defaults, migration, normalization, autosave, and duplicate blocking;
- Stats defaults, custom order/visibility, scoped resets, cleanup restoration,
  unknown-row preservation, fixed Insights placement, and expansion-safe
  idempotence;
- independent one-time native initial expansion or retraction for every visible
  known rating row, preserving later manual state changes;
- dynamic content replacement, route departure, and settings changes;
- tri-state Daily Games placement plus independent ChessTV/Legend visibility on
  desktop and responsive layouts, including early hidden-card pre-arming;
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
- enabled-document pre-hiding of exact native toolbar/banner/promo replacements
  before delayed mutation reconciliation;
- document-start observation, settings-load gating, and landmarks arriving after
  runtime startup.

### Local visual harness

Build first, then run:

```sh
pnpm visual
```

Useful routes:

    http://127.0.0.1:4173/home
    http://127.0.0.1:4173/home?eight-preview=1
    http://127.0.0.1:4173/home?union-preview=1
    http://127.0.0.1:4173/home?pre-hydration=1
    http://127.0.0.1:4173/home-online-tv
    http://127.0.0.1:4173/home-responsive
    http://127.0.0.1:4173/popup

`union-preview=1` renders Bullet, mobile Blitz, and Rapid examples without
starting a game. At the 1600px verification viewport, Quick Play and Game History
were both 728px wide. Version 0.9.0 was visually checked at desktop, extension
popup, and responsive fixture sizes with no browser-console errors. The desktop
Stats card rendered only Games, Rapid, Blitz, and Insights in that order; the
popup's nine Stats controls were readable and scrollable at 420×600.

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
The real tablet DOM and six live clocks require human-controlled signed-in
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

For a user-visible release:

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

Current artifact:

    release/chesscom-vinf-0.13.4.zip

Android artifact:

    dist-android/chesscom-vinf.user.js

The project directory is not currently an independent Git repository. Do not
assume Git status, tags, or release history exist; verify before using Git and
never initialize or publish a repository without the user's request.

## Manual Live Checklist Still Outstanding

Before any public release beyond private use, a human in a signed-in browser
should verify:

1. Load `dist/` unpacked in current Brave and Chrome.
2. Start one real match for each currently selected control in the active grid.
3. Confirm every resulting clock exactly matches its button.
4. Confirm popup settings, including Stats visibility/order and independent
   per-rating initial states, survive popup close/reopen and browser restart.
5. Confirm extension disable/enable restores and reapplies the native page.
6. Confirm all three Daily Games placements and both optional-card toggles apply
   without a reload.
7. Confirm refresh, SPA departure/return, and narrow-window behavior.
8. Confirm Game History, Stats, navigation, and every enabled optional card
   remain usable.
9. Install the Android userscript in current Firefox/Violentmonkey and verify
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
- Daily Games intentionally sits between ChessTV and Legend League by default,
  but all three cards now have explicit presentation settings.
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
- Six-button mode intentionally uses two rows of three. Eight-button mode keeps
  the same gap and total Game History width while using two rows of four.
- Rapid popup order is intentionally `10`, `10+5`, `15+10`, `20`, `30`, `60`.
- Desktop and Android settings intentionally share one Blitz group ordered
  `3`, `3+2`, `5`, `5+2`, `5+3`, `5+5`; do not recreate a mobile subgroup.
- There is intentionally no Save button in the popup.
- Stats intentionally defaults to Games, retracted Rapid, retracted Blitz, and
  Insights. Insights is not configurable and always remains last.
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

## Known Limitations and Risks

- Chess.com can change its Vue structure, semantic classes, or native launch
  link at any time.
- Campaign content is intentionally ignored; if Chess.com changes the
  `#main-banner` landmark itself, the exact selector will need a new live audit.
- If Chess.com renames `#homepage-toolbar` or `.promo-toolbar-user-info`,
  re-audit the exact semantic modules; do not replace them with account-specific
  or broad profile selectors.
- The primary complete-page capture and sanitized DOM fixture date from
  2026-07-16.
- Promo-card detection uses exact English titles and may not work in other
  locales.
- Known Stats row recognition uses exact English native labels. Semantic
  `/insights/` routing is preferred for Insights, but a non-English Stats rollout
  may require a sanitized audit update.
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
- required profile/promo/column landmarks still exist.

### Quick Play appears but every button is disabled

The native launch template was not found or failed validation. Inspect only the
native action column and compare it with `DOM_AUDIT.md`. Do not add an invented
route fallback.

### Quick Play duplicates or modules jump repeatedly

Check mutation-triggered reconciliation, namespaced markers, and original
position tracking. Repeated `reconcile` calls must preserve one owned panel and
an already-correct sidebar prefix.

### ChessTV or Legend League order is wrong

Check both online ChessTV player landmarks and the `/tv` fallback. The online
card may show a streamer name instead of `Live on ChessTV`.

### Stats order or visibility is wrong

Confirm the Stats card still has direct `ul.sidebar-ratings-general` summary
rows and direct `.stat-section-stats-section` rating wrappers matching
`DOM_AUDIT.md`. Known rows should carry `stats-summary-*` or `stats-rating-*`
hidden reasons when disabled. Insights must remain unmarked and last. Do not
hide an unknown row to make the card look tidy; capture the smallest sanitized
new structure and update the catalog/audit deliberately.

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
