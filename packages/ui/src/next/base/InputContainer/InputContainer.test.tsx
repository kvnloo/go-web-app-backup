import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import InputContainer from '.';

import styles from './styles.module.css';

function render(props: Partial<React.ComponentProps<typeof InputContainer>>) {
    return renderToStaticMarkup(
        <InputContainer
            label="DREF Title"
            inputId="title"
            hintId="title-hint"
            errorId="title-error"
            input={<input id="title" />}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />,
    );
}

test('the label points at the control', () => {
    expect(render({})).toContain('<label for="title"');
});

test('the hint carries its id for aria-describedby', () => {
    const html = render({ hint: 'Name the event the way the National Society refers to it.' });
    expect(html).toContain('id="title-hint"');
});

test('an error replaces the hint and is announced', () => {
    const html = render({ hint: 'A hint', error: 'This field is required' });
    expect(html).not.toContain('title-hint');
    expect(html).toContain('id="title-error"');
    expect(html).toContain('role="alert"');
});

test('required marks the label with a hidden asterisk', () => {
    expect(render({ required: true })).toMatch(/aria-hidden="true"[^>]*>\*</);
});

test('read-only fields get their own look', () => {
    expect(render({ readOnly: true })).toContain(styles.readOnly);
});
