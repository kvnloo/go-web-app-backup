import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import DataDisplayList from '../DataDisplayList';
import KeyFigure from '../KeyFigure';
import DataDisplay from '.';

import styles from './styles.module.css';

function forbiddenCombinations() {
    return (
        <>
            <DataDisplay label="People" valueType="number" value={3} format="compact" />
            <DataDisplay label="Start" valueType="date" value="2026-01-01" format="dd MMM yyyy" />
            <DataDisplay label="Note" value={<span>node</span>} />
            {/* @ts-expect-error number presets do not apply to text */}
            <DataDisplay label="Name" valueType="text" value="A" format="compact" />
            {/* @ts-expect-error decision 12 replaced strongLabel with variant */}
            <DataDisplay label="Name" value="A" strongLabel />
            {/* @ts-expect-error a DataDisplay has no dark surface */}
            <DataDisplay label="Name" value="A" surface="dark" />
            {/* @ts-expect-error item arrangement belongs to the list */}
            <DataDisplayList layout="block" layoutOptions={{ numPreferredColumns: 2 }}>x</DataDisplayList>
            {/* @ts-expect-error a key figure is a number */}
            <KeyFigure label="Date" valueType="date" value="2026-01-01" />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('on its own a DataDisplay is a description list with a strong label', () => {
    const html = renderToStaticMarkup(<DataDisplay label="People" valueType="number" value={1200} />);
    expect(html).toMatch(/^<dl [^>]*><dt class="[^"]*strong[^"]*">/);
    expect(html).toContain('<dd');
    expect(html).toContain('value="1200"');
});

test('inside a list it becomes a dt/dd group and takes the list emphasis', () => {
    const html = renderToStaticMarkup(
        <DataDisplayList variant="strong-value">
            <DataDisplay label="People" valueType="number" value={3} />
        </DataDisplayList>,
    );
    expect(html).toMatch(/^<dl [^>]*><div [^>]*><dt/);
    expect(html).toMatch(new RegExp(`<dd class="[^"]*${styles.strong}`));
});

test('missing values show the empty value; block layout drops the colon', () => {
    const inline = renderToStaticMarkup(<DataDisplay label="Budget" valueType="number" value={undefined} />);
    expect(inline).toContain('--');
    expect(inline).toContain(styles.withColon);
    const block = renderToStaticMarkup(<DataDisplay label="Budget" value="x" layout="block" />);
    expect(block).not.toContain(styles.withColon);
});

test('info renders a named info trigger', () => {
    const html = renderToStaticMarkup(<DataDisplay label="Budget" value="x" info="Why" />);
    expect(html).toContain('aria-label="More information"');
});
