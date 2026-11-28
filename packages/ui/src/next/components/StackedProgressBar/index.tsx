import { _cs } from '@togglecorp/fujs';

import ListLayout from '#next/base/ListLayout';
import RawDisplay from '#next/base/RawDisplay';

import LegendItem from '../LegendItem';

import styles from './styles.module.css';

export interface Props<DATUM> {
    className?: string;
    data: DATUM[];
    valueSelector: (datum: DATUM, index: number) => number;
    labelSelector: (datum: DATUM, index: number) => React.ReactNode;
    /** A CSS colour per part, usually from the data */
    colorSelector: (datum: DATUM, index: number) => string;
}

/**
 * One bar split into parts that add up to the whole (people reached by
 * sector), with each part's value above it and a legend below. Parts below
 * a tenth of the bar show no percentage, so labels do not collide.
 */
function StackedProgressBar<DATUM>(props: Props<DATUM>) {
    const {
        className,
        data,
        valueSelector,
        labelSelector,
        colorSelector,
    } = props;

    const parts = data.map((datum, index) => ({
        value: valueSelector(datum, index),
        label: labelSelector(datum, index),
        color: colorSelector(datum, index),
    }));
    const total = parts.reduce((sum, part) => sum + Math.max(part.value, 0), 0);

    return (
        <div className={_cs(styles.stackedProgressBar, className)}>
            {/* NOTE: with nothing to show, the parts would all collapse onto each other */}
            {total > 0 && (
                <div className={styles.values}>
                    {parts.map((part, index) => {
                        const percentage = (Math.max(part.value, 0) / total) * 100;
                        return (
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                className={styles.value}
                                style={{ width: `${percentage}%` }}
                            >
                                <RawDisplay
                                    className={styles.number}
                                    valueType="number"
                                    value={part.value}
                                />
                                {percentage > 10 && (
                                    <RawDisplay
                                        className={styles.percentage}
                                        valueType="number"
                                        value={percentage}
                                        formatOptions={{
                                            maximumFractionDigits: 0,
                                            prefix: '(',
                                            suffix: '%)',
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            <div className={styles.track} aria-hidden>
                {total > 0 && parts.map((part, index) => (
                    <div
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        className={styles.bar}
                        style={{
                            width: `${(Math.max(part.value, 0) / total) * 100}%`,
                            backgroundColor: part.color,
                        }}
                    />
                ))}
            </div>
            <ListLayout wrap spacing="sm">
                {parts.map((part, index) => (
                    <LegendItem
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        color={part.color}
                        label={part.label}
                    />
                ))}
            </ListLayout>
        </div>
    );
}

export default StackedProgressBar;
