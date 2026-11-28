import TextLayout from '#next/base/TextLayout';
import {
    type TextVariant,
    textVariantToStyle,
} from '#next/utils/text';
import type {
    StatusType,
    TextSizeType,
} from '#utils/style';

export type { TextVariant };

export interface Props {
    className?: string;
    children?: React.ReactNode;
    variant?: TextVariant;
    /** Colours the text with a status colour; the weight still follows the variant */
    status?: StatusType;
    textSize?: TextSizeType;
}

/**
 * Inline text with an emphasis variant and an optional status colour. On a
 * dark surface the colours switch to their on-dark forms automatically.
 */
function Text(props: Props) {
    const {
        className,
        children,
        variant = 'default',
        status,
        textSize,
    } = props;

    const { textColor, fontWeight } = textVariantToStyle[variant];

    return (
        <TextLayout
            className={className}
            textColor={status ?? textColor}
            fontWeight={fontWeight}
            textSize={textSize}
        >
            {children}
        </TextLayout>
    );
}

export default Text;
