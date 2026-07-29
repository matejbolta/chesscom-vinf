# Chrome Web Store update TL;DR — 0.15.4 to 0.17.2

This is the short checklist for updating the currently uploaded 0.15.4 item.
You do not need to repeat the original submission setup.

## Do these

- [ ] Open the existing item with extension ID
  `pfdelnfocedcbpomokhdaampckmhomme`.
- [ ] Upload `release/chesscom-vinf-0.17.2.zip`.
- [ ] Add the permission disclosure for the new `sidePanel` permission. Copy
  only the text inside this block:

```text
Shows the same packaged local VINF settings interface in Chromium’s persistent side panel when the user explicitly opens it from the extension popup. It does not access page content, account data, or browsing activity.
```

- [ ] Replace the store description with the current copy in the `Description`
  section of `SUBMISSION.md`.
- [ ] Replace only the settings screenshot:
  `assets/screenshot-03-settings.jpg`.
- [ ] Save the draft, inspect the listing preview and permission summary, then
  submit the update for review.

## Leave these unchanged

- Store icon: `assets/store-icon-128.png`
- Homepage screenshots:
  - `assets/screenshot-01-focused-home.jpg`
  - `assets/screenshot-02-eight-presets.jpg`
- Small promo tile: `assets/small-promo-440x280.jpg`
- Marquee promo tile: `assets/marquee-promo-1400x560.jpg`
- Category: `Productivity`
- Language: `English`
- Mature content: `Off`
- Official URL: `None`
- Homepage URL: `https://github.com/matejbolta/chesscom-vinf`
- Support URL: `https://github.com/matejbolta/chesscom-vinf/issues`
- Privacy-policy URL:
  `https://github.com/matejbolta/chesscom-vinf/blob/main/docs/PRIVACY.md`
- Visibility, regions, pricing, and in-app-purchase settings
- Reviewer test instructions: they may remain empty

## Permissions and privacy

Only one permission changes compared with uploaded version 0.15.4:

- Existing permission: `storage`
- New permission: `sidePanel`
- Site access remains only `https://www.chess.com/home*`.
- Remote code remains `No`.
- Data collected remains `None`.
- Keep every data-use category unchecked.
- Keep all three required data-use certifications checked.

The side panel displays only VINF’s packaged local settings page. The extension
still has no analytics, telemetry, advertising, remote code, account-data
collection, or extension-owned network requests.

## What users gain compared with 0.15.4

- Keep the complete autosaving settings UI open in Chromium’s persistent side
  panel, with an in-panel close button when supported.
- Choose zero Quick Play buttons to remove the module completely.
- Reuse the same time control in multiple Quick Play buttons.
- Change the button count without losing existing choices: shrinking keeps the
  leading controls, while expanding fills only new slots.
- Show, hide, and place Daily Games, Recommended Match, and Game History in
  either Main or Right.
- Apply one saved managed-card order independently within both Main and Right,
  while Quick Play stays first.
- Keep the toolbar popup as the default settings entry point and preserve safe
  fallback behavior when Side Panel APIs are unavailable.

## Package identity

- Version: `0.17.2`
- File: `release/chesscom-vinf-0.17.2.zip`
- SHA-256:
  `43a4a7742eceb3ab72f8a522305f94f5fed7d4c8a447497e8cdc25c5f4905247`

The complete field-by-field reference and all copy-ready text remain in
`SUBMISSION.md`.
