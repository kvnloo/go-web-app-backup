# Codemods

Scripted, re-runnable rewrites for moving the app onto `@ifrc-go/ui/next` (see Phase 5 of the GO UI plan). Each codemod leaves files without a match untouched, so a feature branch can re-run it after rebasing instead of resolving conflicts by hand.

Run them from `packages/ui`, then run `pnpm lint:fix` in `app/` to restore import order.

| Script | What it does |
|---|---|
| `pnpm codemod:move-component --from <module> --to <module> --name <Component> [--rename <NewName>] [--dry-run] <globs...>` | Moves a component import (and its `<Name>Props` type) to another module, renaming references and JSX tags when the import is not aliased |

Example: `pnpm codemod:move-component --from @ifrc-go/ui --to @ifrc-go/ui/next --name Modal --rename Dialog "../../app/src/**/*.tsx"`
