// NOTE: shares the v2 confirmation strings (same "common" namespace keys); the
// file moves here when v2 is removed
import i18n from '#components/ConfirmModal/i18n.json';
import useTranslation from '#hooks/useTranslation';
import ButtonLayout from '#next/base/ButtonLayout';
import RawButton from '#next/base/RawButton';
import { buttonVariantToLook } from '#next/utils/button';

import Dialog from '../Dialog';

import styles from './styles.module.css';

export interface Props<NAME> {
    className?: string;
    name: NAME;
    /** Defaults to "Confirmation" */
    heading?: React.ReactNode;
    message: React.ReactNode;
    /** Label of the confirming action, such as "Delete"; defaults to "Ok" */
    confirmLabel?: React.ReactNode;
    /** Defaults to "Cancel" */
    cancelLabel?: React.ReactNode;
    onConfirm: (name: NAME) => void;
    onCancel: () => void;
    /** Disables both actions, for example while the confirmed request runs */
    disabled?: boolean;
}

/**
 * Asks the user to confirm an action. Buttons and menu items with
 * `onConfirm` open it themselves; use it directly only for confirmations
 * that do not start from a click.
 */
function ConfirmDialog<const NAME>(props: Props<NAME>) {
    const strings = useTranslation(i18n);

    const {
        className,
        name,
        heading = strings.confirmation,
        message,
        confirmLabel = strings.buttonOk,
        cancelLabel = strings.buttonCancel,
        onConfirm,
        onCancel,
        disabled,
    } = props;

    // NOTE: composes the button look directly, as Button opens this dialog
    return (
        <Dialog
            className={className}
            heading={heading}
            size="sm"
            onClose={onCancel}
            footerActions={(
                <>
                    <RawButton
                        className={styles.button}
                        name={undefined}
                        onClick={onCancel}
                        disabled={disabled}
                    >
                        <ButtonLayout
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...buttonVariantToLook.secondary}
                            disabled={disabled}
                        >
                            {cancelLabel}
                        </ButtonLayout>
                    </RawButton>
                    <RawButton
                        className={styles.button}
                        name={name}
                        onClick={onConfirm}
                        disabled={disabled}
                    >
                        <ButtonLayout
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...buttonVariantToLook.primary}
                            disabled={disabled}
                        >
                            {confirmLabel}
                        </ButtonLayout>
                    </RawButton>
                </>
            )}
        >
            {message}
        </Dialog>
    );
}

export default ConfirmDialog;
