## 2024-05-24 - Accessibility improvements for Icon-Only Buttons
**Learning:** Found that the Presets Manager in this application's Entity Editor utilizes multiple icon-only actions (like Edit/Delete) without standard accessibility markers. It requires adding Material UI tooltips and `aria-label` tags simultaneously to support both sighted mouse users and screen reader users correctly.
**Action:** Always wrap icon-only actions with descriptive `Tooltip` elements and include mirroring `aria-label`s on the interactive element itself to guarantee universal access.

## 2024-05-20 - Adding Tooltips and ARIA Labels to Icon Buttons
**Learning:** Icon-only buttons (like Material UI's `IconButton`) need an `aria-label` for screen reader accessibility, but they also need visual tooltips for sighted mouse users. Adding just one or the other leaves out a segment of users. Wrapping `IconButton`s in `Tooltip`s while simultaneously defining the `aria-label` provides a complete accessibility and UX solution.
**Action:** Always wrap `IconButton` components in `Tooltip` and ensure the button itself has an `aria-label` that mirrors the tooltip text.
