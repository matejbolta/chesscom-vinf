# Chrome Web Store update TL;DR — 0.15.4 to 0.15.5

This is the short checklist for updating the already submitted 0.15.4 item.
You do not need to repeat the original submission setup.

## Do these

- [ ] Open the existing item with extension ID
  `pfdelnfocedcbpomokhdaampckmhomme`.
- [ ] Upload `release/chesscom-vinf-0.15.5.zip`.
- [ ] In the permission disclosure for the new `sidePanel` permission, copy
  only the text inside this block:

```text
Shows the same packaged local VINF settings interface in Chromium’s persistent side panel when the user explicitly opens it from the extension popup. It does not access page content, account data, or browsing activity.
```

- [ ] Replace the store description with the current copy in the
  `Description` section of `SUBMISSION.md`.
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

## Privacy and permissions

One narrow UI permission is new; data practices are unchanged.

- Permissions are now `storage` and `sidePanel`.
- `sidePanel` only displays the extension's own packaged settings page.
- Site access remains only `https://www.chess.com/home*`.
- Remote code remains `No`.
- Data collected remains `None`.
- Keep every data-use category unchecked.
- Keep all three required data-use certifications checked.

The privacy policy now explicitly describes the side panel. Its public URL is
unchanged. No data-use category should be enabled.

## What users gain compared with 0.15.4

- A popup header action that keeps VINF settings open in Chromium's persistent
  right-side panel.
- A clear `×` beside the version badge closes the panel from inside VINF on
  browsers that expose the current close API.
- The side panel reuses the exact same autosaving settings and local storage.
- The toolbar popup remains the default entry point.
- Unsupported or rejected Side Panel API behavior leaves the normal popup
  usable.

## Package identity

- Version: `0.15.5`
- File: `release/chesscom-vinf-0.15.5.zip`
- SHA-256:
  `7acdb9526189c7bcbd87ddc71dcb529d8954f8722eb3c7223a6c07ca3541f3de`

The complete field-by-field reference and all copy-ready text remain in
`SUBMISSION.md`.
