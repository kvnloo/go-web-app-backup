import type { OptionKey } from '../base/SelectInputContainer/GenericOption';
import type { DiffProps } from './input';

/**
 * One value, cleared with the clear button; one value that cannot be
 * cleared; or several values (`multiple`), with an optional select-all
 */
export type SelectValueProps<NAME, KEY extends OptionKey, OPTION = never> =
    | ({
        multiple?: never;
        value: KEY | null | undefined;
        withoutClearButton?: never;
        withSelectAllButton?: never;
        onChange: (value: KEY | undefined, name: NAME, option: OPTION | undefined) => void;
    } & DiffProps<KEY>)
    | ({
        multiple?: never;
        value: KEY | null | undefined;
        withoutClearButton: true;
        withSelectAllButton?: never;
        onChange: (value: KEY, name: NAME, option: OPTION) => void;
    } & DiffProps<KEY>)
    | ({
        multiple: true;
        value: KEY[] | null | undefined;
        withoutClearButton?: never;
        withSelectAllButton?: boolean;
        onChange: (value: KEY[], name: NAME) => void;
    } & DiffProps<KEY[]>);

/** The diff view's highlight for one value or several (compared as sets) */
export function getSelectHighlightMode<KEY>(
    value: KEY | KEY[] | null | undefined,
    prevValue: KEY | KEY[] | null | undefined,
    withDiffView: boolean | undefined,
) {
    if (!withDiffView) {
        return undefined;
    }
    const toList = (item: KEY | KEY[] | null | undefined) => {
        if (Array.isArray(item)) {
            return item;
        }
        return item === null || item === undefined ? [] : [item];
    };
    const current = toList(value);
    const previous = toList(prevValue);
    if (previous.length === 0 && current.length > 0) {
        return 'add' as const;
    }
    if (current.length === 0 && previous.length > 0) {
        return 'remove' as const;
    }
    if (current.length !== previous.length || previous.some((key) => !current.includes(key))) {
        return 'update' as const;
    }
    return undefined;
}

export function getSelectPrevValueDisplay<OPTION, KEY>(
    prevValue: KEY | KEY[] | null | undefined,
    options: OPTION[] | null | undefined,
    keySelector: (option: OPTION) => KEY,
    labelSelector: (option: OPTION) => string,
) {
    const keys = Array.isArray(prevValue) ? prevValue : [prevValue];
    return (options ?? [])
        .filter((option) => keys.includes(keySelector(option)))
        .map(labelSelector)
        .join(', ');
}
