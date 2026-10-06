# ChessComVINF

A calmer Chess.com experience for playing and reviewing games.

- Arrange, hide and reorder homepage cards in either column.
- Start games with your own Quick Play presets.
- Keep useful stats and a shortcut back to your open game close by.
- Use true-black OLED styling, or Extreme OLED for an even darker board.
- Enjoy cleaner game controls and a phone-friendly review layout.
- Customize the turn indicator, pulse and animation speed.

Settings save automatically. New installations start with OLED enabled and eight desktop/tablet shortcuts: **10, 15+10, 3, 5+5** above **10+5, 30, 3+2, 1+1**. Existing settings are preserved when updating.

## Desktop

Install [ChessComVINF from the Chrome Web Store](https://chromewebstore.google.com/detail/pfdelnfocedcbpomokhdaampckmhomme) in Chrome or a compatible desktop browser such as Brave. Open the extension icon to change settings.

## Android phones and tablets

Use **Firefox for Android + Violentmonkey**. This is a separate installation; the Chrome Web Store version does not install on your phone.

1. Install [Violentmonkey in Firefox](https://addons.mozilla.org/android/addon/violentmonkey/).
2. Download `chesscom-vinf.user.js` from the [latest GitHub release](https://github.com/matejbolta/chesscom-vinf/releases/latest).
3. Open the file with Violentmonkey and confirm installation. If Firefox downloads it instead, import the file from the Violentmonkey dashboard.
4. Open Chess.com and sign in. Use Violentmonkey’s **VINF settings** menu command to customize it.

The phone layout uses compact controls and a review graph below the board. Tablet defaults match desktop; phones start with three shortcuts (**3+2, 10, 15+10**), a smaller turn indicator and ChessTV disabled. See the [Android installation guide](docs/ANDROID.md) for the manual-copy fallback. This setup is for Android, not iPhone or iPad.

## Privacy

No analytics, advertising or developer-operated servers. Preferences stay in your browser. The Open Game shortcut makes a read-only request to Chess.com’s own presence service to find your active game; account details are not stored. Small tab-local game/clock references keep visual indicators consistent across refreshes. [Privacy policy](docs/PRIVACY.md).

[Report an issue](https://github.com/matejbolta/chesscom-vinf/issues).

ChessComVINF is independent and unofficial, and is not affiliated with or endorsed by Chess.com.

## Build locally

Requires Node.js 20+ and pnpm.

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm build:android
```

Load `dist/` as an unpacked desktop extension. The Android script is in `dist-android/`. `pnpm package` creates the desktop upload ZIP in `release/`.
