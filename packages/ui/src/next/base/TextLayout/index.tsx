import { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import LayoutDefaultsContext from '#contexts/layout-defaults';
import {
    type FontWeightType,
    getFontWeightClassName,
    getTextColorClassName,
    getTextSizeClassName,
    type TextColorType,
    type TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

type TextElement = 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'dt' | 'dd' | 'label' | 'legend' | 'figcaption';

export interface Props extends Omit<React.HTMLAttributes<HTMLElement>, 'className'> {
    /** Element to render; pick the one that matches the meaning of the text */
    as?: TextElement;
    className?: string;
    elementRef?: React.Ref<HTMLElement>;
    /** Only for `as="label"` */
    htmlFor?: string;
    textSize?: TextSizeType;
    textSizeOffset?: number;
    textColor?: TextColorType;
    fontWeight?: FontWeightType;
    fontWeightOffset?: number;
    textAlign?: 'start' | 'center' | 'end';
    textTransform?: 'uppercase';
    /** balance: even line lengths, for headings and short centred text */
    textWrap?: 'balance' | 'nowrap';
    /** Truncate after this many lines with an ellipsis */
    lineClamp?: 1 | 2 | 3 | 4;
}

const textAlignToClassName = {
    start: styles.textAlignStart,
    center: styles.textAlignCenter,
    end: styles.textAlignEnd,
};

const lineClampToClassName = {
    1: styles.lineClampOne,
    2: styles.lineClampTwo,
    3: styles.lineClampThree,
    4: styles.lineClampFour,
};

/**
 * Text with token-backed size, colour and weight (building block).
 * Exposed text components (Text, Description, Heading, DisplayLabel) map
 * their variants onto these props; text size follows layout-default offsets.
 */
function TextLayout(props: Props) {
    const {
        as: Element = 'span',
        className,
        elementRef,
        textSize,
        textSizeOffset = 0,
        textColor,
        fontWeight,
        fontWeightOffset,
        textAlign,
        textTransform,
        textWrap,
        lineClamp,
        children,
        ...otherProps
    } = props;

    const { textSizeOffset: contextTextSizeOffset } = useContext(LayoutDefaultsContext);

    return (
        <Element
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef as React.Ref<never>}
            className={_cs(
                styles.textLayout,
                getTextSizeClassName(textSize, textSizeOffset + contextTextSizeOffset),
                getTextColorClassName(textColor),
                getFontWeightClassName(fontWeight, fontWeightOffset),
                textAlign && textAlignToClassName[textAlign],
                textTransform === 'uppercase' && styles.uppercase,
                textWrap === 'balance' && styles.textWrapBalance,
                textWrap === 'nowrap' && styles.textWrapNowrap,
                lineClamp && lineClampToClassName[lineClamp],
                className,
            )}
        >
            {children}
        </Element>
    );
}

export default TextLayout;
