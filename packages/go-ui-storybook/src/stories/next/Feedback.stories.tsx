import { AnalysisIcon } from '@ifrc-go/icons';
import {
    Alert,
    BlockLoading,
    Button,
    ListView,
    Message,
    ProgressBar,
    StackedProgressBar,
    TopBanner,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

const meta = {
    title: 'Next/Feedback/Alert',
    component: Alert,
    tags: ['autodocs'],
    args: {
        name: 'alert',
        heading: 'Report saved',
        description: 'It is now visible to your National Society.',
        onClose: fn(),
    },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {};

export const Toasts: Story = {
    render: () => (
        <ListView layout="block">
            <Alert name="a" variant="toast" status="positive" heading="Report saved" onClose={fn()} />
            <Alert name="b" variant="toast" status="negative" heading="Upload failed" debugMessage="500" onClose={fn()} />
        </ListView>
    ),
};

export const Banners: Story = {
    render: () => (
        <ListView layout="block">
            <TopBanner variant="brand">GO will be read-only on Saturday for maintenance.</TopBanner>
            <TopBanner status="warning">You are viewing an older version.</TopBanner>
        </ListView>
    ),
};

export const Messages: Story = {
    render: () => (
        <ListView layout="block">
            <Message heading="No field reports yet" description="Reports appear here once submitted." icon={<AnalysisIcon />} actions={<Button name="c" onClick={fn()}>Create report</Button>} />
            <BlockLoading message="Loading the map" />
        </ListView>
    ),
};

export const Progress: Story = {
    render: () => (
        <ListView layout="block">
            <ProgressBar heading="Funding coverage" value={30} totalValue={45} withPercentage />
            <StackedProgressBar
                data={[{ label: 'Health', value: 400, color: '#c02c2c' }, { label: 'Shelter', value: 250, color: '#011e41' }]}
                valueSelector={(datum) => datum.value}
                labelSelector={(datum) => datum.label}
                colorSelector={(datum) => datum.color}
            />
        </ListView>
    ),
};
