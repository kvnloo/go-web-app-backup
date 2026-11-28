import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import BlockLoading from '../BlockLoading';
import KeyFigureCard from '../KeyFigureCard';
import ProgressBar from '../ProgressBar';
import StackedProgressBar from '../StackedProgressBar';
import TopBanner from '../TopBanner';
import Alert from '.';

function noop() {}

function forbiddenCombinations() {
    return (
        <>
            <Alert name="a" status="positive" heading="Saved" onClose={noop} />
            <Alert name="a" heading="Read only" withoutCloseButton />
            {/* @ts-expect-error a closable alert needs its close handler */}
            <Alert name="a" heading="Saved" />
            {/* @ts-expect-error decision 3 replaced the v2 names */}
            <Alert name="a" status="success" heading="Saved" onClose={noop} />
            {/* @ts-expect-error a status colour and a data colour exclude each other */}
            <ProgressBar value={1} totalValue={2} status="positive" color="red" />
            {/* @ts-expect-error the brand strip has no status */}
            <TopBanner variant="brand" status="warning">Notice</TopBanner>
            {/* @ts-expect-error progress fields come together */}
            <KeyFigureCard label="Funding" value={1} progressTitle="Coverage" />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('an alert is an alert region with a named close button', () => {
    const html = renderToStaticMarkup(
        <Alert name="a" status="negative" heading="Failed" debugMessage="trace" onClose={noop} />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('Copy error details');
});

test('the progress bar gives screen readers a named meter', () => {
    const html = renderToStaticMarkup(
        <ProgressBar heading="Funding coverage" value={30} totalValue={60} withPercentage />,
    );
    const id = html.match(/<span id="([^"]+)">Funding coverage/)?.[1];
    expect(html).toMatch(new RegExp(`<meter[^>]*aria-labelledby="${id}"`));
    expect(html).toContain('50%');
});

test('a stacked bar with nothing to show does not stack its labels', () => {
    const html = renderToStaticMarkup(
        <StackedProgressBar
            data={[1, 2]}
            valueSelector={() => 0}
            labelSelector={(_, index) => `Part ${index}`}
            colorSelector={() => 'red'}
        />,
    );
    expect(html).not.toContain('width:0%');
    expect(html).toContain('Part 1');
});

test('block loading has one status region', () => {
    const html = renderToStaticMarkup(<BlockLoading message="Loading reports" />);
    expect(html.match(/role="status"/g)).toHaveLength(1);
});
