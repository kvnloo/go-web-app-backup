import RawDisplay from '#next/base/RawDisplay';
import type {
    NumberFormatOptions,
    NumberFormatPreset,
} from '#utils/format';

export interface Props {
    className?: string;
    value: number | null | undefined;
    /** number (default): grouped digits; percent: 0 to 100 as 64%; compact: 1.2M */
    format?: NumberFormatPreset;
    formatOptions?: NumberFormatOptions;
    /** Shown when the value is missing; defaults to "--" from the defaults context */
    invalidText?: React.ReactNode;
}

/**
 * A formatted number in a <data> element. Abbreviated numbers carry their
 * full reading for screen readers. Wrap it in Text for emphasis.
 */
function NumberDisplay(props: Props) {
    const {
        className,
        value,
        format,
        formatOptions,
        invalidText,
    } = props;

    return (
        <RawDisplay
            className={className}
            valueType="number"
            value={value}
            format={format}
            formatOptions={formatOptions}
            invalidText={invalidText}
        />
    );
}

export default NumberDisplay;
