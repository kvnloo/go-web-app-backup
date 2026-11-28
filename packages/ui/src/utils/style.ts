import {
    _cs,
    bound,
} from '@togglecorp/fujs';

import specs from './specs.module.css';

/*
 * Token specs
 *
 * Each visual dimension ("spec") is defined once here: an ordered scale of
 * tokens (matching the CSS variables in index.css), a type derived from it,
 * and a resolver returning the static utility class for a token (see
 * specs.module.css). Ordinal specs also take an offset that shifts the token
 * along the scale, clamped at both ends, so a building block placed in a
 * denser or looser context shifts its whole scale without new tokens.
 */

export const spacingScale = ['none', '5xs', '4xs', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;
export type SpacingType = (typeof spacingScale)[number];

export const textSizeScale = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;
export type TextSizeType = (typeof textSizeScale)[number];

export const fontWeightScale = ['normal', 'medium', 'semibold'] as const;
export type FontWeightType = (typeof fontWeightScale)[number];

export const borderRadiusScale = ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'] as const;
export type BorderRadiusType = (typeof borderRadiusScale)[number];

export const boxShadowScale = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export type BoxShadowType = (typeof boxShadowScale)[number];

export const statuses = ['positive', 'information', 'warning', 'negative'] as const;
export type StatusType = (typeof statuses)[number];

export const textColors = ['default', 'light', 'strong', 'brand', ...statuses] as const;
export type TextColorType = (typeof textColors)[number];

export const backgroundColors = ['foreground', 'background', 'element', 'surface-raised'] as const;
export type BackgroundColorType = (typeof backgroundColors)[number];

export type SpacingMode = 'row-gap' | 'column-gap' | 'padding-inline' | 'padding-block';

export type ColorVariant = 'text' | 'text-on-dark' | 'primary' | 'secondary' | 'success' | 'danger';

export const gapSpacings: SpacingMode[] = ['row-gap', 'column-gap'];
export const paddingSpacings: SpacingMode[] = ['padding-block', 'padding-inline'];
export const fullSpacings: SpacingMode[] = [
    ...gapSpacings,
    ...paddingSpacings,
];

function resolveSpecToken<T extends string>(
    scale: readonly T[],
    value: T,
    offset = 0,
): T {
    return scale[bound(scale.indexOf(value) + offset, 0, scale.length - 1)];
}

const spacingTokenToClassName: Record<SpacingType, string> = {
    none: specs.spacingNone,
    '5xs': specs.spacing5Xs,
    '4xs': specs.spacing4Xs,
    '3xs': specs.spacing3Xs,
    '2xs': specs.spacing2Xs,
    xs: specs.spacingXs,
    sm: specs.spacingSm,
    md: specs.spacingMd,
    lg: specs.spacingLg,
    xl: specs.spacingXl,
    '2xl': specs.spacing2Xl,
    '3xl': specs.spacing3Xl,
    '4xl': specs.spacing4Xl,
    '5xl': specs.spacing5Xl,
};

const textSizeTokenToClassName: Record<TextSizeType, string> = {
    '2xs': specs.textSize2Xs,
    xs: specs.textSizeXs,
    sm: specs.textSizeSm,
    md: specs.textSizeMd,
    lg: specs.textSizeLg,
    xl: specs.textSizeXl,
    '2xl': specs.textSize2Xl,
    '3xl': specs.textSize3Xl,
    '4xl': specs.textSize4Xl,
};

const fontWeightTokenToClassName: Record<FontWeightType, string> = {
    normal: specs.fontWeightNormal,
    medium: specs.fontWeightMedium,
    semibold: specs.fontWeightSemibold,
};

const borderRadiusTokenToClassName: Record<BorderRadiusType, string> = {
    none: specs.borderRadiusNone,
    sm: specs.borderRadiusSm,
    md: specs.borderRadiusMd,
    lg: specs.borderRadiusLg,
    xl: specs.borderRadiusXl,
    '2xl': specs.borderRadius2Xl,
    '3xl': specs.borderRadius3Xl,
    full: specs.borderRadiusFull,
};

const boxShadowTokenToClassName: Record<BoxShadowType, string> = {
    none: specs.boxShadowNone,
    xs: specs.boxShadowXs,
    sm: specs.boxShadowSm,
    md: specs.boxShadowMd,
    lg: specs.boxShadowLg,
    xl: specs.boxShadowXl,
    '2xl': specs.boxShadow2Xl,
};

const textColorToClassName: Record<TextColorType, string> = {
    default: specs.textColorDefault,
    light: specs.textColorLight,
    strong: specs.textColorStrong,
    brand: specs.textColorBrand,
    positive: specs.textColorPositive,
    information: specs.textColorInformation,
    warning: specs.textColorWarning,
    negative: specs.textColorNegative,
};

const backgroundColorToClassName: Record<BackgroundColorType, string> = {
    foreground: specs.backgroundColorForeground,
    background: specs.backgroundColorBackground,
    element: specs.backgroundColorElement,
    'surface-raised': specs.backgroundColorSurfaceRaised,
};

// NOTE: the class keys above depend on vite's camelCaseOnly locals convention
// (lodash camelCase: spacing-5xs becomes spacing5Xs); this check catches a
// toolchain change that would silently drop spec classes
function validateSpecClassNames() {
    [
        spacingTokenToClassName,
        textSizeTokenToClassName,
        fontWeightTokenToClassName,
        borderRadiusTokenToClassName,
        boxShadowTokenToClassName,
        textColorToClassName,
        backgroundColorToClassName,
        {
            'padding-inline': specs.spacingPaddingInline,
            'padding-inline-additional': specs.spacingPaddingInlineAdditional,
            'padding-block': specs.spacingPaddingBlock,
            'padding-block-plain': specs.spacingPaddingBlockPlain,
            'row-gap': specs.spacingRowGap,
            'row-gap-plain': specs.spacingRowGapPlain,
            'column-gap': specs.spacingColumnGap,
            'surface-dark': specs.surfaceDark,
        },
    ].forEach((tokenMap) => {
        Object.entries(tokenMap).forEach(([token, className]) => {
            if (className === undefined) {
                // eslint-disable-next-line no-console
                console.error(`Spec utility class missing for token "${token}". Check specs.module.css and the CSS modules locals convention.`);
            }
        });
    });
}
validateSpecClassNames();

export interface SpacingClassNameOptions {
    spacing?: SpacingType;
    offset?: number;
    modes?: SpacingMode[];
    withoutOpticalCorrection?: boolean;
    withAdditionalInlinePadding?: boolean;
}

export function getSpacingClassName(options: SpacingClassNameOptions) {
    const {
        spacing = 'md',
        offset = 0,
        modes = ['padding-inline', 'padding-block'],
        withoutOpticalCorrection,
        withAdditionalInlinePadding,
    } = options;

    const token = resolveSpecToken(spacingScale, spacing, offset);

    return _cs(
        spacingTokenToClassName[token],
        ...modes.map((mode) => {
            if (mode === 'padding-inline') {
                return withAdditionalInlinePadding
                    ? specs.spacingPaddingInlineAdditional
                    : specs.spacingPaddingInline;
            }
            if (mode === 'padding-block') {
                return withoutOpticalCorrection
                    ? specs.spacingPaddingBlockPlain
                    : specs.spacingPaddingBlock;
            }
            if (mode === 'row-gap') {
                return withoutOpticalCorrection
                    ? specs.spacingRowGapPlain
                    : specs.spacingRowGap;
            }
            return specs.spacingColumnGap;
        }),
    );
}

export function getTextSizeClassName(textSize: TextSizeType | undefined, offset = 0) {
    if (textSize === undefined) {
        return undefined;
    }
    return textSizeTokenToClassName[resolveSpecToken(textSizeScale, textSize, offset)];
}

export function getFontWeightClassName(fontWeight: FontWeightType | undefined, offset = 0) {
    if (fontWeight === undefined) {
        return undefined;
    }
    return fontWeightTokenToClassName[resolveSpecToken(fontWeightScale, fontWeight, offset)];
}

export function getBorderRadiusClassName(borderRadius: BorderRadiusType | undefined, offset = 0) {
    if (borderRadius === undefined) {
        return undefined;
    }
    return borderRadiusTokenToClassName[resolveSpecToken(borderRadiusScale, borderRadius, offset)];
}

export function getBoxShadowClassName(boxShadow: BoxShadowType | undefined, offset = 0) {
    if (boxShadow === undefined) {
        return undefined;
    }
    return boxShadowTokenToClassName[resolveSpecToken(boxShadowScale, boxShadow, offset)];
}

export function getTextColorClassName(textColor: TextColorType | undefined) {
    if (textColor === undefined) {
        return undefined;
    }
    return textColorToClassName[textColor];
}

export function getBackgroundColorClassName(backgroundColor: BackgroundColorType | undefined) {
    if (backgroundColor === undefined) {
        return undefined;
    }
    return backgroundColorToClassName[backgroundColor];
}

/** The dark surface: navy background, and on-dark colours for the text inside it */
export function getDarkSurfaceClassName() {
    return specs.surfaceDark;
}

/** Restores the light text colours inside a dark surface (a white card on navy) */
export function getLightSurfaceClassName() {
    return specs.surfaceLight;
}

export function getOpticallyCorrectedSpacingValue(value: string, mode: SpacingMode) {
    // Horizontal padding seems a bit imbalanced
    // due to the gap from the line height in vertical padding
    if (mode === 'padding-block' || mode === 'row-gap') {
        return `calc(${value} + (1rem / var(--go-ui-optical-correction-factor) - 1rem))`;
    }

    return value;
}

export function getSpacingValue(
    spacing: SpacingType = 'md',
    offset: number = 0,
) {
    const spacingTokens = [
        '0',
        'var(--go-ui-spacing-5xs)',
        'var(--go-ui-spacing-4xs)',
        'var(--go-ui-spacing-3xs)',
        'var(--go-ui-spacing-2xs)',
        'var(--go-ui-spacing-xs)',
        'var(--go-ui-spacing-sm)',
        'var(--go-ui-spacing-md)',
        'var(--go-ui-spacing-lg)',
        'var(--go-ui-spacing-xl)',
        'var(--go-ui-spacing-2xl)',
        'var(--go-ui-spacing-3xl)',
        'var(--go-ui-spacing-4xl)',
        'var(--go-ui-spacing-5xl)',
    ] as const;

    const spacingTypeToStartIndexMap: Record<SpacingType, number> = {
        none: 0,
        '5xs': 1,
        '4xs': 2,
        '3xs': 3,
        '2xs': 4,
        xs: 5,
        sm: 6,
        md: 7,
        lg: 8,
        xl: 9,
        '2xl': 10,
        '3xl': 11,
        '4xl': 12,
        '5xl': 13,
    };

    const startIndex = bound(
        spacingTypeToStartIndexMap[spacing] + offset,
        0,
        spacingTokens.length - 1,
    );

    const spacingValue = spacingTokens[startIndex];

    return spacingValue;
}
