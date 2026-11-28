import ButtonLayout from '#next/base/ButtonLayout';
import RawFileInput from '#next/base/RawFileInput';
import {
    type ButtonVariant,
    buttonVariantToLook,
} from '#next/utils/button';
import { useInputState } from '#next/utils/input';

interface BaseProps<NAME> {
    className?: string;
    name: NAME;
    /** The button label */
    children: React.ReactNode;
    /** File types to offer, such as ".pdf,.docx" or "image/*" */
    accept?: string;
    /** Defaults to secondary */
    variant?: ButtonVariant;
    before?: React.ReactNode;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page */
    readOnly?: boolean;
}

type FileProps<NAME> =
    | { multiple?: never; onChange: (file: File | undefined, name: NAME) => void }
    | { multiple: true; onChange: (files: File[] | undefined, name: NAME) => void };

export type Props<NAME> = BaseProps<NAME> & FileProps<NAME>;

/**
 * A button that opens the file picker; with `multiple` it passes several
 * files. Reachable and operable from the keyboard like any button.
 */
function FileInputButton<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        children,
        accept,
        variant = 'secondary',
        before,
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        multiple,
        onChange,
    } = props;

    const { disabled, readOnly } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
    });

    const look = (
        <ButtonLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...buttonVariantToLook[variant]}
            className={className}
            before={before}
            disabled={disabled}
            readOnly={readOnly}
        >
            {children}
        </ButtonLayout>
    );

    if (multiple) {
        return (
            <RawFileInput
                name={name}
                accept={accept}
                disabled={disabled}
                readOnly={readOnly}
                multiple
                onChange={onChange}
            >
                {look}
            </RawFileInput>
        );
    }

    return (
        <RawFileInput
            name={name}
            accept={accept}
            disabled={disabled}
            readOnly={readOnly}
            onChange={onChange}
        >
            {look}
        </RawFileInput>
    );
}

export default FileInputButton;
