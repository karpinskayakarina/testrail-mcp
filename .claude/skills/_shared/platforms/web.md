# Platform Rules — Web (deltas only)

> **Scope:** Web-specific behavior that differs from iOS and Android. Anything common across platforms belongs in the stream rule, not here.

Inherits all global rules. This file lists Web deltas only.

---

## Browser Compatibility

Cover the supported browser matrix only when test logic is browser-sensitive (e.g. iOS Safari quirk, Firefox-only bug). Default browser is implicit — do NOT add a "For e2e tests: Chrome mobile / For manual tests: Chrome desktop" line to preconditions of generic Web cases. It clutters the case without adding signal.

Browsers worth naming explicitly when relevant:
- Chrome (mobile + desktop)
- Safari (iOS Safari + macOS Safari) — only mention for iOS Safari–specific behavior or USA-locale Funnels
- Firefox
- Edge

> **Funnels exception:** AppNebula Funnels keep the explicit browser line because their preconditions template mandates it (see `_shared/streams/funnels-appnebula.md` Preconditions Format). That rule overrides the default above and applies only inside funnel-skill output.

## Responsive Breakpoints

- **Mobile-web** vs **desktop** — test both where layout differs
- Use `custom_case_platform_dropdown`:
  - Desktop_view
  - Mobile_view
  - Both_views (4)

## Cookie Consent / GDPR

- **EU locale** — cookie banner appears, must be accepted before flow
- **USA locale** — no cookie banner
- **LATAM** — no cookie banner

This is captured in preconditions test data per stream — see funnels-appnebula.md for canonical example.

## URL and Navigation

- **URL parameters** — direct deep-link entry to specific funnel step or page
- **Browser back / forward** — verify behavior, history-stack restoration
- **Tab / window focus** — pause animations, refresh data on focus

## Storage

- Local storage / session storage / cookies — verify session persistence across page reloads
- Cross-tab behavior — multiple tabs with same session

## Email / External Links

- Email button click → opens correct landing in same or new tab depending on design
- Magic links / order_id flows — deep-link from email back into web funnel
