import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import SearchSelectInput from '../SearchSelectInput';
import SelectInput from '.';

interface Country {
    iso: string;
    name: string;
}

const countries: Country[] = [
    { iso: 'np', name: 'Nepal' },
    { iso: 'bd', name: 'Bangladesh' },
];

function keySelector(option: Country) {
    return option.iso;
}

function labelSelector(option: Country) {
    return option.name;
}

function noop() {}

function setOne(value: string, name: string) {
    return [value, name];
}

function setMany(value: string[], name: string) {
    return [value, name];
}

/* eslint-disable react/jsx-props-no-spreading */
function forbiddenCombinations() {
    const common = {
        name: 'country', label: 'Country', options: countries, keySelector, labelSelector,
    } as const;
    return (
        <>
            <SelectInput {...common} value="np" onChange={noop} />
            <SelectInput {...common} value="np" withoutClearButton onChange={setOne} />
            <SelectInput {...common} multiple value={['np']} onChange={setMany} withSelectAllButton />
            {/* @ts-expect-error a clearable select can report undefined */}
            <SelectInput {...common} value="np" onChange={setOne} />
            {/* @ts-expect-error multiple holds an array */}
            <SelectInput {...common} multiple value="np" onChange={setMany} />
            {/* @ts-expect-error a multiple select reports an array */}
            <SelectInput {...common} multiple value={['np']} onChange={setOne} />
            {/* @ts-expect-error select all needs multiple */}
            <SelectInput {...common} value="np" onChange={noop} withSelectAllButton />
            {/* @ts-expect-error the previous value follows multiple */}
            <SelectInput {...common} multiple value={['np']} onChange={setMany} withDiffView prevValue="np" />
            {/* @ts-expect-error decision 26 merged MultiSelectInput into multiple */}
            <SelectInput {...common} value="np" onChange={noop} nonClearable />
            {/* @ts-expect-error a remote select needs its search handler */}
            <SearchSelectInput {...common} searchOptions={countries} value="np" onChange={noop} />
        </>
    );
}
/* eslint-enable react/jsx-props-no-spreading */

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('a select is a combobox showing the chosen label', () => {
    const html = renderToStaticMarkup(
        <SelectInput
            name="country"
            label="Country"
            options={countries}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value="np"
            onChange={noop}
        />,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('value="Nepal"');
    expect(html).toContain('aria-expanded="false"');
});

test('several values are listed together; an unlabelled select is named', () => {
    const html = renderToStaticMarkup(
        <SelectInput
            name="countries"
            ariaLabel="Countries"
            options={countries}
            keySelector={keySelector}
            labelSelector={labelSelector}
            multiple
            value={['np', 'bd']}
            onChange={noop}
        />,
    );
    expect(html).toContain('value="Nepal, Bangladesh"');
    expect(html).toMatch(/role="combobox"[^>]*aria-label="Countries"|aria-label="Countries"[^>]*role="combobox"/);
});

test('a remote select labels its value from the kept options', () => {
    const html = renderToStaticMarkup(
        <SearchSelectInput
            name="country"
            label="Country"
            options={countries}
            searchOptions={undefined}
            onSearchValueChange={noop}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value="bd"
            onChange={noop}
        />,
    );
    expect(html).toContain('value="Bangladesh"');
});
