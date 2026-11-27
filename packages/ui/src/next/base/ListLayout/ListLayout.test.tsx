import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import ListLayout from '.';

// NOTE: compile-time checks; each @ts-expect-error fails the typecheck if the
// combination ever becomes accepted
function forbiddenCombinations() {
    return (
        <>
            <ListLayout layout="grid" numPreferredColumns={3} minColumnSize="lg" />
            <ListLayout layout="grid" sidebar={{ position: 'start', size: 'sm' }} />
            <ListLayout layout="inline" wrap align="between" alignItems="start" />
            <ListLayout layout="block" align="center" />
            {/* @ts-expect-error grid columns only apply to the grid layout */}
            <ListLayout layout="block" numPreferredColumns={3} />
            {/* @ts-expect-error wrapping only applies to the inline layout */}
            <ListLayout layout="grid" wrap />
            {/* @ts-expect-error a sidebar grid has no preferred column count */}
            <ListLayout layout="grid" sidebar={{}} numPreferredColumns={2} />
            {/* @ts-expect-error column sizes are tokens, not CSS lengths */}
            <ListLayout layout="grid" minColumnSize="20rem" />
            {/* @ts-expect-error space-between is not a block alignment */}
            <ListLayout layout="block" align="between" />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('grid layout renders its items in a grid content element', () => {
    const html = renderToStaticMarkup(
        <ListLayout layout="grid"><span>a</span></ListLayout>,
    );
    expect(html).toMatch(/^<div class="[^"]*"><div class="[^"]*"><span>a<\/span><\/div><\/div>$/);
});

test('block and inline layouts render items directly', () => {
    const html = renderToStaticMarkup(
        <ListLayout layout="block"><span>a</span></ListLayout>,
    );
    expect(html).toMatch(/^<div class="[^"]*"><span>a<\/span><\/div>$/);
});
