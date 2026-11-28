import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import BooleanInput from '../BooleanInput';
import Checkbox from '../Checkbox';
import Checklist from '../Checklist';
import SegmentInput from '../SegmentInput';
import Switch from '../Switch';
import RadioInput from '.';

import segmentStyles from '../SegmentInput/styles.module.css';

interface Option {
    key: string;
    label: string;
}

const options: Option[] = [
    { key: 'a', label: 'Alpha' },
    { key: 'b', label: 'Beta' },
];

function keySelector(option: Option) {
    return option.key;
}

function labelSelector(option: Option) {
    return option.label;
}

function noop() {}

function setValue(value: string, name: string) {
    return [value, name];
}

/* eslint-disable react/jsx-props-no-spreading */
function forbiddenCombinations() {
    const common = {
        name: 'n', label: 'L', options, keySelector, labelSelector,
    } as const;
    return (
        <>
            <RadioInput {...common} value="a" onChange={setValue} />
            <RadioInput {...common} value="a" withDeselect onChange={noop} layout="grid" layoutOptions={{ numPreferredColumns: 2 }} />
            {/* @ts-expect-error with deselection the handler must accept undefined */}
            <RadioInput {...common} value="a" withDeselect onChange={setValue} />
            {/* @ts-expect-error column options only apply to the grid layout */}
            <RadioInput {...common} value="a" onChange={noop} layoutOptions={{ numPreferredColumns: 2 }} />
            {/* @ts-expect-error custom renderers belong to app wrappers built from /base */}
            <RadioInput {...common} value="a" onChange={noop} renderer={() => null} />
            {/* @ts-expect-error a checklist holds an array of keys */}
            <Checklist {...common} value="a" onChange={noop} />
            {/* @ts-expect-error a single checkbox has no option look */}
            <Checkbox name="c" label="Agree" value onChange={noop} variant="inline" />
            {/* @ts-expect-error decision 25 folded withAsterisk into required */}
            <BooleanInput name="b" label="Ok?" value onChange={noop} withAsterisk />
        </>
    );
}

/* eslint-enable react/jsx-props-no-spreading */

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('a radio group is named by its label and shares one native name', () => {
    const html = renderToStaticMarkup(
        <RadioInput
            name="n"
            label="Pick one"
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value="b"
            onChange={noop}
        />,
    );
    expect(html).toContain('role="radiogroup"');
    const labelId = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(html).toContain(`id="${labelId}"`);
    const names = [...html.matchAll(/type="radio" name="([^"]+)"/g)].map((match) => match[1]);
    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(1);
    expect(html.match(/<input[^>]*value="b"[^>]*>/)?.[0]).toContain('checked=""');
});

test('a read-only checkbox stays focusable and says it is read-only', () => {
    const html = renderToStaticMarkup(<Checkbox name="c" label="Agree" value readOnly onChange={noop} />);
    expect(html).toContain('aria-readonly="true"');
    expect(html).not.toContain('disabled=""');
});

test('a switch is announced as a switch', () => {
    expect(renderToStaticMarkup(<Switch name="s" label="Notify" value onChange={noop} />))
        .toContain('role="switch"');
});

test('a checklist is a labelled group of checkboxes', () => {
    const html = renderToStaticMarkup(
        <Checklist
            name="n"
            label="Pick some"
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value={['a']}
            onChange={noop}
        />,
    );
    expect(html).toContain('role="group"');
    expect(html.match(/type="checkbox"/g)).toHaveLength(2);
    expect(html.match(/checked=""/g)).toHaveLength(1);
});

test('yes and no come from the library strings', () => {
    const html = renderToStaticMarkup(<BooleanInput name="b" label="Ok?" value={false} onChange={noop} />);
    expect(html).toContain('Yes');
    expect(html).toContain('No');
});

test('the segment label sits outside the track', () => {
    const html = renderToStaticMarkup(
        <SegmentInput
            name="v"
            label="View"
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value="a"
            onChange={noop}
        />,
    );
    const trackStart = html.indexOf(segmentStyles.track);
    expect(html.indexOf('View')).toBeLessThan(trackStart);
});
