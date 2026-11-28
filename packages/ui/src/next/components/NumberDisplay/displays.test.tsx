import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import DefaultsContext from '#contexts/defaults';

import DateRangeDisplay from '../DateRangeDisplay';
import HtmlDisplay from '../HtmlDisplay';
import NumberDisplay from '.';

test('missing values show the context default', () => {
    expect(renderToStaticMarkup(<NumberDisplay value={undefined} />)).toContain('--');
    const custom = renderToStaticMarkup(
        <DefaultsContext.Provider value={{ invalidText: 'n/a', messages: {} }}>
            <NumberDisplay value={null} />
        </DefaultsContext.Provider>,
    );
    expect(custom).toContain('n/a');
});

test('a date range with both ends missing collapses to one empty value', () => {
    expect(renderToStaticMarkup(
        <DateRangeDisplay startDate={undefined} endDate={null} />,
    )).toBe('<span>--</span>');
    const halfOpen = renderToStaticMarkup(
        <DateRangeDisplay startDate="2026-01-05" endDate={undefined} />,
    );
    expect(halfOpen).toContain('dateTime="2026-01-05"');
    expect(halfOpen).toContain('--');
});

test('HtmlDisplay keeps mailto and tel links and strips scripts', () => {
    const html = renderToStaticMarkup(
        <HtmlDisplay value='<a href="mailto:a@b.org">mail</a><a href="tel:+41">call</a><script>x()</script><a href="javascript:x()">bad</a>' />,
    );
    expect(html).toContain('href="mailto:a@b.org"');
    expect(html).toContain('href="tel:+41"');
    expect(html).not.toContain('script');
    expect(html).not.toContain('javascript');
});

test('HtmlDisplay renders nothing for a missing value', () => {
    expect(renderToStaticMarkup(<HtmlDisplay value={undefined} />)).toBe('');
});
