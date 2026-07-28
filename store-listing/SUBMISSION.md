# Chrome Web Store update — ChessComVINF 0.15.4

For the short list of changes from the already submitted 0.13.4 version, use
`UPDATE_TLDR.md`. The rest of this file is the complete field-by-field reference
and copy-ready text.

This file contains copy-ready text for the existing Chrome Web Store item.
Every copy block is plain text inside a fenced block, so copying it will not add
Markdown blockquote characters.

## Existing item

- Extension ID: `pfdelnfocedcbpomokhdaampckmhomme`
- Current public repository: `https://github.com/matejbolta/chesscom-vinf`
- Published source commit: `3f055bd`
- Published tag: `v0.15.4`
- GitHub release:
  `https://github.com/matejbolta/chesscom-vinf/releases/tag/v0.15.4`
- Category: `Productivity`
- Language: `English`
- Mature content: `Off`
- Official URL: `None`

## Package

- Upload: `../release/chesscom-vinf-0.15.4.zip`
- Version: `0.15.4`
- SHA-256:
  `7c7268ff3a0c5f0044251ecd7539bdba364d403d015a072d0e8bc83c110eb7fb`

The package contains only the Manifest V3 extension. The Android userscript,
private fixtures, source maps, store assets, and release documentation are not
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

• Choose 1, 2, 3, 4, 6, or 8 one-click Bullet, Blitz, and Rapid presets.
• Keep Game History directly beneath Quick Play.
• Show or hide Chess.com’s large native play panel.
• Show, hide, and reorder known cards in the right column.
• Put Daily Games in the main column or right column, or hide it.
• Choose which Stats rows appear, their fixed order, and whether each enabled rating starts expanded or retracted when Chess.com supports expansion.
• Hide recurring campaign banners and the redundant homepage profile strip.
• Save every setting immediately without a separate Save button.
• Disable all VINF changes instantly from the extension popup.

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

All screenshots and promo tiles are synthetic and public-safe. They contain no
live account data. The JPEG assets have no EXIF or XMP metadata.

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
Stores only the user’s local VINF settings—enabled state, selected time controls, native module placement and visibility, right-column order, and Stats display preferences—so they persist across browser sessions. No account or page data is stored.
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
2. Confirm that configurable Quick Play buttons appear at the top, with Game History directly below and the selected native cards arranged in the right column.
3. Open the ChessComVINF toolbar popup. Change the Quick Play grid size, select different time controls, change Daily Games placement, change right-column card visibility/order, and change Stats visibility/order/initial state.
4. Refresh the homepage and confirm that the settings persist.
5. Turn off “Enable VINF” and confirm that the native homepage layout is restored after the page updates.

Most functionality can be reviewed without starting a live game. If a Quick Play shortcut is tested, it uses Chess.com’s own native game-start URL. No developer-provided account or credentials are required.
```

## GitHub release notes

Suggested title:

```text
ChessComVINF 0.15.4
```

Suggested release notes:

```text
ChessComVINF 0.15.4 updates VINF for Chess.com’s redesigned homepage and expands homepage customization.

Highlights:

• Supports both the redesigned and preceding signed-in homepage layouts.
• Adds 1, 2, 3, and 4-button Quick Play grids alongside the existing 6 and 8-button layouts.
• Makes the shortcut editor mirror the selected homepage grid.
• Adds visibility and fixed ordering for all known right-column cards.
• Adds a separate native play-panel visibility setting.
• Keeps Daily Games visibility separate from its Main/Right placement.
• Updates Stats handling for Chess.com’s new card structure while preserving legacy expandable rows.
• Preserves unknown future homepage cards instead of hiding them.
• Includes updated Android userscript parity and extensive migration coverage.

Privacy remains unchanged: no analytics, telemetry, remote code, or collected account data.
```

## Final update sequence

1. GitHub source, tag, release page, and release ZIP are already published.
2. Confirm the public privacy-policy URL still renders before submission.
3. In the Chrome Web Store dashboard, open extension
   `pfdelnfocedcbpomokhdaampckmhomme`.
4. Upload `release/chesscom-vinf-0.15.4.zip` as the new package.
5. Replace the store description with the copy-ready description above.
6. Upload the refreshed screenshots if the dashboard does not retain them
   automatically.
7. Confirm the Privacy and Distribution answers still match this file.
8. Save the draft, inspect the listing preview, and submit the update for review.
