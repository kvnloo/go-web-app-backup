import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import Heading from '../Heading';
import Dialog from '.';

function noop() {}

function forbiddenCombinations() {
    return (
        <>
            <Dialog heading="Details" onClose={noop}>c</Dialog>
            <Dialog ariaLabel="Map preview">c</Dialog>
            {/* @ts-expect-error a dialog needs a name */}
            <Dialog>c</Dialog>
            {/* @ts-expect-error a heading already names the dialog */}
            <Dialog heading="Details" ariaLabel="Details">c</Dialog>
            {/* @ts-expect-error the overlay is decided by the states */}
            <Dialog heading="Details" overlayPending>c</Dialog>
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('the dialog is named by its h2 heading and nests headings below it', () => {
    const html = renderToStaticMarkup(
        <Dialog heading="Details" onClose={noop}>
            <Heading>Part</Heading>
        </Dialog>,
    );
    const headingId = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(headingId).toBeTruthy();
    expect(html).toContain(`<h2 id="${headingId}"`);
    expect(html).toMatch(/<h3[^>]*>Part<\/h3>/);
    expect(html).toContain('aria-label="Close"');
});

test('without onClose there is no close button', () => {
    expect(renderToStaticMarkup(<Dialog heading="Blocking">c</Dialog>))
        .not.toContain('aria-label="Close"');
});

test('pending over content keeps it, inert', () => {
    const html = renderToStaticMarkup(<Dialog heading="List" pending>items</Dialog>);
    expect(html).toContain('inert');
    expect(html).toContain('items');
    expect(renderToStaticMarkup(<Dialog heading="List" pending empty>items</Dialog>))
        .not.toContain('items');
});
