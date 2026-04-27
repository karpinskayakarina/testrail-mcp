# Platform Rules — Web (deltas only)

> **Scope:** Web-specific behavior that differs from iOS and Android. Anything common across platforms belongs in the stream rule, not here.

Inherits all global rules. This file lists Web deltas only.

---

## Browser Compatibility

Cover the supported browser matrix when test logic is browser-sensitive:
- Chrome (mobile + desktop)
- Safari (iOS Safari + macOS Safari)
- Firefox
- Edge

Always note explicit browser in preconditions for manual tests:
- `For e2e tests: Chrome mobile browser`
- `For manual tests: Chrome desktop browser`
- `For manual tests: Safari` (USA locale convention for Funnels)

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
