import RawDisplay from '#next/base/RawDisplay';

export interface Props {
    className?: string;
    value: boolean | null | undefined;
    /** Shown when the value is missing; defaults to "--" from the defaults context */
    invalidText?: React.ReactNode;
}

/** Yes or No, in the current language, inline with the surrounding text */
function BooleanDisplay(props: Props) {
    const {
        className,
        value,
        invalidText,
    } = props;

    return (
        <RawDisplay
            className={className}
            valueType="boolean"
            value={value}
            invalidText={invalidText}
        />
    );
}

export default BooleanDisplay;
