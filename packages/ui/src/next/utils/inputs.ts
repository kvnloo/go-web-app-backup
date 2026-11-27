import { listToMap } from '@togglecorp/fujs';

import type { Props as InputContainerProps } from '../base/InputContainer';

/** Splits a field's props into those for its InputContainer and the rest */
// eslint-disable-next-line import/prefer-default-export
export function extractInputContainerProps<MIXED_PROPS extends Partial<InputContainerProps>>(
    mixedProps: MIXED_PROPS,
): [Pick<MIXED_PROPS, keyof InputContainerProps>, Omit<MIXED_PROPS, keyof InputContainerProps>] {
    // NOTE: typed as a full record so a new InputContainer prop fails to compile here
    const keysToExtract: Record<(keyof InputContainerProps), boolean> = {
        className: true,
        elementRef: true,
        inputSectionRef: true,
        label: true,
        icons: true,
        input: true,
        actions: true,
        hint: true,
        error: true,
        errorOnTooltip: true,
        inputId: true,
        hintId: true,
        errorId: true,
        role: true,
        disabled: true,
        readOnly: true,
        required: true,
        highlightMode: true,
        prevValue: true,
        withPrevValue: true,
        variant: true,
        spacing: true,
        withPadding: true,
        backgroundColor: true,
        withoutInputSectionPadding: true,
    };

    const keys = Object.keys(keysToExtract) as (keyof typeof keysToExtract)[];

    const props = listToMap(
        keys,
        (key) => key,
        (key) => mixedProps[key],
    );

    const remainingProps = { ...mixedProps };
    keys.forEach((key) => {
        delete remainingProps[key];
    });

    return [props as Pick<MIXED_PROPS, keyof InputContainerProps>, remainingProps];
}
