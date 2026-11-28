import {
    useContext,
    useMemo,
} from 'react';

import ContainerStateContext from '#contexts/container-state';
import useTranslation from '#hooks/useTranslation';
import TableLayout from '#next/base/TableLayout';
import type { Sorting } from '#next/base/TableLayout/sorting';
import TableBodyContent from '#next/base/TableLayout/TableBodyContent';
import type { RowOptions } from '#next/base/TableLayout/types';

import {
    ExpandCell,
    IndicatorCell,
    type IndicatorPosition,
} from './cells';
import {
    createElementColumn,
    type TableColumn,
} from './columns';
import SubRowContext, { type SubRowContextProps } from './subRows';

import i18n from './i18n.json';
import styles from './styles.module.css';

type TableKey = string | number;

interface BaseProps<DATUM, KEY extends TableKey> {
    className?: string;
    data: DATUM[] | null | undefined;
    keySelector: (datum: DATUM, index: number) => KEY;
    /** Made with the create*Column helpers */
    columns: TableColumn<DATUM, KEY>[];
    /** Names the table for assistive technology; it is not shown */
    caption?: React.ReactNode;
    /** Shows the loading message; a surrounding Section shows its own */
    pending?: boolean;
    /** Shows the error message; a surrounding Section shows its own */
    errored?: boolean;
    /** Words the empty message for filters; defaults to the surrounding Section */
    filtered?: boolean;
    headersHidden?: boolean;
}

/** Sorting needs both the current sort and its change handler */
type SortingProps =
    | { sorting: Sorting | undefined; onSortingChange: (sorting: Sorting | undefined) => void }
    | { sorting?: never; onSortingChange?: never };

/** Sub-rows need the rows, the expanded row keys and their change handler */
type SubRowProps<DATUM, KEY> =
    | {
        getSubRows: (datum: DATUM) => DATUM[] | null | undefined;
        expandedKeys: KEY[];
        onExpandedKeysChange: (keys: KEY[]) => void;
    }
    | { getSubRows?: never; expandedKeys?: never; onExpandedKeysChange?: never };

export type Props<DATUM, KEY extends TableKey> = BaseProps<DATUM, KEY>
    & SortingProps
    & SubRowProps<DATUM, KEY>;

function getIndicatorPosition(index: number, count: number): IndicatorPosition {
    if (count === 1) {
        return 'single';
    }
    if (index === 0) {
        return 'start';
    }
    return index === count - 1 ? 'end' : 'mid';
}

function emptyCell() {
    return null;
}

/**
 * A table of records. Columns come from the create*Column helpers; numbers
 * align right and dates get their width. Sortable columns show a sort
 * toggle wired to `sorting`. With `getSubRows`, rows that have sub-rows get
 * an expand button and show them below, tied by a line.
 */
function Table<DATUM, KEY extends TableKey>(props: Props<DATUM, KEY>) {
    const {
        className,
        data,
        keySelector,
        columns,
        caption,
        pending = false,
        errored = false,
        filtered: filteredFromProps,
        headersHidden,
        sorting,
        onSortingChange,
        getSubRows,
        expandedKeys,
        onExpandedKeysChange,
    } = props;

    const strings = useTranslation(i18n);
    const containerState = useContext(ContainerStateContext);
    const filtered = filteredFromProps ?? containerState.filtered;

    const withSubRows = !!getSubRows;

    const { rowColumns, subRowColumns } = useMemo(() => {
        if (!withSubRows) {
            return { rowColumns: columns, subRowColumns: columns };
        }
        const indicatorColumn = (active: boolean) => {
            type IndicatorProps = React.ComponentProps<typeof IndicatorCell>;
            const column = createElementColumn<DATUM, KEY, IndicatorProps>(
                active ? 'subRowIndicator' : 'rowIndicator',
                '',
                IndicatorCell,
                () => ({ position: undefined }),
            );
            return {
                ...column,
                columnClassName: styles.narrowColumn,
                cellContainerClassName: styles.indicatorCell,
                cellContainerRendererParams: () => ({ withoutBorder: true }),
                cellRendererParams: active
                    ? (_: KEY, __: DATUM, index: number, rows: DATUM[]) => ({
                        position: getIndicatorPosition(index, rows.length),
                    })
                    : () => ({ position: undefined }),
            } as TableColumn<DATUM, KEY>;
        };
        const expandColumn = {
            ...createElementColumn<DATUM, KEY, React.ComponentProps<typeof ExpandCell>>(
                'expandRow',
                '',
                ExpandCell,
                (key, datum) => ({
                    rowKey: key,
                    datum,
                    expandLabel: strings.tableExpandRowLabel,
                    collapseLabel: strings.tableCollapseRowLabel,
                }),
            ),
            columnClassName: styles.narrowColumn,
        } as TableColumn<DATUM, KEY>;
        const emptyExpandColumn = {
            ...createElementColumn<DATUM, KEY, object>('expandRow', '', emptyCell, () => ({})),
            columnClassName: styles.narrowColumn,
        } as TableColumn<DATUM, KEY>;

        return {
            rowColumns: [indicatorColumn(false), ...columns, expandColumn],
            subRowColumns: [indicatorColumn(true), ...columns, emptyExpandColumn],
        };
    }, [withSubRows, columns, strings.tableExpandRowLabel, strings.tableCollapseRowLabel]);

    const subRowContext = useMemo<SubRowContextProps>(() => ({
        isExpanded: (rowKey) => !!expandedKeys?.includes(rowKey as KEY),
        hasSubRows: (datum) => (getSubRows?.(datum as DATUM)?.length ?? 0) > 0,
        toggle: (rowKey) => {
            const key = rowKey as KEY;
            const keys = expandedKeys ?? [];
            onExpandedKeysChange?.(
                keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key],
            );
        },
    }), [expandedKeys, getSubRows, onExpandedKeysChange]);

    const rowModifier = withSubRows
        ? ({ row, rowKey, datum }: RowOptions<DATUM, KEY>) => {
            const subRows = getSubRows?.(datum);
            if (!expandedKeys?.includes(rowKey) || !subRows || subRows.length === 0) {
                return row;
            }
            return (
                <>
                    {row}
                    <TableBodyContent
                        data={subRows}
                        keySelector={keySelector}
                        columns={subRowColumns}
                        cellClassName={styles.subRowCell}
                    />
                </>
            );
        }
        : undefined;

    return (
        <SubRowContext.Provider value={subRowContext}>
            <TableLayout
                className={className}
                data={data}
                keySelector={keySelector}
                columns={rowColumns}
                caption={caption}
                withHiddenCaption
                headersHidden={headersHidden}
                sorting={sorting}
                onSortingChange={onSortingChange}
                rowModifier={rowModifier}
                pending={pending}
                errored={errored}
                filtered={filtered}
            />
        </SubRowContext.Provider>
    );
}

export default Table;
