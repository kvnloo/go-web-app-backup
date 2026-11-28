import { _cs } from '@togglecorp/fujs';

import RawDisplay from '#next/base/RawDisplay';
import type {
    NumberFormatOptions,
    NumberFormatPreset,
} from '#utils/format';
import {
    getTextSizeClassName,
    type TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    value: number | null | undefined;
    /** number (default): grouped digits; percent: 0 to 100 as 64%; compact: 1.2M */
    format?: NumberFormatPreset;
    formatOptions?: NumberFormatOptions;
    label: React.ReactNode;
    /** Muted text after the value, such as "/ 4" */
    supplement?: React.ReactNode;
    /** Size of the value; defaults to 3xl */
    textSize?: TextSizeType;
    /** Shown when the value is missing; defaults to "--" from the defaults context */
    invalidText?: React.ReactNode;
}

/**
 * A prominent number over a smaller label. For a key figure on its own
 * surface, with an icon or progress, use KeyFigureCard.
 */
function KeyFigure(props: Props) {
    const {
        className,
        value,
        format,
        formatOptions,
        label,
        supplement,
        textSize = '3xl',
        invalidText,
    } = props;

    return (
        <div className={_cs(styles.keyFigure, className)}>
            <div className={styles.valueRow}>
                <RawDisplay
                    className={_cs(styles.value, getTextSizeClassName(textSize))}
                    valueType="number"
                    value={value}
                    format={format}
                    formatOptions={formatOptions}
                    invalidText={invalidText}
                />
                {supplement && (
                    <span className={styles.supplement}>
                        {supplement}
                    </span>
                )}
            </div>
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

export default KeyFigure;
