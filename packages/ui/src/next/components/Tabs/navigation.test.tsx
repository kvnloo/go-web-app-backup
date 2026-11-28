import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import Breadcrumbs from '../Breadcrumbs';
import Link from '../Link';
import NavigationTab from '../NavigationTab';
import NavigationTabList from '../NavigationTabList';
import Tab from '../Tab';
import TabList from '../TabList';
import TabPanel from '../TabPanel';
import Tabs from '.';

function noop() {}

function forbiddenCombinations() {
    return (
        <>
            {/* @ts-expect-error the nav look belongs to NavigationTabList */}
            <Tabs value="a" onChange={noop} variant="nav"><span /></Tabs>
            {/* @ts-expect-error a navigation landmark needs a name */}
            <NavigationTabList><span /></NavigationTabList>
            {/* @ts-expect-error decision 28 replaced the v2 style axis */}
            <Tabs value="a" onChange={noop} styleVariant="pill"><span /></Tabs>
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('the active tab controls its labelled panel; others are skipped by Tab', () => {
    const html = renderToStaticMarkup(
        <Tabs value="b" onChange={noop}>
            <TabList>
                <Tab name="a">Overview</Tab>
                <Tab name="b">Details</Tab>
            </TabList>
            <TabPanel name="a">first</TabPanel>
            <TabPanel name="b">second</TabPanel>
        </Tabs>,
    );
    expect(html).toContain('role="tablist"');
    const active = html.match(/<button[^>]*aria-selected="true"[^>]*>/)?.[0] ?? '';
    const tabId = active.match(/id="([^"]+)"/)?.[1];
    const panelId = active.match(/aria-controls="([^"]+)"/)?.[1];
    expect(active).toContain('tabindex="0"');
    expect(html).toMatch(/<button[^>]*aria-selected="false"[^>]*tabindex="-1"/);
    expect(html).toContain(`id="${panelId}" role="tabpanel" aria-labelledby="${tabId}"`);
    expect(html).not.toContain('first');
});

test('navigation tabs are links; the current page is marked', () => {
    const html = renderToStaticMarkup(
        <NavigationTabList ariaLabel="Emergency sections">
            <NavigationTab href="/e/1/details/" active>Details</NavigationTab>
            <NavigationTab href="/e/1/reports/">Reports</NavigationTab>
        </NavigationTabList>,
    );
    expect(html).toContain('<nav aria-label="Emergency sections">');
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/e\/1\/details\/"/);
    expect(html.match(/aria-current/g)).toHaveLength(1);
});

test('breadcrumbs are a labelled list ending at the current page', () => {
    const html = renderToStaticMarkup(
        <Breadcrumbs>
            <Link href="/">Home</Link>
            <Link href="/emergencies/">Emergencies</Link>
            Nepal Floods
        </Breadcrumbs>,
    );
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('<ol');
    expect(html).toMatch(/<li[^>]*aria-current="page"[^>]*>Nepal Floods<\/li>/);
});
