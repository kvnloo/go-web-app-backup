import {
    compareBoolean,
    compareDate,
    compareNumber,
    compareString,
} from '@togglecorp/fujs';

import type { ColumnSizeType } from '#next/base/ListLayout';
import HeaderCell, { type HeaderCellProps } from '#next/base/TableLayout/HeaderCell';
import type {
    Column,
    SortDirection,
} from '#next/base/TableLayout/types';
import type { DateLike } from '#utils/common';
import type {
    NumberFormatOptions,
    NumberFormatPreset,
} from '#utils/format';
import type { StatusType } from '#utils/style';

import MoreInfo from '../MoreInfo';
import {
    ActionCell,
    BooleanCell,
    DateCell,
    LinkCell,
    NumberCell,
    TagCell,
    TextCell,
} from './cells';

import styles from './styles.module.css';

type CellProps = Record<string, unknown>;

/** A table column, made by one of the create*Column helpers */
export interface TableColumn<DATUM, KEY> extends Column<DATUM, KEY, CellProps, HeaderCellProps> {
    /** Orders two rows by this column, for sorting data in the app */
    valueComparator?: (a: DATUM, b: DATUM) => number;
}

export interface ColumnOptions {
    sortable?: boolean;
    /** Direction of the first sort; defaults to ascending */
    defaultSortDirection?: SortDirection;
    /** A width from the column scale */
    width?: ColumnSizeType;
    /** Takes up the free width */
    stretch?: boolean;
    /** An explanation, behind an info icon in the header */
    info?: React.ReactNode;
}

interface ColumnParts<DATUM, KEY, PROPS> {
    id: string;
    title: string;
    options: ColumnOptions | undefined;
    cellRenderer: React.ComponentType<PROPS>;
    cellRendererParams: (key: KEY, datum: DATUM) => Omit<PROPS, 'className' | 'name'>;
    valueComparator?: (a: DATUM, b: DATUM) => number;
    headerClassName?: string;
    cellClassName?: string;
    columnClassName?: string;
}

function createColumn<DATUM, KEY, PROPS>(parts: ColumnParts<DATUM, KEY, PROPS>) {
    const {
        id,
        title,
        options,
        cellRenderer,
        cellRendererParams,
        valueComparator,
        headerClassName,
        cellClassName,
        columnClassName,
    } = parts;

    const column = {
        id,
        title,
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: headerClassName,
        headerCellRendererParams: {
            sortable: options?.sortable,
            defaultSortDirection: options?.defaultSortDirection,
            info: options?.info && <MoreInfo heading={title}>{options.info}</MoreInfo>,
        },
        cellRenderer,
        cellRendererParams,
        cellContainerClassName: cellClassName,
        columnClassName,
        columnStyle: options?.width
            ? { width: `var(--go-ui-width-column-${options.width})` }
            : undefined,
        columnStretch: options?.stretch,
        valueComparator,
    };

    // NOTE: the concrete cell props are erased so columns of different
    // kinds fit in one array
    return column as unknown as TableColumn<DATUM, KEY>;
}

export function createStringColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => string | null | undefined,
    options?: ColumnOptions,
) {
    return createColumn<DATUM, KEY, React.ComponentProps<typeof TextCell>>({
        id,
        title,
        options,
        cellRenderer: TextCell,
        cellRendererParams: (_, datum) => ({ value: accessor(datum) }),
        valueComparator: (a, b) => compareString(accessor(a), accessor(b)),
    });
}

export function createNumberColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => number | null | undefined,
    options?: ColumnOptions & {
        format?: NumberFormatPreset;
        formatOptions?: NumberFormatOptions;
    },
) {
    return createColumn<DATUM, KEY, React.ComponentProps<typeof NumberCell>>({
        id,
        title,
        options,
        cellRenderer: NumberCell,
        cellRendererParams: (_, datum) => ({
            value: accessor(datum),
            format: options?.format,
            formatOptions: options?.formatOptions,
        }),
        valueComparator: (a, b) => compareNumber(accessor(a), accessor(b)),
        headerClassName: styles.numberHeader,
        cellClassName: styles.numberCell,
    });
}

export function createDateColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => DateLike | null | undefined,
    options?: ColumnOptions & { format?: string },
) {
    return createColumn<DATUM, KEY, React.ComponentProps<typeof DateCell>>({
        id,
        title,
        // NOTE: dates have a known width
        options: { width: 'sm', ...options },
        cellRenderer: DateCell,
        cellRendererParams: (_, datum) => ({ value: accessor(datum), format: options?.format }),
        valueComparator: (a, b) => compareDate(accessor(a), accessor(b)),
    });
}

export function createBooleanColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => boolean | null | undefined,
    options?: ColumnOptions,
) {
    return createColumn<DATUM, KEY, React.ComponentProps<typeof BooleanCell>>({
        id,
        title,
        options,
        cellRenderer: BooleanCell,
        cellRendererParams: (_, datum) => ({ value: accessor(datum) }),
        valueComparator: (a, b) => compareBoolean(accessor(a), accessor(b)),
    });
}

/** A link to a record, underlined; internal links go through the app's router */
export function createLinkColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => string | null | undefined,
    hrefSelector: (datum: DATUM) => string | null | undefined,
    options?: ColumnOptions,
) {
    return createColumn<DATUM, KEY, React.ComponentProps<typeof LinkCell>>({
        id,
        title,
        options,
        cellRenderer: LinkCell,
        cellRendererParams: (_, datum) => ({ label: accessor(datum), href: hrefSelector(datum) }),
        valueComparator: (a, b) => compareString(accessor(a), accessor(b)),
    });
}

/** A status or category as a Tag */
export function createTagColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => string | null | undefined,
    statusSelector?: (datum: DATUM) => StatusType | undefined,
    options?: ColumnOptions,
) {
    return createColumn<DATUM, KEY, React.ComponentProps<typeof TagCell>>({
        id,
        title,
        options,
        cellRenderer: TagCell,
        cellRendererParams: (_, datum) => ({
            label: accessor(datum),
            status: statusSelector?.(datum),
        }),
        valueComparator: (a, b) => compareString(accessor(a), accessor(b)),
    });
}

/**
 * A "more actions" menu per row; `itemsSelector` returns the row's
 * MenuItems (nothing for a row without actions)
 */
export function createActionColumn<DATUM, KEY>(
    id: string,
    itemsSelector: (datum: DATUM) => React.ReactNode,
    options: { ariaLabel: string },
) {
    return createColumn<DATUM, KEY, React.ComponentProps<typeof ActionCell>>({
        id,
        title: '',
        options: undefined,
        cellRenderer: ActionCell,
        cellRendererParams: (_, datum) => ({
            items: itemsSelector(datum),
            ariaLabel: options.ariaLabel,
        }),
        columnClassName: styles.narrowColumn,
    });
}

/** A column with its own cell component, for cells no other helper covers */
export function createElementColumn<DATUM, KEY, PROPS extends object>(
    id: string,
    title: string,
    renderer: React.ComponentType<PROPS>,
    rendererParams: (key: KEY, datum: DATUM) => PROPS,
    options?: ColumnOptions,
) {
    return createColumn<DATUM, KEY, PROPS>({
        id,
        title,
        options,
        cellRenderer: renderer,
        cellRendererParams: rendererParams,
    });
}
