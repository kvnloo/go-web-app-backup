import type {
    Dispatch,
    SetStateAction,
} from 'react';

import type { OptionKey } from '#next/base/SelectInputContainer/GenericOption';
import SelectLayout, { type Props as SelectLayoutProps } from '#next/base/SelectLayout';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    useInputState,
} from '#next/utils/input';
import {
    getSelectHighlightMode,
    getSelectPrevValueDisplay,
    type SelectValueProps,
} from '#next/utils/select';

interface BaseProps<NAME, OPTION, KEY extends OptionKey> extends CommonInputProps<NAME> {
    /**
     * The options the value is labelled from, usually those chosen so far;
     * keep them with `onOptionsChange`
     */
    options: OPTION[] | null | undefined;
    /** Receives each chosen option, to add it to `options` */
    onOptionsChange?: Dispatch<SetStateAction<OPTION[] | null | undefined>>;
    /** The results for the current search text */
    searchOptions: OPTION[] | null | undefined;
    onSearchValueChange: (search: string | undefined) => void;
    optionsPending?: boolean;
    optionsErrored?: boolean;
    /** Total number of results, when the search returns only the first page */
    totalOptionsCount?: number;
    onShowDropdownChange?: (shown: boolean) => void;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => string;
    descriptionSelector?: (option: OPTION) => string;
    placeholder?: string;
    autoFocus?: boolean;
    /** Leading content, such as a search icon */
    before?: React.ReactNode;
}

export type Props<NAME, OPTION, KEY extends OptionKey> = BaseProps<NAME, OPTION, KEY>
    & AccessibleNameProps
    & SelectValueProps<NAME, KEY, OPTION>;

/**
 * A select whose options come from a search on the server. Chosen options
 * are listed first when the popup opens. The chosen option is passed to
 * `onChange` too, for a search box that acts on a result.
 */
function SearchSelectInput<const NAME, OPTION extends object, KEY extends OptionKey>(
    props: Props<NAME, OPTION, KEY>,
) {
    const {
        className,
        name,
        label,
        ariaLabel,
        hint,
        error,
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        required,
        variant: variantFromProps,
        options,
        onOptionsChange,
        searchOptions,
        onSearchValueChange,
        optionsPending,
        optionsErrored,
        totalOptionsCount,
        onShowDropdownChange,
        keySelector,
        labelSelector,
        descriptionSelector,
        placeholder,
        autoFocus,
        before,
        multiple,
        value,
        onChange,
        withoutClearButton,
        withSelectAllButton,
        withDiffView,
        prevValue,
    } = props;

    const { disabled, readOnly, variant } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        variant: variantFromProps,
    });

    const handleSelectAll = () => {
        if (multiple) {
            (onChange as (value: KEY[], name: NAME) => void)(
                (searchOptions ?? []).map(keySelector),
                name,
            );
        }
    };

    return (
        <SelectLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...({ multiple, value, onChange } as SelectLayoutProps<NAME, OPTION, KEY>)}
            className={className}
            name={name}
            label={label}
            ariaLabel={ariaLabel}
            hint={hint}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            variant={variant}
            icons={before}
            options={options}
            onOptionsChange={onOptionsChange}
            searchOptions={searchOptions}
            onSearchValueChange={onSearchValueChange}
            optionsPending={optionsPending}
            optionsErrored={optionsErrored}
            totalOptionsCount={totalOptionsCount}
            onShowDropdownChange={onShowDropdownChange}
            keySelector={keySelector}
            labelSelector={labelSelector}
            descriptionSelector={descriptionSelector}
            placeholder={placeholder}
            autoFocus={autoFocus}
            selectedOnTop
            withoutClearButton={withoutClearButton}
            onSelectAll={withSelectAllButton ? handleSelectAll : undefined}
            highlightMode={getSelectHighlightMode(value, prevValue, withDiffView)}
            withPrevValue={withDiffView}
            prevValue={withDiffView && getSelectPrevValueDisplay(
                prevValue,
                options,
                keySelector,
                labelSelector,
            )}
        />
    );
}

export default SearchSelectInput;
