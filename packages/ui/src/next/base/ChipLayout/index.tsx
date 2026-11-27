import { useContext } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import SurfaceContext from '#contexts/surface';

import type {
    Fill,
    Tone,
} from '../ButtonLayout';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Leading slot, typically an icon */
    leading?: React.ReactNode;
    label: React.ReactNode;
    /** Trailing slot, typically a remove action */
    trailing?: React.ReactNode;
    tone?: Tone;
    fill?: Fill;
    withBorder?: boolean;
    leadingClassName?: string;
    labelClassName?: string;
    trailingClassName?: string;
    as?: 'span' | 'div' | 'li';
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

/**
 * A pill with leading, label and trailing slots (building block). Tag and
 * Selection compose it and own the behaviour.
 */
function ChipLayout(props: Props) {
    const {
        className,
        leading,
        label,
        trailing,
        tone = 'neutral',
        fill = 'soft',
        withBorder = false,
        leadingClassName,
        labelClassName,
        trailingClassName,
        as: Element = 'span',
    } = props;

    const { dark } = useContext(SurfaceContext);

    return (
        <Element
            className={_cs(
                styles.chipLayout,
                toneToClassName[tone],
                fill === 'solid' && styles.fillSolid,
                fill === 'soft' && styles.fillSoft,
                withBorder && styles.withBorder,
                dark && styles.onDark,
                isDefined(trailing) && styles.withTrailing,
                className,
            )}
        >
            {isDefined(leading) && (
                <span className={_cs(styles.leading, leadingClassName)}>
                    {leading}
                </span>
            )}
            <span className={labelClassName}>
                {label}
            </span>
            {isDefined(trailing) && (
                <span className={_cs(styles.trailing, trailingClassName)}>
                    {trailing}
                </span>
            )}
        </Element>
    );
}

export default ChipLayout;
