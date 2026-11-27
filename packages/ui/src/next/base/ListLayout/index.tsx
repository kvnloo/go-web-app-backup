import {
    type RefObject,
    useContext,
    useLayoutEffect,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import LayoutDefaultsContext from '#contexts/layout-defaults';
import {
    type BackgroundColorType,
    fullSpacings,
    gapSpacings,
    getBackgroundColorClassName,
    getSpacingClassName,
    getSpacingValue,
    type SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

/** Steps of the --go-ui-width-column-* scale */
export type ColumnSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type NumColumns = 1 | 2 | 3 | 4 | 5 | 6;
export type LayoutType = 'block' | 'inline' | 'grid';

interface CommonLayoutOptions {
    /** Optical correction is on by default */
    withoutSpacingOpticalCorrection?: boolean;
}

export interface BlockLayoutOptions extends CommonLayoutOptions {
    /** Cross-axis alignment of the items */
    align?: 'start' | 'center';
    wrap?: never;
    alignItems?: never;
    numPreferredColumns?: never;
    minColumnSize?: never;
    sidebar?: never;
}

export interface InlineLayoutOptions extends CommonLayoutOptions {
    wrap?: boolean;
    /** Main-axis distribution of the items */
    align?: 'start' | 'center' | 'between';
    alignItems?: 'start' | 'center';
    numPreferredColumns?: never;
    minColumnSize?: never;
    sidebar?: never;
}

export interface GridLayoutOptions extends CommonLayoutOptions {
    numPreferredColumns?: NumColumns;
    minColumnSize?: ColumnSizeType;
    sidebar?: never;
    wrap?: never;
    align?: never;
    alignItems?: never;
}

export interface GridWithSidebarLayoutOptions extends CommonLayoutOptions {
    sidebar: {
        position?: 'start' | 'end';
        size?: 'xs' | 'sm' | 'md' | 'lg';
    };
    numPreferredColumns?: never;
    minColumnSize?: never;
    wrap?: never;
    align?: never;
    alignItems?: never;
}

/** The arrangement options that apply to a given layout */
export type LayoutOptions<L extends LayoutType> = L extends 'grid'
    ? GridLayoutOptions | GridWithSidebarLayoutOptions
    : L extends 'inline'
        ? InlineLayoutOptions
        : BlockLayoutOptions;

interface CommonProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'wrap'> {
    className?: string;
    elementRef?: RefObject<HTMLDivElement | null>;
    /** Defaults to the layout-defaults context, then md */
    spacing?: SpacingType;
    spacingOffset?: number;
    children?: React.ReactNode;
    withPadding?: boolean;
    withFullWidth?: boolean;
    /** Setting a background also rounds the corners */
    backgroundColor?: BackgroundColorType;
    withOverflow?: boolean;
    withGrow?: boolean;
    gridContentClassName?: string;
}

export type Props = CommonProps & (
    | ({ layout?: 'inline' } & InlineLayoutOptions)
    | ({ layout: 'block' } & BlockLayoutOptions)
    | ({ layout: 'grid' } & GridLayoutOptions)
    | ({ layout: 'grid' } & GridWithSidebarLayoutOptions)
);

function useFallbackRef<T>(ref?: RefObject<T | null>) {
    const localRef = useRef<T>(null);
    return ref ?? localRef;
}

const sidebarSizeToClassName = {
    xs: styles.xsSidebar,
    sm: styles.smSidebar,
    md: styles.mdSidebar,
    lg: styles.lgSidebar,
};

/**
 * Arranges items as an inline row, a block stack or a grid, owning the gaps
 * between them (building block). The exposed ListView and the container
 * flavours pass their layout and layoutOptions through to it.
 */
function ListLayout(props: Props) {
    const {
        className,
        layout = 'inline',
        wrap,
        align,
        alignItems,
        spacing: spacingFromProps,
        spacingOffset = 0,
        withPadding,
        backgroundColor,
        children,
        numPreferredColumns = 2,
        minColumnSize = 'sm',
        gridContentClassName,
        sidebar,
        withFullWidth,
        elementRef: elementRefFromProps,
        withoutSpacingOpticalCorrection,
        withOverflow,
        withGrow,
        ...divElementProps
    } = props;

    const defaults = useContext(LayoutDefaultsContext);
    const spacing = spacingFromProps ?? defaults.spacing ?? 'md';
    const offset = spacingOffset + defaults.spacingOffset;
    const elementRef = useFallbackRef(elementRefFromProps);

    useLayoutEffect(() => {
        if (layout !== 'grid') {
            return;
        }
        const element = elementRef.current;
        element?.style.setProperty('--num-preferred-columns', String(numPreferredColumns));
        element?.style.setProperty('--min-column-size', `var(--go-ui-width-column-${minColumnSize})`);
        const paddingPartitions = withPadding ? 2 : 0;
        const gapPartitions = numPreferredColumns - 1;
        element?.style.setProperty(
            '--reserved-space',
            `calc(${getSpacingValue(spacing, offset)} * ${paddingPartitions + gapPartitions})`,
        );
    }, [numPreferredColumns, minColumnSize, layout, withPadding, spacing, offset, elementRef]);

    const spacingClassName = getSpacingClassName({
        spacing,
        offset,
        modes: withPadding ? fullSpacings : gapSpacings,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divElementProps}
            ref={elementRef}
            className={_cs(
                styles.listLayout,
                layout === 'inline' && styles.inlineLayout,
                layout === 'block' && styles.blockLayout,
                layout === 'grid' && styles.gridLayout,
                layout !== 'grid' && spacingClassName,
                wrap && styles.withWrap,
                alignItems === 'start' && styles.withStartAlignment,
                align === 'between' && styles.withSpaceBetweenContents,
                align === 'center' && styles.withCenteredContents,
                withFullWidth && styles.withFullWidth,
                getBackgroundColorClassName(backgroundColor),
                isDefined(backgroundColor) && styles.withBackgroundColor,
                isDefined(sidebar) && styles.withSidebar,
                withOverflow && styles.withOverflow,
                withGrow && styles.withGrow,
                className,
            )}
        >
            {layout === 'grid' ? (
                <div
                    className={_cs(
                        styles.gridContent,
                        spacingClassName,
                        gridContentClassName,
                        isDefined(sidebar) && styles.gridContentWithSidebar,
                        sidebar?.position === 'start' && styles.sidebarPositionStart,
                        isDefined(sidebar) && sidebarSizeToClassName[sidebar.size ?? 'md'],
                    )}
                >
                    {children}
                </div>
            ) : children}
        </div>
    );
}

export default ListLayout;
