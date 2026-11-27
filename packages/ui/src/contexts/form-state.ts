import { createContext } from 'react';

/** form: inside form sections; general: filters and standalone inputs; inline: table cells */
export type InputVariant = 'form' | 'general' | 'inline';

export interface FormStateContextProps {
    disabled: boolean;
    readOnly: boolean;
    inputVariant: InputVariant | undefined;
}

const FormStateContext = createContext<FormStateContextProps>({
    disabled: false,
    readOnly: false,
    inputVariant: undefined,
});

interface FormStateOverrides {
    disabled?: boolean;
    readOnly?: boolean;
    variant?: InputVariant;
}

/** An instance prop wins over the inherited form state, in either direction */
export function resolveFormState(
    context: FormStateContextProps,
    overrides: FormStateOverrides,
    defaultVariant: InputVariant = 'form',
) {
    return {
        disabled: overrides.disabled ?? context.disabled,
        readOnly: overrides.readOnly ?? context.readOnly,
        variant: overrides.variant ?? context.inputVariant ?? defaultVariant,
    };
}

export default FormStateContext;
