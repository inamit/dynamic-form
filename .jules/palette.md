## 2024-05-24 - Accessibility improvements for Icon-Only Buttons
**Learning:** Found that the Presets Manager in this application's Entity Editor utilizes multiple icon-only actions (like Edit/Delete) without standard accessibility markers. It requires adding Material UI tooltips and `aria-label` tags simultaneously to support both sighted mouse users and screen reader users correctly.
**Action:** Always wrap icon-only actions with descriptive `Tooltip` elements and include mirroring `aria-label`s on the interactive element itself to guarantee universal access.

## 2024-05-18 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found an accessibility issue pattern specific to this app's components regarding `IconButton`s. Many icon-only buttons, especially in `features/EntityEditor/FieldManager.tsx` and `features/EntityEditor/GridPreview/GridPreview.tsx`, were missing `aria-label`s and `Tooltip`s. This makes them difficult to use for screen reader users and those who rely on visual tooltips for context.
**Action:** When creating or modifying `IconButton` components that only contain an icon, always wrap them with a descriptive `Tooltip` component and include a mirroring `aria-label` attribute on the button element itself to ensure accessibility for both sighted and screen-reader users.
