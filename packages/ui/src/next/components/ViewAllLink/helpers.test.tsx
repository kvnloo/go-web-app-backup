import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import LastUpdated from '../LastUpdated';
import Page from '../Page';
import SourceDisplay from '../SourceDisplay';
import ViewAllLink from '.';

function forbiddenCombinations() {
    return (
        <>
            {/* @ts-expect-error the back link has one look; it takes an href and a label */}
            <Page backLink={<span>Back</span>} />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('view all is an underlined link with the chevron', () => {
    const html = renderToStaticMarkup(<ViewAllLink href="/reports/">View All Reports</ViewAllLink>);
    expect(html).toContain('href="/reports/"');
    expect(html).toContain('<svg');
});

test('sources and the update date carry their labels', () => {
    expect(renderToStaticMarkup(
        <SourceDisplay sources={[{ label: 'ReliefWeb', href: 'https://reliefweb.int' }]} />,
    )).toContain('Source');
    expect(renderToStaticMarkup(<LastUpdated date="2026-11-28" />)).toContain('Last updated');
});

test('the page back link has the back arrow', () => {
    const html = renderToStaticMarkup(
        <Page heading="Report" backLink={{ href: '/reports/', label: 'All reports' }} />,
    );
    expect(html).toContain('href="/reports/"');
    expect(html).toContain('All reports');
});
