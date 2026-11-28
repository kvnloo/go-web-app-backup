import { useState } from 'react';
import {
    Breadcrumbs,
    Link,
    ListView,
    NavigationTab,
    NavigationTabList,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    Text,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

const meta = {
    title: 'Next/Navigation/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    args: {
        value: 'details',
        onChange: fn(),
        children: null,
    },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function TabsExample() {
    const [tab, setTab] = useState('details');
    return (
        <Tabs value={tab} onChange={setTab}>
            <TabList>
                <Tab name="details">Details</Tab>
                <Tab name="map">Map</Tab>
                <Tab name="documents" errored>Documents</Tab>
            </TabList>
            <TabPanel name="details"><Text>Details panel</Text></TabPanel>
            <TabPanel name="map"><Text>Map panel</Text></TabPanel>
            <TabPanel name="documents"><Text>Documents panel</Text></TabPanel>
        </Tabs>
    );
}

export const Default: Story = { render: () => <TabsExample /> };

function StepsExample() {
    const [step, setStep] = useState('two');
    return (
        <Tabs value={step} onChange={setStep} variant="step">
            <TabList>
                <Tab name="one" step={1}>Overview</Tab>
                <Tab name="two" step={2}>Operation</Tab>
                <Tab name="three" step={3}>Submission</Tab>
            </TabList>
        </Tabs>
    );
}

export const Steps: Story = { render: () => <StepsExample /> };

export const PageNavigation: Story = {
    render: () => (
        <ListView layout="block">
            <Breadcrumbs>
                <Link href="/">Home</Link>
                <Link href="/emergencies/">Emergencies</Link>
                Nepal Floods
            </Breadcrumbs>
            <NavigationTabList ariaLabel="Emergency sections">
                <NavigationTab href="/details/" active>Details</NavigationTab>
                <NavigationTab href="/reports/">Reports</NavigationTab>
            </NavigationTabList>
        </ListView>
    ),
};
