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
import { rankedSearchOnList } from '#utils/common';

interface BaseProps<NAME, OPTION, KEY extends OptionKey> extends CommonInputProps<NAME> {
    options: OPTION[] | null | undefined;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => string;
    descriptionSelector?: (option: OPTION) => string;
    placeholder?: string;
    autoFocus?: boolean;
}

export type Props<NAME, OPTION, KEY extends OptionKey> = BaseProps<NAME, OPTION, KEY>
    & AccessibleNameProps
    & SelectValueProps<NAME, KEY>;

/**
 * A select over options that are already loaded, searchable by typing. With
 * `multiple` it holds several values, and its value and change handler are
 * arrays.
 */
function SelectInput<const NAME, OPTION extends object, KEY extends OptionKey>(
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
        keySelector,
        labelSelector,
        descriptionSelector,
        placeholder,
        autoFocus,
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
                (options ?? []).map(keySelector),
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
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            descriptionSelector={descriptionSelector}
            sortFunction={rankedSearchOnList}
            placeholder={placeholder}
            autoFocus={autoFocus}
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

export default SelectInput;
