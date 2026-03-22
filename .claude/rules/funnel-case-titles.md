# Funnel Test Case — Standard Titles

> **Scope:** AppNebula Funnels (suite 486). Titles are fixed across all funnels.
> Source reference: Aura section (section_id: 36639). Steps from Aura are NOT a reference — titles only.

## Standard Set (10 cases per funnel)

| # | Title | Condition |
|---|-------|-----------|
| 1 | Check successful payments for user with EU locale and email check | Always |
| 2 | Check successful subscription payment for user with USA locale | Always |
| 3 | Check flow for user with EU localization with subscription payment error | Always |
| 4 | Check flow for user with EU localization with additional discount payment | Always |
| 5 | Check flow for user with USA locale with error on upsell payments | Always |
| 6 | Verify funnel flow with failed {scan type} scan for EU users | Only if scan exists |
| 7 | Check flow for user with re-entering card after incorrect upsells payment | Always |
| 8 | Check successful subscription flows on LATAM localizations | Always |
| 9 | Check email marketing landing flow for EU user with email check | Always |
| 10 | Check email marketing paywall flow for EU user with email check | Always |

## Title Rules

- Cases 1–5, 7–10: titles are **identical** across all funnels — do not change wording
- Case 6: the only case where the title adapts — replace `{scan type}` with the actual scan type:
  - hand scan → `palmistry`
  - face scan → `face`
- Case 6 is omitted entirely if the funnel has no scan
- All AI-generated cases must end with `(AI generated)`

## Cases NOT in the standard per-funnel set

| Title | Reason |
|-------|--------|
| Check flow for user with EU locale with resign form on payments | Automated once — only in section 49665 |
| Check flow for user re-entering the funnel with already active subscription on UK locale | Automated once — only in section 49665 |
| Check flow for user re-entering another funnel with already active subscription on US locale | Automated once — only in section 49665 |
| Check flow with successful payments with upsell for user with USA locale when timer has expired and email check | Component-level automation — not per-funnel |
| Check flow for user re-entering the funnel after subscription cancellation | Still being groomed — not yet in use |
| Check that emails are sent to user with confirmed email and valid payment (EU locale) for user with app installed | Manual only — no e2e automation planned |

## Notes

- Aura case metadata (priority_id, platform dropdown) is **not** a reference — values vary inconsistently
- For metadata, always copy from the reference case of the specific funnel (see update-funnels-case skill)
