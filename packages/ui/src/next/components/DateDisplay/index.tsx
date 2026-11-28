import RawDisplay from '#next/base/RawDisplay';
import type { DateLike } from '#utils/common';

export interface Props {
    className?: string;
    value: DateLike | null | undefined;
    /** Date format tokens; defaults to yyyy-MM-dd */
    format?: string;
    /** Shown when the value is missing; defaults to "--" from the defaults context */
    invalidText?: React.ReactNode;
}

/**
 * A formatted date in a <time dateTime> element, with the full date (and
 * time, when the format has one) as the screen-reader reading.
 */
function DateDisplay(props: Props) {
    const {
        className,
        value,
        format,
        invalidText,
    } = props;

    return (
        <RawDisplay
            className={className}
            valueType="date"
            value={value}
            format={format}
            invalidText={invalidText}
        />
    );
}

export default DateDisplay;
