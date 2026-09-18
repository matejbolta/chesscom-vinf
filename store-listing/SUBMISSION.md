# Chrome Web Store update — ChessComVINF 2.2.0

For the short list of dashboard changes from the currently published 1.0.8
version, use `UPDATE_TLDR.md`.

## Package

- Upload: `../release/chesscom-vinf-2.2.0.zip`
- Version: `2.2.0`
- SHA-256:
  `c2155f2b879bea3baa6409644ba9ddd6825226e82c2043fbffcaacb337e268bc`

The package contains only the Manifest V3 extension. The Android userscript,
private fixtures, source maps, Store assets, and release documentation are not
included.

## Store listing

### Description

Copy only the text inside this block:

```text
ChessComVINF creates a calmer, more useful Chess.com experience focused on playing and reviewing chess.

It replaces distracting homepage promotions with configurable Quick Play buttons, keeps Game History prominent, lets you arrange native homepage cards, and adds optional OLED presentation to supported homepage, game, and Game Review pages.

Features:

• Choose 0, 1, 2, 3, 4, 6, or 8 one-click Bullet, Blitz, and Rapid presets.
• Reuse the same time control in as many Quick Play buttons as you want.
• Change the button count while preserving existing choices and filling only new slots.
• Remove Quick Play completely by choosing zero buttons.
• Show or hide Chess.com’s large native play panel.
• Show, hide, and reorder known homepage cards.
• Put Profile, Daily Games, Recommended Match, Game History, and Open Game in the main or right column, or hide them.
• Use Open Game to follow Chess.com’s exact active-game link when one is present, with Game History as a deliberate finished-game fallback.
• Apply one saved card order within both the main and right columns.
• Choose which Stats rows appear, their fixed order, and whether each enabled rating starts expanded or retracted when Chess.com supports expansion.
• Hide recurring campaign banners.
• Keep ChessTV’s native loading and playback behavior unchanged when its card is shown.
• Save every setting immediately without a separate Save button.
• Open and close settings from Chromium’s persistent side panel when supported.
• Use an optional true-black page canvas on supported homepage, game, and Game Review routes.
• Independently use low-glare OLED button colors for Quick Play and Open Game.
• On narrow phone Game Review layouts, keep Chess.com’s native evaluation graph directly below the board.
• Disable all VINF changes instantly from the popup or side panel.

Privacy:

VINF has no analytics, advertising, telemetry, remote code, or developer-operated servers. It stores only your presentation preferences in Chrome storage and does not collect or transmit account data or page content.

VINF runs only on the signed-in Chess.com homepage and exact supported Chess.com game and Game Review routes. Quick Play and Open Game use Chess.com’s own native links; the extension does not access credentials or private matchmaking APIs.

ChessComVINF is an independent, unofficial extension and is not affiliated with, endorsed by, or sponsored by Chess.com.
```

### Graphic assets

- Replace only: `assets/screenshot-03-settings.jpg`
- Keep unchanged:
  - `assets/screenshot-01-focused-home.jpg`
  - `assets/screenshot-02-eight-presets.jpg`
  - `assets/store-icon-128.png`
  - `assets/small-promo-440x280.jpg`
  - `assets/marquee-promo-1400x560.jpg`

The replacement screenshot is synthetic, public-safe, 1280×800, and contains
no live account data or image metadata.

## Unchanged dashboard fields

- Extension ID: `pfdelnfocedcbpomokhdaampckmhomme`
- Category: `Productivity`
- Language: `English`
- Mature content: `Off`
- Homepage: `https://github.com/matejbolta/chesscom-vinf`
- Privacy policy: `https://github.com/matejbolta/chesscom-vinf/blob/main/docs/PRIVACY.md`
- Support: `https://github.com/matejbolta/chesscom-vinf/issues`
- Official URL: `None`
- Permissions: `storage`, `sidePanel`
- Remote code: `No`
- Data collected: `None`
- Every data-use category: unchecked
- All three required data-use certifications: checked
- Visibility: `Public`
- Regions: `All regions`
- Pricing: free
- In-app purchases: none
- Reviewer test instructions: may remain empty

## Privacy-copy reference

### Single purpose

```text
Improve the signed-in Chess.com homepage and supported game/review presentation with configurable layout, one-click time-control shortcuts, and optional OLED styling.
```

### Permission justification — storage

```text
Stores only the user’s local VINF presentation settings—enabled state, Quick Play controls, card placement and order, Stats display preferences, and OLED appearance choices—so they persist across browser sessions. No account, game, or page data is stored.
```

### Permission justification — sidePanel

```text
Shows the same packaged local VINF settings interface in Chromium’s persistent side panel when the user explicitly opens it from the extension popup. It does not access page content, account data, or browsing activity.
```

### Site access justification

```text
The content script runs only on Chess.com’s signed-in homepage plus supported game and Game Review URL shapes. It rearranges user-selected homepage modules, renders configured Quick Play controls, applies optional presentation-only OLED styles, and repositions Chess.com’s native evaluation graph on narrow move-by-move review layouts. It makes no network requests and does not run on messages, account settings, or other websites.
```

### Remote-code explanation

```text
All executable JavaScript and CSS is included in the uploaded package. The extension does not download or execute remote code.
```

## Reviewer instructions if Google requests them

```text
ChessComVINF applies to the signed-in Chess.com homepage and exact supported Chess.com game and Game Review routes.

1. Sign in to a Chess.com test account and open https://www.chess.com/home.
2. Confirm that configurable Quick Play buttons appear above the selected native main-column cards.
3. Open the ChessComVINF toolbar popup. Use its header button to open the same settings in the browser side panel.
4. Change the Quick Play grid size and selected time controls.
5. Change the visibility, Main/Right placement, and order of Profile, Daily Games, Recommended Match, and Game History. Change other managed-card and Stats visibility/order settings.
6. Enable “OLED black” and “OLED button colors”; confirm that the homepage canvas is black and Quick Play uses the low-glare palette.
7. Refresh the homepage and confirm that all settings persist.
8. Open a supported Chess.com game or Game Review URL and confirm that OLED black changes presentation only. At a phone-width move-by-move review layout, the native evaluation graph appears directly below the board.
9. Turn off “Enable VINF” and confirm that the native layout and presentation are restored after the page updates.

Most functionality can be reviewed without starting a live game. If a Quick Play shortcut is tested, it uses Chess.com’s own native game-start URL. No developer-provided account or credentials are required.
```
