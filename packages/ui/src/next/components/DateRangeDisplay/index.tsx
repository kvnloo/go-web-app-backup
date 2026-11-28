import { useContext } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import DefaultsContext from '#contexts/defaults';
import RawDisplay from '#next/base/RawDisplay';
import type { DateLike } from '#utils/common';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    startDate: DateLike | null | undefined;
    endDate: DateLike | null | undefined;
    /** Date format tokens for both ends; defaults to yyyy-MM-dd */
    format?: string;
    /** Shown when both dates are missing; defaults to "--" from the defaults context */
    invalidText?: React.ReactNode;
}

/**
 * A start and end date, each in its own <time dateTime> element. A missing
 * end shows the empty value in its place; when both are missing the range
 * collapses to one empty value.
 */
function DateRangeDisplay(props: Props) {
    const {
        className,
        startDate,
        endDate,
        format,
        invalidText: invalidTextFromProps,
    } = props;

    const { invalidText: defaultInvalidText } = useContext(DefaultsContext);
    const invalidText = invalidTextFromProps ?? defaultInvalidText;

    if (isNotDefined(startDate) && isNotDefined(endDate)) {
        return <span className={className}>{invalidText}</span>;
    }

    return (
        <span className={_cs(styles.dateRangeDisplay, className)}>
            <RawDisplay
                valueType="date"
                value={startDate}
                format={format}
                invalidText={invalidText}
            />
            <span aria-hidden>-</span>
            <RawDisplay
                valueType="date"
                value={endDate}
                format={format}
                invalidText={invalidText}
            />
        </span>
    );
}

export default DateRangeDisplay;
