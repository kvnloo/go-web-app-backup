import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import InlineLayout from '#next/base/InlineLayout';
import InputError from '#next/base/InputError';
import { useInputState } from '#next/utils/input';

import IconButton from '../IconButton';

import styles from './styles.module.css';

export interface Props<NAME> {
    className?: string;
    /** Passed to onRemove, usually the row's client_id */
    name: NAME;
    onRemove: (name: NAME) => void;
    /** Tooltip of the remove button, such as "Remove source" */
    removeLabel: string;
    /** A more specific accessible name, such as "Remove source 2" */
    removeAriaLabel?: string;
    /** The row's inputs */
    children: React.ReactNode;
    /** An error for the row as a whole, shown above its inputs */
    error?: React.ReactNode;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page; hides the remove button */
    readOnly?: boolean;
}

/**
 * One row of a RepeatableList: its content with a remove button at the end.
 * The button is hidden when the form is read-only.
 */
function RemovableItem<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onRemove,
        removeLabel,
        removeAriaLabel,
        children,
        error,
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
    } = props;

    const { disabled, readOnly } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
    });

    return (
        <div className={_cs(styles.removableItem, className)}>
            {error && <InputError>{error}</InputError>}
            <InlineLayout
                wrapBreakpoint="sm"
                after={!readOnly && (
                    <IconButton
                        name={name}
                        onClick={onRemove}
                        label={removeLabel}
                        ariaLabel={removeAriaLabel}
                        disabled={disabled}
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
            >
                {children}
            </InlineLayout>
        </div>
    );
}

export default RemovableItem;
