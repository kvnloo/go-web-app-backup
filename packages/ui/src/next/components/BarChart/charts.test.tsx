import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import Iframe from '../Iframe';
import Image from '../Image';
import PieChart from '../PieChart';
import TimeSeriesChart from '../TimeSeriesChart';
import BarChart from '.';

interface Row {
    id: string;
    value: number;
}

const rows: Row[] = [
    { id: 'a', value: 10 },
    { id: 'b', value: 30 },
    { id: 'c', value: 20 },
];

function idSelector(row: Row) {
    return row.id;
}

function valueSelector(row: Row) {
    return row.value;
}

/* eslint-disable max-len */
function forbiddenCombinations() {
    return (
        <>
            {/* @ts-expect-error a chart needs a name (decision 28) */}
            <BarChart data={rows} keySelector={idSelector} valueSelector={valueSelector} labelSelector={idSelector} />
            {/* @ts-expect-error a palette and a colour selector exclude each other */}
            <PieChart ariaLabel="Share" data={rows} keySelector={idSelector} valueSelector={valueSelector} labelSelector={idSelector} colors={['red']} colorSelector={() => 'red'} />
            {/* @ts-expect-error series colours come from a colour selector, not class names */}
            <TimeSeriesChart ariaLabel="Trend" dataKeys={['a']} timePoints={[]} valueSelector={() => 1} classNameSelector={() => 'x'} xAxisFormatter={String} />
            {/* @ts-expect-error an image needs alternative text */}
            <Image src="/a.png" />
            {/* @ts-expect-error an embedded page needs a title */}
            <Iframe src="https://example.org" />
        </>
    );
}

/* eslint-enable max-len */

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('bars are sorted, capped and named', () => {
    const html = renderToStaticMarkup(
        <BarChart
            ariaLabel="Top values"
            data={rows}
            keySelector={idSelector}
            valueSelector={valueSelector}
            labelSelector={idSelector}
            maxRows={2}
        />,
    );
    expect(html).toContain('role="group" aria-label="Top values"');
    expect(html.indexOf('>b<')).toBeLessThan(html.indexOf('>c<'));
    expect(html).not.toContain('>a<');
});

test('the pie is a named image with a text legend', () => {
    const html = renderToStaticMarkup(
        <PieChart
            ariaLabel="Share"
            data={rows}
            keySelector={idSelector}
            valueSelector={valueSelector}
            labelSelector={idSelector}
            colors={['red', 'blue']}
            withPercentage
        />,
    );
    expect(html).toContain('role="img" aria-label="Share"');
    expect(html).toContain('(50%)');
});

test('images load lazily; embeds are lazy and titled', () => {
    expect(renderToStaticMarkup(<Image src="/a.png" alt="A map" />)).toContain('loading="lazy"');
    expect(renderToStaticMarkup(<Iframe src="https://example.org" title="Dashboard" />))
        .toContain('title="Dashboard"');
});
