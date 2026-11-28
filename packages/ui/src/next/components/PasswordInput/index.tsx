import { useState } from 'react';
import {
    EyeFillIcon,
    EyeOffLineIcon,
} from '@ifrc-go/icons';

// NOTE: shares the v2 strings (same "common" namespace keys); the file moves
// here when v2 is removed
import i18n from '#components/PasswordInput/i18n.json';
import useTranslation from '#hooks/useTranslation';
import InputContainer from '#next/base/InputContainer';
import RawInput from '#next/base/RawInput';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    useInputState,
} from '#next/utils/input';

import IconButton from '../IconButton';

interface BaseProps<NAME> extends CommonInputProps<NAME> {
    value: string | null | undefined;
    onChange: (value: string | undefined, name: NAME) => void;
    placeholder?: string;
    /** current-password (the default) to sign in, new-password to set one */
    autoComplete?: 'current-password' | 'new-password';
    autoFocus?: boolean;
    inputElementRef?: React.Ref<HTMLInputElement>;
}

export type Props<NAME> = BaseProps<NAME> & AccessibleNameProps;

/** A password input with a button that shows or hides the password */
function PasswordInput<const NAME>(props: Props<NAME>) {
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
        autoComplete = 'current-password',
        autoFocus,
        inputElementRef,
    } = props;

    const strings = useTranslation(i18n);
    const [visible, setVisible] = useState(false);

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
            actions={(
                <IconButton
                    name={undefined}
                    onClick={() => setVisible((prevVisible) => !prevVisible)}
                    label={visible ? strings.hidePassword : strings.showPassword}
                    disabled={disabled}
                >
                    {visible ? <EyeOffLineIcon /> : <EyeFillIcon />}
                </IconButton>
            )}
            input={(
                <RawInput
                    id={inputId}
                    elementRef={inputElementRef}
                    name={name}
                    value={value}
                    onChange={onChange}
                    type={visible ? 'text' : 'password'}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
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

export default PasswordInput;
