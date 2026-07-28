# Chrome Web Store update TL;DR — 0.13.4 to 0.15.4

This is the short update checklist. You do not need to repeat the complete
first-submission setup recorded in `SUBMISSION.md`.

## Do these

- [ ] Open the existing item with extension ID
  `pfdelnfocedcbpomokhdaampckmhomme`.
- [ ] Upload `release/chesscom-vinf-0.15.4.zip` as the new package.
- [ ] Replace the store description with the current copy from the
  `Description` section of `SUBMISSION.md`.
- [ ] Replace all three screenshots:
  - `assets/screenshot-01-focused-home.jpg`
  - `assets/screenshot-02-eight-presets.jpg`
  - `assets/screenshot-03-settings.jpg`
- [ ] Replace the marquee promo tile with
  `assets/marquee-promo-1400x560.jpg`.
- [ ] Save the draft, check the listing preview, and submit the update for
  review.

## Leave these unchanged

- Store icon: `assets/store-icon-128.png`
- Small promo tile: `assets/small-promo-440x280.jpg`
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

## Privacy and permissions

Nothing became more invasive.

- Permissions remain only `storage`.
- Site access remains only `https://www.chess.com/home*`.
- Remote code remains `No`.
- Data collected remains `None`.
- Keep every data-use category unchecked.
- Keep all three required data-use certifications checked.

The privacy-policy text was refreshed to describe the additional local
presentation settings, but its public URL is unchanged. No new disclosure
category or permission justification is required.

## What users gain compared with 0.13.4

- Compatibility with Chess.com's redesigned homepage while retaining support
  for the preceding layout.
- Quick Play grids with 1, 2, 3, or 4 buttons in addition to 6 and 8.
- A shortcut settings grid that mirrors the actual homepage layout.
- Show/Hide and fixed ordering for all known right-column cards.
- A separate setting for Chess.com's large native play panel.
- Separate Daily Games visibility and Main/Right placement.
- Updated Stats handling for the redesigned card and legacy expandable rows.
- Preservation of unknown future homepage cards.
- Updated Android userscript parity and settings migration.

## Package identity

- Version: `0.15.4`
- File: `release/chesscom-vinf-0.15.4.zip`
- SHA-256:
  `7c7268ff3a0c5f0044251ecd7539bdba364d403d015a072d0e8bc83c110eb7fb`

The complete field-by-field reference and all copy-ready text remain in
`SUBMISSION.md`.
