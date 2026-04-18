## 2024-05-24 - Accessibility improvements for Icon-Only Buttons
**Learning:** Found that the Presets Manager in this application's Entity Editor utilizes multiple icon-only actions (like Edit/Delete) without standard accessibility markers. It requires adding Material UI tooltips and `aria-label` tags simultaneously to support both sighted mouse users and screen reader users correctly.
**Action:** Always wrap icon-only actions with descriptive `Tooltip` elements and include mirroring `aria-label`s on the interactive element itself to guarantee universal access.
