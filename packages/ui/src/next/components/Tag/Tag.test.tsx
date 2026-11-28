import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import chipStyles from '#next/base/ChipLayout/styles.module.css';

import Tag from '.';

function forbiddenCombinations() {
    return (
        <>
            <Tag label="Active" status="positive" variant="primary" />
            {/* @ts-expect-error tones belong to the building block */}
            <Tag label="Active" tone="neutral" />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('status sets the tone and the variant sets the fill', () => {
    const html = renderToStaticMarkup(<Tag label="Late" status="warning" variant="secondary" />);
    expect(html).toContain(chipStyles.toneWarning);
    expect(html).toContain(chipStyles.withBorder);
});
