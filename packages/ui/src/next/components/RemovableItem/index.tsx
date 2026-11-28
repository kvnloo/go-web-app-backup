import { useRef } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import InlineLayout from '#next/base/InlineLayout';
import InputError from '#next/base/InputError';
import ListLayout from '#next/base/ListLayout';
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

    const rowRef = useRef<HTMLDivElement>(null);
    const handleRemove = (itemName: NAME) => {
        // NOTE: the removed row takes the focused button with it, so focus
        // moves to the next row's remove button, else to the list's add button
        const row = rowRef.current;
        const nextRemoveButton = row?.nextElementSibling
            ?.querySelector(`.${styles.removeButton}`)
            ?.closest('button');
        const addButton = row?.closest('[data-repeatable-list]')
            ?.querySelector<HTMLElement>('[data-repeatable-list-add] button');
        (nextRemoveButton ?? addButton)?.focus();
        onRemove(itemName);
    };

    return (
        <div ref={rowRef} className={_cs(styles.removableItem, className)}>
            {error && <InputError>{error}</InputError>}
            <InlineLayout
                wrapBreakpoint="sm"
                contentAlignment="start"
                after={!readOnly && (
                    <IconButton
                        className={styles.removeButton}
                        name={name}
                        onClick={handleRemove}
                        label={removeLabel}
                        ariaLabel={removeAriaLabel}
                        disabled={disabled}
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
            >
                <ListLayout layout="block">
                    {children}
                </ListLayout>
            </InlineLayout>
        </div>
    );
}

export default RemovableItem;
