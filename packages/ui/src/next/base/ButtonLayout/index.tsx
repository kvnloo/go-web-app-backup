import { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import SurfaceContext from '#contexts/surface';
import {
    getTextSizeClassName,
    type StatusType,
    type TextSizeType,
} from '#utils/style';

import InlineLayout, { type Props as InlineLayoutProps } from '../InlineLayout';

import styles from './styles.module.css';

/** The palette for text, border and fill together */
export type Tone = 'primary' | 'secondary' | 'neutral' | StatusType;
export type Fill = 'solid' | 'soft' | 'none';
/** pill: padded with rounded ends; inline: text-like, no padding */
export type Shape = 'pill' | 'inline';

export interface Props extends Omit<InlineLayoutProps, 'withPadding' | 'withAdditionalInlinePadding' | 'withInlineDisplay'> {
    tone?: Tone;
    fill?: Fill;
    withBorder?: boolean;
    shape?: Shape;
    withUnderline?: boolean;
    textSize?: TextSizeType;
    textSizeOffset?: number;
    disabled?: boolean;
    readOnly?: boolean;
    withFullWidth?: boolean;
}

const toneToClassName: Record<Tone, string> = {
    primary: styles.tonePrimary,
    secondary: styles.toneSecondary,
    neutral: styles.toneNeutral,
    positive: styles.tonePositive,
    information: styles.toneInformation,
    warning: styles.toneWarning,
    negative: styles.toneNegative,
};

const fillToClassName: Record<Fill, string> = {
    solid: styles.fillSolid,
    soft: styles.fillSoft,
    none: styles.fillNone,
};

/**
 * The look shared by buttons, links, tags, menu items and select triggers
 * (building block). Each exposed component maps its variant or status onto
 * these props. On a dark surface every tone switches to its on-dark colour.
 */
function ButtonLayout(props: Props) {
    const {
        tone = 'neutral',
        fill = 'none',
        withBorder = false,
        shape = 'pill',
        withUnderline = false,
        textSize,
        textSizeOffset,
        className,
        disabled,
        readOnly,
        withFullWidth,
        children,
        // NOTE: the v2 button and link sizes: pills sit 3 steps below the
        // context spacing, text-like buttons 5 steps
        spacingOffset = shape === 'inline' ? -5 : -3,
        ...inlineLayoutProps
    } = props;

    const { dark } = useContext(SurfaceContext);

    return (
        <InlineLayout
            withPadding={shape === 'pill'}
            withAdditionalInlinePadding={shape === 'pill'}
            withInlineDisplay
            className={_cs(
                styles.buttonLayout,
                toneToClassName[tone],
                fillToClassName[fill],
                withBorder && styles.withBorder,
                shape === 'inline' && styles.shapeInline,
                withUnderline && styles.withUnderline,
                dark && styles.onDark,
                disabled && styles.disabled,
                readOnly && styles.readOnly,
                withFullWidth && styles.withFullWidth,
                getTextSizeClassName(textSize, textSizeOffset),
                className,
            )}
            beforeContainerClassName={styles.before}
            afterContainerClassName={styles.after}
            spacingOffset={spacingOffset}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inlineLayoutProps}
        >
            {children}
            <span className={styles.visualFeedback} />
        </InlineLayout>
    );
}

export default ButtonLayout;
