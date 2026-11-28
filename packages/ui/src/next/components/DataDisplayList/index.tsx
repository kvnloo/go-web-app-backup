import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import DataDisplayListContext, {
    type DataDisplayListContextProps,
    type DataDisplayVariant,
} from '#contexts/data-display-list';
import type {
    ColumnSizeType,
    NumColumns,
} from '#next/base/ListLayout';
import {
    gapSpacings,
    getSpacingClassName,
    type SpacingType,
    type TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

interface GridOptions {
    /** Defaults to 2 */
    numPreferredColumns?: NumColumns;
    /** Narrowest a column may get before the grid drops a column; defaults to sm */
    minColumnSize?: ColumnSizeType;
}

type LayoutProps =
    | { layout?: 'block'; layoutOptions?: never }
    | { layout: 'inline'; layoutOptions?: never }
    | { layout: 'grid'; layoutOptions?: GridOptions };

interface BaseProps {
    className?: string;
    /** DataDisplays */
    children: React.ReactNode;
    /** Emphasis for every item; an item can override it */
    variant?: DataDisplayVariant;
    textSize?: TextSizeType;
    /** Gap between the items; defaults to sm */
    spacing?: SpacingType;
}

export type Props = BaseProps & LayoutProps;

/**
 * A group of facts: one <dl> whose DataDisplays render as its <dt>/<dd>
 * pairs. Lays them out as a stack (the default), a wrapping row or a grid,
 * and sets their emphasis once.
 */
function DataDisplayList(props: Props) {
    const {
        className,
        children,
        variant,
        textSize,
        spacing = 'sm',
        layout = 'block',
        layoutOptions,
    } = props;

    const contextValue = useMemo<DataDisplayListContextProps>(
        () => ({ variant, textSize }),
        [variant, textSize],
    );

    const numColumns = layoutOptions?.numPreferredColumns ?? 2;
    const minColumnSize = layoutOptions?.minColumnSize ?? 'sm';

    const gridStyle = layout === 'grid' ? {
        '--num-columns': numColumns,
        '--min-column-size': `var(--go-ui-width-column-${minColumnSize})`,
    } as React.CSSProperties : undefined;

    return (
        <DataDisplayListContext.Provider value={contextValue}>
            <dl
                className={_cs(
                    styles.dataDisplayList,
                    layout === 'inline' && styles.inlineLayout,
                    layout === 'grid' && styles.gridLayout,
                    getSpacingClassName({ spacing, modes: gapSpacings }),
                    className,
                )}
                style={gridStyle}
            >
                {children}
            </dl>
        </DataDisplayListContext.Provider>
    );
}

export default DataDisplayList;
