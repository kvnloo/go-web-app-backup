import ChipLayout, { type Props as ChipLayoutProps } from '#next/base/ChipLayout';
import type { StatusType } from '#utils/style';

/**
 * default: a soft fill, the default;
 * primary: a solid fill, for the state that needs attention;
 * secondary: an outline.
 */
export type TagVariant = 'default' | 'primary' | 'secondary';

export interface Props {
    className?: string;
    label: React.ReactNode;
    /** Leading content, typically an icon */
    before?: React.ReactNode;
    variant?: TagVariant;
    /** Colours the tag with a status colour; brand red when unset (gray for default) */
    status?: StatusType;
}

const variantToLook: Record<TagVariant, Pick<ChipLayoutProps, 'fill' | 'withBorder'>> = {
    default: { fill: 'soft' },
    primary: { fill: 'solid' },
    secondary: { fill: 'none', withBorder: true },
};

/** A short, static label, such as a status or a category */
function Tag(props: Props) {
    const {
        className,
        label,
        before,
        variant = 'default',
        status,
    } = props;

    const defaultTone = variant === 'default' ? 'neutral' : 'primary';

    return (
        <ChipLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...variantToLook[variant]}
            className={className}
            tone={status ?? defaultTone}
            leading={before}
            label={label}
        />
    );
}

export default Tag;
