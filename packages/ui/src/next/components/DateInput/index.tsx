import InputContainer from '#next/base/InputContainer';
import RawInput from '#next/base/RawInput';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    type DiffProps,
    useInputState,
} from '#next/utils/input';
import { getHighlightMode } from '#utils/common';

import DateDisplay from '../DateDisplay';

interface BaseProps<NAME> extends CommonInputProps<NAME> {
    /** An ISO date (yyyy-MM-dd) */
    value: string | null | undefined;
    onChange: (value: string | undefined, name: NAME) => void;
    /** Earliest selectable date (yyyy-MM-dd) */
    min?: string;
    /** Latest selectable date (yyyy-MM-dd) */
    max?: string;
    inputElementRef?: React.Ref<HTMLInputElement>;
}

export type Props<NAME> = BaseProps<NAME> & AccessibleNameProps & DiffProps<string>;

/** A date input on the native date picker */
function DateInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        label,
        ariaLabel,
        hint,
        error,
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        required,
        variant: variantFromProps,
        value,
        onChange,
        min,
        max,
        inputElementRef,
        withDiffView,
        prevValue,
    } = props;

    const {
        disabled,
        readOnly,
        variant,
        inputId,
        hintId,
        errorId,
        describedBy,
        invalid,
    } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        variant: variantFromProps,
        hint,
        error,
    });

    return (
        <InputContainer
            className={className}
            label={label}
            hint={hint}
            error={error}
            inputId={inputId}
            hintId={hintId}
            errorId={errorId}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            variant={variant}
            highlightMode={getHighlightMode(value, prevValue, withDiffView)}
            withPrevValue={withDiffView}
            prevValue={withDiffView && <DateDisplay value={prevValue} />}
            input={(
                <RawInput
                    id={inputId}
                    elementRef={inputElementRef}
                    name={name}
                    value={value}
                    onChange={onChange}
                    type="date"
                    min={min}
                    max={max}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-required={required}
                    aria-label={ariaLabel}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                />
            )}
        />
    );
}

export default DateInput;
