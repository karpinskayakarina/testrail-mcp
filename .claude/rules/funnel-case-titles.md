# Funnel Test Case — Standard Titles

> **Scope:** AppNebula Funnels (suite 486). Titles are fixed across all funnels.
> Source reference: Aura section (section_id: 36639). Steps from Aura are NOT a reference — titles only.

## Standard Set (11 cases)

| # | Title | Condition |
|---|-------|-----------|
| 1 | Check successful payments for user with EU locale and email check | Always |
| 2 | Check successful payments for user with USA locale | Always |
| 3 | Check flow for user with EU locale with subscription payment error | Always |
| 4 | Check flow for user with EU locale with additional discount payment | Always |
| 5 | Check flow for user with USA locale with error on upsell payments | Always |
| 6 | Verify funnel flow with failed {scan type} scan for EU users | Only if scan exists |
| 7 | Check flow for user with re-entering card after incorrect upsells payment | Always |
| 8 | Check flow with successful payments with upsell for user with USA locale when timer has expired and email check | Always |
| 9 | Check successful subscription flows on LATAM localizations | Always |
| 10 | Check that emails are sent to user with confirmed email and valid payment (EU locale) for user with app installed | Always |
| 11 | Check successful payments on landing | Always |

## Title Rules

- Cases 1–5, 7–11: titles are **identical** across all funnels — do not change wording
- Case 6: the only case where the title adapts — replace `{scan type}` with the actual scan type:
  - hand scan → `palmistry`
  - face scan → `face`
- Case 6 is omitted entirely if the funnel has no scan
- All AI-generated cases must end with `(AI generated)`

## Notes

- Aura case metadata (priority_id, platform dropdown) is **not** a reference — values vary inconsistently
- For metadata, always copy from the reference case of the specific funnel (see update-funnels-case skill)
