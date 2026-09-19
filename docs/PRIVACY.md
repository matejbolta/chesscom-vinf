# ChessComVINF Privacy Policy

Effective date: September 19, 2026

ChessComVINF runs entirely inside the signed-in Chess.com homepage, live games,
and supported live-game review pages.

- It collects or sells no data. Its only extension-initiated transmission is
  sending the current signed-in UUID back to Chess.com's same-origin presence
  service to resolve an active live game.
- It has no telemetry, analytics, advertising, or remote configuration.
- It makes a read-only, same-origin Chess.com presence request on the signed-in
  homepage when the Open Game shortcut is enabled and refreshes it on ordinary
  click or keyboard activation. Concurrent activations share one request; there
  is no background polling. Requests time out after four seconds.
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
`https://www.chess.com/play/online/new*` and
`https://www.chess.com/game/*` and
`https://www.chess.com/live/game/*` and
`https://www.chess.com/analysis/game/*`. The review enhancement
moves an already-rendered native graph and stores nothing about the reviewed
game.

To make the homepage continuation card work when a live game is open on another
device, VINF reads the current user's UUID from Chess.com's own inline signed-in
page context and sends it only to Chess.com's same-origin
`/service/presence/users` endpoint. It uses only a validated live-game numeric
ID from that response to construct Chess.com's native `/game/<id>` URL for
current RCN live games or `/game/live/<id>` for legacy live games. The UUID,
response, game ID, and URL are kept only in page memory and are never stored,
logged, or sent anywhere else. If the lookup is unavailable or does not prove a
current live game, the card uses the latest eligible link already rendered in
Game History.

The Android userscript has the same privacy boundary. It grants only
`GM_getValue`, `GM_setValue`, `GM_addValueChangeListener`, and
`GM_registerMenuCommand` so Violentmonkey can persist those local presentation
settings and open the local settings dialog. Its presence lookup uses the same
signed-in, same-origin Chess.com endpoint and needs no cross-origin request
grant. It has no remote code and no update URL. Its metadata matches only
`https://www.chess.com/home*` and
`https://www.chess.com/play/online/new*` and
`https://www.chess.com/game/*` and
`https://www.chess.com/live/game/*` and
`https://www.chess.com/analysis/game/*`. The runtime still enforces
exact route and layout guards before changing the DOM.

## Third parties

ChessComVINF sells or shares no data with third parties. The same-origin
presence lookups and normal requests made by Chess.com remain governed by
Chess.com's own terms and privacy policy.

ChessComVINF is an independent, unofficial extension and is not affiliated with,
endorsed by, or sponsored by Chess.com.

## Changes

If a future version changes the extension's data practices, this policy and the
Chrome Web Store disclosures will be updated before that version is distributed.

## Contact

For privacy questions or support, open an issue in the
[public GitHub repository](https://github.com/matejbolta/chesscom-vinf/issues).
