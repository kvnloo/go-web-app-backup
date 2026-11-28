import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import inputContainerStyles from '#next/base/InputContainer/styles.module.css';

import DateInput from '../DateInput';
import FormSection from '../FormSection';
import NumberInput from '../NumberInput';
import PasswordInput from '../PasswordInput';
import Section from '../Section';
import TextArea from '../TextArea';
import TextInput from '.';

function noop() {}

function forbiddenCombinations() {
    return (
        <>
            <TextInput name="a" label="Title" value="" onChange={noop} />
            <TextInput name="a" ariaLabel="Title" value="" onChange={noop} />
            <TextInput name="a" label="Title" value="" onChange={noop} withDiffView prevValue={undefined} />
            {/* @ts-expect-error an input needs a name for assistive technology */}
            <TextInput name="a" value="" onChange={noop} />
            {/* @ts-expect-error a visible label already names the input */}
            <TextInput name="a" label="Title" ariaLabel="Title" value="" onChange={noop} />
            {/* @ts-expect-error the diff view needs the previous value */}
            <TextInput name="a" label="Title" value="" onChange={noop} withDiffView />
            {/* @ts-expect-error a previous value alone shows nothing */}
            <TextInput name="a" label="Title" value="" onChange={noop} prevValue="old" />
            {/* @ts-expect-error decision 25 folded withAsterisk into required */}
            <TextInput name="a" label="Title" value="" onChange={noop} withAsterisk />
            {/* @ts-expect-error one limit at a time */}
            <TextArea name="a" label="Notes" value="" onChange={noop} maxLength={10} maxWords={5} />
            {/* @ts-expect-error a number input holds numbers */}
            <NumberInput name="a" label="People" value="3" onChange={noop} />
            {/* @ts-expect-error autocomplete is limited to password tokens */}
            <PasswordInput name="a" label="Password" value="" onChange={noop} autoComplete="email" />
            {/* @ts-expect-error the date picker holds ISO strings */}
            <DateInput name="a" label="Start" value={new Date()} onChange={noop} />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('the label names the control and the hint describes it', () => {
    const html = renderToStaticMarkup(
        <TextInput name="title" label="Title" hint="Short" value="" onChange={noop} required />,
    );
    const id = html.match(/<input[^>]* id="([^"]+)"/)?.[1];
    expect(html).toContain(`for="${id}"`);
    expect(html).toContain(`aria-describedby="${id}-hint"`);
    expect(html).toContain('aria-required="true"');
    expect(html).not.toMatch(/<input[^>]* required=""/i);
});

test('an error replaces the hint in the description', () => {
    const html = renderToStaticMarkup(
        <TextInput name="title" label="Title" hint="Short" error="Too long" value="" onChange={noop} />,
    );
    const id = html.match(/<input[^>]* id="([^"]+)"/)?.[1];
    expect(html).toContain(`aria-describedby="${id}-error"`);
    expect(html).toContain('aria-invalid="true"');
});

test('state and look come from the surroundings unless set', () => {
    const inForm = renderToStaticMarkup(
        <FormSection readOnly>
            <TextInput name="a" label="A" value="" onChange={noop} />
            <TextInput name="b" label="B" value="" onChange={noop} readOnly={false} />
        </FormSection>,
    );
    expect(inForm.match(/<input[^>]*readonly=""/gi)?.length).toBe(1);
    expect(inForm).toContain(inputContainerStyles.formVariant);

    const inFilters = renderToStaticMarkup(
        <Section filters={<TextInput name="q" label="Search" value="" onChange={noop} />} />,
    );
    expect(inFilters).toContain(inputContainerStyles.generalVariant);
});

test('a word limit shows a live count', () => {
    const html = renderToStaticMarkup(
        <TextArea name="a" label="Notes" value="one two" onChange={noop} maxWords={10} />,
    );
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('2 / 10 words');
});

test('the password toggle is named', () => {
    const html = renderToStaticMarkup(
        <PasswordInput name="p" label="Password" value="" onChange={noop} />,
    );
    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('type="password"');
});
