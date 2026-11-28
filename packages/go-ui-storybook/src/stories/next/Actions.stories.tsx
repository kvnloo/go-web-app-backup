import {
    AddLineIcon,
    DeleteBinLineIcon,
    MoreFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Dropdown,
    IconButton,
    Link,
    ListView,
    Menu,
    MenuItem,
    MoreInfo,
    Pagination,
    Tag,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

const meta = {
    title: 'Next/Actions/Button',
    component: Button,
    tags: ['autodocs'],
    args: {
        name: 'button',
        onClick: fn(),
        children: 'Save',
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
    render: () => (
        <ListView>
            <Button name="p" variant="primary" before={<AddLineIcon />} onClick={fn()}>Primary</Button>
            <Button name="s" onClick={fn()}>Secondary</Button>
            <Button name="t" variant="tertiary" onClick={fn()}>Tertiary</Button>
            <Button name="d" onConfirm={fn()} confirmMessage="The report will be deleted.">Delete</Button>
            <IconButton name="i" label="Remove" onClick={fn()}><DeleteBinLineIcon /></IconButton>
        </ListView>
    ),
};

export const Links: Story = {
    render: () => (
        <ListView>
            <Link href="/emergencies/">Internal</Link>
            <Link href="/emergencies/" variant="underline" withLinkIcon>View All Emergencies</Link>
            <Link href="https://ifrc.org">External</Link>
            <Link href="https://ifrc.org" variant="secondary">Open dashboard</Link>
        </ListView>
    ),
};

export const Tags: Story = {
    render: () => (
        <ListView>
            <Tag label="Draft" />
            <Tag label="Approved" status="positive" />
            <Tag label="Late" status="warning" variant="secondary" />
            <Tag label="Exceeded" variant="primary" />
        </ListView>
    ),
};

export const MenusAndPopups: Story = {
    render: () => (
        <ListView>
            <Menu label="Actions">
                <MenuItem href="/reports/">View report</MenuItem>
                <MenuItem name="export" onClick={fn()}>Export</MenuItem>
                <MenuItem name="delete" onConfirm={fn()} confirmMessage="Delete the report?">Delete</MenuItem>
            </Menu>
            <Menu icon={<MoreFillIcon />} ariaLabel="More actions">
                <MenuItem name="export" onClick={fn()}>Export</MenuItem>
            </Menu>
            <Dropdown label="Share">Share options go here.</Dropdown>
            <MoreInfo heading="About the data">Figures come from the latest field report.</MoreInfo>
        </ListView>
    ),
};

export const Paging: Story = {
    render: () => (
        <Pagination activePage={4} numItems={200} numItemsPerPage={10} onActivePageChange={fn()} />
    ),
};
