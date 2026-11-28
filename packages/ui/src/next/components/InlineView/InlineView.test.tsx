import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import inlineLayoutStyles from '#next/base/InlineLayout/styles.module.css';

import InlineView from '.';

function forbiddenCombinations() {
    return (
        <>
            <InlineView before="i" after="a" wrapBreakpoint="lg" alignItems="start">c</InlineView>
            {/* @ts-expect-error padding belongs to the surface around the row */}
            <InlineView withPadding />
            {/* @ts-expect-error alignment uses the same values as ListView */}
            <InlineView alignItems="end" />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('wraps below md by default', () => {
    const html = renderToStaticMarkup(<InlineView after="a">c</InlineView>);
    expect(html).toContain(inlineLayoutStyles.withMdWrapBreakpoint);
});

test('none keeps a single row without the container wrapper', () => {
    const html = renderToStaticMarkup(
        <InlineView wrapBreakpoint="none" after="a">c</InlineView>,
    );
    expect(html).not.toContain(inlineLayoutStyles.wrapContainer);
});
