import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import RawDisplay from '#next/base/RawDisplay';
import TooltipLayout from '#next/base/TooltipLayout';
import type {
    NumberFormatOptions,
    NumberFormatPreset,
} from '#utils/format';

import styles from './styles.module.css';

export interface Props<DATUM> {
    className?: string;
    /** Names the chart for assistive technology */
    ariaLabel: string;
    data: DATUM[] | null | undefined;
    keySelector: (datum: DATUM) => string | number;
    valueSelector: (datum: DATUM) => number | null | undefined;
    labelSelector: (datum: DATUM) => React.ReactNode;
    /** Extra detail shown on hover */
    tooltipSelector?: (datum: DATUM) => React.ReactNode;
    /** The value of a full bar; defaults to the largest value */
    maxValue?: number;
    /** Shows the largest values only; defaults to 5 */
    maxRows?: number;
    format?: NumberFormatPreset;
    formatOptions?: NumberFormatOptions;
}

/**
 * Horizontal bars for the largest values, each with its label and value as
 * text, so the chart reads without seeing the bars.
 */
function BarChart<DATUM>(props: Props<DATUM>) {
    const {
        className,
        ariaLabel,
        data,
        keySelector,
        valueSelector,
        labelSelector,
        tooltipSelector,
        maxValue: maxValueFromProps,
        maxRows = 5,
        format,
        formatOptions,
    } = props;

    const rows = (data ?? [])
        .map((datum) => {
            const value = valueSelector(datum);
            return isDefined(value)
                ? {
                    key: keySelector(datum), value, label: labelSelector(datum), datum,
                }
                : undefined;
        })
        .filter(isDefined)
        .sort((a, b) => b.value - a.value)
        .slice(0, maxRows);

    const maxValue = maxValueFromProps ?? Math.max(0, ...rows.map((row) => row.value));
    const fullValue = maxValue === 0 ? 1 : maxValue;

    return (
        <div className={_cs(styles.barChart, className)} role="group" aria-label={ariaLabel}>
            {rows.map((row) => {
                const tooltip = tooltipSelector?.(row.datum);
                return (
                    <div key={row.key} className={styles.row}>
                        {tooltip && <TooltipLayout heading={row.label} description={tooltip} />}
                        <div className={styles.label}>{row.label}</div>
                        <div className={styles.track} aria-hidden>
                            <div
                                className={styles.bar}
                                style={{ width: `${(Math.max(row.value, 0) / fullValue) * 100}%` }}
                            />
                        </div>
                        <RawDisplay
                            className={styles.value}
                            valueType="number"
                            value={row.value}
                            format={format}
                            formatOptions={formatOptions}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default BarChart;
