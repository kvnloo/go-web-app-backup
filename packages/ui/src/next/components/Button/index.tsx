import {
    useContext,
    useState,
} from 'react';

import FormStateContext from '#contexts/form-state';
import ButtonLayout from '#next/base/ButtonLayout';
import RawButton from '#next/base/RawButton';
import {
    type ButtonVariant,
    buttonVariantToLook,
} from '#next/utils/button';

import ConfirmDialog from '../ConfirmDialog';

import styles from './styles.module.css';

interface BaseProps<NAME> {
    className?: string;
    elementRef?: React.Ref<HTMLButtonElement>;
    name: NAME;
    children: React.ReactNode;
    /** Defaults to secondary */
    variant?: ButtonVariant;
    before?: React.ReactNode;
    after?: React.ReactNode;
    /** A submit button is also disabled when its form section is disabled or read-only */
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

interface ClickProps<NAME> {
    onClick?: (name: NAME, event: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirm?: never;
    confirmMessage?: never;
    confirmHeading?: never;
}

interface ConfirmProps<NAME> {
    onClick?: never;
    /** Called once the user confirms; the button label is the confirming action */
    onConfirm: (name: NAME) => void;
    confirmMessage: React.ReactNode;
    /** Defaults to "Confirmation" */
    confirmHeading?: React.ReactNode;
}

export type Props<NAME> = BaseProps<NAME> & (ClickProps<NAME> | ConfirmProps<NAME>);

/**
 * A button. With `onConfirm` it asks for confirmation first, in a dialog
 * whose confirming action carries the button's own label.
 */
function Button<const NAME>(props: Props<NAME>) {
    const {
        className,
        elementRef,
        name,
        children,
        variant = 'secondary',
        before,
        after,
        disabled: disabledFromProps,
        type = 'button',
        onClick,
        onConfirm,
        confirmMessage,
        confirmHeading,
    } = props;

    const formState = useContext(FormStateContext);
    const [confirming, setConfirming] = useState(false);

    const disabled = disabledFromProps
        || (type === 'submit' && (formState.disabled || formState.readOnly));

    const handleClick = onConfirm
        ? () => setConfirming(true)
        : onClick;

    const handleConfirm = (confirmedName: NAME) => {
        setConfirming(false);
        onConfirm?.(confirmedName);
    };

    return (
        <>
            <RawButton
                className={styles.button}
                elementRef={elementRef}
                name={name}
                onClick={handleClick}
                disabled={disabled}
                type={type}
            >
                <ButtonLayout
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...buttonVariantToLook[variant]}
                    className={className}
                    before={before}
                    after={after}
                    disabled={disabled}
                >
                    {children}
                </ButtonLayout>
            </RawButton>
            {confirming && (
                <ConfirmDialog
                    name={name}
                    heading={confirmHeading}
                    message={confirmMessage}
                    confirmLabel={children}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirming(false)}
                />
            )}
        </>
    );
}

export default Button;
