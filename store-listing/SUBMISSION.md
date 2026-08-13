# Chrome Web Store update — ChessComVINF 1.0.8

For the short list of dashboard changes from the currently uploaded 0.17.3
version, use `UPDATE_TLDR.md`.

## Package

- Upload: `../release/chesscom-vinf-1.0.8.zip`
- Version: `1.0.8`
- SHA-256:
  `22bfb07bb62156c07dd0a8e839d2cc53000b5e304761aa808c37e4bdb2b57c31`

The package contains only the Manifest V3 extension. The Android userscript,
private fixtures, source maps, Store assets, and release documentation are not
included.

## Store listing

### Description

Copy only the text inside this block:

```text
ChessComVINF creates a calmer, more useful Chess.com homepage focused on playing chess.

It replaces distracting homepage promotions with configurable Quick Play buttons, keeps Game History prominent, and lets you decide which native homepage cards remain visible and where they appear.

Features:

• Choose 0, 1, 2, 3, 4, 6, or 8 one-click Bullet, Blitz, and Rapid presets.
• Reuse the same time control in as many Quick Play buttons as you want.
• Change the button count while preserving existing choices and filling only new slots.
• Remove Quick Play completely by choosing zero buttons.
• Show or hide Chess.com’s large native play panel.
• Show, hide, and reorder known homepage cards.
• Put Profile, Daily Games, Recommended Match, and Game History in the main or right column, or hide them.
• Apply one saved card order within both the main and right columns.
• Choose which Stats rows appear, their fixed order, and whether each enabled rating starts expanded or retracted when Chess.com supports expansion.
• Hide recurring campaign banners.
• Keep ChessTV’s native loading and playback behavior unchanged when its card is shown.
• Save every setting immediately without a separate Save button.
• Open and close settings from Chromium’s persistent side panel when supported.
• Disable all VINF changes instantly from the popup or side panel.

Privacy:

VINF has no analytics, advertising, telemetry, remote code, or developer-operated servers. It stores only your presentation preferences in Chrome storage and does not collect or transmit account data or page content.

VINF runs only on the signed-in Chess.com homepage. Quick Play uses Chess.com’s own native game-start link; the extension does not access credentials or private matchmaking APIs.

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
Improve the signed-in Chess.com homepage by simplifying its layout and providing configurable one-click time-control shortcuts.
```

### Permission justification — storage

```text
Stores only the user’s local VINF settings—enabled state, selected Quick Play count and time controls, native card placement, visibility and order, and Stats display preferences—so they persist across browser sessions. No account or page data is stored.
```

### Permission justification — sidePanel

```text
Shows the same packaged local VINF settings interface in Chromium’s persistent side panel when the user explicitly opens it from the extension popup. It does not access page content, account data, or browsing activity.
```

### Site access justification

```text
The content script runs only on https://www.chess.com/home* so it can rearrange native homepage modules, hide user-selected modules, and render the configured Quick Play controls. VINF does not run on games, messages, account settings, or other websites.
```

### Remote-code explanation

```text
All executable JavaScript and CSS is included in the uploaded package. The extension does not download or execute remote code.
```

## Reviewer instructions if Google requests them

```text
ChessComVINF applies only to the signed-in Chess.com homepage.

1. Sign in to a Chess.com test account and open https://www.chess.com/home.
2. Confirm that configurable Quick Play buttons appear above the selected native main-column cards.
3. Open the ChessComVINF toolbar popup. Use its header button to open the same settings in the browser side panel.
4. Change the Quick Play grid size and selected time controls.
5. Change the visibility, Main/Right placement, and order of Profile, Daily Games, Recommended Match, and Game History. Change other managed-card and Stats visibility/order settings.
6. Refresh the homepage and confirm that all settings persist.
7. Turn off “Enable VINF” and confirm that the native homepage layout is restored after the page updates.

Most functionality can be reviewed without starting a live game. If a Quick Play shortcut is tested, it uses Chess.com’s own native game-start URL. No developer-provided account or credentials are required.
```
