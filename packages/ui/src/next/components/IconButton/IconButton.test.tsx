import { renderToStaticMarkup } from 'react-dom/server';
import { DeleteBinLineIcon } from '@ifrc-go/icons';
import {
    expect,
    test,
} from 'vitest';

import IconButton from '.';

function forbiddenCombinations() {
    return (
        <>
            <IconButton name="a" label="Remove source" ariaLabel="Remove source 2">
                <DeleteBinLineIcon />
            </IconButton>
            {/* @ts-expect-error an icon button needs a label */}
            <IconButton name="a"><DeleteBinLineIcon /></IconButton>
            {/* @ts-expect-error looks are curated variants */}
            <IconButton name="a" label="Remove" styleVariant="action"><DeleteBinLineIcon /></IconButton>
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('the label is the accessible name unless ariaLabel is set', () => {
    expect(renderToStaticMarkup(
        <IconButton name="a" label="Remove"><DeleteBinLineIcon /></IconButton>,
    )).toContain('aria-label="Remove"');
    expect(renderToStaticMarkup(
        <IconButton name="a" label="Remove" ariaLabel="Remove source 2">
            <DeleteBinLineIcon />
        </IconButton>,
    )).toContain('aria-label="Remove source 2"');
});
