## 2024-04-20 - Tooltips and ARIA Labels for Icon Buttons
**Learning:** Material-UI `IconButton` components often lack visible text, making them non-descriptive for sighted users unfamiliar with the icons, and inaccessible to screen readers without `aria-label`s. Wrapping them in `<Tooltip>`s and adding `aria-label`s significantly improves UX and accessibility with very low risk.
**Action:** Always wrap `IconButton` components that only contain icons with a `<Tooltip>` and provide a matching `aria-label` attribute on the button itself.
