import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import FormStateContext from '#contexts/form-state';

import ConfirmDialog from '../ConfirmDialog';
import Button from '.';

function noop() {}

function forbiddenCombinations() {
    return (
        <>
            <Button name="a" onClick={noop}>Save</Button>
            <Button name="a" onConfirm={noop} confirmMessage="Delete it?">Delete</Button>
            {/* @ts-expect-error a click handler and a confirmation exclude each other */}
            <Button name="a" onClick={noop} onConfirm={noop} confirmMessage="?">Delete</Button>
            {/* @ts-expect-error a confirmation needs its message */}
            <Button name="a" onConfirm={noop}>Delete</Button>
            {/* @ts-expect-error a message without onConfirm does nothing */}
            <Button name="a" confirmMessage="?">Delete</Button>
            {/* @ts-expect-error looks are curated variants */}
            <Button name="a" variant="subtle">Save</Button>
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('a submit button follows the form state; other buttons do not', () => {
    const readOnly = { disabled: false, readOnly: true, inputVariant: undefined };
    expect(renderToStaticMarkup(
        <FormStateContext.Provider value={readOnly}>
            <Button name="a" type="submit">Submit</Button>
        </FormStateContext.Provider>,
    )).toContain('disabled=""');
    expect(renderToStaticMarkup(
        <FormStateContext.Provider value={readOnly}>
            <Button name="a">Export</Button>
        </FormStateContext.Provider>,
    )).not.toContain('disabled=""');
});

test('the confirmation dialog labels its actions', () => {
    const html = renderToStaticMarkup(
        <ConfirmDialog
            name="a"
            heading="Delete the report?"
            message="This cannot be undone."
            confirmLabel="Delete"
            onConfirm={noop}
            onCancel={noop}
        />,
    );
    expect(html).toContain('<dialog');
    expect(html).toMatch(/<h2[^>]*>Delete the report\?<\/h2>/);
    expect(html).toContain('>Delete<');
    expect(html).toContain('>Cancel<');
});
