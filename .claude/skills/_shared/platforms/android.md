# Platform Rules — Android (deltas only)

> **Scope:** Android-specific behavior that differs from iOS and Web. Anything common across platforms belongs in the stream rule, not here.

Inherits all global rules. This file lists Android deltas only.

---

## Hardware Back Button

- Standard Android **back gesture / back button** — must be tested for every flow
- Different behavior per screen — sometimes pops navigation stack, sometimes shows confirmation, sometimes exits app
- Cover back-button behavior in negative / edge-case scenarios

## System Permission Flow

- **Android 13+ notification permission** — runtime prompt on first launch; flow differs from earlier versions
- Camera / storage / location — runtime permissions with `Allow` / `Don't allow` / `While using app`
- Permission denial flow — verify graceful handling

## Device Fragmentation

- Test on representative device tiers when relevant (low-end / mid / flagship)
- Screen size variability — verify layout doesn't break on small screens
- OS version variability — note minimum supported version in preconditions

## Material Design Navigation

- Bottom navigation bar — Material patterns, hamburger drawer, FAB
- Navigation drawer behavior

## System-Level Features

- **Split-screen / multi-window** behavior — verify app doesn't crash or lose state
- **Notification channels** — Android-specific concept; verify channel grouping
- **Picture-in-picture** if applicable

## Localisation

- **India** localisation — has its own folder under Mobile: Android / Localisation / India
- Currency, date format, language fallback chain
