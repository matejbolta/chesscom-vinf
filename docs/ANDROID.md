# Android Installation and Architecture

Last verified: 2026-07-26.

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
4. Confirm the script is enabled and its match is
   `https://www.chess.com/home*`.

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

Violentmonkey should open its install screen. Review the four local GM grants and
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
known managed card. Daily Games, Recommended Match, and Game History use the
same visibility checkbox plus a `Main` / `Right` selector that remembers their
location while hidden. The one saved sequence determines their relative order
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
```

The Android shell contributes only:

- a Violentmonkey local-settings adapter;
- the settings menu command and responsive modal;
- bundled local CSS and userscript metadata.

It makes no network requests. Matchmaking still derives from the native
same-origin Chess.com immediate-match link already present in the signed-in
homepage, and changes only `base` and `timeIncrement`.

## Responsive behavior

VINF has two DOM modes:

- **Two-column:** either the legacy `#vue-instance` /
  `#vue-sidebar-instance` hosts or redesigned `#home-main` /
  `#home-sidebar` hosts keep their existing behavior, with the saved card order
  filtered independently within Main and Right.
- **Responsive/single-column:** VINF finds cards using semantic URLs, headings,
  and native component landmarks. Quick Play is inserted before the movable
  Main-card group; that group and the conceptual Right-card group each follow
  the saved card order. Daily Games, Recommended Match, and Game History follow
  their visibility plus Main/Right placement, and every other known card follows
  its Show/Hide setting. Legacy native action, Puzzles, Next Lesson,
  Game Review, and the optional
  `#main-banner` campaign are hidden. Every optional
  `.promo-toolbar-user-info` compatibility variant is also hidden. The exact
  `#homepage-toolbar` containing the avatar/name strip is hidden when the
  responsive page exposes that desktop toolbar; unrelated mobile profile
  controls are not targeted. The redesigned exact `#home-header` hero follows
  Native play panel while its native launch link remains available in the DOM.

At tablet widths Quick Play uses two columns. At narrow phone widths it becomes
one column. Controls keep 7rem touch targets, no hover dependency, visible focus,
and a reduced-motion mode.

The userscript runs at `document-start`. Its shared observer begins at
`.base-container`, responsive `main`/`[role=main]`, `body`, or the document
element as soon as one exists, while waiting for stored settings before changing
the page. Initial incomplete DOM batches reconcile immediately; after activation,
mutations are leading-throttled at 60ms. The 750ms route/root check, idempotent
markers, and original-position restoration all apply on Android.

## Test checklist on the real tablet

Automated tests use a sanitized responsive fixture and never start a game. On
the signed-in tablet, verify:

1. The script runs only on `/home` and leaves other Chess.com routes untouched.
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

## Limitations

- The responsive selectors are covered by a sanitized semantic fixture, but the
  private signed-in Android page could not be captured in this development
  session. Chess.com experiments, locales, or future DOM changes may require a
  small sanitized tablet DOM sample and a locator update.
- Exact English card headings remain a fallback for some cards; semantic URLs
  are preferred where available.
- The settings of the Android userscript and desktop extension are intentionally
  separate.
- Chrome Android and Brave Android are not supported targets for this delivery.
- When Chess.com removes or changes the validated native immediate-match link,
  Quick Play fails closed instead of guessing a matchmaking URL.
