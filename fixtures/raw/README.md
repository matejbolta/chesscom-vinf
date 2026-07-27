# Raw Page Captures

This directory is reserved for complete browser-saved Chess.com pages used during local DOM discovery.

Raw signed-in captures may contain usernames, ratings, account-specific images, session-related markup, experiment identifiers, or other private data. Dated capture directories are intentionally excluded by `.gitignore` and must not be committed or included in extension builds or release packages.

Keep each saved `.html` file beside its matching `_files` directory so relative asset references continue to work.

Before using a capture in automated tests:

1. Extract only the DOM needed for the behavior under test.
2. Remove scripts and unrelated assets.
3. Replace personal identifiers and profile data with neutral fixtures.
4. Remove tokens, cookies, CSRF values, API keys, and session-related values.
5. Save the sanitized result under `tests/fixtures/`.
6. Add an automated sanitization test before committing the fixture.
