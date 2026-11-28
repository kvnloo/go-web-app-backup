# GO UI next

The redesigned GO UI library. It is built beside the current library (`@ifrc-go/ui`, v2) and exported as `@ifrc-go/ui/next`, so views move to it one at a time while v2 stays stable. Once the app has moved, `next/` becomes the package root, v2 is removed and 3.0.0 is released.

The work lands on the `project/go-ui-v3` branch. This document holds the rules every next component and every view that uses one follows.

## Entry points and layers

| Entry point | Holds | Used by |
|---|---|---|
| `@ifrc-go/ui/next` | Exposed components: layouts (`ListView`, `InlineView`), container flavours (`Page`, `Section`, `Card`, `FormSection`, `FieldGroup`, `ExpandableSection`, `Dialog`), text, values, actions, inputs, tables, charts, feedback, navigation, and helpers such as `useListState` and `useRepeatableList` | Views |
| `@ifrc-go/ui/next/base` | Building blocks: `Raw*` primitives and `*Layout` parts (`ButtonLayout`, `ContainerLayout`, `InputContainer`, `TableLayout`, ...) | The library itself, and app wrappers in `app/src/components/**` |

- Building blocks never import exposed components.
- next never imports v2 components, and v2 never imports next. Tokens (`src/index.css`), contexts and formatters are shared.
- Naming: `*Layout` is a building block, `*View` is an exposed layout.
- Folders: `src/next/components/<Name>/` for exposed components, `src/next/base/<Name>/` for building blocks, entry files `src/next/index.ts` and `src/next/base.ts`.

## Component rules

### Look and state

- Exposed components take only a curated `variant`, a `status`, or both. `status` is always `positive | information | warning | negative`, matching the colour tokens. Brand colours (`primary`, `secondary`) are a separate concept.
- Building blocks offer independent props, each controlling one thing (for example `tone`, `fill`, `withBorder` and `shape` on `ButtonLayout`).
- Variant sets are closed per component. Token scales are never narrowed: every component that takes spacing or text size accepts the full scale.

### Few props: flavours, context and options objects

- A different kind of container is a separate flavour (`Section`, `Card`, `FormSection`, ...), not a flag on one component.
- Anything that depends on position comes from context, and a prop only overrides it:
  - heading level from nesting (a `Card` inside a `Section` gets the next level), with the look from the flavour
  - `disabled`, `readOnly` and the input look from the surrounding `Page`, `FormSection`, section filters or table
  - `pending`, `errored`, `empty` and `filtered` from the surrounding section
  - the surface (light or dark), which switches text, links and icons to their on-dark colours
  - default state messages, the empty value (`--`) and internal links rendered through the app's router
- Rare tweaks go in one `<area>Options` object (`layoutOptions`, `formatOptions`).
- An option is added to an exposed component only when several call sites need it. A one-off need is an app wrapper built from `/base`.

### Strict types

- Props that exclude each other are a union whose other branches are `?: never`: an input takes exactly one of `label` and `ariaLabel`; `Button` takes `onClick` or `onConfirm`; `MenuItem` takes `href`, `onClick` or `onConfirm`.
- Props that only work together are required together (sorting with its change handler, sub-rows with the expanded keys).
- One concept has one prop: no `withX` next to `withoutX`, and no two props that can contradict each other.
- The value type follows configuration (`multiple` decides whether a select holds one key or an array).
- No `any` in public types. Forbidden combinations have type tests (`@ts-expect-error` cases run with the component tests).

### Names

- A prop is named for what it is or does. Exposed props carry no styling words.
- Slots: `heading`, `description`, `icon`, `actions`, `info`, `filters`, `footer`, `footerActions`, `before`, `after`.
- Names follow a rule:

| Kind | Rule | Examples |
|---|---|---|
| Event handler | `on<Event>`; value handlers are `(value, name)`, actions `(name, event)` | `onChange`, `onConfirm`, `onSortingChange` |
| Boolean | `with<Feature>` when off by default, `without<Feature>` when on by default | `withLinkIcon`, `withoutClearButton` |
| Token prop | named after the CSS property it sets | `spacing`, `textSize`, `textColor`, `fontWeight`, `backgroundColor` |
| Offset (building blocks) | `<tokenProp>Offset` | `spacingOffset`, `textSizeOffset` |
| Options object | `<area>Options` | `layoutOptions`, `formatOptions` |
| Selector | `<thing>Selector` | `keySelector`, `labelSelector` |
| Ref | `elementRef`, `<part>Ref` | `inputSectionRef` |
| Count | `num<Things>` | `numPreferredColumns`, `numItemsPerPage` |

### Tokens

- CSS uses `var(--go-ui-*)` tokens only, never raw px or hex values. Props take scale tokens, never CSS values.
- When a scale lacks a value, the scale is extended in `src/index.css`.

### Platform and accessibility

- Components are built on the native element for what they do: `<dialog>`, `<details>`, the Popover API with anchor positioning, `<meter>`, `<search>`, `<time>`, `<fieldset disabled>`.
- Browser support follows Baseline: widely available features are used freely, newly available ones only with a fallback, the rest only as an enhancement. The `browserslist` setting, `eslint-plugin-compat` and `stylelint-no-unsupported-browser-features` enforce it.
- Every control has an accessible name, and the types require it: input `label` or `ariaLabel`, `IconButton` `label`, chart `ariaLabel`, `Image` `alt`, `Iframe` `title`.
- Focus is never lost: dialogs and menus return it, and removing a row moves it to the next row or the add button.

### Every component ships with

- JSDoc on the component and its props
- a story in `packages/go-ui-storybook/src/stories/next/`, one file per family
- Vitest tests, including type tests for forbidden prop combinations
- strings in an `i18n.json` beside it (`common` namespace)

## Using next in the app

- Views import from `@ifrc-go/ui/next`. `Link`, `MenuItem` and `Page` come from the app wrappers in `#components/next/*`, which map route keys and add app concerns (document title, machine translation warning). Lint enforces both, and keeps `@ifrc-go/ui/next/base` out of views.
- Passing `className` or `style` to a next component in a view is a lint warning. A needed variation is added to the library (variant, token, `layoutOptions` field); an app wrapper built from `/base`, marked `FIXME`, is the fallback.
- Shared domain components get next versions in `app/src/components/next/domain/<Name>/`, beside the v2 ones. Their strings use the `common` namespace with keys prefixed by the component name. A next version is added together with its first caller, and the v2 version is removed with its last caller.
- Table columns for GO records with a known width (country, appeal code, emergency, title, disaster type, budget) come from `#utils/domain/tableColumns`; views do not set their width.

## Migration

- v2 (`src/components/`) is frozen: user-visible bug fixes only, against `develop`.
- Views move one at a time. A view PR moves the view and the domain components only it uses; shared domain components get their own PRs.
- One-to-one changes (imports, renames, button looks, `required`) run as app-wide codemods from `packages/ui/codemods/`, one PR each, right after a release cut.
- PRs for this work target `project/go-ui-v3` (or the PR below them in a stack). They carry no changesets or translation migrations: both are written once on `project/go-ui-v3` before it merges into `develop`.

## Development

- Typecheck, lint, tests and builds use the built library: run `pnpm build:ui` after editing `packages/ui/src`.
- Library checks, in `packages/ui`: `pnpm typecheck`, `pnpm lint:js`, `pnpm lint:css`, `pnpm test`.
- Stories: `pnpm storybook` in `packages/go-ui-storybook`.
