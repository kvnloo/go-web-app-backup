import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import specs from '#utils/specs.module.css';

import Description from '../Description';
import Text from '.';

function forbiddenCombinations() {
    return (
        <>
            <Text variant="brand" status="negative" textSize="sm">t</Text>
            {/* @ts-expect-error colours are set by variant or status */}
            <Text textColor="light">t</Text>
            {/* @ts-expect-error decision 12 replaced withLightText */}
            <Description withLightText>t</Description>
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('variants map onto colour and weight specs', () => {
    expect(renderToStaticMarkup(<Text variant="light">t</Text>)).toContain(specs.textColorLight);
    const brand = renderToStaticMarkup(<Text variant="brand">t</Text>);
    expect(brand).toContain(specs.textColorBrand);
    expect(brand).toContain(specs.fontWeightMedium);
});

test('status replaces the colour but keeps the weight', () => {
    const html = renderToStaticMarkup(<Text variant="strong" status="negative">t</Text>);
    expect(html).toContain(specs.textColorNegative);
    expect(html).toContain(specs.fontWeightSemibold);
});

test('Description renders a block and nothing when empty', () => {
    expect(renderToStaticMarkup(<Description>d</Description>)).toMatch(/^<div /);
    expect(renderToStaticMarkup(<Description />)).toBe('');
});
