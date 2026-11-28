import type {
    FontWeightType,
    TextColorType,
} from '#utils/style';

/**
 * default: inherits the surrounding text colour;
 * light: muted, for metadata;
 * strong: semibold, for emphasis;
 * brand: red at medium weight, for highlighted figures and names.
 */
export type TextVariant = 'default' | 'light' | 'strong' | 'brand';

interface TextStyle {
    textColor?: TextColorType;
    fontWeight?: FontWeightType;
}

export const textVariantToStyle: Record<TextVariant, TextStyle> = {
    default: {},
    light: { textColor: 'light' },
    strong: { fontWeight: 'semibold' },
    brand: { textColor: 'brand', fontWeight: 'medium' },
};
