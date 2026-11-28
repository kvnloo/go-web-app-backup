import {
    BooleanDisplay,
    DataDisplay,
    DataDisplayList,
    DateDisplay,
    DateRangeDisplay,
    Description,
    Heading,
    HtmlDisplay,
    KeyFigure,
    ListView,
    NumberDisplay,
    Text,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

const meta = {
    title: 'Next/Text and values/Text',
    component: Text,
    tags: ['autodocs'],
    args: { children: 'Funding coverage' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
    render: () => (
        <ListView layoutOptions={{ wrap: true }}>
            <Text>Default</Text>
            <Text variant="light">Light</Text>
            <Text variant="strong">Strong</Text>
            <Text variant="brand">Brand</Text>
            <Text status="negative" variant="strong">Negative</Text>
        </ListView>
    ),
};

export const Headings: Story = {
    render: () => (
        <ListView layout="block">
            <Heading variant="display">Display</Heading>
            <Heading>Section heading (h2)</Heading>
            <Heading level={3}>Card heading (h3)</Heading>
            <Heading level={4}>Group heading (h4)</Heading>
            <Description variant="light">A light description under a heading.</Description>
        </ListView>
    ),
};

export const Values: Story = {
    render: () => (
        <ListView layoutOptions={{ wrap: true }}>
            <NumberDisplay value={1234567} format="compact" />
            <NumberDisplay value={64.27} format="percent" />
            <NumberDisplay value={null} />
            <DateDisplay value="2026-11-28" />
            <DateRangeDisplay startDate="2026-01-01" endDate="2026-03-31" />
            <BooleanDisplay value />
            <HtmlDisplay value="<p>Rich <strong>text</strong> with a <a href='mailto:a@b.org'>link</a>.</p>" />
        </ListView>
    ),
};

export const Facts: Story = {
    render: () => (
        <ListView layout="block">
            <DataDisplayList layout="grid" layoutOptions={{ numPreferredColumns: 3 }}>
                <DataDisplay label="Appeal code" value="MDRNP015" />
                <DataDisplay label="Budget" valueType="number" value={250000} info="Requested amount in CHF." />
                <DataDisplay label="End date" valueType="date" value={null} />
            </DataDisplayList>
            <DataDisplay label="Description" valueType="text" value="Floods in the Terai region." layout="block" />
            <KeyFigure value={1240000} format="compact" label="People affected" />
        </ListView>
    ),
};
