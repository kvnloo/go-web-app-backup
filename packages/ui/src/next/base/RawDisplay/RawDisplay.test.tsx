import { renderToStaticMarkup } from 'react-dom/server';
import {
    describe,
    expect,
    test,
} from 'vitest';

import DefaultsContext from '#contexts/defaults';

import RawDisplay from '.';

function render(element: React.ReactElement) {
    return renderToStaticMarkup(element).replace(/ class="[^"]*"/g, '');
}

describe('numbers', () => {
    test('plain numbers carry the raw value and no reading override', () => {
        expect(render(<RawDisplay valueType="number" value={12500} />))
            .toBe('<data value="12500">12,500</data>');
    });
    test('compact numbers give screen readers the full number', () => {
        expect(render(<RawDisplay valueType="number" value={2400000} format="compact" />))
            .toBe('<data value="2400000" role="img" aria-label="2,400,000">2.4M</data>');
    });
    test('percent rounds and adds the sign', () => {
        expect(render(<RawDisplay valueType="number" value={64.27} format="percent" />))
            .toBe('<data value="64.27">64%</data>');
    });
});

describe('dates', () => {
    test('default format with the spelled-out reading', () => {
        expect(render(<RawDisplay valueType="date" value="2026-08-14" />))
            .toBe('<time dateTime="2026-08-14" role="img" aria-label="14 Aug 2026">2026-08-14</time>');
    });
    test('a time in the format is announced and kept in dateTime', () => {
        const html = render(<RawDisplay valueType="date" value="2026-08-14T09:30:00Z" format="yyyy-MM-dd, hh:mm" />);
        expect(html).toContain('dateTime="2026-08-14T09:30:00.000Z"');
        expect(html).toMatch(/aria-label="14 Aug 2026, \d\d:\d\d"/);
    });
});

describe('missing values', () => {
    test('fall back to the context default', () => {
        expect(render(<RawDisplay valueType="number" value={undefined} />))
            .toBe('<data value="">--</data>');
        expect(render(<RawDisplay valueType="text" value="" />)).toBe('<span>--</span>');
    });
    test('follow a context override', () => {
        expect(render(
            <DefaultsContext.Provider value={{ invalidText: 'N/A', messages: {} }}>
                <RawDisplay valueType="date" value={null} />
            </DefaultsContext.Provider>,
        )).toBe('<time>N/A</time>');
    });
});

test('booleans read Yes or No', () => {
    expect(render(<RawDisplay valueType="boolean" value />)).toBe('<data value="true">Yes</data>');
});
