import { useState } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import InputContainer from '#next/base/InputContainer';
import RawInput from '#next/base/RawInput';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    type DiffProps,
    useInputState,
} from '#next/utils/input';
import { getHighlightMode } from '#utils/common';

import NumberDisplay from '../NumberDisplay';

interface BaseProps<NAME> extends CommonInputProps<NAME> {
    value: number | null | undefined;
    onChange: (value: number | undefined, name: NAME) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    autoFocus?: boolean;
    /** Leading content, such as an icon */
    before?: React.ReactNode;
    actions?: React.ReactNode;
    inputElementRef?: React.Ref<HTMLInputElement>;
}

export type Props<NAME> = BaseProps<NAME> & AccessibleNameProps & DiffProps<number>;

interface Draft {
    text: string | undefined;
    /** The value the text stood for when it was typed */
    value: number | undefined;
}

function toNumber(text: string | undefined) {
    if (isNotDefined(text)) {
        return undefined;
    }
    const parsed = Number(text);
    return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * A number input. Partial entries ("1.", "-") stay in the field while they
 * are typed; the value changes once the text is a number.
 */
function NumberInput<const NAME>(props: Props<NAME>) {
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
        min,
        max,
        step,
        autoFocus,
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

    // NOTE: the typed text is kept only while it still stands for the current
    // value; a new value from outside replaces it (no effect needed)
    const [draft, setDraft] = useState<Draft>();
    const text = draft && draft.value === (value ?? undefined)
        ? draft.text
        : value?.toString();

    const handleChange = (newText: string | undefined) => {
        const newValue = toNumber(newText);
        setDraft({ text: newText, value: newValue });
        if (newValue !== (value ?? undefined)) {
            onChange(newValue, name);
        }
    };

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
            prevValue={withDiffView && <NumberDisplay value={prevValue} />}
            input={(
                <RawInput
                    id={inputId}
                    elementRef={inputElementRef}
                    name={name}
                    value={text}
                    onChange={handleChange}
                    type="number"
                    inputMode="decimal"
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    autoFocus={autoFocus}
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

export default NumberInput;
