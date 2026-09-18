# ChessComVINF Privacy Policy

Effective date: September 18, 2026

ChessComVINF runs entirely inside the signed-in Chess.com homepage, live games,
and supported live-game review pages.

- It collects, transmits, or sells no data.
- It has no telemetry, analytics, advertising, or remote configuration.
- It makes no extension-owned network requests.
- It stores no usernames, ratings, game history, credentials, cookies, or tokens.
- It stores only local presentation preferences: enabled state, native play
  panel visibility, OLED-black appearance, OLED button palette,
  managed-card visibility/order, Daily Games, Recommended
  Match, Game History, and Profile placement and remembered visible locations, the
  selected Quick Play button count and preset IDs, and the visible
  rows/order/initial states selected for the native Stats card.
- It uses the native Chess.com page action already present in the authenticated
  homepage to start a selected game.

The extension requests Chrome's `storage` permission only for those local
preferences and the `sidePanel` permission only to show the same local settings
interface in Chromium's persistent side panel. Opening that panel collects or
transmits nothing. The content script runs only on
`https://www.chess.com/home*` and
`https://www.chess.com/game/*` and
`https://www.chess.com/live/game/*` and
`https://www.chess.com/analysis/game/*`. The review enhancement
moves an already-rendered native graph and stores nothing about the reviewed
game.

The homepage continuation card uses only the first exact eligible game link
already rendered by Chess.com. This can be an open-game link or the latest
Game History fallback. VINF does not request, persist, or transmit its game ID
or URL.

The Android userscript has the same privacy boundary. It grants only
`GM_getValue`, `GM_setValue`, `GM_addValueChangeListener`, and
`GM_registerMenuCommand` so Violentmonkey can persist those local presentation
settings and open the local settings dialog. It has no cross-origin request
grant, no remote code, and no update URL. Its metadata matches only
`https://www.chess.com/home*` and
`https://www.chess.com/game/*` and
`https://www.chess.com/live/game/*` and
`https://www.chess.com/analysis/game/*`. The runtime still enforces
exact route and layout guards before changing the DOM.

## Third parties

ChessComVINF sells or shares no data with third parties. Normal requests made by
Chess.com remain governed by Chess.com's own terms and privacy policy.

ChessComVINF is an independent, unofficial extension and is not affiliated with,
endorsed by, or sponsored by Chess.com.

## Changes

If a future version changes the extension's data practices, this policy and the
Chrome Web Store disclosures will be updated before that version is distributed.

## Contact

For privacy questions or support, open an issue in the
[public GitHub repository](https://github.com/matejbolta/chesscom-vinf/issues).
