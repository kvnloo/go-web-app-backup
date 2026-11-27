---
"@ifrc-go/ui": patch
---

Fix visible defects in tables, containers, progress bars and file inputs

- Space multiple actions in a container's footer, as in its header
- Right-align numbers and their headers in number columns
- Apply a column's `columnWidth` and `columnStyle` in tables without fixed column widths
- Format currency amounts instead of failing, and apply the `unit` number option
- Separate a progress bar's title from its percentage and round the percentage to a whole number
- Keep email and phone links in HTML content
- Make the file input reachable and visibly focused with the keyboard
