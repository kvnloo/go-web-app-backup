import {
    BarChart,
    Image,
    Legend,
    ListView,
    PieChart,
    TimeSeriesChart,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

interface Country {
    key: string;
    label: string;
    value: number;
}

const countries: Country[] = [
    { key: 'np', label: 'Nepal', value: 1240000 },
    { key: 'bd', label: 'Bangladesh', value: 980000 },
    { key: 'ke', label: 'Kenya', value: 410000 },
];

const months = Array.from({ length: 8 }, (_, index) => new Date(2026, index, 1));

const series = [
    { key: 'appeals', label: 'Appeals', color: 'var(--go-ui-color-primary-red)' },
    { key: 'drefs', label: 'DREFs', color: 'var(--go-ui-color-primary-blue)' },
];

const meta = {
    title: 'Next/Charts/BarChart',
    component: BarChart,
    tags: ['autodocs'],
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        ariaLabel: 'People affected by country',
        data: countries,
        keySelector: (datum) => (datum as Country).key,
        valueSelector: (datum) => (datum as Country).value,
        labelSelector: (datum) => (datum as Country).label,
        format: 'compact',
    },
};

export const Pie: Story = {
    args: Default.args,
    render: () => (
        <PieChart
            ariaLabel="People affected by country"
            data={countries}
            keySelector={(datum) => datum.key}
            valueSelector={(datum) => datum.value}
            labelSelector={(datum) => datum.label}
            colors={['#c02c2c', '#011e41', '#f5a623']}
            withPercentage
        />
    ),
};

export const TimeSeries: Story = {
    args: Default.args,
    render: () => (
        <ListView layout="block">
            <TimeSeriesChart
                ariaLabel="Requested amount over time"
                dataKeys={series.map((item) => item.key)}
                timePoints={months}
                valueSelector={(key, date) => (key === 'appeals' ? date.getMonth() * 130000 : date.getMonth() * 60000)}
                colorSelector={(key) => series.find((item) => item.key === key)?.color ?? 'gray'}
                xAxisFormatter={(date) => date.toLocaleString('en', { month: 'short' })}
            />
            <Legend
                items={series}
                keySelector={(item) => item.key}
                labelSelector={(item) => item.label}
                colorSelector={(item) => item.color}
            />
        </ListView>
    ),
};

export const ImageStory: Story = {
    name: 'Image',
    args: Default.args,
    render: () => (
        <Image src="https://picsum.photos/640/320" alt="A sample photo" caption="A caption" size="md" expandable />
    ),
};
