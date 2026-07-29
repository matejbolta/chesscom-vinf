# ChessComVINF Agent Instructions

ChessComVINF is an independent Chrome/Brave Manifest V3 extension. Keep all code,
dependencies, build output, test fixtures, and release artifacts inside this
directory.

## Required project context

- Before changing this project, read `docs/LLM_HANDOFF.md` completely. It is the
  canonical current-state summary and routes to deeper documentation.
- Treat `docs/PRODUCT_BRIEF.md` as historical input, not current implementation
  status. Later decisions in the handoff and `docs/FINAL_PRODUCT_SPEC.md`
  supersede it.
- Update `docs/LLM_HANDOFF.md` whenever behavior, architecture, selectors,
  settings, release procedure, known limitations, or the current version changes.

## Product invariants

- Run only on the signed-in Chess.com homepage.
- Keep Chess.com's main navigation; hide the native Game Review homepage card.
- Expose 0, 1, 2, 3, 4, 6, or 8 user-selected time controls. Zero removes the
  Quick Play module entirely. Default to the original six recorded in
  `docs/FINAL_PRODUCT_SPEC.md`; use the per-count defaults in
  `src/shared/time-controls.ts`. When the count changes, preserve the leading
  selections and fill only new slots from the documented fallback sequence.
  Repeated selections are valid and must persist.
- Keep the settings catalog as the documented desktop-first union of 17 Bullet,
  Blitz, and Rapid controls unless the user explicitly changes that decision.
- Derive launches from Chess.com's native immediate-match link; never call a
  private matchmaking endpoint or reuse account credentials.
- Prefer semantic landmarks and URLs over generated class names.
- Keep DOM reconciliation idempotent and safe when optional modules are absent.
- Keep the toolbar popup as the default settings entry point. The optional
  Chromium side panel must reuse the same local autosaving UI and fail safely
  when a browser does not expose `chrome.sidePanel`.
- Do not add telemetry, analytics, remote code, or extension-owned network calls.
- Never commit raw signed-in page captures or account-specific data.

## Required checks

Run these from this directory before handing off a change:

```sh
pnpm typecheck
pnpm test
pnpm build
```

When selectors change, update `docs/DOM_AUDIT.md` and the sanitized fixtures.
