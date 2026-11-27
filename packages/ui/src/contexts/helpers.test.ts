import {
    describe,
    expect,
    test,
} from 'vitest';

import { resolveFormState } from './form-state';
import { getNextHeadingLevel } from './heading-level';
import { getHrefKind } from './link';
import { getContrastBackground } from './surface';

test('heading level goes one deeper and stops at h6', () => {
    expect(getNextHeadingLevel(1)).toBe(2);
    expect(getNextHeadingLevel(5)).toBe(6);
    expect(getNextHeadingLevel(6)).toBe(6);
});

test('contrast surfaces alternate', () => {
    expect(getContrastBackground('background')).toBe('foreground');
    expect(getContrastBackground('foreground')).toBe('background');
});

describe('form state', () => {
    const inherited = { disabled: true, readOnly: false, inputVariant: 'general' as const };
    test('inherits from context', () => {
        expect(resolveFormState(inherited, {})).toEqual({ disabled: true, readOnly: false, variant: 'general' });
    });
    test('an instance prop overrides in either direction', () => {
        expect(resolveFormState(inherited, { disabled: false, readOnly: true, variant: 'inline' }))
            .toEqual({ disabled: false, readOnly: true, variant: 'inline' });
    });
    test('falls back to the default look', () => {
        const empty = { disabled: false, readOnly: false, inputVariant: undefined };
        expect(resolveFormState(empty, {}).variant).toBe('form');
    });
});

describe('link kinds', () => {
    const origin = 'https://go.ifrc.org';
    test.each([
        ['/emergencies/12', 'internal'],
        ['emergencies/12', 'internal'],
        ['https://go.ifrc.org/emergencies/12', 'internal'],
        ['https://www.ifrc.org/document.pdf', 'external'],
        ['//cdn.example.org/file.pdf', 'external'],
        ['mailto:dref@ifrc.org', 'other'],
        ['tel:+41227304222', 'other'],
        ['#key-figures', 'other'],
    ] as const)('%s is %s', (href, kind) => {
        expect(getHrefKind(href, origin)).toBe(kind);
    });
});
