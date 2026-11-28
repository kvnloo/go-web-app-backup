import {
    type Dispatch,
    type SetStateAction,
    useState,
} from 'react';
import {
    isDefined,
    isTruthyString,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import { rankedSearchOnList } from '#utils/common';

import type { Props as InputContainerProps } from '../InputContainer';
import SelectInputContainer from '../SelectInputContainer';
import type { OptionKey } from '../SelectInputContainer/GenericOption';
import Option, { type Props as OptionProps } from './Option';

type SingleValueProps<NAME, OPTION, KEY extends OptionKey> = {
    multiple?: false;
    value: KEY | null | undefined;
    onChange: (value: KEY | undefined, name: NAME, option: OPTION | undefined) => void;
};

type MultipleValueProps<NAME, KEY extends OptionKey> = {
    multiple: true;
    value: KEY[] | null | undefined;
    onChange: (value: KEY[], name: NAME) => void;
};

type ContainerProps = Pick<
    InputContainerProps,
    'className' | 'label' | 'ariaLabel' | 'hint' | 'error' | 'disabled' | 'readOnly'
    | 'required' | 'variant' | 'icons' | 'actions' | 'highlightMode' | 'prevValue'
    | 'withPrevValue'
>;

interface CommonProps<OPTION, KEY extends OptionKey> extends ContainerProps {
    placeholder?: string;
    autoFocus?: boolean;
    /** The options that values are labelled from */
    options: OPTION[] | null | undefined;
    /** The options listed in the popup; defaults to `options` */
    searchOptions?: OPTION[] | null | undefined;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => string;
    descriptionSelector?: (option: OPTION) => string;
    /** Orders (and may filter) the listed options for the search text */
    sortFunction?: (
        options: OPTION[],
        search: string | undefined,
        labelSelector: (option: OPTION) => string,
    ) => OPTION[];
    /** Lists the options chosen when the popup opened first */
    selectedOnTop?: boolean;
    onSearchValueChange?: (search: string | undefined) => void;
    onShowDropdownChange?: (shown: boolean) => void;
    /** Receives each chosen option, so a remote select keeps the options its value needs */
    onOptionsChange?: Dispatch<SetStateAction<OPTION[] | null | undefined>>;
    optionsPending?: boolean;
    optionsErrored?: boolean;
    totalOptionsCount?: number;
    withoutClearButton?: boolean;
    /** Shows a "select all" button (multiple only) */
    onSelectAll?: () => void;
}

export type Props<NAME, OPTION, KEY extends OptionKey> = CommonProps<OPTION, KEY>
    & { name: NAME }
    & (SingleValueProps<NAME, OPTION, KEY> | MultipleValueProps<NAME, KEY>);

const emptyList: never[] = [];

/**
 * The select behaviour shared by the select inputs (building block): a
 * combobox with a searchable options popup, for one value or several, local
 * or remote options. The popup stays open while several values are picked.
 */
function SelectLayout<const NAME, OPTION extends object, KEY extends OptionKey>(
    props: Props<NAME, OPTION, KEY>,
) {
    const {
        name,
        options: optionsFromProps,
        searchOptions: searchOptionsFromProps,
        keySelector,
        labelSelector,
        descriptionSelector,
        sortFunction,
        selectedOnTop,
        onSearchValueChange,
        onShowDropdownChange,
        onOptionsChange,
        optionsPending,
        optionsErrored,
        totalOptionsCount,
        withoutClearButton,
        onSelectAll,
        placeholder,
        autoFocus,
        multiple,
        value,
        onChange,
        ...containerProps
    } = props;

    // NOTE: the props union pairs `multiple` with the value and handler types
    const emitMultiple = onChange as (newValue: KEY[], inputName: NAME) => void;
    const emitSingle = onChange as (
        newValue: KEY | undefined,
        inputName: NAME,
        option: OPTION | undefined,
    ) => void;

    const options = optionsFromProps ?? (emptyList as OPTION[]);
    const searchOptions = searchOptionsFromProps ?? options;

    let selectedValues: KEY[] = [];
    if (multiple) {
        selectedValues = (value as KEY[] | null | undefined) ?? [];
    } else if (isDefined(value)) {
        selectedValues = [value as KEY];
    }

    const [searchText, setSearchText] = useState<string>();
    const [dropdownShown, setDropdownShown] = useState(false);
    const [focused, setFocused] = useState(false);
    const [focusedKey, setFocusedKey] = useState<{ key: KEY, mouse?: boolean }>();
    const [keysSelectedOnOpen, setKeysSelectedOnOpen] = useState<KEY[]>([]);

    const labelMap = listToMap(
        [...options, ...searchOptions],
        keySelector,
        labelSelector,
    );
    const valueDisplay = selectedValues.map((key) => labelMap[key] ?? '?').join(', ');

    const selectedOptions = options.filter(
        (option) => selectedValues.includes(keySelector(option)),
    );
    const allOptions = unique([...searchOptions, ...selectedOptions], keySelector) ?? [];

    let listedOptions: OPTION[];
    if (selectedOnTop) {
        const chosenFirst = allOptions.filter(
            (option) => keysSelectedOnOpen.includes(keySelector(option)),
        );
        const rest = allOptions.filter(
            (option) => !keysSelectedOnOpen.includes(keySelector(option)),
        );
        listedOptions = [
            ...rankedSearchOnList(chosenFirst, searchText, labelSelector),
            ...(sortFunction ? sortFunction(rest, searchText, labelSelector) : rest),
        ];
    } else {
        listedOptions = sortFunction
            ? sortFunction(allOptions, searchText, labelSelector)
            : allOptions;
    }

    const handleSearchTextChange = (text: string | undefined) => {
        setSearchText(text);
        onSearchValueChange?.(text);
    };

    const handleDropdownShownChange = (shown: boolean) => {
        setDropdownShown(shown);
        onShowDropdownChange?.(shown);
        if (shown) {
            setKeysSelectedOnOpen(selectedValues);
            setFocusedKey(!multiple && selectedValues[0] !== undefined
                ? { key: selectedValues[0] }
                : undefined);
        } else {
            setKeysSelectedOnOpen([]);
            setFocusedKey(undefined);
            handleSearchTextChange(undefined);
        }
    };

    const rememberOption = (key: KEY, option: OPTION) => {
        onOptionsChange?.((existingOptions) => {
            const safeOptions = existingOptions ?? [];
            if (safeOptions.some((item) => keySelector(item) === key)) {
                return existingOptions;
            }
            return [...safeOptions, option];
        });
    };

    const handleOptionClick = (key: KEY, option: OPTION) => {
        if (multiple) {
            const chosen = selectedValues.includes(key);
            if (!chosen) {
                rememberOption(key, option);
            }
            emitMultiple(
                chosen
                    ? selectedValues.filter((selectedKey) => selectedKey !== key)
                    : [...selectedValues, key],
                name,
            );
            return;
        }
        rememberOption(key, option);
        emitSingle(key, name, option);
    };

    const handleClear = () => {
        if (multiple) {
            emitMultiple([], name);
        } else {
            emitSingle(undefined, name, undefined);
        }
    };

    const optionRendererParams = (key: KEY, option: OPTION) => ({
        label: labelSelector(option),
        description: descriptionSelector?.(option),
        active: selectedValues.includes(key),
        title: labelSelector(option),
    });

    return (
        <SelectInputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...containerProps}
            name={name}
            placeholder={placeholder}
            autoFocus={autoFocus}
            options={listedOptions}
            optionsPending={optionsPending}
            optionsErrored={optionsErrored}
            optionsFiltered={isTruthyString(searchText)}
            totalOptionsCount={totalOptionsCount}
            optionKeySelector={keySelector}
            optionRenderer={Option}
            optionRendererParams={optionRendererParams as (
                key: KEY,
                option: OPTION,
            ) => OptionProps & { title: string }}
            onOptionClick={handleOptionClick}
            valueDisplay={valueDisplay}
            hasValue={selectedValues.length > 0}
            nonClearable={withoutClearButton}
            onClearButtonClick={handleClear}
            onSelectAllButtonClick={multiple ? onSelectAll : undefined}
            searchText={searchText}
            onSearchTextChange={handleSearchTextChange}
            dropdownShown={dropdownShown}
            onDropdownShownChange={handleDropdownShownChange}
            focused={focused}
            onFocusedChange={setFocused}
            focusedKey={focusedKey}
            onFocusedKeyChange={setFocusedKey}
            optionSelector={(key) => selectedValues.includes(key)}
            persistentOptionPopup={!!multiple}
            multiSelect={!!multiple}
        />
    );
}

export default SelectLayout;
