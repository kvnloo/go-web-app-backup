import {
    Button,
    InlineView,
    ListView,
    Tag,
    Text,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

const meta = {
    title: 'Next/Layout/ListView',
    component: ListView,
    tags: ['autodocs'],
} satisfies Meta<typeof ListView>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = ['Floods', 'Cyclone', 'Drought', 'Epidemic', 'Earthquake', 'Wildfire'];

export const Inline: Story = {
    args: {
        layoutOptions: { wrap: true },
        children: items.map((item) => <Tag key={item} label={item} />),
    },
};

export const Block: Story = {
    args: {
        layout: 'block',
        children: items.map((item) => <Text key={item}>{item}</Text>),
    },
};

export const Grid: Story = {
    args: {
        layout: 'grid',
        layoutOptions: { numPreferredColumns: 3 },
        children: items.map((item) => <Text key={item}>{item}</Text>),
    },
};

export const RowWithActions: Story = {
    args: {},
    render: () => (
        <InlineView
            before={<Tag label="Draft" />}
            after={<Button name="edit" onClick={fn()}>Edit</Button>}
        >
            <Text variant="strong">Nepal Floods 2026</Text>
        </InlineView>
    ),
};
