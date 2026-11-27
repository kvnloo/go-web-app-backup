import {
    expect,
    test,
} from 'vitest';

import { formatNumberPreset } from './format';

test('number preset groups digits and keeps decimals only below 1,000', () => {
    expect(formatNumberPreset(12500, 'number', {}, 'en')?.text).toBe('12,500');
    expect(formatNumberPreset(2400000.4, 'number', {}, 'en')?.text).toBe('2,400,000');
    expect(formatNumberPreset(64.275, 'number', {}, 'en')?.text).toBe('64.28');
});

test('percent preset adds the sign without a space and rounds to whole numbers', () => {
    expect(formatNumberPreset(64.27, 'percent', {}, 'en')).toEqual({
        text: '64%',
        fullText: '64%',
        isAbbreviated: false,
    });
    expect(formatNumberPreset(64.27, 'percent', { suffix: ' pts' }, 'en')?.text).toBe('64%');
});

test('compact preset abbreviates and keeps the full number for screen readers', () => {
    expect(formatNumberPreset(2400000, 'compact', {}, 'en')).toEqual({
        text: '2.4M',
        fullText: '2,400,000',
        isAbbreviated: true,
    });
    expect(formatNumberPreset(950, 'compact', {}, 'en')?.isAbbreviated).toBe(false);
});

test('the full reading follows maximumFractionDigits', () => {
    // previously the reading kept every decimal (shown 64.3, read 64.27)
    expect(formatNumberPreset(64.27, 'number', { maximumFractionDigits: 1 }, 'en')?.fullText).toBe('64.3');
    expect(formatNumberPreset(1234567.89, 'compact', { maximumFractionDigits: 1 }, 'en')?.fullText)
        .toBe('1,234,567.9');
});

test('prefix and suffix wrap both texts', () => {
    expect(formatNumberPreset(12, 'number', { prefix: '~', suffix: ' days' }, 'en')?.text).toBe('~12 days');
});

test('missing values format to nothing', () => {
    expect(formatNumberPreset(undefined)).toBeUndefined();
    expect(formatNumberPreset(null)).toBeUndefined();
    expect(formatNumberPreset(Number.NaN)).toBeUndefined();
});
