import { useId } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import RawDisplay from '#next/base/RawDisplay';
import type { StatusType } from '#utils/style';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    /** What is measured, such as "Funding coverage" */
    heading?: React.ReactNode;
    description?: React.ReactNode;
    value: number | null | undefined;
    totalValue: number | null | undefined;
    /** Shows the percentage at the end of the heading row */
    withPercentage?: boolean;
}

/** A status colour, or a colour from the data (a hazard or sector colour) */
type ColorProps =
    | { status?: StatusType; color?: never }
    | { status?: never; color: string };

export type Props = BaseProps & ColorProps;

const statusToClassName: Record<StatusType, string> = {
    positive: styles.positive,
    information: styles.information,
    warning: styles.warning,
    negative: styles.negative,
};

/**
 * A bar showing how much of a known total is reached, such as funding
 * coverage. Screen readers get a native <meter> named by the heading.
 */
function ProgressBar(props: Props) {
    const {
        className,
        heading,
        description,
        value: valueFromProps,
        totalValue: totalValueFromProps,
        withPercentage,
        status,
        color,
    } = props;

    const headingId = useId();
    const value = valueFromProps ?? 0;
    const totalValue = totalValueFromProps ?? 0;
    const percentage = totalValue === 0 ? 0 : (value / totalValue) * 100;

    return (
        <div
            className={_cs(
                styles.progressBar,
                isDefined(status) && statusToClassName[status],
                className,
            )}
            style={isDefined(color) ? { '--bar-color': color } as React.CSSProperties : undefined}
        >
            {(heading || withPercentage) && (
                <div className={styles.headingRow}>
                    <span id={headingId}>{heading}</span>
                    {withPercentage && (
                        <RawDisplay
                            valueType="number"
                            value={percentage}
                            formatOptions={{ maximumFractionDigits: 0, suffix: '%' }}
                        />
                    )}
                </div>
            )}
            <meter
                className={styles.meter}
                min={0}
                max={totalValue || 1}
                value={Math.min(value, totalValue || 1)}
                aria-labelledby={heading ? headingId : undefined}
            />
            <div className={styles.track} aria-hidden>
                <div
                    className={styles.bar}
                    style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                />
            </div>
            {description && (
                <div className={styles.description}>{description}</div>
            )}
        </div>
    );
}

export default ProgressBar;
