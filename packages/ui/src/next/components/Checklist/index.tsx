import {
    CheckboxBlankLineIcon,
    CheckboxFillIcon,
} from '@ifrc-go/icons';

import CheckboxLayout from '#next/base/CheckboxLayout';
import InputContainer from '#next/base/InputContainer';
import ListLayout from '#next/base/ListLayout';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    type DiffProps,
    useInputState,
} from '#next/utils/input';
import {
    getOptionLabels,
    getOptionListLayoutProps,
    type OptionLayoutProps,
} from '#next/utils/options';

import styles from './styles.module.css';

type ChecklistKey = string | number;

interface BaseProps<NAME, OPTION, KEY extends ChecklistKey>
    extends Omit<CommonInputProps<NAME>, 'variant'> {
    value: KEY[] | null | undefined;
    onChange: (value: KEY[], name: NAME) => void;
    options: OPTION[] | undefined;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => React.ReactNode;
    descriptionSelector?: (option: OPTION) => React.ReactNode;
}

export type Props<NAME, OPTION, KEY extends ChecklistKey> = BaseProps<NAME, OPTION, KEY>
    & AccessibleNameProps
    & DiffProps<KEY[]>
    & OptionLayoutProps;

/** A group of checkboxes for choosing several options, named by its label */
function Checklist<const NAME, OPTION, KEY extends ChecklistKey>(
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
        value,
        onChange,
        options,
        keySelector,
        labelSelector,
        descriptionSelector,
        withDiffView,
        prevValue,
        layout,
        layoutOptions,
    } = props;

    const {
        disabled,
        readOnly,
        hintId,
        errorId,
    } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        hint,
        error,
    });

    const selectedKeys = value ?? [];

    const handleCheck = (checked: boolean, key: KEY) => {
        onChange(
            checked
                ? [...selectedKeys, key]
                : selectedKeys.filter((selectedKey) => selectedKey !== key),
            name,
        );
    };

    // NOTE: compares the selections as sets, so the same keys in another
    // array (or order) are not a change
    const prevKeys = prevValue ?? [];
    let highlightMode: 'add' | 'update' | 'remove' | undefined;
    if (withDiffView) {
        if (prevKeys.length === 0 && selectedKeys.length > 0) {
            highlightMode = 'add';
        } else if (selectedKeys.length === 0 && prevKeys.length > 0) {
            highlightMode = 'remove';
        } else if (
            prevKeys.length !== selectedKeys.length
            || prevKeys.some((key) => !selectedKeys.includes(key))
        ) {
            highlightMode = 'update';
        }
    }

    const prevLabels = getOptionLabels(prevKeys, options, keySelector, labelSelector)
        .map((optionLabel, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={index} className={styles.prevLabel}>{optionLabel}</span>
        ));

    return (
        <InputContainer
            className={className}
            role="group"
            label={label}
            ariaLabel={ariaLabel}
            hint={hint}
            error={error}
            hintId={hintId}
            errorId={errorId}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            variant="inline"
            withoutInputSectionPadding
            highlightMode={highlightMode}
            withPrevValue={withDiffView}
            prevValue={withDiffView && prevLabels}
            input={(
                <ListLayout
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...getOptionListLayoutProps(
                        { layout, layoutOptions } as OptionLayoutProps,
                    )}
                    spacingOffset={-2}
                >
                    {options?.map((option) => {
                        const key = keySelector(option);
                        const checked = selectedKeys.includes(key);
                        return (
                            <CheckboxLayout
                                key={String(key)}
                                name={key}
                                checked={checked}
                                onChange={handleCheck}
                                indicator={checked
                                    ? <CheckboxFillIcon className={styles.checked} />
                                    : <CheckboxBlankLineIcon />}
                                label={labelSelector(option)}
                                description={descriptionSelector?.(option)}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        );
                    })}
                </ListLayout>
            )}
        />
    );
}

export default Checklist;
