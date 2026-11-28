import type {
    BlockLayoutOptions,
    GridLayoutOptions,
    InlineLayoutOptions,
    Props as ListLayoutProps,
} from '../base/ListLayout';

/** How a group lays out its options: a wrapping row (the default), a stack or a grid */
export type OptionLayoutProps =
    | { layout?: 'inline'; layoutOptions?: InlineLayoutOptions }
    | { layout: 'block'; layoutOptions?: BlockLayoutOptions }
    | { layout: 'grid'; layoutOptions?: GridLayoutOptions };

/** The ListLayout props for an option layout (the union pairs each layout with its options) */
export function getOptionListLayoutProps(props: OptionLayoutProps) {
    const { layout = 'inline', layoutOptions } = props;
    if (layout === 'inline') {
        return { layout, wrap: true, ...layoutOptions } as ListLayoutProps;
    }
    return { layout, ...layoutOptions } as ListLayoutProps;
}

/** Labels of the given keys, for the diff view's previous value */
export function getOptionLabels<OPTION, KEY>(
    keys: KEY[],
    options: OPTION[] | undefined,
    keySelector: (option: OPTION) => KEY,
    labelSelector: (option: OPTION) => React.ReactNode,
) {
    return (options ?? [])
        .filter((option) => keys.includes(keySelector(option)))
        .map(labelSelector);
}
