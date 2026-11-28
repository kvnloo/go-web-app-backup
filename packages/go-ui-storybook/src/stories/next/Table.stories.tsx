import { useState } from 'react';
import {
    Button,
    createActionColumn,
    createDateColumn,
    createLinkColumn,
    createNumberColumn,
    createTagColumn,
    MenuItem,
    Section,
    type Sorting,
    Table,
    TextInput,
    useListState,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

interface Operation {
    id: number;
    title: string;
    people: number | null;
    date: string;
    status: string;
    updates?: Operation[];
}

const operations: Operation[] = [
    {
        id: 1,
        title: 'Nepal Floods',
        people: 1240000,
        date: '2026-01-05',
        status: 'Active',
        updates: [
            {
                id: 11, title: 'Operational update 1', people: 1300000, date: '2026-01-20', status: 'Active',
            },
            {
                id: 12, title: 'Final report', people: 1350000, date: '2026-03-01', status: 'Closed',
            },
        ],
    },
    {
        id: 2, title: 'Cyclone Freddy', people: null, date: '2026-02-01', status: 'Closed',
    },
    {
        id: 3, title: 'Kenya Drought', people: 52000, date: '2026-02-14', status: 'Active',
    },
];

function keySelector(operation: Operation) {
    return operation.id;
}

const columns = [
    createLinkColumn<Operation, number>('title', 'Title', (row) => row.title, (row) => `/operations/${row.id}/`, { sortable: true, stretch: true }),
    createNumberColumn<Operation, number>('people', 'People affected', (row) => row.people, { sortable: true, info: 'Estimated by the National Society.' }),
    createDateColumn<Operation, number>('date', 'Start date', (row) => row.date),
    createTagColumn<Operation, number>('status', 'Status', (row) => row.status, (row) => (row.status === 'Active' ? 'positive' : undefined)),
    createActionColumn<Operation, number>('actions', {
        itemsSelector: () => <MenuItem name="export" onClick={fn()}>Export</MenuItem>,
        actionsSelector: (row) => (row.status === 'Active' ? <Button name={row.id} onClick={fn()}>Edit</Button> : undefined),
    }),
];

// NOTE: the generic table, fixed to this story's rows
const OperationTable = Table<Operation, number>;

const meta = {
    title: 'Next/Data/Table',
    component: OperationTable,
    tags: ['autodocs'],
} satisfies Meta<typeof OperationTable>;

export default meta;
type Story = StoryObj<typeof meta>;

function TableExample() {
    const [sorting, setSorting] = useState<Sorting | undefined>({ name: 'people', direction: 'dsc' });
    const [expandedKeys, setExpandedKeys] = useState<number[]>([1]);
    return (
        <Section heading="Operations">
            <Table
                caption="Operations"
                data={operations}
                keySelector={keySelector}
                columns={columns}
                sorting={sorting}
                onSortingChange={setSorting}
                getSubRows={(row) => row.updates}
                expandedKeys={expandedKeys}
                onExpandedKeysChange={setExpandedKeys}
            />
        </Section>
    );
}

export const Default: Story = {
    args: {
        data: operations,
        keySelector,
        columns,
    },
    render: () => <TableExample />,
};

function PagedExample() {
    const listState = useListState<{ title?: string }>({ filter: {}, pageSize: 2 });
    const search = listState.filter.title?.toLowerCase();
    const matches = operations.filter(
        (operation) => !search || operation.title.toLowerCase().includes(search),
    );
    const response = {
        count: matches.length,
        results: matches.slice(listState.offset, listState.offset + listState.limit),
    };

    return (
        <Section
            heading="Operations"
            filters={(
                <TextInput
                    name="title"
                    ariaLabel="Title"
                    placeholder="Search titles"
                    value={listState.rawFilter.title}
                    onChange={listState.setFilterField}
                />
            )}
            list={{ state: listState, response, pending: false }}
        >
            <Table
                caption="Operations"
                data={response.results}
                keySelector={keySelector}
                columns={columns}
            />
        </Section>
    );
}

export const PagedList: Story = {
    args: {
        data: operations,
        keySelector,
        columns,
    },
    render: () => <PagedExample />,
};

export const FilteredEmpty: Story = {
    args: {
        data: [],
        keySelector,
        columns,
        filtered: true,
    },
};
