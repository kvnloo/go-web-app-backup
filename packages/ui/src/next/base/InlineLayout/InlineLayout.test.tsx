import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import InlineLayout from '.';

test('a fixed row renders without a wrapper', () => {
    const html = renderToStaticMarkup(<InlineLayout id="row" after="x">content</InlineLayout>);
    expect(html.startsWith('<div id="row"')).toBe(true);
    expect((html.match(/<div/g) ?? []).length).toBe(3);
});

test('an adaptive row adds a container wrapper that takes the root props', () => {
    const html = renderToStaticMarkup(
        <InlineLayout id="row" wrapBreakpoint="md" after="x">content</InlineLayout>,
    );
    expect(html.startsWith('<div id="row"')).toBe(true);
    expect((html.match(/<div/g) ?? []).length).toBe(4);
});
