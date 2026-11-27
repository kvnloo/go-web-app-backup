import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import HeaderCell, { type HeaderCellProps } from './HeaderCell';
import type { Column } from './types';
import TableLayout from '.';

import styles from './styles.module.css';

interface Operation {
    id: number;
    name: string;
}

function NameCell({ value }: { value: string }) {
    return <span>{value}</span>;
}

const columns: Column<Operation, number, { value: string }, HeaderCellProps>[] = [{
    id: 'name',
    title: 'Operation',
    headerCellRenderer: HeaderCell,
    headerCellRendererParams: { sortable: true },
    cellRenderer: NameCell,
    cellRendererParams: (_, datum) => ({ value: datum.name }),
    columnWidth: 240,
}];

const data: Operation[] = [{ id: 1, name: 'Bangladesh: Monsoon Floods' }];

type TableLayoutProps = React.ComponentProps<
    typeof TableLayout<Operation, number, typeof columns[number]>
>;

function render(props: Partial<TableLayoutProps>) {
    return renderToStaticMarkup(
        <TableLayout
            data={data}
            keySelector={(datum) => datum.id}
            columns={columns}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />,
    );
}

test('renders the rows on the first paint, without an empty message', () => {
    const html = render({});
    expect(html).toContain('Bangladesh: Monsoon Floods');
    expect(html).not.toContain('Data is not available');
});

test('the sorted column announces its direction', () => {
    const html = render({ sorting: { name: 'name', direction: 'dsc' }, onSortingChange: () => undefined });
    expect(html).toContain('aria-sort="descending"');
    expect(html).toContain('aria-label="Sort Table"');
});

test('a hidden caption stays in the table for assistive technology', () => {
    const html = render({ caption: 'Ongoing Operations', withHiddenCaption: true });
    expect(html).toMatch(new RegExp(`<caption class="${styles.visuallyHidden}">Ongoing Operations</caption>`));
});

test('an explicit column width applies in auto layout', () => {
    expect(render({})).toContain('style="width:240px"');
});

test('an empty table shows the empty message', () => {
    expect(render({ data: [] })).toContain('Data is not available!');
});
