// NOTE: @ifrc-go/ui/next is the redesigned library, built in parallel with v2
// (decisions in GO_UI_V3_ROLLOUT.md). This entry exports only the components
// meant for views; building blocks are exported from `@ifrc-go/ui/next/base`.
export type { Props as InlineViewProps } from './components/InlineView';
export { default as InlineView } from './components/InlineView';
export type { Props as ListViewProps } from './components/ListView';
export { default as ListView } from './components/ListView';
