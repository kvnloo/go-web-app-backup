import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import FileInputButton from '../FileInputButton';
import FormSection from '../FormSection';
import RemovableItem from '../RemovableItem';
import RepeatableList from '.';

function noop() {}

function setFile(file: File | undefined, name: string) {
    return [file, name];
}

function forbiddenCombinations() {
    return (
        <>
            <FileInputButton name="f" onChange={setFile}>Upload</FileInputButton>
            {/* @ts-expect-error several files arrive as an array */}
            <FileInputButton name="f" multiple onChange={setFile}>Upload</FileInputButton>
            {/* @ts-expect-error the remove button needs a label */}
            <RemovableItem name="a" onRemove={noop}>row</RemovableItem>
            {/* @ts-expect-error the add button needs a label */}
            <RepeatableList onAdd={noop} />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('rows get a specific remove name; an empty list shows its message', () => {
    const html = renderToStaticMarkup(
        <RepeatableList addLabel="Add source" onAdd={noop}>
            <RemovableItem name="a" onRemove={noop} removeLabel="Remove source" removeAriaLabel="Remove source 1">
                row
            </RemovableItem>
        </RepeatableList>,
    );
    expect(html).toContain('aria-label="Remove source 1"');
    expect(html).toContain('Add source');

    const empty = renderToStaticMarkup(
        <RepeatableList addLabel="Add source" onAdd={noop} messages={{ empty: 'No sources yet' }} />,
    );
    expect(empty).toContain('No sources yet');
});

test('a read-only form hides the add and remove buttons', () => {
    const html = renderToStaticMarkup(
        <FormSection readOnly>
            <RepeatableList addLabel="Add source" onAdd={noop}>
                <RemovableItem name="a" onRemove={noop} removeLabel="Remove source">row</RemovableItem>
            </RepeatableList>
        </FormSection>,
    );
    expect(html).not.toContain('Add source');
    expect(html).not.toContain('Remove source');
});
