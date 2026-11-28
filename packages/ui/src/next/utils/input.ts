import {
    useContext,
    useId,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import FormStateContext, {
    type InputVariant,
    resolveFormState,
} from '#contexts/form-state';

/** Every input needs a name: a visible label, or an aria label when the label is elsewhere */
export type AccessibleNameProps =
    | { label: React.ReactNode; ariaLabel?: never }
    | { label?: never; ariaLabel: string };

/** The diff view highlights a change against the previous value and shows it below */
export type DiffProps<VALUE> =
    | { withDiffView?: never; prevValue?: never }
    | { withDiffView: true; prevValue: VALUE | null | undefined };

export interface CommonInputProps<NAME> {
    className?: string;
    name: NAME;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page */
    readOnly?: boolean;
    /** Shows the asterisk and sets aria-required */
    required?: boolean;
    /** Defaults to the look of the surroundings: form, general (filters) or inline (table cells) */
    variant?: InputVariant;
}

interface InputStateOptions {
    disabled?: boolean;
    readOnly?: boolean;
    variant?: InputVariant;
    hint?: React.ReactNode;
    error?: React.ReactNode;
}

/**
 * Resolves an input's state against the surrounding form state and wires
 * its ids: the control id for the label, and the hint and error ids for
 * aria-describedby (the hint is hidden while there is an error)
 */

export function useInputState(options: InputStateOptions) {
    const formState = useContext(FormStateContext);
    const { disabled, readOnly, variant } = resolveFormState(formState, options);

    const inputId = useId();
    const hasError = isDefined(options.error);
    const errorId = hasError ? `${inputId}-error` : undefined;
    const hintId = isDefined(options.hint) && !hasError ? `${inputId}-hint` : undefined;
    const describedBy = [hintId, errorId].filter(isDefined).join(' ') || undefined;

    return {
        disabled,
        readOnly,
        variant,
        inputId,
        hintId,
        errorId,
        describedBy,
        invalid: hasError,
    };
}
