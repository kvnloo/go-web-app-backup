import type { Props as ButtonLayoutProps } from '../base/ButtonLayout';

/**
 * primary: the main action of a view (filled);
 * secondary: other actions (outlined), the default;
 * tertiary: low-emphasis actions that read like text.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

type ButtonLook = Pick<ButtonLayoutProps, 'tone' | 'fill' | 'withBorder' | 'shape'>;

export const buttonVariantToLook: Record<ButtonVariant, ButtonLook> = {
    primary: { tone: 'primary', fill: 'solid' },
    secondary: { tone: 'primary', fill: 'none', withBorder: true },
    tertiary: { tone: 'neutral', fill: 'none', shape: 'inline' },
};
