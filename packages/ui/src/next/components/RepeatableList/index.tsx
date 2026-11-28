import { Children } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';

import InputError from '#next/base/InputError';
import ListLayout from '#next/base/ListLayout';
import StateMessage from '#next/base/StateMessage';
import { useInputState } from '#next/utils/input';

import Button from '../Button';

export interface Props {
    className?: string;
    /** The rows, usually RemovableItems keyed by client_id */
    children?: React.ReactNode;
    /** Label of the add button, such as "Add source" */
    addLabel: React.ReactNode;
    onAdd: () => void;
    /** An error for the list as a whole, shown above the rows */
    error?: React.ReactNode;
    /** Shown when there are no rows; defaults to the library's empty message */
    messages?: { empty?: React.ReactNode };
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page; hides the add button */
    readOnly?: boolean;
}

/**
 * The frame of an array field: the list's own error, the rows (or the empty
 * message) and the add button below. The rows are mapped by the caller, so
 * any row shape works.
 */
function RepeatableList(props: Props) {
    const {
        className,
        children,
        addLabel,
        onAdd,
        error,
        messages,
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
    } = props;

    const { disabled, readOnly } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
    });

    const empty = Children.toArray(children).length === 0;

    return (
        <ListLayout className={className} layout="block">
            {error && <InputError>{error}</InputError>}
            {empty ? (
                <StateMessage empty compact messages={messages} />
            ) : children}
            {!readOnly && (
                <div>
                    <Button
                        name={undefined}
                        onClick={onAdd}
                        before={<AddLineIcon />}
                        disabled={disabled}
                    >
                        {addLabel}
                    </Button>
                </div>
            )}
        </ListLayout>
    );
}

export default RepeatableList;
