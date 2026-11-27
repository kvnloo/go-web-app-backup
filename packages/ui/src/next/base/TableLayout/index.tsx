import React, {
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
    sum,
} from '@togglecorp/fujs';

import { WIDTH_DEFAULT_TABLE_COLUMN } from '#utils/constants';

import StateMessage from '../StateMessage';
import TableSortingContext, { type Sorting } from './sorting';
import TableBodyContent from './TableBodyContent';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import type {
    Column,
    RowOptions,
    VerifyColumn,
} from './types';

import styles from './styles.module.css';

function getAriaSort(sorting: Sorting | undefined, columnId: string) {
    if (sorting?.name !== columnId) {
        return undefined;
    }
    return sorting.direction === 'asc' ? 'ascending' : 'descending';
}

function getColumnWidth<D, K, C, H>(column: Column<D, K, C, H>, width: number | undefined) {
    return width ?? column.columnWidth ?? WIDTH_DEFAULT_TABLE_COLUMN;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableProps<D, K extends string | number, C extends Column<D, K, any, any>> {
    className?: string;
    caption?: React.ReactNode;
    keySelector: (data: D, index: number) => K;
    columns: C[] & VerifyColumn<C, D, K>;
    data: D[] | undefined | null;
    captionClassName?: string;
    headerRowClassName?: string;
    headerCellClassName?: string | ((columnKey: string) => (string | undefined));
    rowClassName?: string | ((key: K, datum: D) => (string | undefined));
    cellClassName?: string | ((key: K, datum: D, columnKey: string) => (string | undefined));
    rowModifier?: (rowOptions: RowOptions<D, K>) => React.ReactNode;

    fixedColumnWidth?: boolean;
    resizableColumn?: boolean;

    headersHidden?: boolean;
    /** Keep the caption for assistive technology but do not show it */
    withHiddenCaption?: boolean;

    sorting?: Sorting;
    onSortingChange?: (sorting: Sorting | undefined) => void;

    filtered?: boolean;
    pending?: boolean;
    errored?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableLayout<D, K extends string | number, C extends Column<D, K, any, any>>(
    props: TableProps<D, K, C>,
) {
    const {
        data,
        keySelector,
        columns,
        caption,
        className,
        captionClassName,
        headerRowClassName,
        headerCellClassName,
        rowClassName,
        cellClassName,
        rowModifier,
        fixedColumnWidth,
        resizableColumn,
        headersHidden,
        withHiddenCaption,
        sorting,
        onSortingChange,
        pending = false,
        filtered = false,
        errored = false,
    } = props;

    const sortingContextValue = useMemo(
        () => ({ sorting, onSortingChange }),
        [sorting, onSortingChange],
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const [tableName] = React.useState(() => randomString());
    const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});

    useEffect(() => {
        setColumnWidths((cols) => {
            if (isNotDefined(containerRef.current)) {
                return cols;
            }

            const size = containerRef.current.getBoundingClientRect();
            const { width: parentWidth } = size;

            let newColumnWidths: { id: string, width: number, stretch: boolean }[] = columns.map(
                (col) => ({
                    id: col.id,
                    stretch: !!col.columnStretch,
                    width: getColumnWidth(col, cols[col.id]),
                }),
            );

            const totalStretchableWidth = sum(
                newColumnWidths
                    .filter((item) => item.stretch)
                    .map((item) => item.width),
            );
            const totalNonStretchableWidth = sum(
                newColumnWidths
                    .filter((item) => !item.stretch)
                    .map((item) => item.width),
            );

            const stretchFactor = (parentWidth - totalNonStretchableWidth) / totalStretchableWidth;

            if (stretchFactor > 1) {
                newColumnWidths = newColumnWidths.map((item) => ({
                    ...item,
                    width: item.stretch
                        // NOTE: may need to use floor
                        ? item.width * stretchFactor
                        : item.width,
                }));
            }
            return listToMap(
                newColumnWidths,
                (item) => item.id,
                (item) => item.width,
            );
        });
    }, [columns]);

    const handleColumnResize = React.useCallback(
        (widthFromArgs: number, name: string | undefined) => {
            const column = document.getElementById(`${tableName}-${name}`);
            // NOTE: setting a minimum size for column
            const width = Math.max(widthFromArgs, 80);
            if (isNotDefined(column)) {
                return;
            }

            column.style.width = `${width}px`;

            if (!fixedColumnWidth) {
                return;
            }
            const table = document.getElementById(tableName);
            if (isNotDefined(table)) {
                return;
            }

            const totalWidth = sum(columns.map((c) => (
                c.id === name ? width : columnWidths[c.id]
            )));
            table.style.width = `${totalWidth}px`;
        },
        [tableName, columnWidths, columns, fixedColumnWidth],
    );

    const handleColumnResizeComplete = React.useCallback(
        (width: number, name: string | undefined) => {
            if (isDefined(name)) {
                setColumnWidths((prevColumnWidths) => ({
                    ...prevColumnWidths,
                    [name]: Math.max(width, 80),
                }));
            }
        },
        [setColumnWidths],
    );

    const width = React.useMemo(() => (
        sum(columns.map((c) => columnWidths[c.id] ?? getColumnWidth(c, undefined)))
    ), [columnWidths, columns]);

    // NOTE: emptiness depends on the data only; measured widths matter for
    // fixed-width tables, which fall back to each column's declared width
    const isEmpty = isNotDefined(data) || data.length === 0;

    return (
        <TableSortingContext.Provider value={sortingContextValue}>
            <div
                ref={containerRef}
                className={_cs(styles.table, className)}
            >
                {!isEmpty && (
                    <div className={styles.tableOverflowWrapper}>
                        <table
                            className={styles.tableElement}
                            style={fixedColumnWidth ? { width: `${width}px` } : undefined}
                            id={tableName}
                        >
                            {caption && (
                                <caption
                                    className={_cs(
                                        withHiddenCaption && styles.visuallyHidden,
                                        captionClassName,
                                    )}
                                >
                                    {caption}
                                </caption>
                            )}
                            <colgroup>
                                {columns.map((column) => {
                                    const {
                                        id,
                                        columnClassName,
                                        columnStyle,
                                        columnWidth: preferredColumnWidth,
                                    } = column;

                                    // NOTE: auto layout applies only an explicit columnWidth;
                                    // computed widths are for fixedColumnWidth tables
                                    const colWidth = fixedColumnWidth
                                        ? (columnWidths[id] ?? getColumnWidth(column, undefined))
                                        : preferredColumnWidth;
                                    const style = {
                                        ...columnStyle,
                                        ...(isDefined(colWidth)
                                            ? { width: `${colWidth}px` }
                                            : undefined),
                                    };

                                    return (
                                        <col
                                            id={`${tableName}-${id}`}
                                            style={style}
                                            key={id}
                                            className={_cs(styles.column, columnClassName)}
                                        />
                                    );
                                })}
                            </colgroup>
                            {!headersHidden && (
                                <thead>
                                    <TableRow
                                        className={_cs(styles.headerRow, headerRowClassName)}
                                    >
                                        {columns.map((column, index) => {
                                            const {
                                                id,
                                                title,
                                                headerCellRenderer: Renderer,
                                                headerCellRendererClassName,
                                                headerCellRendererParams,
                                                headerContainerClassName,
                                            } = column;

                                            const children = (
                                                <Renderer
                                                    // eslint-disable-next-line max-len
                                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                                    {...headerCellRendererParams}
                                                    name={id}
                                                    title={title}
                                                    index={index}
                                                    className={_cs(
                                                        headerCellRendererClassName,
                                                        styles.headerComponent,
                                                    )}
                                                />
                                            );
                                            return (
                                                <TableHeader
                                                    key={id}
                                                    scope="col"
                                                    name={id}
                                                    aria-sort={getAriaSort(sorting, id)}
                                                    onResize={resizableColumn
                                                        ? handleColumnResize
                                                        : undefined}
                                                    onResizeComplete={resizableColumn
                                                        ? handleColumnResizeComplete
                                                        : undefined}
                                                    className={_cs(
                                                        styles.headerElement,
                                                        typeof headerCellClassName === 'function'
                                                            ? headerCellClassName(id)
                                                            : headerCellClassName,
                                                        headerContainerClassName,
                                                    )}
                                                >
                                                    {children}
                                                </TableHeader>
                                            );
                                        })}
                                    </TableRow>
                                </thead>
                            )}
                            <tbody>
                                <TableBodyContent
                                    data={data}
                                    keySelector={keySelector}
                                    columns={columns}
                                    rowClassName={rowClassName}
                                    cellClassName={cellClassName}
                                    rowModifier={rowModifier}
                                />
                            </tbody>
                        </table>
                    </div>
                )}
                <StateMessage
                    filtered={filtered}
                    empty={isEmpty && !pending}
                    errored={errored}
                    pending={pending}
                />
            </div>
        </TableSortingContext.Provider>
    );
}

export default TableLayout;
