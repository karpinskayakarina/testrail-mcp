# Platform Rules — iOS (deltas only)

> **Scope:** iOS-specific behavior that differs from Android and Web. Anything common across platforms belongs in the stream rule, not here.

Inherits all global rules. This file lists iOS deltas only.

---

## Gestures and Navigation

- **Tap** / **long-press** — never use "click" in iOS test cases
- **Swipe** for navigation (e.g. back swipe from screen edge)
- **iOS bottom tab bar** — primary navigation pattern; reference exact tab labels from Figma
- **Status bar** — interactions (tap to scroll to top); occasional content overlap

## System Permission Dialogs

When test scenario requires permissions, account for the iOS system flow:
- Camera access — iOS prompt with `OK` / `Don't Allow`
- Notification permission — first-launch system prompt; can be re-requested via Settings only
- Location — `Allow Once` / `Allow While Using App` / `Don't Allow`
- Photo library — full / selected / none

## Authentication

- **Face ID** / **Touch ID** flows — biometric auth replaces password where supported
- App Store review prompt — system-level, can't be triggered manually in tests

## iOS-Specific UI

- **Dynamic Island** / Notification Center — for live activities and alerts
- iOS safe area — top notch, bottom home indicator
- Pull-to-refresh — standard iOS rubber-band animation

## Browser

For web cases that target iOS Safari specifically — note browser explicitly in preconditions (e.g. `For manual tests: Safari mobile`).
