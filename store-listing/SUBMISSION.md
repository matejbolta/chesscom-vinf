# Chrome Web Store update — ChessComVINF 2.24.2

For the dashboard checklist, use `UPDATE_TLDR.md`. Verify the currently published version in the dashboard before submission.

## Package

- Upload: `../release/chesscom-vinf-2.24.2.zip`
- Version: `2.24.2`
- SHA-256:
  `96566c223efac907e08480e79fd6827a6f3e09a1b80e378900d76bdeaac0d55d`

The package contains only the Manifest V3 extension. The Android userscript,
private fixtures, source maps, Store assets, and release documentation are not
included.

## Store listing

### Description

Copy only the text inside this block:

```text
ChessComVINF makes Chess.com calmer and easier to use, from your homepage to your game review.

• Arrange, hide and reorder homepage cards in the main or right column.
• Choose your own one-click Quick Play presets.
• Keep useful Stats and a shortcut to your open game close by.
• Use true-black OLED styling or an even darker Extreme OLED board.
• Enjoy cleaner game controls, configurable turn indicators and a phone-friendly review layout.
• Customize Pokémon pieces from Generations I–III.
• Change settings from the toolbar popup or optional side panel. Everything saves automatically.

Start with OLED enabled and eight customizable Quick Play presets. You can change these anytime.

Also available on Android phones and tablets through Firefox and Violentmonkey. This requires a separate installation from our GitHub page; the Chrome Web Store package is for desktop browsers. Installation instructions and downloads are linked from the project homepage.

Privacy: No analytics, advertising, telemetry or developer-operated servers. Preferences stay in your browser. The Open Game shortcut sends your signed-in identifier only to Chess.com’s own presence service to find your active game; VINF does not store account details. Small tab-local game/clock references keep visual indicators consistent across refreshes. All executable code is bundled locally.

ChessComVINF is an independent, unofficial extension and is not affiliated with or endorsed by Chess.com. Pokémon artwork remains the property of its respective owners.
```

### Graphic assets

Replace the screenshot gallery with all five images, in this order:

1. `assets/screenshot-01-focused-home.jpg` — default desktop homepage.
2. `assets/screenshot-02-quick-play.jpg` — default eight-preset grid and stats settings.
3. `assets/screenshot-03-settings.jpg` — default homepage and OLED settings.
4. `assets/screenshot-04-live-game.jpg` — phone gameplay layout.
5. `assets/screenshot-05-game-review.jpg` — phone Game Review layout.

All screenshots are 1280×800, use fictional data/default settings and omit version badges. Phone images explicitly describe the separate Android Firefox + Violentmonkey installation.

Replace both promotional tiles:

- `assets/small-promo-440x280.jpg` (440×280)
- `assets/marquee-promo-1400x560.jpg` (1400×560)

Keep `assets/store-icon-128.png`. Public images have no personal EXIF metadata. The new gallery and promo sources are `source/gallery.html` and `source/gallery.css`; the homepage scene remains in `source/showcase.html`.

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
Stores only the user’s local VINF presentation settings—enabled state, Quick Play controls, card placement and order, Stats display preferences, and OLED appearance choices—so they persist across browser sessions. No account details are stored in extension storage. Tab-local sessionStorage keeps the current game identifier, clock references and display expiry for visual continuity.
```

### Permission justification — sidePanel

```text
Shows the same packaged local VINF settings interface in Chromium’s persistent side panel when the user explicitly opens it from the extension popup. It does not access page content, account data, or browsing activity.
```

### Site access justification

```text
The content script runs only on Chess.com’s signed-in homepage plus supported game and Game Review URL shapes. It rearranges user-selected homepage modules, renders configured Quick Play controls, applies optional presentation-only OLED styles, and repositions Chess.com’s native evaluation graph on narrow move-by-move review layouts. When the Open Game shortcut is enabled, it makes a read-only same-origin Chess.com presence lookup using the signed-in identifier to resolve an active game. The identifier and response stay in page memory and are never logged or stored. It does not run on messages, account settings, or other websites.
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
5. Change the visibility, Main/Right placement, and order of all managed cards. Change Stats visibility/order settings.
6. OLED mode starts enabled. Toggle it and confirm that the homepage canvas and button palette update. Extreme OLED is a separate option.
7. Refresh the homepage and confirm that all settings persist.
8. Open a supported Chess.com game or Game Review URL and confirm that OLED black changes presentation only. At a phone-width move-by-move review layout, the native evaluation graph appears directly below the board.
9. Turn off “Enable VINF” and confirm that the native layout and presentation are restored after the page updates.

Most functionality can be reviewed without starting a live game. If a Quick Play shortcut is tested, it uses Chess.com’s own native game-start URL. No developer-provided account or credentials are required.
```
