import ListLayout, {
    type BlockLayoutOptions,
    type GridLayoutOptions,
    type GridWithSidebarLayoutOptions,
    type InlineLayoutOptions,
    type Props as ListLayoutProps,
} from '#next/base/ListLayout';
import type { SpacingType } from '#utils/style';

interface BaseProps {
    className?: string;
    elementRef?: React.RefObject<HTMLDivElement | null>;
    children?: React.ReactNode;
    /** Gap between the items; defaults to the layout-defaults context, then md */
    spacing?: SpacingType;
}

interface InlineProps extends BaseProps {
    layout?: 'inline';
    layoutOptions?: InlineLayoutOptions;
}

interface BlockProps extends BaseProps {
    layout: 'block';
    layoutOptions?: BlockLayoutOptions;
}

interface GridProps extends BaseProps {
    layout: 'grid';
    layoutOptions?: GridLayoutOptions | GridWithSidebarLayoutOptions;
}

export type Props = InlineProps | BlockProps | GridProps;

/**
 * Arranges a list of items in a row (`inline`, the default), a stack
 * (`block`) or a grid, and owns the gaps between them. Rare tweaks go in
 * `layoutOptions`, whose fields depend on the layout. A list that needs a
 * surface is a Card, not a ListView with a background.
 */
function ListView(props: Props) {
    const {
        className,
        elementRef,
        children,
        spacing,
        layout,
        layoutOptions,
    } = props;

    // NOTE: the union above already pairs each layout with its options
    const layoutProps = { layout, ...layoutOptions } as ListLayoutProps;

    return (
        <ListLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...layoutProps}
            className={className}
            elementRef={elementRef}
            spacing={spacing}
        >
            {children}
        </ListLayout>
    );
}

export default ListView;
