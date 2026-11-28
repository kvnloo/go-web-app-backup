import { _cs } from '@togglecorp/fujs';

import TextLayout from '#next/base/TextLayout';
import {
    type TextVariant,
    textVariantToStyle,
} from '#next/utils/text';
import type {
    StatusType,
    TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    variant?: TextVariant;
    status?: StatusType;
    textSize?: TextSizeType;
}

/**
 * Descriptive body text, such as the explanation under a heading. Takes the
 * same emphasis variants as Text. Renders nothing without children.
 */
function Description(props: Props) {
    const {
        className,
        children,
        variant = 'default',
        status,
        textSize,
    } = props;

    if (!children) {
        return null;
    }

    const { textColor, fontWeight } = textVariantToStyle[variant];

    return (
        <TextLayout
            as="div"
            className={_cs(styles.description, className)}
            textColor={status ?? textColor}
            fontWeight={fontWeight}
            textSize={textSize}
        >
            {children}
        </TextLayout>
    );
}

export default Description;
