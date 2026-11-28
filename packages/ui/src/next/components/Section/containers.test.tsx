import { useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import FormStateContext from '#contexts/form-state';

import Card from '../Card';
import ExpandableSection from '../ExpandableSection';
import FieldGroup from '../FieldGroup';
import FormSection from '../FormSection';
import Page from '../Page';
import Section from '.';

function noop() {}

function FormStateProbe() {
    const { disabled, readOnly, inputVariant } = useContext(FormStateContext);
    return <i data-state={`${disabled}-${readOnly}-${inputVariant}`} />;
}

const listState = {
    page: 1,
    setPage: noop,
    limit: 10,
    filtered: true,
    resetFilter: noop,
};

function forbiddenCombinations() {
    return (
        <>
            <Section heading="Reports" list={{ state: listState, response: undefined, pending: false }} />
            {/* @ts-expect-error a paged list sets the section's states itself */}
            <Section heading="Reports" list={{ state: listState, response: undefined, pending: false }} pending />
            {/* @ts-expect-error a paged list shows its own pagination */}
            <Section heading="Reports" list={{ state: listState, response: undefined, pending: false }} footerActions="x" />
            <Section heading="Operations" layout="grid" layoutOptions={{ numPreferredColumns: 3 }} />
            {/* @ts-expect-error column options only apply to the grid layout */}
            <Section heading="Operations" layoutOptions={{ numPreferredColumns: 3 }} />
            {/* @ts-expect-error the level follows from nesting (decision 11) */}
            <Section heading="Operations" headingLevel={3} />
            {/* @ts-expect-error decision 9 renamed headerActions to actions */}
            <Card heading="Resource" headerActions={null} />
            {/* @ts-expect-error a card stays white (decision 41) */}
            <Card heading="Resource" surface="dark" />
            {/* @ts-expect-error decision 22 renamed title to heading */}
            <FieldGroup title="Contacts" />
            {/* @ts-expect-error one prop shows the asterisk (decision 25) */}
            <FieldGroup heading="Contacts" withAsteriskOnTitle />
            {/* @ts-expect-error an expandable section needs a summary */}
            <ExpandableSection>content</ExpandableSection>
            {/* @ts-expect-error page looks are curated */}
            <Page variant="dark" />
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('the outline follows nesting: page h1, section h2, card h3', () => {
    const html = renderToStaticMarkup(
        <Page heading="Nepal Floods">
            <Section heading="Operations">
                <Card heading="DREF">c</Card>
            </Section>
        </Page>,
    );
    expect(html).toMatch(/<h1[^>]*>Nepal Floods<\/h1>/);
    expect(html).toMatch(/<h2[^>]*>Operations<\/h2>/);
    expect(html).toMatch(/<h3[^>]*>DREF<\/h3>/);
    expect(html).toContain('<main');
});

test('a section is named by its heading; without one it is a plain block', () => {
    const html = renderToStaticMarkup(<Section heading="Operations">c</Section>);
    const id = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(html).toMatch(/^<section /);
    expect(html).toContain(`id="${id}"`);
    expect(renderToStaticMarkup(<Section>c</Section>)).toMatch(/^<div /);
});

test('filters sit in a search landmark with the general input look', () => {
    const html = renderToStaticMarkup(
        <Section heading="Reports" filters={<FormStateProbe />} onFiltersClear={noop}>c</Section>,
    );
    expect(html).toContain('<search>');
    expect(html).toContain('data-state="false-false-general"');
    expect(html).not.toContain('Clear Filters');
    expect(renderToStaticMarkup(
        <Section heading="Reports" filters={<FormStateProbe />} onFiltersClear={noop} filtered>
            c
        </Section>,
    )).toContain('Clear Filters');
});

test('a paged list section shows its pagination, empty message and Clear Filters', () => {
    const html = renderToStaticMarkup(
        <Section
            heading="Reports"
            filters={<FormStateProbe />}
            list={{
                state: listState,
                response: { count: 35, results: [] },
                pending: false,
            }}
        >
            c
        </Section>,
    );
    expect(html).toContain('Clear Filters');
    expect(html).toContain('aria-current="page"');
    expect(html).toMatch(/>4<\/button>/);
});

test('a disabled form section disables its fields natively and through context', () => {
    const html = renderToStaticMarkup(
        <FormSection heading="Overview" disabled>
            <FormStateProbe />
        </FormSection>,
    );
    expect(html).toContain('<fieldset');
    expect(html).toContain('disabled=""');
    expect(html).toContain('data-state="true-false-form"');
});

test('a page passes read-only down; a form section can override it', () => {
    const html = renderToStaticMarkup(
        <Page readOnly>
            <FormStateProbe />
            <FormSection readOnly={false}><FormStateProbe /></FormSection>
        </Page>,
    );
    expect(html).toContain('data-state="false-true-undefined"');
    expect(html).toContain('data-state="false-false-form"');
});

test('a field group is a group named by its heading, with a spaced asterisk', () => {
    const html = renderToStaticMarkup(
        <FieldGroup heading="Contacts" required error="Add a contact">i</FieldGroup>,
    );
    expect(html).toContain('role="group"');
    // NOTE: a word joiner keeps the asterisk on the line of the last word
    expect(html).toMatch(/aria-hidden="true">\u2060\*<\/span>/);
    expect(html).toContain('Add a contact');
});

test('an expandable section is a details element', () => {
    const html = renderToStaticMarkup(
        <ExpandableSection heading="What is a DREF?" name="faq" initiallyExpanded>a</ExpandableSection>,
    );
    expect(html).toMatch(/^<details [^>]*name="faq"[^>]*open=""/);
    expect(html).toContain('<summary');
});
