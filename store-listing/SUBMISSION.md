# Chrome Web Store submission

This folder contains the public-safe listing copy and graphic assets for
ChessComVINF 0.13.4. None of the screenshots use the private signed-in Chess.com
capture in `fixtures/raw/`.

## Package

- Upload: `../release/chesscom-vinf-0.13.4.zip`
- Version: `0.13.4`
- SHA-256:
  `27d56a301878157c916b8529e40e9502c260061ef738a8a75edbae72fbb6bb97`

## Store listing

### Product details

- Title from package: `ChessComVINF`
- Summary from package:
  `A focused, infinitely improving Chess.com homepage with configurable one-click time controls.`
- Category: `Productivity`
- Language: `English`

### Description

Paste the following text into the Description field:

> ChessComVINF creates a calmer, more useful Chess.com homepage focused on
> playing chess.
>
> It replaces distracting homepage promotions with configurable Quick Play
> buttons, keeps Game History prominent, and lets you decide which Stats and
> sidebar cards remain visible.
>
> Features:
>
> • Choose six or eight one-click Bullet, Blitz, and Rapid presets.
> • Keep Game History directly beneath Quick Play.
> • Put Daily Games in the main column, right column, or hide it.
> • Show or hide ChessTV and Legend League.
> • Choose which Stats rows appear, their order, and whether each rating starts
> expanded or retracted.
> • Hide recurring campaign banners and the redundant homepage profile strip.
> • Disable all VINF changes instantly from the extension popup.
>
> Privacy:
>
> VINF has no analytics, advertising, telemetry, remote code, or
> developer-operated servers. It stores only your presentation preferences in
> Chrome storage and does not collect or transmit account data or page content.
>
> VINF runs only on the signed-in Chess.com homepage. Quick Play uses
> Chess.com’s own native game-start link; the extension does not access
> credentials or private matchmaking APIs.
>
> ChessComVINF is an independent, unofficial extension and is not affiliated
> with, endorsed by, or sponsored by Chess.com.

### Graphic assets

- Store icon: `assets/store-icon-128.png`
- Screenshots, in this order:
  1. `assets/screenshot-01-focused-home.jpg`
  2. `assets/screenshot-02-eight-presets.jpg`
  3. `assets/screenshot-03-settings.jpg`
- Small promo tile: `assets/small-promo-440x280.jpg`
- Marquee promo tile: `assets/marquee-promo-1400x560.jpg`
- Global promo video: leave blank.

All screenshots and promo tiles are full-bleed JPEGs without transparency.
The 128×128 store icon is a PNG with intentional transparent corner padding.

### Additional fields

- Official URL: `None`
- Homepage URL: `https://github.com/matejbolta/chesscom-vinf`
- Support URL: `https://github.com/matejbolta/chesscom-vinf/issues`
- Mature content: `Off`
- Item support: visible

Do not use `chess.com` as the official URL: VINF is independent and does not
control that domain.

## Privacy

### Single purpose

> Improve the signed-in Chess.com homepage by simplifying its layout and
> providing configurable one-click time-control shortcuts.

### Permission justification — storage

> Stores only the user’s local VINF settings—enabled state, selected time
> controls, module placement and visibility, and Stats display
> preferences—so they persist across browser sessions. No account or page data
> is stored.

### Site access justification

> The content script runs only on https://www.chess.com/home* so it can
> rearrange native homepage modules, hide user-selected modules, and render the
> configured Quick Play controls. VINF does not run on games, messages,
> account settings, or other websites.

### Remote code

Select `No, I am not using remote code`.

Suggested explanation if the dashboard requests one:

> All executable JavaScript and CSS is included in the uploaded package. The
> extension does not download or execute remote code.

### Data usage

- Data collected: `None`
- Do not select any personal, authentication, financial, location, browsing,
  website-content, or activity data categories.
- Selling data: `No`
- Using data for unrelated purposes: `No`
- Using data for creditworthiness or lending: `No`

### Privacy policy

Use this public GitHub-rendered policy URL:

`https://github.com/matejbolta/chesscom-vinf/blob/main/docs/PRIVACY.md`

The standalone `privacy-policy.html` remains available if a dedicated website
or GitHub Pages site is added later.

## Distribution

- Visibility: `Public`
- Regions: `All regions`
- Pricing: free
- In-app purchases: none

Use `Unlisted` instead only if the first release is intentionally limited to
people with the direct store URL. Public and unlisted packages undergo the same
review.

## Test instructions

This field is optional and may be left blank. If Google requests reviewer
guidance or review stalls because the signed-in route is not obvious, paste the
following:

> ChessComVINF applies only to the signed-in Chess.com homepage.
>
> 1. Sign in to a Chess.com test account and open
>    https://www.chess.com/home.
> 2. Confirm that configurable Quick Play buttons appear at the top, with Game
>    History directly below and the selected native cards arranged in the right
>    column.
> 3. Open the ChessComVINF toolbar popup. Change the Quick Play grid between six
>    and eight buttons, select different time controls, change Daily Games
>    placement, and change Stats visibility/order/expanded state.
> 4. Refresh the homepage and confirm the saved settings persist.
> 5. Turn off “Enable VINF” and confirm the native homepage layout is restored
>    after the page updates.
>
> Most functionality can be reviewed without starting a live game. If a Quick
> Play shortcut is tested, it uses Chess.com’s own native game-start URL.
> No developer-provided account or credentials are required.

## Before submitting

1. Upload the package and every asset listed above.
2. Publish the privacy policy and enter its HTTPS URL.
3. Complete the Privacy and Distribution pages with the answers above.
4. Save the draft and use “Why can’t I submit?” to identify any field Google
   has added or made mandatory.
5. Review the listing preview for accidental cropping.
6. Submit for review only after the public privacy-policy URL is live.
