import {
    describe,
    expect,
    test,
} from 'vitest';

import {
    backgroundColors,
    borderRadiusScale,
    boxShadowScale,
    fontWeightScale,
    getBackgroundColorClassName,
    getBorderRadiusClassName,
    getBoxShadowClassName,
    getDarkSurfaceClassName,
    getFontWeightClassName,
    getSpacingClassName,
    getTextColorClassName,
    getTextSizeClassName,
    spacingScale,
    textColors,
    textSizeScale,
} from './style';

import specs from './specs.module.css';

describe('every token resolves to a utility class', () => {
    test.each(spacingScale)('spacing %s', (token) => {
        expect(getSpacingClassName({ spacing: token, modes: [] })).toBeTruthy();
    });
    test.each(textSizeScale)('text size %s', (token) => {
        expect(getTextSizeClassName(token)).toBeTruthy();
    });
    test.each(fontWeightScale)('font weight %s', (token) => {
        expect(getFontWeightClassName(token)).toBeTruthy();
    });
    test.each(borderRadiusScale)('border radius %s', (token) => {
        expect(getBorderRadiusClassName(token)).toBeTruthy();
    });
    test.each(boxShadowScale)('box shadow %s', (token) => {
        expect(getBoxShadowClassName(token)).toBeTruthy();
    });
    test.each(textColors)('text color %s', (token) => {
        expect(getTextColorClassName(token)).toBeTruthy();
    });
    test.each(backgroundColors)('background color %s', (token) => {
        expect(getBackgroundColorClassName(token)).toBeTruthy();
    });
    test('dark surface', () => {
        expect(getDarkSurfaceClassName()).toBe(specs.surfaceDark);
    });
});

describe('offsets shift along the scale and clamp at both ends', () => {
    test('spacing', () => {
        expect(getSpacingClassName({ spacing: 'md', offset: 1, modes: [] })).toBe(specs.spacingLg);
        expect(getSpacingClassName({ spacing: 'md', offset: -2, modes: [] })).toBe(specs.spacingXs);
        expect(getSpacingClassName({ spacing: 'md', offset: 100, modes: [] })).toBe(specs.spacing5Xl);
        expect(getSpacingClassName({ spacing: 'md', offset: -100, modes: [] })).toBe(specs.spacingNone);
    });
    test('text size', () => {
        expect(getTextSizeClassName('md', 1)).toBe(specs.textSizeLg);
        expect(getTextSizeClassName('2xs', -1)).toBe(specs.textSize2Xs);
    });
    test('font weight', () => {
        expect(getFontWeightClassName('normal', 1)).toBe(specs.fontWeightMedium);
        expect(getFontWeightClassName('semibold', 5)).toBe(specs.fontWeightSemibold);
    });
    test('border radius and box shadow', () => {
        expect(getBorderRadiusClassName('md', 1)).toBe(specs.borderRadiusLg);
        expect(getBoxShadowClassName('md', -10)).toBe(specs.boxShadowNone);
    });
});

describe('spacing modes', () => {
    test('defaults to padding on both axes with optical correction', () => {
        expect(getSpacingClassName({ spacing: 'sm' }).split(' ')).toEqual([
            specs.spacingSm,
            specs.spacingPaddingInline,
            specs.spacingPaddingBlock,
        ]);
    });
    test('gaps without optical correction', () => {
        expect(getSpacingClassName({
            spacing: 'sm',
            modes: ['row-gap', 'column-gap'],
            withoutOpticalCorrection: true,
        }).split(' ')).toEqual([
            specs.spacingSm,
            specs.spacingRowGapPlain,
            specs.spacingColumnGap,
        ]);
    });
});

test('missing values resolve to no class', () => {
    expect(getTextSizeClassName(undefined)).toBeUndefined();
    expect(getFontWeightClassName(undefined)).toBeUndefined();
    expect(getTextColorClassName(undefined)).toBeUndefined();
    expect(getBackgroundColorClassName(undefined)).toBeUndefined();
});
