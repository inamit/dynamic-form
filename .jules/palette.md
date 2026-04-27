## 2024-05-24 - Accessibility improvements for Icon-Only Buttons
**Learning:** Found that the Presets Manager in this application's Entity Editor utilizes multiple icon-only actions (like Edit/Delete) without standard accessibility markers. It requires adding Material UI tooltips and `aria-label` tags simultaneously to support both sighted mouse users and screen reader users correctly.
**Action:** Always wrap icon-only actions with descriptive `Tooltip` elements and include mirroring `aria-label`s on the interactive element itself to guarantee universal access.
## 2026-04-26 - Add ARIA labels and Tooltips to ListFieldGrid icon buttons
**Learning:** Found that the custom cellRenderer and headerComponent of the AgGrid instance in `libs/shared-ui/src/components/ListFieldGrid.tsx` lacked Tooltips and aria-labels for their respective `IconButton`s (Add, Delete, Restore). While previous entries highlighted this for PresetsManager, similar patterns existed in custom component renders of grid layouts.
**Action:** Always wrap `IconButton` elements with `Tooltip` components and provide a descriptive `aria-label` inside custom cell renderers and header components for list or grid views to ensure accessible and clear interaction.
## 2024-05-18 - List View Standardisation: Empty States and Deletion Dialogs
**Learning:** List views in this app often lack clear guidance when empty and confirmation steps for destructive actions, leading to potential user confusion or accidental data loss.
**Action:** Always include a helpful empty state with a clear Call-To-Action (CTA) for empty lists, and implement a confirmation dialog (`Dialog` from MUI) for row-level delete operations to prevent accidental deletion and provide a standard UX.
