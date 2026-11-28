import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import ContainerStateContext from '#contexts/container-state';

import MenuItem from '../MenuItem';
import {
    createActionColumn,
    createDateColumn,
    createLinkColumn,
    createNumberColumn,
    createStringColumn,
    createTagColumn,
} from './columns';
import Table from '.';

import styles from './styles.module.css';

interface Report {
    id: number;
    title: string;
    people: number | null;
    date: string;
    status: string;
    children?: Report[];
}

const reports: Report[] = [
    {
        id: 1,
        title: 'Floods',
        people: 1200,
        date: '2026-01-05',
        status: 'Active',
        children: [{
            id: 11, title: 'Update 1', people: 1300, date: '2026-01-09', status: 'Active',
        }],
    },
    {
        id: 2, title: 'Cyclone', people: null, date: '2026-02-01', status: 'Closed',
    },
];

function keySelector(report: Report) {
    return report.id;
}

function getSubRows(report: Report) {
    return report.children;
}

function noop() {}

const columns = [
    createLinkColumn<Report, number>(
        'title',
        'Title',
        (report) => report.title,
        (report) => `/reports/${report.id}/`,
        { sortable: true },
    ),
    createNumberColumn<Report, number>('people', 'People', (report) => report.people, { info: 'Estimated' }),
    createDateColumn<Report, number>('date', 'Date', (report) => report.date),
    createTagColumn<Report, number>(
        'status',
        'Status',
        (report) => report.status,
        (report) => (report.status === 'Active' ? 'positive' : undefined),
    ),
    createActionColumn<Report, number>(
        'actions',
        () => <MenuItem name="x" onClick={noop}>Export</MenuItem>,
        { ariaLabel: 'Report actions' },
    ),
];

/* eslint-disable max-len */
function forbiddenCombinations() {
    return (
        <>
            <Table data={reports} keySelector={keySelector} columns={columns} sorting={undefined} onSortingChange={noop} />
            {/* @ts-expect-error sorting needs its change handler */}
            <Table data={reports} keySelector={keySelector} columns={columns} sorting={{ name: 'title', direction: 'asc' }} />
            {/* @ts-expect-error sub-rows need the expanded keys and their handler */}
            <Table data={reports} keySelector={keySelector} columns={columns} getSubRows={getSubRows} />
            {/* @ts-expect-error row modifiers stay in the building block */}
            <Table data={reports} keySelector={keySelector} columns={columns} rowModifier={noop} />
            {/* @ts-expect-error column widths are tokens from the column scale */}
            {createStringColumn<Report, number>('t', 'T', (report) => report.title, { width: '12rem' })}
        </>
    );
}

/* eslint-enable max-len */

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('columns render their kinds; numbers align right and dates get a width', () => {
    const html = renderToStaticMarkup(
        <Table data={reports} keySelector={keySelector} columns={columns} caption="Reports" />,
    );
    expect(html).toContain('href="/reports/1/"');
    expect(html).toContain(styles.numberCell);
    expect(html).toContain(styles.numberHeader);
    expect(html).toContain('var(--go-ui-width-column-sm)');
    expect(html).toContain('aria-label="Report actions"');
    expect(html).toContain('aria-label="More information"');
    expect(html).toMatch(/<caption[^>]*>Reports<\/caption>/);
    expect(html).toContain('--');
});

test('a sorted column says so', () => {
    const html = renderToStaticMarkup(
        <Table
            data={reports}
            keySelector={keySelector}
            columns={columns}
            sorting={{ name: 'title', direction: 'asc' }}
            onSortingChange={noop}
        />,
    );
    expect(html).toContain('aria-sort="ascending"');
});

test('expanded rows show their sub-rows; rows without them cannot expand', () => {
    const html = renderToStaticMarkup(
        <Table
            data={reports}
            keySelector={keySelector}
            columns={columns}
            getSubRows={getSubRows}
            expandedKeys={[1]}
            onExpandedKeysChange={noop}
        />,
    );
    expect(html).toContain('Update 1');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-label="Hide details"');
    expect(html).toMatch(/aria-expanded="false"[^>]*disabled=""|disabled=""[^>]*aria-expanded="false"/);

    const collapsed = renderToStaticMarkup(
        <Table
            data={reports}
            keySelector={keySelector}
            columns={columns}
            getSubRows={getSubRows}
            expandedKeys={[]}
            onExpandedKeysChange={noop}
        />,
    );
    expect(collapsed).not.toContain('Update 1');
});

test('an empty table inside a filtered section says nothing matches', () => {
    const html = renderToStaticMarkup(
        <ContainerStateContext.Provider value={{
            pending: false, errored: false, empty: false, filtered: true,
        }}
        >
            <Table data={[]} keySelector={keySelector} columns={columns} />
        </ContainerStateContext.Provider>,
    );
    const unfiltered = renderToStaticMarkup(
        <Table data={[]} keySelector={keySelector} columns={columns} />,
    );
    expect(html).not.toBe(unfiltered);
});
