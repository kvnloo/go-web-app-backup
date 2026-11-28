import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import LayoutDefaultsContext from '#contexts/layout-defaults';
import specs from '#utils/specs.module.css';

import ListView from '.';

function forbiddenCombinations() {
    return (
        <>
            <ListView layoutOptions={{ wrap: true, align: 'between' }} />
            <ListView layout="block" layoutOptions={{ align: 'center' }} />
            <ListView layout="grid" layoutOptions={{ numPreferredColumns: 3, minColumnSize: 'md' }} />
            <ListView layout="grid" layoutOptions={{ sidebar: { position: 'end' } }} />
            {/* @ts-expect-error column options only apply to the grid layout */}
            <ListView layout="block" layoutOptions={{ numPreferredColumns: 3 }} />
            {/* @ts-expect-error wrapping only applies to the inline layout */}
            <ListView layout="grid" layoutOptions={{ wrap: true }} />
            {/* @ts-expect-error a list has no surface; use a Card */}
            <ListView withPadding />
            {/* @ts-expect-error a list has no surface; use a Card */}
            <ListView backgroundColor="background" />
            {/* @ts-expect-error options are grouped in layoutOptions */}
            <ListView layout="grid" numPreferredColumns={2} />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('spacing comes from the layout-defaults context unless set', () => {
    const fromContext = renderToStaticMarkup(
        <LayoutDefaultsContext.Provider value={{ spacing: 'xl', spacingOffset: 0, textSizeOffset: 0 }}>
            <ListView layout="block">a</ListView>
        </LayoutDefaultsContext.Provider>,
    );
    expect(fromContext).toContain(specs.spacingXl);

    const fromProps = renderToStaticMarkup(
        <LayoutDefaultsContext.Provider value={{ spacing: 'xl', spacingOffset: 0, textSizeOffset: 0 }}>
            <ListView layout="block" spacing="sm">a</ListView>
        </LayoutDefaultsContext.Provider>,
    );
    expect(fromProps).toContain(specs.spacingSm);
});

test('grid options reach the grid', () => {
    const html = renderToStaticMarkup(
        <ListView layout="grid" layoutOptions={{ sidebar: { size: 'sm' } }}>a</ListView>,
    );
    expect(html).toMatch(/^<div class="[^"]*"><div class="[^"]*">a<\/div><\/div>$/);
});
