import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import HeadingLevelContext from '#contexts/heading-level';

import Heading from '.';

import styles from './styles.module.css';

function forbiddenCombinations() {
    return (
        <>
            <Heading variant="card" level={4}>Heading</Heading>
            {/* @ts-expect-error looks are curated variants, not sizes */}
            <Heading textSize="lg">Heading</Heading>
            {/* @ts-expect-error the level is a heading level */}
            <Heading level={7}>Heading</Heading>
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('the level is one below the nearest heading above', () => {
    expect(renderToStaticMarkup(<Heading>Top</Heading>)).toMatch(/^<h2 /);
    const nested = renderToStaticMarkup(
        <HeadingLevelContext.Provider value={{ level: 3 }}>
            <Heading>Nested</Heading>
        </HeadingLevelContext.Provider>,
    );
    expect(nested).toMatch(/^<h4 /);
});

test('the look follows the level unless a variant is set', () => {
    expect(renderToStaticMarkup(<Heading>Top</Heading>)).toContain(styles.section);
    const forced = renderToStaticMarkup(<Heading level={2} variant="group">Top</Heading>);
    expect(forced).toMatch(/^<h2 /);
    expect(forced).toContain(styles.group);
});

test('renders nothing without children', () => {
    expect(renderToStaticMarkup(<Heading />)).toBe('');
});
