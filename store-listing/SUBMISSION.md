# Chrome Web Store update — ChessComVINF 0.15.5

For the short list of changes from the already submitted 0.15.4 version, use
`UPDATE_TLDR.md`. The rest of this file is the complete field-by-field reference
and copy-ready text.

This file contains copy-ready text for the existing Chrome Web Store item.
Every copy block is plain text inside a fenced block, so copying it will not add
Markdown blockquote characters.

## Existing item

- Extension ID: `pfdelnfocedcbpomokhdaampckmhomme`
- Current public repository: `https://github.com/matejbolta/chesscom-vinf`
- Previous published source commit: `3f055bd`
- Previous published tag: `v0.15.4`
- Previous GitHub release:
  `https://github.com/matejbolta/chesscom-vinf/releases/tag/v0.15.4`
- Category: `Productivity`
- Language: `English`
- Mature content: `Off`
- Official URL: `None`

## Package

- Upload: `../release/chesscom-vinf-0.15.5.zip`
- Version: `0.15.5`
- SHA-256:
  `7acdb9526189c7bcbd87ddc71dcb529d8954f8722eb3c7223a6c07ca3541f3de`

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

### Permission justification — sidePanel

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
2. Confirm that configurable Quick Play buttons appear at the top, with Game History directly below and the selected native cards arranged in the right column.
3. Open the ChessComVINF toolbar popup. Use its header button to open the same settings in the browser side panel.
4. Change the Quick Play grid size, selected time controls, Daily Games placement, right-column card visibility/order, and Stats visibility/order/initial state.
5. Refresh the homepage and confirm that the settings persist.
6. Turn off “Enable VINF” and confirm that the native homepage layout is restored after the page updates.

Most functionality can be reviewed without starting a live game. If a Quick Play shortcut is tested, it uses Chess.com’s own native game-start URL. No developer-provided account or credentials are required.
```

## GitHub release notes

Suggested title:

```text
ChessComVINF 0.15.5
```

Suggested release notes:

```text
ChessComVINF 0.15.5 adds an optional persistent settings side panel while keeping the familiar toolbar popup.

Highlights:

• Opens the complete VINF settings UI in Chromium’s persistent right-side panel from a compact popup header action.
• Adds a clear in-panel close button beside the version badge on browsers that expose the current close API.
• Reuses the same immediate autosave behavior and local settings in both surfaces.
• Keeps the toolbar popup as the default entry point.
• Adapts the settings layout to narrow side-panel widths.
• Leaves the popup usable if the browser does not expose or accept the Side Panel API.

Privacy remains unchanged: no analytics, telemetry, remote code, or collected account data.
```

## Final update sequence

1. Publish the 0.15.5 source, tag, release page, and matching release ZIP.
2. Confirm the public privacy-policy URL includes the side-panel disclosure.
3. In the Chrome Web Store dashboard, open extension
   `pfdelnfocedcbpomokhdaampckmhomme`.
4. Upload `release/chesscom-vinf-0.15.5.zip` as the new package.
5. Replace the store description with the copy-ready description above.
6. Add the `sidePanel` permission justification above.
7. Replace only `assets/screenshot-03-settings.jpg`.
8. Confirm the remaining Privacy and Distribution answers still match this
   file.
9. Save the draft, inspect the listing preview, and submit the update for review.
