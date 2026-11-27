import { isNotDefined } from '@togglecorp/fujs';

/**
 * number: grouped digits (two decimals below 1,000, none above)
 * percent: a 0 to 100 value shown with a % sign and no decimals
 * compact: abbreviated (1.2M); the full number is kept for screen readers
 */
export type NumberFormatPreset = 'number' | 'percent' | 'compact';

export interface NumberFormatOptions {
    maximumFractionDigits?: number;
    prefix?: string;
    /** Not applied with the percent preset, which adds its own % sign */
    suffix?: string;
}

export interface FormattedNumber {
    /** What is shown */
    text: string;
    /** What a screen reader should hear: the same value without abbreviation */
    fullText: string;
    /** True when text loses information that fullText has (role="img" + aria-label is needed) */
    isAbbreviated: boolean;
}

function getDefaultFractionDigits(value: number, preset: NumberFormatPreset) {
    if (preset === 'percent') {
        return 0;
    }
    if (preset === 'compact') {
        return 1;
    }
    return Math.abs(value) < 1000 ? 2 : 0;
}

function formatWithIntl(
    value: number,
    options: Intl.NumberFormatOptions,
    language: string | undefined,
) {
    return new Intl.NumberFormat(language, options).format(value);
}

export function formatNumberPreset(
    value: number | null | undefined,
    preset: NumberFormatPreset = 'number',
    options: NumberFormatOptions = {},
    language?: string,
): FormattedNumber | undefined {
    if (isNotDefined(value) || Number.isNaN(value)) {
        return undefined;
    }

    const maximumFractionDigits = options.maximumFractionDigits
        ?? getDefaultFractionDigits(value, preset);
    const prefix = options.prefix ?? '';
    const suffix = preset === 'percent' ? '%' : (options.suffix ?? '');

    const visible = formatWithIntl(value, {
        maximumFractionDigits,
        notation: preset === 'compact' ? 'compact' : 'standard',
        compactDisplay: 'short',
    }, language);

    // NOTE: the full reading uses the same fraction digits as the visible text,
    // only without abbreviation, so both describe the same rounded value
    const full = preset === 'compact'
        ? formatWithIntl(value, {
            maximumFractionDigits: options.maximumFractionDigits
                ?? getDefaultFractionDigits(value, 'number'),
        }, language)
        : visible;

    const text = `${prefix}${visible}${suffix}`;
    const fullText = `${prefix}${full}${suffix}`;

    return {
        text,
        fullText,
        isAbbreviated: text !== fullText,
    };
}
