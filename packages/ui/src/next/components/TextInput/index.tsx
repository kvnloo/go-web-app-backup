import InputContainer from '#next/base/InputContainer';
import RawInput from '#next/base/RawInput';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    type DiffProps,
    useInputState,
} from '#next/utils/input';
import { getHighlightMode } from '#utils/common';

interface BaseProps<NAME> extends CommonInputProps<NAME> {
    value: string | null | undefined;
    onChange: (value: string | undefined, name: NAME) => void;
    placeholder?: string;
    /** The native type; it also picks the right on-screen keyboard */
    type?: 'text' | 'email' | 'url' | 'tel' | 'search';
    autoComplete?: string;
    autoFocus?: boolean;
    maxLength?: number;
    /** Leading content, such as an icon */
    before?: React.ReactNode;
    /** Trailing controls */
    actions?: React.ReactNode;
    inputElementRef?: React.Ref<HTMLInputElement>;
}

export type Props<NAME> = BaseProps<NAME> & AccessibleNameProps & DiffProps<string>;

/**
 * A single-line text input. Its disabled and read-only state and its look
 * come from the surrounding form section, filters or table, unless set.
 */
function TextInput<const NAME>(props: Props<NAME>) {
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
        placeholder,
        type = 'text',
        autoComplete,
        autoFocus,
        maxLength,
        before,
        actions,
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
            icons={before}
            actions={actions}
            highlightMode={getHighlightMode(value, prevValue, withDiffView)}
            withPrevValue={withDiffView}
            prevValue={prevValue}
            input={(
                <RawInput
                    id={inputId}
                    elementRef={inputElementRef}
                    name={name}
                    value={value}
                    onChange={onChange}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    disabled={disabled}
                    readOnly={readOnly}
                    // NOTE: aria-required only; the native attribute would block submit
                    // before the form's own validation runs
                    aria-required={required}
                    aria-label={ariaLabel}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                />
            )}
        />
    );
}

export default TextInput;
