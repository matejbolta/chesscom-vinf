# Chrome Web Store update — ChessComVINF 0.17.3

For the short list of changes from the currently uploaded 0.17.2 version, use
`UPDATE_TLDR.md`. The rest of this file is the complete field-by-field reference
and copy-ready text.

Every copy block is plain text inside a fenced block, so copying it will not add
Markdown blockquote characters.

## Existing item

- Extension ID: `pfdelnfocedcbpomokhdaampckmhomme`
- Current Chrome Web Store upload: `0.17.2`
- Public repository: `https://github.com/matejbolta/chesscom-vinf`
- Published 0.17.2 source commit: `beb4163`
- Category: `Productivity`
- Language: `English`
- Mature content: `Off`
- Official URL: `None`

## Package

- Upload: `../release/chesscom-vinf-0.17.3.zip`
- Version: `0.17.3`
- SHA-256:
  `b86d0a876ba0408f64821996c303012b228e0112c3268293742ef1e7b1d107b7`

The package contains only the Manifest V3 extension. The Android userscript,
private fixtures, source maps, Store assets, and release documentation are not
included.

## Store listing

### Product details

- Title from package: `ChessComVINF`
- Summary from package:
  `A focused, infinitely improving Chess.com homepage with configurable one-click time controls.`
- Category: `Productivity`
- Language: `English`

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
• Put Daily Games, Recommended Match, and Game History in the main column or right column, or hide them.
• Apply one saved card order within both the main and right columns.
• Choose which Stats rows appear, their fixed order, and whether each enabled rating starts expanded or retracted when Chess.com supports expansion.
• Hide recurring campaign banners and the redundant homepage profile strip.
• Save every setting immediately without a separate Save button.
• Open and close settings from Chromium’s persistent side panel when supported.
• Disable all VINF changes instantly from the popup or side panel.

Privacy:

VINF has no analytics, advertising, telemetry, remote code, or developer-operated servers. It stores only your presentation preferences in Chrome storage and does not collect or transmit account data or page content.

VINF runs only on the signed-in Chess.com homepage. Quick Play uses Chess.com’s own native game-start link; the extension does not access credentials or private matchmaking APIs.

ChessComVINF is an independent, unofficial extension and is not affiliated with, endorsed by, or sponsored by Chess.com.
```

### Graphic assets

- Store icon: `assets/store-icon-128.png`
- Screenshots, in this order:
  1. `assets/screenshot-01-focused-home.jpg`
  2. `assets/screenshot-02-eight-presets.jpg`
  3. `assets/screenshot-03-settings.jpg`
- Small promo tile: `assets/small-promo-440x280.jpg`
- Marquee promo tile: `assets/marquee-promo-1400x560.jpg`
- Global promo video: leave blank.

Only `screenshot-03-settings.jpg` changes for 0.17.3. It is synthetic,
public-safe, and shows the current settings model and version badge. All Store
screenshots and promo tiles contain no live account data. The JPEG assets have
no EXIF or XMP metadata.

### URLs and support

- Homepage URL: `https://github.com/matejbolta/chesscom-vinf`
- Privacy policy:
  `https://github.com/matejbolta/chesscom-vinf/blob/main/docs/PRIVACY.md`
- Support URL: `https://github.com/matejbolta/chesscom-vinf/issues`
- Official URL: `None`

Do not enter `chess.com` as the official URL. VINF is independent and does not
control that domain.

## Privacy disclosures

Keep every data-use category unchecked.

### Single purpose

```text
Improve the signed-in Chess.com homepage by simplifying its layout and providing configurable one-click time-control shortcuts.
```

### Permission justification — storage

```text
Stores only the user’s local VINF settings—enabled state, selected Quick Play count and time controls, native card placement, visibility and order, and Stats display preferences—so they persist across browser sessions. No account or page data is stored.
```

### Permission justification — sidePanel

This permission is unchanged from the currently uploaded 0.17.2 package.

```text
Shows the same packaged local VINF settings interface in Chromium’s persistent side panel when the user explicitly opens it from the extension popup. It does not access page content, account data, or browsing activity.
```

### Site access justification

```text
The content script runs only on https://www.chess.com/home* so it can rearrange native homepage modules, hide user-selected modules, and render the configured Quick Play controls. VINF does not run on games, messages, account settings, or other websites.
```

### Remote code

Select `No, I am not using remote code`.

If an explanation is requested, copy:

```text
All executable JavaScript and CSS is included in the uploaded package. The extension does not download or execute remote code.
```

### Data-use answers

- Data collected: `None`
- Selling data: `No`
- Using data for unrelated purposes: `No`
- Using data for creditworthiness or lending: `No`
- Keep all three required data-use certifications checked.

## Distribution

- Visibility: `Public`
- Regions: `All regions`
- Pricing: free
- In-app purchases: none

## Reviewer test instructions

This field may remain empty, as it was for the original accepted submission. If
Google requests instructions, copy only the text inside this block:

```text
ChessComVINF applies only to the signed-in Chess.com homepage.

1. Sign in to a Chess.com test account and open https://www.chess.com/home.
2. Confirm that configurable Quick Play buttons appear above the selected native main-column cards.
3. Open the ChessComVINF toolbar popup. Use its header button to open the same settings in the browser side panel.
4. Change the Quick Play grid size and selected time controls. Confirm that shrinking preserves the leading choices and expanding preserves existing choices while adding only new slots.
5. Change the visibility, Main/Right placement, and order of Daily Games, Recommended Match, and Game History. Change other managed-card and Stats visibility/order settings.
6. Refresh the homepage and confirm that all settings persist.
7. Turn off “Enable VINF” and confirm that the native homepage layout is restored after the page updates.

Most functionality can be reviewed without starting a live game. If a Quick Play shortcut is tested, it uses Chess.com’s own native game-start URL. No developer-provided account or credentials are required.
```

## Optional GitHub release notes

Suggested title:

```text
ChessComVINF 0.17.3
```

Suggested release notes:

```text
ChessComVINF 0.17.3 fixes the narrow toolbar-popup layout.

Highlights:

• Keeps Quick Play selectors in the same grid as the chosen homepage layout, including two rows of four for eight presets.
• Prevents switches from shrinking beside wrapped setting labels.
• Preserves the existing persistent side-panel layout and all saved settings.

Privacy remains unchanged: no analytics, telemetry, remote code, collected account data, or extension-owned network requests.
```

## Final update sequence

1. Push the 0.17.3 source to the public repository.
2. In the Chrome Web Store dashboard, open extension
   `pfdelnfocedcbpomokhdaampckmhomme`.
3. Upload `release/chesscom-vinf-0.17.3.zip`.
4. Replace only `assets/screenshot-03-settings.jpg`.
5. Confirm every data-use category remains unchecked and all three required
   certifications remain checked.
6. Leave the remaining listing, Privacy, and Distribution fields unchanged.
7. Save the draft, inspect the listing preview, and submit the update for
    review.
